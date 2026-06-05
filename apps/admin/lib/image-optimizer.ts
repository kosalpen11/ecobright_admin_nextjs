import sharp from "sharp";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]);

const maxOriginalFileSizeBytes = 8 * 1024 * 1024;
const minTargetBytes = 300 * 1024;
const maxTargetBytes = 800 * 1024;

type OptimizedImage = {
  buffer: Buffer;
  contentType: "image/webp";
  extension: "webp";
  size: number;
};

function validateImageFile(file: File) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
  }

  if (file.size > maxOriginalFileSizeBytes) {
    throw new Error("Original image must be 8MB or smaller.");
  }
}

async function optimizeImage(
  file: File,
  {
    width,
    qualityCandidates
  }: {
    width: number;
    qualityCandidates: number[];
  }
): Promise<OptimizedImage> {
  validateImageFile(file);

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  let selectedBuffer: Buffer | null = null;

  for (const quality of qualityCandidates) {
    const candidateBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width,
        withoutEnlargement: true
      })
      .webp({
        quality,
        effort: 6
      })
      .toBuffer();

    selectedBuffer = candidateBuffer;

    if (candidateBuffer.length <= maxTargetBytes) {
      break;
    }
  }

  if (!selectedBuffer) {
    throw new Error("Unable to optimize image.");
  }

  return {
    buffer: selectedBuffer,
    contentType: "image/webp",
    extension: "webp",
    size: selectedBuffer.length
  };
}

export async function optimizeMainImage(file: File) {
  return optimizeImage(file, {
    width: 1200,
    qualityCandidates: [82, 80, 78]
  });
}

export async function optimizeGalleryImage(file: File) {
  return optimizeImage(file, {
    width: 1000,
    qualityCandidates: [80, 78, 75]
  });
}

export function getOptimizationHint(size: number) {
  if (size < minTargetBytes) {
    return "Optimized image is below the preferred 300KB target, but kept to preserve source dimensions.";
  }

  if (size > maxTargetBytes) {
    return "Optimized image is above the preferred 800KB target.";
  }

  return null;
}
