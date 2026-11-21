import { get, put, del } from "@vercel/blob";
import { env, hasBlobStorage } from "./env";

export function blobConfigured() {
  return hasBlobStorage;
}

/** Private uploads: the only public access path is /api/media/[id] after approval. */
export async function uploadPrivateImage(file: File, folder: string) {
  if (!hasBlobStorage || !env.BLOB_READ_WRITE_TOKEN) throw new Error("Image storage is not configured.");
  const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
  const pathname = `${folder}/${crypto.randomUUID()}.${extension}`;
  const result = await put(pathname, file, { access: "private", contentType: file.type, token: env.BLOB_READ_WRITE_TOKEN });
  return result.url;
}

export async function readPrivateImage(url: string) {
  if (!hasBlobStorage || !env.BLOB_READ_WRITE_TOKEN) return null;
  return get(url, { access: "private", token: env.BLOB_READ_WRITE_TOKEN });
}

export async function removeImage(url: string) {
  if (!hasBlobStorage) return;
  await del(url, { token: env.BLOB_READ_WRITE_TOKEN });
}
