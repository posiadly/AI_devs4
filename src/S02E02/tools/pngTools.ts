import sharp from "sharp";

type CropRect = {
  left: number; // x from top-left
  top: number; // y from top-left
  width: number;
  height: number;
};

function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
}

export async function cropPng(
  arrayBuffer: ArrayBuffer,
  rect: CropRect,
): Promise<ArrayBuffer> {
  const cropped = await sharp(Buffer.from(arrayBuffer))
    .extract({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    })
    .png()
    .toBuffer();
  return bufferToArrayBuffer(cropped);
}

export async function splitPngGrid(
  arrayBuffer: ArrayBuffer,
  gridSize = 3,
): Promise<ArrayBuffer[]> {
  const image = sharp(Buffer.from(arrayBuffer));
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  if (width == null || height == null) {
    throw new Error("Could not read image dimensions");
  }
  if (width % gridSize !== 0 || height % gridSize !== 0) {
    throw new Error(
      `Image dimensions ${width}x${height} are not divisible by grid size ${gridSize}`,
    );
  }

  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;
  const tiles: ArrayBuffer[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cropped = await sharp(Buffer.from(arrayBuffer))
        .extract({
          left: col * cellWidth,
          top: row * cellHeight,
          width: cellWidth,
          height: cellHeight,
        })
        .png()
        .toBuffer();
      tiles.push(bufferToArrayBuffer(cropped));
    }
  }

  return tiles;
}
