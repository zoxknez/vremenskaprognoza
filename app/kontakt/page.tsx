"use client";

import { useState } from "react";
import Link from "next/link";
import { Github, Globe, Mail, Send, MessageSquare, User, AtSign } from "lucide-react";

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulacija slanja
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Kontakt
          </h1>
          <p className="text-slate-400 text-lg">
            Imate pitanja ili sugestije? Slobodno me kontaktirajte.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="neo-card p-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Povežimo se
              </h3>
              
              <div className="space-y-4">
                <Link
                  href="https://github.com/zoxknez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center">
                    <Github className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium group-hover:text-sky-400 transition-colors">
                      GitHub
                    </p>
                    <p className="text-slate-400 text-sm">@zoxknez</p>
                  </div>
                </Link>

                <Link
                  href="https://mojportfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium group-hover:text-sky-400 transition-colors">
                      Portfolio
                    </p>
                    <p className="text-slate-400 text-sm">mojportfolio.vercel.app</p>
                  </div>
                </Link>

                <Link
                  href="https://github.com/zoxknez/vremenskaprognoza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium group-hover:text-sky-400 transition-colors">
                      Prijavite problem
                    </p>
                    <p className="text-slate-400 text-sm">GitHub Issues</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Quick Info */}
            <div className="neo-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Brzi odgovor
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Za najbrži odgovor, preporučujem da me kontaktirate putem GitHub-a 
                ili da otvorite Issue na repozitorijumu projekta za tehničke probleme.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="neo-card p-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              Pošaljite poruku
            </h3>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Send className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  Hvala vam!
                </h4>
                <p className="text-slate-400">
                  Vaša poruka je primljena. Odgovoriću vam što pre.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ime
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Vaše ime"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="vas@email.com"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Poruka
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Vaša poruka..."
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Slanje...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Pošalji poruku
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
