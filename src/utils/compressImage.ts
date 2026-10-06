const MAX_EDGE = 1600;
const TARGET_BYTES = 900 * 1024;

export async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("unsupported");
  }

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("unsupported");
  });
  const scale = Math.min(1, MAX_EDGE / bitmap.width, MAX_EDGE / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("unsupported");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const webp = await canvasToBlob(canvas, "image/webp", 0.78);
  let blob = webp && webp.type === "image/webp" ? webp : await canvasToBlob(canvas, "image/jpeg", 0.8);
  if (!blob) throw new Error("unsupported");

  const mime = blob.type === "image/webp" ? "image/webp" : "image/jpeg";
  let quality = mime === "image/webp" ? 0.78 : 0.8;
  while (blob.size > TARGET_BYTES && quality > 0.5) {
    quality = Math.round((quality - 0.08) * 100) / 100;
    const next = await canvasToBlob(canvas, mime, quality);
    if (!next) break;
    blob = next;
  }

  if (blob.size > 1_800_000) {
    throw new Error("too-large");
  }

  const extension = mime === "image/webp" ? "webp" : "jpg";
  return new File([blob], `shop.${extension}`, { type: mime, lastModified: Date.now() });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}
