import { cancel, cancelOrder, createOrder, sell } from "@/mint/marketplace";
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/supabase/supabase-admin";
import { NFTMintMaster } from "@/mint/mint";
import { web3 } from "@project-serum/anchor";
import base58 from "bs58";

const verifiedSolSvcKey = process.env.VERIFIED_INK_SOL_SERVICE_KEY!;

/**
 * Find order book row
 * where buy = false and active = true (seller's row creation)
 * and set active to false
 */

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) {
    return res.status(500).json({ error: "Not authenticated " });
  }

  // serial_no
  // nft_id
  // price
  // currency
  // buy (or sell)

  const { serial_no, nft_id, price, currency, buy } = req.body;
  // Can only cancel if there's already a pending order'

  let mint = null;
  // 1. find mint
  const { data: nftOwner, error: nftOwnerError } = await supabase
    .from("nft_owner")
    .select("*")
    .eq("nft_id", nft_id)
    .eq("serial_no", serial_no)
    .maybeSingle();

  if (nftOwnerError) {
    return res.status(500).json({ error: nftOwnerError.message });
  }
  if (!nftOwner) {
    return res.status(500).json({ error: "No nft owner found." });
  }
  if (nftOwner.mint === null) {
    return res.status(500).json({ error: "Mint not found." });
  }
  mint = nftOwner.mint;

  // 2. find order book from mint
  const { data: orderBook, error: orderBookError } = await supabase
    .from("order_book")
    .select("*")
    .match({ mint, buy: false, active: true });

  if (orderBookError) {
    return res.status(500).json({ error: orderBookError.message });
  }
  if (!orderBook) {
    return res.status(500).json({ error: "Order not found." });
  }
  // 3. check if it's active
  // there are multiple order books for each mint
  let activeOrder = null;
  for (var i = 0; i < orderBook.length; i++) {
    const order = orderBook[i];
    if (order.active) {
      // found active order
      activeOrder = order;
      break;
    }
  }

  if (!activeOrder) {
    return res.status(500).json({ error: "Active order not found." });
  }

  try {
    // now use active order mint to update blockchain data
    const sellerKeypair = await web3.Keypair.fromSecretKey(
      base58.decode(verifiedSolSvcKey)
    );
    const auctionHouse = "zfQkKkdNbZB6Bnqe4ynEyT7gjHSd28mjj1xqPEVMAgT";

    console.log(activeOrder);

    const ahCancel = await cancel(
      auctionHouse,
      sellerKeypair,
      activeOrder.mint,
      activeOrder.price,
      activeOrder.currency,
      activeOrder.buy
    );

    console.log(`ahCancel: ${JSON.stringify(ahCancel)}`);

    if (ahCancel.error) {
      return res.status(500).json({ error: "There was an error." });
    }

    const stuff = await cancelOrder(
      activeOrder.mint,
      activeOrder.price,
      activeOrder.currency,
      activeOrder.buy,
      user.id,
      activeOrder.public_key
    );

    console.log(stuff);
    if (stuff === null) {
      return res.status(500).json({ error: "There was an error." });
    } else {
      return res.status(200).json({ success: true, orderBook: stuff[0] });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "There was an error." });
  }
}