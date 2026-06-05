import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${getEnv("CLOUDFLARE_R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
      secretAccessKey: getEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
    }
  });
}

export function buildProductImageKey(kind: "main" | "gallery") {
  return `products/${kind}/${nanoid()}.webp`;
}

export function getPublicImageUrl(key: string) {
  const publicUrl = getEnv("CLOUDFLARE_R2_PUBLIC_URL").replace(/\/$/, "");
  return `${publicUrl}/${key}`;
}

export async function uploadProductImageToR2({
  kind,
  body,
  contentType
}: {
  kind: "main" | "gallery";
  body: Buffer;
  contentType: string;
}) {
  const bucket = getEnv("CLOUDFLARE_R2_BUCKET_NAME");
  const key = buildProductImageKey(kind);

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable"
    })
  );

  return {
    key,
    url: getPublicImageUrl(key)
  };
}
