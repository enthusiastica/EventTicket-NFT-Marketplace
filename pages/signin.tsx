import { Card } from "@/components/Card";
import { signIn } from "@/utils/supabase-client";
import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  useColorModeValue,
  VisuallyHidden,
} from "@chakra-ui/react";
import React from "react";
import { FaGoogle } from "react-icons/fa";

interface Props { }

const SignIn: React.FC<Props> = () => {
  return (
    <Box
      bg={useColorModeValue("gray.50", "inherit")}
      minH="100vh"
      py="12"
      px={{ base: "4", lg: "8" }}
    >
      <Box maxW="md" mx="auto">
        <Heading textAlign="center" size="xl" fontWeight="extrabold">
          Sign in to your account
        </Heading>
        <Card mt="12">
          <SimpleGrid mt="6" columns={3} spacing="3">
            <Button
              color="currentColor"
              variant="outline"
              onClick={() => {
                signIn();
              }}
            >
              <VisuallyHidden>Login with Google</VisuallyHidden>
              <FaGoogle />
            </Button>
          </SimpleGrid>
        </Card>
      </Box>
    </Box>
  );
};

export default SignIn;
