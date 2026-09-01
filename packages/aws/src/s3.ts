import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

type Props = {
  bucket: string;
  key: string;
  contentType?: string;
  image?: Buffer<ArrayBuffer>;
};

export const generatePresignedUploadUrl = async ({
  bucket,
  key,
  contentType,
}: Props): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 600 });
};

export const generateDownloadUrl = async ({
  bucket,
  key,
}: Props): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 600,
  });
};

export const headObject = async ({
  bucket,
  key,
}: Props): Promise<HeadObjectCommandOutput> => {
  const response = await s3Client.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  return response;
};

export const objectExists = async ({
  bucket,
  key,
}: Props): Promise<boolean> => {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    return true;
  } catch (error) {
    if (error instanceof S3ServiceException && error.name === "NotFound") {
      return false;
    }

    throw error;
  }
};

export const getObject = async ({
  bucket,
  key,
}: Props): Promise<Buffer<ArrayBuffer>> => {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error(`S3 object has no body: ${key}`);
  }

  const imageBuffer = Buffer.from(await response.Body.transformToByteArray());

  return imageBuffer;
};

export const putObject = async ({ bucket, key, image, contentType }: Props) => {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: image,
      ContentType: contentType,
    }),
  );
};
