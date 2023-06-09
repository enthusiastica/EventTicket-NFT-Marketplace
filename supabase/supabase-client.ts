import NftFormInput from "@/types/NftFormInput";
import SignInOptions from "@/types/SignInOptions";
import SignUpOptions from "@/types/SignUpOptions";
import { createClient } from "@supabase/supabase-js";
import * as ga from "@/utils/ga";
import { data } from "cheerio/lib/api/attributes";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export const signIn = async ({ email, provider }: SignInOptions) => {
  let redirect_url: string = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/redirect`;
  ga.event({
    action: "login",
    params: { provider: provider },
  });

  if (email) {
    const { error } = await supabase.auth.signIn(
      { email },
      { redirectTo: redirect_url }
    );
    if (error) {
      console.log(error);
      return false;
    } else {
      return true;
    }
  } else if (provider) {
    const { error } = await supabase.auth.signIn(
      { provider },
      { redirectTo: redirect_url }
    );
    if (error) console.log(error);
    return null;
  }
  return null;
};

export const signUp = async ({ email, provider }: SignUpOptions) => {
  let redirect_url: string = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/redirect`;
  ga.event({
    action: "sign_up",
    params: { provider: provider },
  });

  if (email) {
    const { error } = await supabase.auth.signIn(
      { email },
      { redirectTo: redirect_url }
    );
    if (error) {
      console.log(error);
      return false;
    }
  } else if (provider) {
    const { error } = await supabase.auth.signIn(
      { provider },
      { redirectTo: redirect_url }
    );
    if (error) {
      console.log(error);
    }
    return null;
  }
  return null;
};

export const signOut = () => supabase.auth.signOut();

const getFileObject = (file_id: number) =>
  supabase.from("files").select("*").eq("id", file_id).maybeSingle();
export const getFilePath = (file_id: number) =>
  supabase.from("files").select("file_name").eq("id", file_id).single();
export const getSupabaseFile = (file_name: string) =>
  supabase.storage.from("private").download(file_name);
const getSupabaseFileLink = (file_name: string) =>
  supabase.storage.from("private").getPublicUrl(file_name);
const deleteStorageFile = (file_name: string) =>
  supabase.storage.from("private").remove([file_name]);
const deleteFileById = (file_id: number) =>
  supabase.from("files").delete().match({ id: file_id });

export const moveFiles = async (from: string, to: string, file_id: number) => {
  return new Promise(async (res, rej) => {
    const { data: move, error: moveError } = await supabase.storage
      .from("private")
      .move(from, to);

    // update file object filename
    const { data, error } = await supabase
      .from("files")
      .update([
        {
          file_name: to,
        },
      ])
      .match({ id: file_id });

    if (move && data) {
      res(true);
    } else {
      rej(false);
    }
  });
};

export const attachFileToNft = (
  fileType: string,
  file_id: number,
  nft_id: number
) =>
  supabase
    .from("nft")
    .update([
      {
        [fileType]: file_id,
      },
    ])
    .match({ id: nft_id });

export const insertFileToSupabase = (file_name: string, nft_id: number) =>
  supabase.from("files").insert([
    {
      file_name,
      nft_id,
    },
  ]);

export const uploadFileToStorage = (filePath: string, photoFile: File) =>
  supabase.storage
    .from("private")
    .upload(filePath, photoFile, { upsert: true });

export const getUserNft = (user_id: string) =>
  supabase.from("nft").select("*").eq("user_id", user_id).maybeSingle();

export const getTempNft = (temp_user_id: string) =>
  supabase
    .from("nft")
    .select("*")
    .eq("temp_user_id", temp_user_id)
    .maybeSingle();

export const getNftById = (nft_id: number) =>
  supabase.from("nft").select("*").eq("id", nft_id).maybeSingle();

export const getFileFromSupabase = async (
  file_id: number
): Promise<{ error: string | null; file: object | null; fileName: string }> => {
  const { data, error } = await getFileObject(file_id);
  if (error) {
    return {
      error: error.message,
      file: null,
      fileName: "",
    };
  }

  const { data: dataFile, error: errorFile } = await getSupabaseFile(
    data.file_name
  );
  if (errorFile) {
    return {
      error: errorFile.message,
      file: null,
      fileName: "",
    };
  }
  return {
    error: null,
    file: dataFile,
    fileName: (/[^/]*$/.exec(data.file_name) as any)[0],
  };
};

export const getFileLinkFromSupabase = async (
  file_id: number
): Promise<{ error: string | null; publicUrl: string | undefined }> => {
  if (file_id === null) {
    return {
      error: "No FileId Supplied",
      publicUrl: "",
    };
  }
  const { data, error } = await getFileObject(file_id);
  if (error) {
    return {
      error: error.message,
      publicUrl: "",
    };
  }

  const { data: dataResponse, error: errorFile } = await getSupabaseFileLink(
    data.file_name
  );
  if (errorFile) {
    return {
      error: errorFile.message,
      publicUrl: "",
    };
  }
  return {
    error: null,
    publicUrl: dataResponse?.publicURL,
  };
};

export const getScreenshots = async (
  nft_ids: number[]
): Promise<{ nft_id: number; public_url: string }[]> => {
  let screenshots: any = [];
  const { data, error } = await supabase
    .from("nft")
    .select(`id, files!nft_screenshot_file_id_fkey(file_name)`)
    .in("id", nft_ids);

  if (data) {
    data.map(async (res) => {
      const public_url = await supabase.storage
        .from("private")
        .getPublicUrl(res.files.file_name);
      screenshots.push({
        nft_id: res.id,
        public_url: public_url.publicURL,
      });
    });
  }
  return screenshots;
};

export const getScreenshot = async (
  nft_id: number
): Promise<{ error: string | null; publicUrl: string | undefined }> => {
  const { data, error } = await supabase
    .from("nft")
    .select(`files!nft_screenshot_file_id_fkey(file_name)`)
    .eq("id", nft_id)
    .maybeSingle();

  if (error) {
    return {
      error: error.message,
      publicUrl: "",
    };
  }
  if (data && data.files) {
    const { data: dataResponse, error: errorFile } = await getSupabaseFileLink(
      data.files.file_name
    );
    if (errorFile) {
      return {
        error: errorFile.message,
        publicUrl: "",
      };
    }
    return {
      error: null,
      publicUrl: dataResponse?.publicURL,
    };
  } else {
    return {
      error: "No file found",
      publicUrl: "",
    };
  }
};

export const deleteNftById = async (
  nft_id: number,
  photo_file: number | undefined,
  signature_file: number | undefined
): Promise<boolean> => {
  // Check if files exist on NFT and delete if they do.
  try {
    await supabase.from("nft").delete().match({ id: nft_id });
    if (photo_file) {
      const { data, error } = await getFileObject(photo_file);
      if (data) {
        await deleteStorageFile(data.file_name);
        await deleteFileById(photo_file);
      }
    }
    if (signature_file) {
      const { data, error } = await getFileObject(signature_file);
      if (data) {
        await deleteStorageFile(data.file_name);
        await deleteFileById(signature_file);
      }
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const createNewNft = (input: NftFormInput) =>
  supabase.from("nft").insert([
    {
      first_name: input.firstName,
      last_name: input.lastName,
      graduation_year: input.gradYear,
      user_id: input.user_id,
      user_details_id: input.user_details_id,
    },
  ]);

export const createNewTempNft = (input: NftFormInput) =>
  supabase.from("nft").insert([
    {
      first_name: input.firstName,
      last_name: input.lastName,
      graduation_year: input.gradYear,
      temp_user_id: input.temp_user_id,
    },
  ]);

export const stepThreeSubmit = (input: NftFormInput) =>
  supabase
    .from("nft")
    .update([
      {
        high_school: input.highSchool,
        usa_state: input.usaState,
        sport: input.sport,
        sport_position: input.sportPosition,
      },
    ])
    .match({ id: input.nft_id });

export const updateNft = (input: NftFormInput) =>
  supabase
    .from("nft")
    .update([
      {
        first_name: input.firstName,
        last_name: input.lastName,
        graduation_year: input.gradYear,
      },
    ])
    .match({ id: input.nft_id });

export const approveNftCard = (nft_id: number) =>
  supabase
    .from("nft")
    .update([{ approved: true }])
    .match({ id: nft_id });

export const updateNftScreenshotUrl = (
  nft_id: number,
  screenshot_url: string
) => supabase.from("nft").update([{ screenshot_url }]).match({ id: nft_id });

export const setMuxValues = (
  nft_id: number,
  asset_id: string | null,
  playback_id: string | null,
  upload_id: string | null,
  mux_max_resolution: string | null
) =>
  supabase
    .from("nft")
    .update([
      {
        mux_asset_id: asset_id,
        mux_playback_id: playback_id,
        mux_upload_id: upload_id,
        mux_max_resolution,
      },
    ])
    .match({ id: nft_id });

export const saveTeamColors = (
  nft_id: number,
  color_top: string,
  color_bottom: string,
  color_transition: string
) =>
  supabase
    .from("nft")
    .update([
      {
        color_top,
        color_bottom,
        color_transition,
      },
    ])
    .match({ id: nft_id });

export const addEmailToWaitlist = (email: string, waitlist?: string) =>
  supabase.from("waitlist").insert([{ email, waitlist }]);

export const updateTempUserNftToRealId = (
  temp_user_id: string,
  user_id: string,
  user_details_id: string
) =>
  supabase
    .from("nft")
    .update([
      {
        user_id,
        user_details_id,
      },
    ])
    .match({ temp_user_id });

export const deleteTempUserId = (user_id: string) =>
  supabase
    .from("nft")
    .update([
      {
        temp_user_id: "",
      },
    ])
    .match({ user_id });

    export const createNewUser = async (email: string) => {
      const createRes = await fetch(`/api/admin/create-user`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        credentials: "same-origin",
        body: JSON.stringify({
            email: email.toLowerCase(),
        }),
    })
        .then((res) => {return res.json()})
        .catch((err) => {
            console.log(err);
            return {
                user: null,
                error: true,
            };
        });
    }
    
