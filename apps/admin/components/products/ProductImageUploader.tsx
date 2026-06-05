"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui";

type UploadResponse = {
  key: string;
  url: string;
  error?: string;
};

async function uploadImage({
  file,
  kind,
  entityId
}: {
  file: File;
  kind: "main" | "gallery";
  entityId: string;
}) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("kind", kind);
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

export function ProductImageUploader({
  entityId,
  value,
  onChange
}: {
  entityId: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const url = await uploadImage({
        file,
        kind: "main",
        entityId
      });
      onChange(url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Main Image</CardTitle>
        <CardDescription>One JPG, PNG, or WEBP image up to 4MB.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50">
          {value ? (
            <img src={value} alt="Main product preview" className="aspect-[4/3] w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-sm text-slate-500">
              Main image preview
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-main-image">Upload Main Image</Label>
          <Input
            id="product-main-image"
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" disabled={isUploading} onClick={() => inputRef.current?.click()}>
            {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {isUploading ? "Uploading..." : "Choose Image"}
          </Button>
          {value ? (
            <Button type="button" variant="secondary" onClick={() => onChange("")}>
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          ) : null}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
