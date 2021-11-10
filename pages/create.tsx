import Card from "@/components/NftCard/Card";
import { supabase } from "@/supabase/supabase-client";
import { Box, Button, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { NextApiRequest } from "next";
import Head from "next/head";
import NextLink from "next/link";
import React from "react";

const Create: React.FC = () => {
  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      // minH="100vh"
      py="12"
      px={{ base: "4", lg: "8" }}
    >
      <Head>
        <meta
          property="og:image"
          content="https://verifiedink.us/img/verified-ink-site.png"
        />
        <meta
          property="og:title"
          content="Create your own custom NFT with Verified Ink"
        />
      </Head>
      <Box maxWidth="1200px" mx="auto">
        <Flex direction={["column", "column", "row"]}>
          <Flex direction="column" spacing={4} align="start">
            <Text colorScheme="gray" mb="4">
            THE NFT YOU ALWAYS HAVE A STAKE IN
            </Text>
            <Text fontSize="4xl" fontWeight="bold" mb="4">
              Own <span style={{ color: "#4688F1" }}>Your</span> Image
            </Text>
            <Text w="75%" colorScheme="gray" mb="4">
            It takes just a few minutes to create your first digital 
            collectible and own it for life. Even after you trade or 
            sell your VerifiedInk, you’ll continue to receive royalties 
            on future sales.
            </Text>
            <Text w="75%" colorScheme="gray" mb="4">
            Your career is in your hands. Your collectibles should be too.
            </Text>
            <NextLink href="/create/step-1">
              <a>
                <Button colorScheme="blue" color="white" mb="4">
                  Get Your VerifiedInk
                </Button>
              </a>
            </NextLink>
            <Text colorScheme="gray">
              Don't have an account yet?{" "}
              <NextLink href="/signup">
                <a className="blue-link">Sign up</a>
              </NextLink>
            </Text>
          </Flex>
          <Box  align="center" mt={["2rem", "2rem", 0]} h={["500px","650px","650px"]}>
            <Card nft_id={93} readOnly={true} />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) {
    return { props: {} };
  } else {
    // check if NFT form is finished or approved.
    const user_id = user.id;
    const { data, error } = await supabase
      .from("nft")
      .select("*")
      .eq("user_id", user_id)
      .single();
    if (data) {
      if (data.finished && !data.approved) {
        return {
          redirect: {
            destination: "/create/step-7",
            permanent: false,
          },
        };
      } else if (data.finished && data.approved) {
        return {
          redirect: {
            destination: "/create/step-8",
            permanent: false,
          },
        };
      } else {
        return { props: {} };
      }
    } else {
      return { props: {} };
    }
  }
}

export default observer(Create);
