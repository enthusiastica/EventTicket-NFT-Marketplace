import { CardListType } from "@/types/CardListType";
import Nft from "@/types/Nft";
import { Grid } from "@chakra-ui/layout";
import React from "react";
import CardListItem from "./CardListItem";

interface Props {
  listType: CardListType;
  nfts: Nft[];
}

const CardList: React.FC<Props> = ({ nfts, listType }) => {
  return (
    <Grid
      w="100%"
      mt={8}
      templateColumns={[
        "repeat(auto-fit, 150px)",
        "repeat(auto-fit, 175px)",
        "repeat(auto-fit, 200px)",
      ]}
      justifyContent={["space-between", "space-around", "center"]}
      gap={[2, 4, 8]}
    >
      {nfts.map((nft) => {
        return <CardListItem key={nft.id} nft={nft} listType={listType} />;
      })}
    </Grid>
  );
};

export default CardList;