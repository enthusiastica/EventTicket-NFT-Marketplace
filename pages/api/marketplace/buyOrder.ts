import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/supabase/supabase-admin";

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { price, transaction, mint, publicKey, currency, sellerKey } = req.body;

  if (!price || !transaction || !mint) {
    return res.status(500).json({ error: "Invalid inputs." });
  }

  // place an entry in the "CompletedSales" table
  const { data: sale, error: saleError } = await supabase
    .from("completed_sale")
    .insert([
      {
        price,
        transaction,
        mint,
        currency,
        buyer_public_key: publicKey,
        seller_public_key: sellerKey,
      },
    ]);

  if (saleError) {
    console.log(saleError);
  }

  // place buy entry in orderbook

  const { data: order, error: orderError } = await supabase
    .from("order_book")
    .insert([
      {
        mint,
        price: price,
        currency,
        user_id: null,
        public_key: publicKey,
        buy: true,
        active: false,
      },
    ]);

  if (orderError) {
    console.log(orderError);
  }

  // Update the order book entries to no longer active.
  const { data: orderUpdate, error: orderUpdateError } = await supabase
    .from("order_book")
    .update([
      {
        active: false,
      },
    ])
    .match({ mint, active: true });

  if (orderUpdateError) {
    console.log(orderUpdateError);
  }

  // Remove the owner from nft_owners
  const { data: ownerUpdate, error: ownerUpdateError } = await supabase
    .from("nft_owner")
    .update([
      {
        owner_id: null,
      },
    ])
    .match({ mint });

  if (ownerUpdateError) {
    console.log(ownerUpdateError);
  }

  if (saleError || orderError || orderUpdateError || ownerUpdateError) {
    return res
      .status(500)
      .json({ saleError, orderError, orderUpdateError, ownerUpdateError });
  }

  return res.status(200).json({ success: true });
}
