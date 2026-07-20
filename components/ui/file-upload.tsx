import React from "react";
import { cn } from "@/lib/utils";

export const FileUploader = ({
  value,
  onValueChange,
  dropzoneOptions,
  className,
  children,
}: any) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {children}
    </div>
  );
};

export const FileInput = ({
  className,
  children,
}: any) => {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-600 bg-neutral-900/50 hover:bg-neutral-800/50 cursor-pointer transition-colors", className)}>
      {children}
    </div>
  );
};

export const FileUploaderContent = ({
  className,
  children,
}: any) => {
  return <div className={cn("flex flex-wrap gap-2 mt-2", className)}>{children}</div>;
};

export const FileUploaderItem = ({
  index,
  className,
  children,
}: any) => {
  return <div className={cn("relative overflow-hidden rounded-md border border-neutral-700", className)}>{children}</div>;
};
