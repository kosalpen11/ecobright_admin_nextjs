"use client";

import { useEffect } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <Card className="w-full shadow-sm">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                The server hit an unexpected error while rendering this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Button onClick={reset}>Try again</Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
