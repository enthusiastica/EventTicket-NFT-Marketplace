import { supabase } from "@/supabase/supabase-client";
import { Spinner, Stack, Text } from "@chakra-ui/react";
import Cookies from "cookies";
import { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMixpanel } from "react-mixpanel-browser";
import { useIntercom } from "react-use-intercom";
import cookieCutter from "cookie-cutter";

interface Props {
  redirect: string;
}

const Redirect: React.FC<Props> = ({ redirect }) => {
  const router = useRouter();
  const [notFound, setNotFound] = useState("");
  const mixpanel = useMixpanel();
  const { update } = useIntercom();

  // TODO: Handle the following error: /redirect?error=server_error&error_description=Error+getting+user+email+from+external+provider

  useEffect(() => {
    if (router.asPath.includes("error_description")) {
      setNotFound("error");
    }
    if (router.asPath.includes("email+from+external+provider")) {
      setNotFound("No Email");
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setTimeout(() => {
          if (event === "SIGNED_IN") {
            mixpanel.track("Signed In");
            update({
              customAttributes: {
                created_account: true,
              },
            });
            if (redirect) {
              // // unset cookie
              // cookieCutter.set("redirect-link", null, {
              //   expires: new Date(0),
              // });
              router.push(redirect);
            } else {
              // NOTE: Need to wait for the cookie to be written
              router.push("/create");
            }
          } else {
            // router.push("/athletes/signin");
          }
        }, 750);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        top: "20%",
        transform: "translate(-50%, -50%)",
        maxWidth: "400px",
      }}
    >
      {notFound === "error" ? (
        <Text fontSize="4xl">Invalid Login Link</Text>
      ) : notFound === "No Email" ? (
        <Stack alignItems={"center"}>
          <Text fontSize="3xl" mb="3">
            No Email Found
          </Text>
          <Text fontSize="l" textAlign={"center"} mb="3">
            Your Twitter handle does not have an associated Email Address.
            Please either add an email to your Twitter profile or choose a
            different account to connect.
          </Text>
        </Stack>
      ) : (
        <Stack alignItems={"center"}>
          <Text fontSize="3xl" mb="3">
            Redirecting...{" "}
          </Text>
          <Spinner size="xl" />
        </Stack>
      )}
    </div>
  );
};

export async function getServerSideProps({ req ,res }: { req: NextApiRequest, res:NextApiResponse }) {
  const cookies = new Cookies(req, res);

  let redirect_link =
    cookies.get("redirect-link") === undefined
      ? null
      : cookies.get("redirect-link");

  cookies.set("redirect-link", "/collection", {
    expires: new Date(0),
  });

  return {
    props: {
      redirect: redirect_link,
    },
  };
}

export default Redirect;
