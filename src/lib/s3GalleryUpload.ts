import {
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/** Bucket may live in a different region than generic AWS_REGION; set AWS_S3_BUCKET_REGION if needed */
function s3Region(): string {
  const r =
    process.env.AWS_S3_BUCKET_REGION?.trim() ||
    process.env.AWS_REGION?.trim() ||
    "eu-north-1";
  return r;
}

let client: S3Client | null = null;

export function isS3GalleryUploadConfigured(): boolean {
  const bucket = process.env.AWS_BUCKET_NAME?.trim();
  const key = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secret = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  return Boolean(bucket && key && secret);
}

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: s3Region(),
      followRegionRedirects: true,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!.trim(),
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!.trim(),
      },
    });
  }
  return client;
}

function bucketName(): string {
  const b = process.env.AWS_BUCKET_NAME?.trim();
  if (!b) throw new Error("AWS_BUCKET_NAME is not set");
  return b;
}

/** Ping S3 without uploading (use admin “S3 check” or logs to verify env). */
export async function headGalleryBucket(): Promise<{
  bucket: string;
  region: string;
  ok: boolean;
  error?: string;
  code?: string;
}> {
  if (!isS3GalleryUploadConfigured()) {
    return {
      bucket: process.env.AWS_BUCKET_NAME?.trim() ?? "(unset)",
      region: s3Region(),
      ok: false,
      error:
        "S3 upload env is incomplete (need AWS_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY).",
    };
  }
  const bucket = bucketName();
  const region = s3Region();
  try {
    await getClient().send(new HeadBucketCommand({ Bucket: bucket }));
    return { bucket, region, ok: true };
  } catch (e: unknown) {
    const err = e as {
      Code?: string;
      name?: string;
      message?: string;
    };
    return {
      bucket,
      region,
      ok: false,
      code: err.Code || err.name,
      error: err.message || String(e),
    };
  }
}

/** Public base URL for objects, e.g. https://bucket.s3.region.amazonaws.com */
export function getGalleryS3PublicBaseUrl(): string {
  const u = process.env.AWS_S3_BUCKET_URL?.trim();
  if (!u) throw new Error("AWS_S3_BUCKET_URL is not set");
  return u.replace(/\/$/, "");
}

export function galleryPublicUrlForKey(objectKey: string): string {
  const base = getGalleryS3PublicBaseUrl();
  return `${base}/${objectKey.replace(/^\//, "")}`;
}

export function objectKeyFromGalleryPublicUrl(
  publicUrl: string,
  baseUrl?: string
): string | null {
  try {
    const base = (baseUrl ?? getGalleryS3PublicBaseUrl()).replace(/\/$/, "");
    const abs = new URL(publicUrl.trim());
    const b = new URL(base);
    if (abs.origin !== b.origin) return null;
    return abs.pathname.replace(/^\//, "") || null;
  } catch {
    return null;
  }
}

export async function deleteGalleryObjectByPublicUrl(publicUrl: string): Promise<void> {
  if (!publicUrl || !/^https?:\/\//i.test(publicUrl)) return;
  if (!isS3GalleryUploadConfigured()) return;
  let base: string;
  try {
    base = getGalleryS3PublicBaseUrl();
  } catch {
    return;
  }
  const key = objectKeyFromGalleryPublicUrl(publicUrl, base);
  if (!key) return;
  await getClient().send(
    new DeleteObjectCommand({ Bucket: bucketName(), Key: key })
  );
}

/** Key matches public URL segment: uploads/gallery/... */
export async function putGalleryImageToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<void> {
  const bucket = bucketName();
  const region = s3Region();

  try {
    await getClient().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      })
    );
  } catch (e: unknown) {
    const err = e as { Code?: string; name?: string; message?: string };
    const awsCode = err.Code || err.name;
    const msg = err.message || "";
    if (
      awsCode === "NoSuchBucket" ||
      msg.includes("The specified bucket does not exist")
    ) {
      throw new Error(
        `S3 bucket "${bucket}" was not found in region "${region}" for this IAM user. Open AWS Console → S3 → General purpose buckets: copy the exact bucket name, confirm it is in the same AWS account as the access key, and set AWS_BUCKET_NAME (and AWS_S3_BUCKET_REGION if the bucket is not in ${region}).`
      );
    }
    throw e;
  }
}
