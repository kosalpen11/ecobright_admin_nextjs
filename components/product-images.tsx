function getDetailImages(imageUrls: string[]) {
  return Array.from(new Set(imageUrls.map((url) => url.trim()).filter(Boolean)));
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
    <div className="product-image-stack">
      <div className="product-main-image">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="product-main-image__img" />
        ) : (
          <div className="product-image-placeholder">No Image</div>
        )}
      </div>
      {detailImages.length > 0 ? (
        <div className="product-detail-images">
          {detailImages.slice(0, 4).map((url, index) => (
            <div key={`${url}-${index}`} className="product-detail-image">
              <img src={url} alt={`${title} detail`} className="product-detail-image__img" />
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
    <div className="image-preview-panel">
      <div className="stack stack-tight">
        <h3 className="section-title">Image Preview</h3>
        <p className="section-description">Main display image plus product detail images.</p>
      </div>
      <ProductImageStack title={title} imageUrl={imageUrl} imageUrls={detailImages} />
    </div>
  );
}
