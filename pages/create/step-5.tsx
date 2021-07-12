import React, { useRef, useEffect, useState } from "react";
import CreateLayout from "@/components/Create/CreateLayout";
import { Flex, Divider, Button, Text, Box, Spinner } from "@chakra-ui/react";
import PhotoPreviewSide from "@/components/Create/PhotoPreviewSide";
import { useUser } from "@/utils/useUser";
import NextLink from "next/link";
import SignaturePad from "react-signature-pad-wrapper";
import { useRouter } from "next/router";

const StepFive = () => {
  const {
    signatureFile,
    uploadSignatureToSupabase,
    nftSignature,
    nft,
    setSignatureFileObject,
    checkSignatureFile,
  } = useUser();
  const signatureRef: any = useRef(null);

  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // check/get signature file
    async function checkSignature() {
      await checkSignatureFile();
    }
    checkSignature();
  }, [nft?.signature_file]);

  function handleClear() {
    if (signatureRef) {
      signatureRef.current.instance.clear();
    }
  }

  async function handleStepFiveSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (signatureFile) {
      router.push("/create/step-6");
    } else {
      if (signatureRef.current.isEmpty()) {
        alert("Draw a signature.");
      } else {
        // save to db
        setSubmitting(true);
        const newSigFile = await dataUrlToFile(
          signatureRef.current.toDataURL(),
          "signaturePic.png"
        );

        // setSignatureFileObject(newSigFile);
        const res = await uploadSignatureToSupabase(newSigFile);
        setSubmitting(false);

        if (res === null) {
          router.push("/create/step-6");
        } else {
          alert(res.message);
        }
      }
    }
  }

  return (
    <CreateLayout>
      <form onSubmit={handleStepFiveSubmit}>
        <Flex direction="column">
          <Flex direction={["column", "column", "row"]}>
            <PhotoPreviewSide
              title="Let's get your Signature"
              subtitle="You can just sign in the space with your finger or trackpad. If you want to use a mouse, best of luck to you."
              flex="1"
            />
            <Flex flex="1" direction="column">
              {signatureFile ? (
                <>
                  <Text mt={["4", "4", 0]}>Your Signature</Text>
                  <Box
                    border="2px solid #E2E8F0"
                    mt="2"
                    mb="2"
                    borderRadius="5px"
                  >
                    <img src={signatureFile} alt="" />
                  </Box>
                </>
              ) : (
                <>
                  <Text>Sign Here</Text>
                  <Box
                    border="2px solid #E2E8F0"
                    mt="2"
                    mb="2"
                    borderRadius="5px"
                  >
                    <SignaturePad
                      ref={signatureRef}
                      options={{
                        minWidth: 5,
                        maxWidth: 10,
                        penColor: "rgb(66, 133, 244)",
                      }}
                    />
                  </Box>
                  <Flex mt="2" mb="2">
                    <Button onClick={handleClear}>Clear</Button>
                  </Flex>
                </>
              )}
              <Button colorScheme="blue" type="submit" alignSelf="flex-end">
                {submitting ? <Spinner /> : "Proof Time"}
              </Button>
            </Flex>
          </Flex>
          <Divider mt="6" mb="6" />
          <Flex>
            <NextLink href="/create/step-4">
              <a>
                <Button>Back</Button>
              </a>
            </NextLink>
          </Flex>
        </Flex>
      </form>
    </CreateLayout>
  );
};

export default StepFive;

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res: Response = await fetch(dataUrl);
  const blob: Blob = await res.blob();
  return new File([blob], fileName, { type: "image/png" });
}
