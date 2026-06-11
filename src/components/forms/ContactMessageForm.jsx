"use client";

import { useMemo, useState } from "react";
import { Loader2, Mail, MessageSquareText, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const initialFormState = {
  name: "",
  email: "",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactMessageForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const isFormValid = useMemo(() => {
    return (
      formData.name.trim().length >= 2 &&
      emailPattern.test(formData.email.trim()) &&
      formData.message.trim().length >= 10
    );
  }, [formData.email, formData.message, formData.name]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (feedback) setFeedback("");
    if (error) setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback("");
    setError("");

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
    };

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Konfigurasi Supabase belum tersedia.");
      }

      const { error: insertError } = await supabase
        .from("contact_messages")
        .insert([payload]);

      if (insertError) {
        throw new Error(insertError.message || "Pesan gagal dikirim.");
      }

      setFeedback("Pesan berhasil dikirim.");
      setFormData(initialFormState);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Pesan gagal dikirim. Coba lagi nanti.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-2xl sm:p-6 lg:p-7"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />

      <div className="grid gap-4">
        <label className="group grid gap-2">
          <span className="flex items-center gap-2 text-sm font-bold text-blue-100/80">
            <User className="size-4 text-blue-300" />
            Nama
          </span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            minLength={2}
            required
            placeholder="Nama kamu"
            className="h-12 rounded-2xl border border-white/10 bg-slate-950/45 px-4 text-sm font-medium text-white outline-none transition duration-300 placeholder:text-blue-100/30 focus:border-blue-300/40 focus:bg-slate-950/60 focus:ring-4 focus:ring-blue-400/10"
          />
        </label>

        <label className="group grid gap-2">
          <span className="flex items-center gap-2 text-sm font-bold text-blue-100/80">
            <Mail className="size-4 text-blue-300" />
            Email
          </span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@example.com"
            className="h-12 rounded-2xl border border-white/10 bg-slate-950/45 px-4 text-sm font-medium text-white outline-none transition duration-300 placeholder:text-blue-100/30 focus:border-blue-300/40 focus:bg-slate-950/60 focus:ring-4 focus:ring-blue-400/10"
          />
        </label>

        <label className="group grid gap-2">
          <span className="flex items-center gap-2 text-sm font-bold text-blue-100/80">
            <MessageSquareText className="size-4 text-blue-300" />
            Pesan
          </span>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            minLength={10}
            required
            rows={5}
            placeholder="Tulis pesan kamu di sini"
            className="min-h-36 resize-none rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-medium leading-7 text-white outline-none transition duration-300 placeholder:text-blue-100/30 focus:border-blue-300/40 focus:bg-slate-950/60 focus:ring-4 focus:ring-blue-400/10"
          />
        </label>
      </div>

      <Button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="video-hover-button mt-5 h-12 w-full rounded-2xl bg-blue-500 text-sm font-black text-white shadow-xl shadow-blue-950/25 transition duration-300 hover:bg-blue-400 disabled:pointer-events-none disabled:opacity-55 sm:h-14"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Mengirim...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Kirim Pesan
          </>
        )}
      </Button>

      {feedback && (
        <p className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">
          {feedback}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-2xl border border-red-300/15 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      )}
    </form>
  );
}
