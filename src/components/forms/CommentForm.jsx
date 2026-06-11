import { useMemo, useState } from "react";
import { ImageIcon, Loader2, MessageSquare, Send, User, X } from "lucide-react";

import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

function getFileExtension(fileName) {
  return fileName.split(".").pop()?.toLowerCase() || "png";
}

function isValidImageFile(file) {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
}

export function CommentForm() {
  const [userName, setUserName] = useState("");
  const [content, setContent] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const isFormValid = useMemo(() => {
    return userName.trim().length > 0 && content.trim().length > 0;
  }, [userName, content]);

  function resetStatus() {
    setStatusMessage("");
    setStatusType("");
  }

  function handleProfileFileChange(event) {
    resetStatus();

    const file = event.target.files?.[0];

    if (!file) {
      setProfileFile(null);
      setPreviewUrl("");
      return;
    }

    if (!isValidImageFile(file)) {
      setProfileFile(null);
      setPreviewUrl("");
      event.target.value = "";
      setStatusType("error");
      setStatusMessage("Format foto harus JPG, JPEG, atau PNG.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setProfileFile(null);
      setPreviewUrl("");
      event.target.value = "";
      setStatusType("error");
      setStatusMessage("Ukuran foto maksimal 2MB.");
      return;
    }

    setProfileFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function removeProfileFile() {
    setProfileFile(null);
    setPreviewUrl("");
  }

  async function uploadProfileImage(file) {
    if (!file) return null;

    const extension = getFileExtension(file.name);
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const filePath = `comments/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("comment-avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("comment-avatars")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    resetStatus();

    if (!isFormValid) {
      setStatusType("error");
      setStatusMessage("Nama dan komentar wajib diisi.");
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setStatusType("error");
      setStatusMessage("Supabase belum dikonfigurasi dengan benar.");
      return;
    }

    try {
      setIsSubmitting(true);

      const profileImageUrl = await uploadProfileImage(profileFile);

      const { error } = await supabase.from("portfolio_comments").insert({
        user_name: userName.trim(),
        content: content.trim(),
        profile_image: profileImageUrl,
        is_pinned: false,
      });

      if (error) {
        throw new Error(error.message);
      }

      setUserName("");
      setContent("");
      setProfileFile(null);
      setPreviewUrl("");
      setStatusType("success");
      setStatusMessage("Komentar berhasil dikirim.");
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error.message || "Gagal mengirim komentar. Coba lagi nanti.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-blue-100/80">
          Name
        </label>

        <div className="relative">
          <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-blue-100/45 sm:left-5" />

          <input
            type="text"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
            placeholder="Enter your name"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-blue-100/35 focus:border-violet-300/35 focus:bg-white/[0.09] sm:h-14 sm:pl-12 sm:pr-5"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-blue-100/80">
          Message
        </label>

        <div className="relative">
          <MessageSquare className="pointer-events-none absolute left-4 top-5 size-4 text-blue-100/45 sm:left-5" />

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your message here..."
            rows={4}
            className="min-h-[116px] w-full resize-y rounded-2xl border border-white/10 bg-white/[0.06] py-4 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-blue-100/35 focus:border-violet-300/35 focus:bg-white/[0.09] sm:min-h-[120px] sm:pl-12 sm:pr-5"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-blue-100/80">
          Profile Photo
        </label>

        <label className="group flex min-h-[54px] cursor-pointer items-center justify-center rounded-2xl border border-dashed border-violet-300/25 bg-violet-500/10 px-4 py-4 transition hover:border-violet-300/45 hover:bg-violet-500/15 sm:min-h-[58px] sm:px-5">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleProfileFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-3 text-sm font-semibold text-blue-100/70 transition group-hover:text-white">
            <ImageIcon className="size-4" />
            Upload Foto Profile
          </div>
        </label>

        <p className="mt-2 text-center text-xs leading-5 text-blue-100/45">
          Maksimal 2MB. Format yang diterima: JPG, JPEG, PNG.
        </p>

        {previewUrl ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={previewUrl}
                alt="Preview profile"
                className="size-11 shrink-0 rounded-full border border-white/10 object-cover sm:size-12"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {profileFile?.name}
                </p>

                <p className="text-xs text-blue-100/45">Foto siap diupload.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeProfileFile}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-100/70 transition hover:bg-red-500/15 hover:text-red-200"
              aria-label="Remove profile photo"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}
      </div>

      {statusMessage ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
            statusType === "success"
              ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-100"
              : "border-red-300/20 bg-red-500/10 text-red-100"
          }`}
        >
          {statusMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !isFormValid}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-xl shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:h-14"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Post Comment
          </>
        )}
      </button>
    </form>
  );
}
