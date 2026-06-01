"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import exifr from "exifr";

import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabase";

export default function NewPhotoPage() {
  const router = useRouter();

  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [capturedDate, setCapturedDate] =
    useState("");

  const [capturedBy, setCapturedBy] =
    useState("Admin");

  const [status, setStatus] =
    useState("active");

  const [file, setFile] =
    useState<File | null>(null);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!file) {
      alert("Please select a photo.");
      return;
    }

    try {
      setUploading(true);

      const compressedFile =
        await imageCompression(file, {
          maxSizeMB: 0.9,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

      const extension =
        compressedFile.name
          .split(".")
          .pop() || "jpg";

      const fileName =
        `${Date.now()}.${extension}`;

      const filePath =
        `photos/${fileName}`;

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

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("event-images")
        .getPublicUrl(filePath);

      const photoUrl =
        publicUrlData.publicUrl;

      const { error: insertError } =
        await supabase
          .from("photos")
          .insert({
            status,
            photo_type: "photo",
            photo_url: photoUrl,

            title:
              title.trim() || null,

            description:
              description.trim() ||
              null,

            location:
              location.trim() || null,

            captured_date:
              capturedDate || null,

            captured_by:
              capturedBy.trim() ||
              null,
          });

      if (insertError) {
        throw insertError;
      }

      alert("Photo uploaded.");

      router.push("/admin/photos");
      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Upload failed. Check browser console."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <AdminLayout title="Upload Photo">
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-6"
      >
        <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-4 md:p-6">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block font-medium">
                Photo
              </label>

              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={async (e) => {
                  const selectedFile =
                    e.target.files?.[0] ??
                    null;

                  setFile(
                    selectedFile
                  );

                  if (
                    !selectedFile
                  ) {
                    return;
                  }

                  try {
                    const exif =
                      await exifr.parse(
                        selectedFile
                      );

                    const dateTaken =
                      exif?.DateTimeOriginal ||
                      exif?.CreateDate;

                    if (
                      dateTaken
                    ) {
                      const date =
                        new Date(
                          dateTaken
                        );

                      const formattedDate =
                        date
                          .toISOString()
                          .split(
                            "T"
                          )[0];

                      setCapturedDate(
                        formattedDate
                      );
                    }
                  } catch (
                    error
                  ) {
                    console.error(
                      "EXIF read failed:",
                      error
                    );
                  }
                }}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Title
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                className="w-full max-w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Description
              </label>

              <textarea
                value={
                  description
                }
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={4}
                className="w-full max-w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Location
              </label>

              <input
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
                className="w-full max-w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Captured Date
              </label>

              <input
                type="date"
                value={
                  capturedDate
                }
                onChange={(e) =>
                  setCapturedDate(
                    e.target.value
                  )
                }
                className="w-full max-w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Captured By
              </label>

              <input
                value={
                  capturedBy
                }
                onChange={(e) =>
                  setCapturedBy(
                    e.target.value
                  )
                }
                className="w-full max-w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className="w-full max-w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3"
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={
            uploading
          }
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-500 disabled:opacity-50 md:w-auto"
        >
          {uploading
            ? "Uploading..."
            : "Upload Photo"}
        </button>
      </form>
    </AdminLayout>
  );
}