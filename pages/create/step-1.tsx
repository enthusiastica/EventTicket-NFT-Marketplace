import CreateLayout from "@/components/Create/CreateLayout";
import { supabase } from "@/utils/supabase-client";
import { useUser } from "@/utils/useUser";
import {
  Text,
  Flex,
  Divider,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import { User } from "@supabase/supabase-js";
import { NextApiRequest } from "next";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

const StepOne = () => {
  const router = useRouter();

  const { nft, setNftObject, createNft, updateNft, deleteNft } = useUser();

  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const handleFirstName = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFirstName(e.target.value);
  const [lastName, setLastName] = useState("");
  const handleLastName = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLastName(e.target.value);
  const [gradYear, setGradYear] = useState<any>("");
  const handleGradYear = (e: React.ChangeEvent<HTMLInputElement>) =>
    setGradYear(e.target.value);

  useEffect(() => {
    if (nft) {
      if (nft.first_name) {
        setFirstName(nft.first_name);
      }
      if (nft.last_name) {
        setLastName(nft.last_name);
      }
      if (nft.graduation_year) {
        setGradYear(nft.graduation_year);
      }
    }
  }, []);

  async function handleStepOneSubmit(e: React.FormEvent) {
    e.preventDefault();

    /**
     * Check if there is an existing NFT
     * If there is
     * And values are the same as the input
     * Then push to step-2 without DB create
     *
     * Else create nft if none, or update if so
     */
    if (nft) {
      if (
        nft.first_name === firstName &&
        nft.last_name === lastName &&
        nft.graduation_year === gradYear
      ) {
        // No changes, go to step 2 with no request
        router.push("/create/step-2");
      } else {
        // Changes, update and then go to step 2.
        try {
          const res: any = await updateNft({
            firstName,
            lastName,
            gradYear,
            nft_id: nft?.id,
          });
          if (res.error) {
            console.log(res.error);
          } else {
            setNftObject(res.data[0]);
            router.push("/create/step-2");
          }
        } catch (err) {
          console.log(err);
        }
      }
    } else {
      // Create new NFT
      try {
        const res: any = await createNft({ firstName, lastName, gradYear });
        if (res.error) {
          alert(res.error.message);
        } else {
          setNftObject(res.data[0]);
          router.push("/create/step-2");
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function handleDeleteNft() {
    if (nft) {
      const { error } = await deleteNft(nft.id);
      if (error) {
        alert("There was an error deleting your NFT.");
      } else {
        setNftObject(null);
        setFirstName("");
        setLastName("");
        setGradYear("");
        alert("Successfully deleted NFT.");
      }
    }
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepOneSubmit}>
        <Flex direction="column">
          {/* Top row */}
          <Flex direction={["column", "column", "row"]}>
            {/* Text */}
            <Flex direction="column" flex="1">
              <Text fontSize="3xl" fontWeight="bold">
                It Starts With <span style={{ color: "#3182ce" }}>You</span>
              </Text>
              <Text mt="1">
                Let's get some basic info to start filling out your Verified
                Ink.
              </Text>
            </Flex>
            <Flex
              justify={["flex-start", "flex-start", "center"]}
              flex="1"
              mt={["4", "4", 0]}
            >
              <Stack spacing="4">
                <FormControl id="firstName">
                  <FormLabel>First name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Bobby"
                    value={firstName}
                    onChange={handleFirstName}
                  />
                </FormControl>
                <FormControl id="lastName">
                  <FormLabel>Last name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Boucher"
                    value={lastName}
                    onChange={handleLastName}
                  />
                </FormControl>
                <FormControl id="graduationYear">
                  <FormLabel>Graduation Year</FormLabel>
                  <Input
                    type="text"
                    placeholder="`22"
                    value={gradYear}
                    onChange={handleGradYear}
                  />
                </FormControl>
              </Stack>
            </Flex>
          </Flex>
          <Divider mt="6" mb="6" />
          {/* Button row */}
          <Flex justify="space-between">
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleDeleteNft}
            >
              Delete Existing NFT
            </Button>
            <Button colorScheme="blue" type="submit">
              {submitting ? <Spinner /> : "Next step"}
            </Button>
          </Flex>
        </Flex>
      </form>
    </CreateLayout>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  // this is buggy.
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
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
            destination: "/create/step-6",
            permanent: false,
          },
        };
      } else if (data.finished && data.approved) {
        return {
          redirect: {
            destination: "/create/step-7",
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

export default StepOne;
