import { get, put, del } from "@vercel/blob";
import { env, hasBlobStorage } from "./env";

/** Auth options for the installed @vercel/blob SDK — token or OIDC, never public access. */
type BlobAuthOptions = { token?: string; storeId?: string; oidcToken?: string };

function blobAuthOptions(): BlobAuthOptions {
  // When OIDC + store id are present the SDK uses them and ignores the token,
  // so only pass one credential path at a time.
  if (env.BLOB_STORE_ID && env.VERCEL_OIDC_TOKEN) {
    return { storeId: env.BLOB_STORE_ID, oidcToken: env.VERCEL_OIDC_TOKEN };
  }
  return { token: env.BLOB_READ_WRITE_TOKEN };
}

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export function blobConfigured() {
  return hasBlobStorage;
}

/** Private uploads: the only public access path is /api/media/[id] after approval. */
export async function uploadPrivateImage(file: File, folder: string) {
  if (!hasBlobStorage) throw new Error("Image storage is not configured.");
  const extension = IMAGE_EXTENSIONS[file.type] ?? "bin";
  const pathname = `${folder}/${crypto.randomUUID()}.${extension}`;
  const result = await put(pathname, file, {
    ...blobAuthOptions(),
    access: "private",
    contentType: file.type,
  });
  return result.url;
}

export async function readPrivateImage(url: string) {
  if (!hasBlobStorage) return null;
  return get(url, { ...blobAuthOptions(), access: "private" });
}

export async function removeImage(url: string) {
  if (!hasBlobStorage) return;
  await del(url, blobAuthOptions());
}
