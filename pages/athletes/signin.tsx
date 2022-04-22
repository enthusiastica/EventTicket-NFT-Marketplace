import { signIn, supabase } from "@/supabase/supabase-client";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { FaGoogle, FaTwitter } from "react-icons/fa";
import { NextApiRequest, NextApiResponse } from "next";
import { SplashModal } from "@/components/ui/SplashModal";
import cookieCutter from "cookie-cutter";


const AthleteSignin: React.FC = () => {

  const [bypass, setBypass] = useState(false)
  
  useEffect(() => {
    if(cookieCutter.get("SplashBypass") === "true") {
      setBypass(true);
    }
  },[bypass])

  return bypass ? (
    <Box minH="100vh" py={"12"} px={{ base: "4", lg: "8" }}>
      <Container centerContent>
        <VStack spacing={4}>
          <Heading
            fontWeight="extrabold"
            fontSize={["4xl", "4xl", "5xl"]}
            textAlign="center"
            w={["100%", "100%", "75%"]}
          >
            Access your Athlete Account
          </Heading>
          <Text
            fontSize="lg"
            textAlign="center"
            pt={2}
            w={["100%", "100%", "75%"]}
          >
            You'll need to have an account before you can create your
            VerifiedInk.
          </Text>
          <Text
            fontSize="lg"
            textAlign="center"
            pt={2}
            pb={8}
            w={["100%", "100%", "75%"]}
          >
            If you already have an account with us, we'll sign you in, otherwise
            we'll sign you up!
          </Text>

          <VStack spacing={8} w="90%" mt={4}>
            <Button
              py={6}
              w="100%"
              background="#1DA1F2"
              color="white"
              onClick={() => {
                // let refer_code =
                //   typeof referralCode === "string" ? referralCode : "";
                // setReferralInfo(refer_code);

                signIn({ provider: "twitter" });
              }}
            >
              <FaTwitter />
              <Text ml="2rem" fontWeight="bold">
                Access with Twitter
              </Text>
            </Button>
            <Button
              py={6}
              w="100%"
              color="currentColor"
              variant="outline"
              onClick={() => {
                signIn({ provider: "google" });
              }}
            >
              <FaGoogle />
              <Text ml="2rem" fontWeight="bold">
                Access with Google
              </Text>
            </Button>
          </VStack>

          <Box borderBottom={"1px solid white"} w="100%" pt={12}></Box>

          <Heading
            fontWeight="extrabold"
            fontSize="4xl"
            textAlign="center"
            pt={8}
          >
            Not an Athlete?
          </Heading>
          <Text textAlign="center">
            Are you a fan looking for your Collector Account?
          </Text>
          <NextLink href="/marketplace/signin">
            <a>
              <Text color={"viBlue"}>Collector Sign In</Text>
            </a>
          </NextLink>
        </VStack>
      </Container>
    </Box>
  ) :
    (
      <SplashModal handleApproval={setBypass}/>
    );
};

export async function getServerSideProps({ req, res }: { req: NextApiRequest, res: NextApiResponse }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (user) {
    return {
      redirect: {
        destination: "/create",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  }

}

export default AthleteSignin;
