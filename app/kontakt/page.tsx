"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Globe, Send, MessageSquare, User, AtSign, Mail, Sparkles, CheckCircle2, ExternalLink } from "lucide-react";

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
    <div className="min-h-screen bg-slate-950 pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm mb-6">
            <Mail className="w-4 h-4" />
            Stupite u kontakt
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Kontakt
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Imate pitanja, sugestije ili želite da sarađujemo? Slobodno me kontaktirajte!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Info - Left Side */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Main Contact Card */}
            <div className="neo-card p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                Povežimo se
              </h3>
              
              <div className="space-y-4">
                <Link
                  href="https://github.com/zoxknez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Github className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium group-hover:text-sky-400 transition-colors">
                      GitHub
                    </p>
                    <p className="text-slate-400 text-sm">@zoxknez</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </Link>

                <Link
                  href="https://mojportfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-sky-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-sky-500/20">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium group-hover:text-sky-400 transition-colors">
                      Portfolio
                    </p>
                    <p className="text-slate-400 text-sm">o0o0o0o</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </Link>

                <Link
                  href="https://github.com/zoxknez/vremenskaprognoza/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium group-hover:text-sky-400 transition-colors">
                      Prijavite problem
                    </p>
                    <p className="text-slate-400 text-sm">GitHub Issues</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Quick Info */}
            <div className="neo-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                💡 Brzi odgovor
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Za najbrži odgovor, preporučujem da me kontaktirate putem GitHub-a 
                ili da otvorite Issue na repozitorijumu projekta za tehničke probleme.
              </p>
            </div>
          </motion.div>

          {/* Contact Form - Right Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="neo-card p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-400" />
                Pošaljite poruku
              </h3>

              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <h4 className="text-2xl font-semibold text-white mb-3">
                    Hvala vam! 🎉
                  </h4>
                  <p className="text-slate-400 mb-6">
                    Vaša poruka je primljena. Odgovoriću vam što pre.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", message: "" });
                    }}
                    className="text-sky-400 hover:text-sky-300 transition-colors font-medium"
                  >
                    Pošalji novu poruku →
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Ime
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Vaše ime"
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="vas@email.com"
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                        />
                      </div>
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
                      placeholder="Napišite vašu poruku ovde..."
                      required
                      rows={6}
                      className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold transition-all shadow-lg shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}
