"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, X, ImageIcon, FileText, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UploadedFile } from "@/hooks/use-mock-analysis";

interface FileUploadZoneProps {
  files: UploadedFile[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  disabled?: boolean;
}

export function FileUploadZone({
  files,
  onAddFiles,
  onRemoveFile,
  disabled,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;

      const dropped: File[] = [];
      if (e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          const item = e.dataTransfer.items[i];
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (file) dropped.push(file);
          }
        }
      } else {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          dropped.push(e.dataTransfer.files[i]);
        }
      }
      if (dropped.length > 0) onAddFiles(dropped);
    },
    [onAddFiles, disabled]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      onAddFiles(Array.from(e.target.files));
      e.target.value = "";
    },
    [onAddFiles]
  );

  if (files.length === 0) {
    return (
      <>
        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-all duration-200",
            isDragOver
              ? "border-slate-400 bg-slate-100/60"
              : "border-border/60 bg-slate-50/30 hover:border-border hover:bg-slate-50/60",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <Upload className="mb-2 h-5 w-5 text-muted-foreground/50" />
          <p className="text-xs font-medium text-muted-foreground">
            Drag & drop files or images here
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <FileText className="h-3 w-3" />
              Files
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ── Thumbnails strip ──────────────────────────────────────────────────
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
      />

      <div className="flex flex-wrap items-center gap-2">
        <AnimatePresence>
          {files.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="group relative"
            >
              {f.previewUrl ? (
                <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-border/60 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.previewUrl}
                    alt={f.file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => onRemoveFile(f.id)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="relative flex h-14 items-center gap-2 rounded-lg border border-border/60 bg-slate-50 px-3">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="max-w-[100px] truncate text-xs text-foreground">
                    {f.file.name}
                  </span>
                  <button
                    onClick={() => onRemoveFile(f.id)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 shrink-0 border-dashed"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </>
  );
}
