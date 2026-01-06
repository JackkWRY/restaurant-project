/**
 * @file Image Upload Field Component
 * @description Reusable image upload field with preview
 * 
 * This component handles:
 * - Display image URL input (read-only)
 * - Upload button with file input
 * - Image preview
 * - Loading state during upload
 * 
 * @module components/admin/ImageUploadField
 * @requires react
 * @requires next/image
 */

"use client";

import { type ChangeEvent } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import type { Dictionary } from "@/locales/dictionary";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  uploading: boolean;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  dict: Dictionary;
}

/**
 * Image Upload Field Component
 * 
 * Reusable component for uploading and previewing images.
 * Displays read-only URL input, upload button, and image preview.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export default function ImageUploadField({
  value,
  onChange,
  uploading,
  onUpload,
  dict,
}: ImageUploadFieldProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1">
        {dict.admin.image}
      </label>
      
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="https://..."
          className="flex-1 border p-2 rounded focus:ring-2 focus:ring-purple-200 outline-none text-sm text-slate-500 bg-slate-100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly
        />

        <label
          className={`cursor-pointer bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 ${
            uploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <ImageIcon size={18} />
          <span className="text-sm font-bold">
            {uploading ? "Uploading..." : "Upload"}
          </span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {value && (
        <div className="mt-2 relative w-full h-32 bg-slate-200 rounded-lg overflow-hidden border">
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
