"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui";

type UploadResponse = {
  key: string;
  url: string;
  error?: string;
};

async function uploadGalleryImage(file: File, entityId: string) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("kind", "gallery");
  formData.set("entityId", entityId);

  const response = await fetch("/api/uploads/product", {
    method: "POST",
    body: formData
  });

  const result = (await response.json()) as UploadResponse;

  if (!response.ok) {
    throw new Error(result.error || "Unable to upload image.");
  }

  return result.url;
}

export function ProductGalleryUploader({
  entityId,
  value,
  onChange
}: {
  entityId: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        uploadedUrls.push(await uploadGalleryImage(file, entityId));
      }

      onChange([...value, ...uploadedUrls]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload images.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeImage(url: string) {
    onChange(value.filter((item) => item !== url));
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Gallery Images</CardTitle>
        <CardDescription>Upload multiple detail images. Each image must be 4MB or smaller.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {value.length > 0 ? (
            value.map((url) => (
              <div key={url} className="space-y-2">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <img src={url} alt="Gallery preview" className="aspect-square w-full object-cover" />
                </div>
                <Button type="button" variant="secondary" size="sm" className="w-full" onClick={() => removeImage(url)}>
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            ))
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
              Gallery previews
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-gallery-images">Upload Gallery Images</Label>
          <Input
            id="product-gallery-images"
            ref={inputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        <Button type="button" variant="outline" disabled={isUploading} onClick={() => inputRef.current?.click()}>
          {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {isUploading ? "Uploading..." : "Add Gallery Images"}
        </Button>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
