import userStore from "@/mobx/UserStore";
import { signOut } from "@/supabase/supabase-client";
import { ChevronDownIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  HStack,
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
  useColorMode,
  Text,
  useColorModeValue,
  StylesProvider,
  styled,
} from "@chakra-ui/react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import ViLogo from "../ui/logos/ViLogo";
import { Navbar } from "./Navbar";
import { NavTabLink } from "./NavTabLink";
import { UserProfile } from "./UserProfile";
import cookieCutter from "cookie-cutter";

const NavIndex: React.FC = () => {
  const router = useRouter();
  const logoColor = useColorModeValue("blue", "white");
  const { colorMode, toggleColorMode } = useColorMode();
  const [referralString, setReferralString] = useState("");

  const MARKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE === "true";

  useEffect(() => {
    const sign_up = localStorage.getItem("sign_up");
    if (sign_up && sign_up === "completed") {

    }
    else {
      localStorage.setItem("sign_up", "true");
    }
    if (router.query.referralCode) {
      setReferralString(`?referralCode=${router.query.referralCode}`);
      localStorage.setItem("referral_code", router.query.referralCode as string);
      cookieCutter.set("SplashBypass", "true");
    }
  }, [router.query]);

  return (
    <Navbar>
      <Navbar.Brand>
        <Link href="/">
          <a>
            <HStack height="100%">
              <ViLogo width="25px" height="25px" />
              <Flex align="center">
                <Text
                  color={logoColor}
                  textTransform="uppercase"
                  fontWeight="semibold"
                  fontSize="2xl"
                  ml={2}
                >
                  Verified
                </Text>
                <Text
                  marginTop="unset"
                  fontWeight="light"
                  alignSelf="flex-start"
                  textTransform="uppercase"
                  fontSize="2xl"
                >
                  Ink
                </Text>
              </Flex>
            </HStack>
          </a>
        </Link>
      </Navbar.Brand>
      <Navbar.Links>
        {userStore.userDetails.role !== "marketplace" && (
          <NavTabLink>Athletes</NavTabLink>
        )}
        <NavTabLink>Marketplace</NavTabLink>
        {userStore.loggedIn && <NavTabLink>Collection</NavTabLink>}
        {userStore.loggedIn && MARKET_ENABLED && (
          <NavTabLink>Listings</NavTabLink>
        )}
      </Navbar.Links>
      {!userStore.loggedIn ? (
        <Navbar.SignIn>
          {(router.pathname.toLowerCase().includes("athletes") ||
            router.pathname.toLowerCase().includes("create"))

            ? (
              <Link href="/athletes/signin" prefetch={false}>
                <a>
                  <Button color="white" colorScheme="blue" borderRadius={1}>
                    Athlete Sign In
                  </Button>
                </a>
              </Link>
            ) : (
              <Link href="/marketplace/signin">
                <a>
                  <Button colorScheme="blue" variant="ghost" borderRadius={1}>
                    Sign In
                  </Button>
                </a>
              </Link>
            )}
          {/* <Link href={`/signup/${referralString}`}>
            <a>
            </a>
          </Link> */}

          <Box display={["none", "none", "none", "block"]}>
            {/* only show in desktop, mobile view set in Navbar.tsx */}
            {MARKET_ENABLED && (
              <WalletMultiButton className="solana-wallet-multi-btn" />
            )}
          </Box>
        </Navbar.SignIn>
      ) : (
        <Navbar.UserProfile>
          <Flex
            direction={["column", "column", "column", "row"]}
            align={["flex-start", "flex-start", "flex-start", "center"]}
          >
            <Box display={["block", "block", "block", "none"]}>
              {/* Display mobile profile nav */}
              <UserProfile
                name={userStore.userDetails.user_name}
                avatarUrl={userStore.avatar_url}
                email={userStore.email}
              />
              <VStack mt={4} align="start">
                <Button
                  colorScheme="blue"
                  color="white"
                  onClick={signOut}
                  minW="93px"
                >
                  Logout
                </Button>
              </VStack>
            </Box>

            <Link href="/recruit">
              <a>
                <Button
                  colorScheme="blue"
                  color="white"
                  variant="outline"
                  borderRadius={1}
                  order={{ base: 2, lg: 1 }}
                  mr={[0, 0, 0, 2]}
                  mt={[6, 6, 6, 0]}
                  mb={[2, 2, 2, 0]}
                  minW="93px"
                >
                  Recruit
                </Button>
              </a>
            </Link>
            <Box display={["none", "none", "none", "block"]}>
              {/* only show in desktop, mobile view set in Navbar.tsx */}
              {MARKET_ENABLED && (
                <WalletMultiButton className="solana-wallet-multi-btn" />
              )}
            </Box>

            <Box display={["none", "none", "none", "block"]}>
              {/* Display dropdown menu only in desktop */}
              <Menu>
                <MenuButton
                  variant="transparent"
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                >
                  <UserProfile
                    name={userStore.name}
                    avatarUrl={userStore.avatar_url}
                    email={userStore.email}
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem>
                    <Link href="/profile">
                      <a style={{ width: "100%" }}>Profile</a>
                    </Link>
                  </MenuItem>
                  <Box w="100%" p="0.4rem 0.8rem">
                    <Button colorScheme="blue" color="white" onClick={signOut}>
                      Logout
                    </Button>
                  </Box>
                </MenuList>
              </Menu>
            </Box>
          </Flex>
        </Navbar.UserProfile>
      )}
    </Navbar>
  );
};

export default observer(NavIndex);
