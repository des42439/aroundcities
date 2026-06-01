"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import exifr from "exifr";

import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";

export default function BatchUploadPage() {
  const [files, setFiles] =
    useState<File[]>([]);

  const [uploading, setUploading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  async function handleUpload() {
    if (files.length === 0) {
      alert("Please select photos.");
      return;
    }

    try {
      setUploading(true);

      let uploaded = 0;

      for (const file of files) {
        let latitude: number | null =
          null;

        let longitude: number | null =
          null;

        let capturedDate:
          | string
          | null = null;

        try {
          const exif =
            await exifr.parse(file);

          if (
            exif?.latitude &&
            exif?.longitude
          ) {
            latitude =
              exif.latitude;

            longitude =
              exif.longitude;
          }

          const dateTaken =
            exif?.DateTimeOriginal ||
            exif?.CreateDate;

          if (dateTaken) {
            capturedDate =
              new Date(
                dateTaken
              ).toISOString();
          }
        } catch {
          // Ignore EXIF errors
        }

        const compressedFile =
          await imageCompression(
            file,
            {
              maxSizeMB: 0.9,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            }
          );

        const extension =
          compressedFile.name
            .split(".")
            .pop() || "jpg";

        const fileName =
          Date.now() +
          "-" +
          Math.random()
            .toString(36)
            .substring(2, 8) +
          "." +
          extension;

        const filePath =
          "photos/" + fileName;

        const uploadResult =
          await supabase.storage
            .from("event-images")
            .upload(
              filePath,
              compressedFile,
              {
                upsert: false,
              }
            );

        if (uploadResult.error) {
          throw uploadResult.error;
        }

        const { data } =
          supabase.storage
            .from("event-images")
            .getPublicUrl(
              filePath
            );

        const photoUrl =
          data.publicUrl;

        const defaultTitle =
          file.name.replace(
            /\.[^/.]+$/,
            ""
          );

        const { error } =
          await supabase
            .from("photos")
            .insert({
              status: "inactive",

              photo_type: "photo",

              photo_url: photoUrl,

              title: defaultTitle,

              description: null,

              location: null,

              latitude,

              longitude,

              captured_date:
                capturedDate,

              captured_by:
                "Batch Upload",
            });

        if (error) {
          throw error;
        }

        uploaded++;

        setProgress(
          Math.round(
            (uploaded /
              files.length) *
              100
          )
        );
      }

      alert(
        `${files.length} photos uploaded successfully.`
      );

      window.location.href =
        "/admin/photos?saved=1";
    } catch (error) {
      console.error(error);

      alert(
        "Batch upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <AdminLayout title="Batch Upload Photos">
      <div className="space-y-6">

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) =>
              setFiles(
                Array.from(
                  e.target.files || []
                )
              )
            }
            className="w-full"
          />

          <div className="mt-4 text-neutral-400">
            Selected Photos:{" "}
            {files.length}
          </div>

          {uploading && (
            <div className="mt-4">
              Upload Progress:
              {" "}
              {progress}%
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={
                handleUpload
              }
              disabled={
                uploading
              }
              className="rounded-lg bg-green-600 px-6 py-3 font-medium hover:bg-green-500 disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : `Upload ${files.length} Photos`}
            </button>
          </div>

        </div>

        {files.length > 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Files
            </h2>

            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="text-sm text-neutral-400"
                >
                  {file.name}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}