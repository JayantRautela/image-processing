import sharp from "sharp";

interface ThumbnailOptions {
  width?: number;
  height?: number;
}

export const generateThumbnail = async (
  input: Buffer,
  options: ThumbnailOptions = {},
) => {
  const { width = 300, height = 300 } = options;

  const output = await sharp(input)
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80,
    })
    .toBuffer();

  const metadata = await sharp(output).metadata();

  return {
    buffer: output,
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
  };
};
