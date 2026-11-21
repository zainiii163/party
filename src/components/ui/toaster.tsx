"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "!bg-[#101f35] !border !border-gold/30 !text-[#f8f5ef] !rounded-xl",
          description: "!text-[#a8b5c8]",
          actionButton: "!bg-[#d8ae63] !text-[#081426]",
        },
      }}
    />
  );
}
