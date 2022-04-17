import { Card } from "@/components/ui/Card";
import { DividerWithText } from "@/components/ui/DividerWithText";
import { signIn, supabase } from "@/supabase/supabase-client";
import Cookies from "cookies";
import {
  Box,
  Button,
  Heading,
  Input,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { NextApiRequest, NextApiResponse } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaGoogle, FaTwitter } from "react-icons/fa";

interface Props { }

const SignIn: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [email, setEmail] = useState("");

  const router = useRouter();

  useEffect(() => {
    const email_router  = router.query.email! as string;
    console.log(email_router);
    setEmail(email_router);
  }, []);


  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // const emailSignIn = await signIn({ email });

    const res = await fetch(`/api/admin/send-magic-link`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({
        email,
      }),
    });

    const resj = await res.json();

    setLoading(false);
    if (resj) {
      setEmailLinkSent(true);
    }
  }

  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      py={"12"}
      px={{ base: "4", lg: "8" }}
    >
      <Box maxW="lg" mx="auto">
        <Heading textAlign="center" size="2xl" fontWeight="extrabold">
          Sign in to your account
        </Heading>

        <Box mt="12" py={8}>
          <form onSubmit={handleSignin}>
            {!emailLinkSent && <>
              <Text fontWeight="bold">Email Address</Text>
              <Input
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                mt={1}
                mb={8}
                borderRadius={1}
              />
            </>

            }
            {!emailLinkSent ? (
              <Button
                py={6}
                type="submit"
                width="100%"
                colorScheme="blue"
                color="white"
                borderRadius={1}
              >
                {loading ? <Spinner /> : "Sign in"}
              </Button>
            ) : (
              <VStack spacing={6}>
                <Text textAlign="center" fontSize="3xl" fontWeight="bold">
                  Check your email
                </Text>
                <Text textAlign="center">
                  A sign in link has been sent to your email.
                </Text>
              </VStack>
            )}
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export async function getServerSideProps({ req, res }: { req: NextApiRequest, res: NextApiResponse }) {
  
  const cookies = new Cookies(req, res);

  cookies.set("redirect-link", "/collection", {
    maxAge: 1000 * 60 * 60,
  });
  
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (user) {
    return {
      redirect: {
        destination: "/collection",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

export default SignIn;