"use client";

import {
  ADMIN_PHOTO_MAX_BYTES,
  ADMIN_PHOTO_MAX_DIMENSION,
} from "./upload-limits";

function readImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read image: ${file.name}`));
    };
    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image compression failed."));
          return;
        }

        resolve(blob);
      },
      type,
      quality
    );
  });
}

export async function compressAdminImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not an image.`);
  }

  const image = await readImage(file);
  const scale = Math.min(
    1,
    ADMIN_PHOTO_MAX_DIMENSION /
      Math.max(image.width, image.height)
  );
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image compression is not supported.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
    const blob = await canvasToBlob(
      canvas,
      "image/jpeg",
      quality
    );

    if (blob.size <= ADMIN_PHOTO_MAX_BYTES) {
      return new File(
        [blob],
        `${file.name.replace(/\.[^.]+$/, "")}.jpg`,
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        }
      );
    }
  }

  throw new Error(
    `${file.name} could not be compressed below 1MB.`
  );
}
