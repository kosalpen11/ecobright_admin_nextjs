import { ImageIcon } from "lucide-react";

function getDetailImages(imageUrls: string[]) {
  return imageUrls.filter(Boolean);
}

function ImagePlaceholder() {
  return (
    <div className="flex h-full min-h-20 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
      <ImageIcon className="h-4 w-4" />
    </div>
  );
}

export function ProductImageStack({
  title,
  imageUrl,
  imageUrls
}: {
  title: string;
  imageUrl?: string | null;
  imageUrls?: string[];
}) {
  const detailImages = getDetailImages(imageUrls ?? []);

  return (
    <div className="flex items-start gap-3">
      <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      {detailImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {detailImages.slice(0, 4).map((url) => (
            <div
              key={url}
              className="h-9 w-9 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
            >
              <img
                src={url}
                alt={`${title} detail`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProductImagePreviewPanel({
  title,
  imageUrl,
  imageUrls
}: {
  title: string;
  imageUrl?: string | null;
  imageUrls?: string[];
}) {
  const detailImages = getDetailImages(imageUrls ?? []);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">Image Preview</h3>
        <p className="text-sm text-slate-500">
          Main display image and detail images for the product listing.
        </p>
      </div>
      <div className="space-y-3">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <ImagePlaceholder />
          )}
        </div>
        {detailImages.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {detailImages.map((url) => (
              <div
                key={url}
                className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <img
                  src={url}
                  alt={`${title} detail`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
