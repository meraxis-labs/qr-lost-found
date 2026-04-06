"use client";

import { Toaster } from "sonner";

/**
 * Global toast host — use `import { toast } from "sonner"` in client components.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      theme="dark"
      richColors
      closeButton
      duration={4000}
    />
  );
}
