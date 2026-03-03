"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AtSign,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Github,
  Globe,
  Mail,
  MessageSquare,
  Send,
  Sparkles,
  User,
} from "lucide-react";

interface FormErrors {
  name?: string[];
  email?: string[];
  message?: string[];
}

const MAX_MESSAGE_LENGTH = 5000;

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        throw new Error(data.error || "Doslo je do greske.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Doslo je do greske pri slanju.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError(null);
    setFieldErrors({});
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-20 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-300 transition-colors hover:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Nazad na pocetnu
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-500/10 px-4 py-2 text-sm text-sky-300">
            <Mail className="h-4 w-4" />
            Kontakt i saradnja
          </div>
          <h1 className="mb-3 text-4xl font-bold text-white md:text-5xl">Kontakt</h1>
          <p className="mx-auto max-w-2xl text-slate-300">
            Ako imas predlog, prijavu baga ili ideju za unapredjenje, posalji poruku.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-5">
          <motion.aside
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="space-y-6 lg:col-span-2"
          >
            <div className="glass-effect rounded-2xl p-6 shadow-xl shadow-black/20">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                <Sparkles className="h-5 w-5 text-sky-300" />
                Kanali komunikacije
              </h2>

              <div className="space-y-3">
                <Link
                  href="https://github.com/zoxknez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-xl border border-slate-700/60 bg-slate-900/50 p-4 transition-all hover:border-slate-500 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white transition-transform group-hover:scale-105">
                    <Github className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">GitHub</p>
                    <p className="text-sm text-slate-400">@zoxknez</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-500 transition-colors group-hover:text-sky-300" />
                </Link>

                <Link
                  href="https://mojportfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-xl border border-slate-700/60 bg-slate-900/50 p-4 transition-all hover:border-sky-500/40 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 transition-transform group-hover:scale-105">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Portfolio</p>
                    <p className="text-sm text-slate-400">Projekti i reference</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-500 transition-colors group-hover:text-sky-300" />
                </Link>

                <Link
                  href="https://github.com/zoxknez/vremenskaprognoza/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-xl border border-slate-700/60 bg-slate-900/50 p-4 transition-all hover:border-slate-500 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white transition-transform group-hover:scale-105">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Prijava problema</p>
                    <p className="text-sm text-slate-400">GitHub Issues</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-500 transition-colors group-hover:text-sky-300" />
                </Link>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6">
              <h3 className="mb-3 text-base font-semibold text-white">Brzi savet</h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Za tehnicke probleme najbrzi put je GitHub Issue. Za saradnju i opste
                upite koristi formu na ovoj stranici.
              </p>
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="glass-effect rounded-2xl p-7 md:p-8 shadow-xl shadow-black/20">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white">
                <Send className="h-5 w-5 text-sky-300" />
                Posalji poruku
              </h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold text-white">Poruka je poslata</h3>
                  <p className="mb-6 text-slate-300">Odgovor stize cim pre.</p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                  >
                    Posalji novu poruku
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                  )}

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-slate-200">
                        Ime
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          id="contact-name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Vase ime"
                          required
                          minLength={2}
                          maxLength={100}
                          aria-invalid={Boolean(fieldErrors.name)}
                          className={`w-full rounded-xl border bg-slate-900/60 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                            fieldErrors.name
                              ? "border-red-400/60 focus-visible:ring-red-400/60"
                              : "border-slate-700/70 hover:border-slate-600"
                          }`}
                        />
                      </div>
                      {fieldErrors.name && (
                        <p className="mt-1 text-xs text-red-300">{fieldErrors.name[0]}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-slate-200">
                        Email
                      </label>
                      <div className="relative">
                        <AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          id="contact-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="vas@email.com"
                          required
                          aria-invalid={Boolean(fieldErrors.email)}
                          className={`w-full rounded-xl border bg-slate-900/60 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                            fieldErrors.email
                              ? "border-red-400/60 focus-visible:ring-red-400/60"
                              : "border-slate-700/70 hover:border-slate-600"
                          }`}
                        />
                      </div>
                      {fieldErrors.email && (
                        <p className="mt-1 text-xs text-red-300">{fieldErrors.email[0]}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-slate-200">
                      Poruka
                    </label>
                    <textarea
                      id="contact-message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Napisite poruku..."
                      required
                      minLength={10}
                      maxLength={MAX_MESSAGE_LENGTH}
                      rows={7}
                      aria-invalid={Boolean(fieldErrors.message)}
                      className={`w-full resize-none rounded-xl border bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                        fieldErrors.message
                          ? "border-red-400/60 focus-visible:ring-red-400/60"
                          : "border-slate-700/70 hover:border-slate-600"
                      }`}
                    />
                    <div className="mt-2 flex items-center justify-between">
                      {fieldErrors.message ? (
                        <p className="text-xs text-red-300">{fieldErrors.message[0]}</p>
                      ) : (
                        <span className="text-xs text-slate-500">Minimum 10 karaktera</span>
                      )}
                      <span className="text-xs text-slate-500">
                        {formData.message.length}/{MAX_MESSAGE_LENGTH}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Slanje...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Posalji poruku
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
