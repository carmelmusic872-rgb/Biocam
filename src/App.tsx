/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Camera, 
  Upload, 
  Dna, 
  AlertTriangle, 
  Info, 
  Microscope, 
  ChevronRight, 
  RefreshCw,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AnalysisResult {
  scientificName: string;
  commonName: string;
  taxonomy: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    species: string;
  };
  condition: string;
  additionalInfo: string;
  safetyWarning?: string;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = image.split(',')[1];
      
      const prompt = `
        Anda adalah BioLens Engine, kecerdasan buatan ahli biologi universal.
        Analisis gambar ini dan berikan informasi teknis dalam format JSON yang ketat.
        
        ATURAN ANALISIS:
        1. Identifikasi Akurat: Nama Ilmiah (Latin) dan Nama Umum (Bahasa Indonesia).
        2. Hierarki Taksonomi: Kingdom, Phylum, Class, Order, Family, Genus, Species.
        3. Analisis Kondisi: Deteksi penyakit atau stres biologis (terutama untuk tanaman/hewan peliharaan).
        4. Informasi Tambahan: Fakta unik, peran ekologis, status kelangkaan.
        5. Keamanan: Jika beracun/berbahaya, berikan peringatan keras 'DILARANG DISENTUH/DIKONSUMSI'.

        FORMAT JSON:
        {
          "scientificName": "string",
          "commonName": "string",
          "taxonomy": {
            "kingdom": "string",
            "phylum": "string",
            "class": "string",
            "order": "string",
            "family": "string",
            "genus": "string",
            "species": "string"
          },
          "condition": "string (markdown allowed)",
          "additionalInfo": "string (markdown allowed)",
          "safetyWarning": "string (optional, only if dangerous)"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Gagal menganalisis gambar. Pastikan gambar jelas dan coba lagi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen scientific-grid flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="w-full max-w-4xl mb-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center p-3 bg-bio-dark rounded-2xl mb-6 shadow-xl"
        >
          <Dna className="w-10 h-10 text-bio-accent animate-pulse" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-2"
        >
          BioLens <span className="text-bio-green">Engine</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 text-lg max-w-2xl mx-auto"
        >
          Kecerdasan Buatan Ahli Biologi Universal. Identifikasi spesies, analisis taksonomi, dan diagnosa kesehatan biologis dalam sekejap.
        </motion.p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input & Preview */}
        <section className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-bottom border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5 text-bio-green" />
                Input Visual
              </h2>
              {image && (
                <button 
                  onClick={reset}
                  className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
            
            <div className="p-6">
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-bio-green hover:bg-bio-green/5 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-bio-green/20 transition-colors">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-bio-green" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-700">Klik atau seret gambar ke sini</p>
                    <p className="text-sm text-slate-400 mt-1">Mendukung JPG, PNG, atau WEBP</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden shadow-inner bg-slate-100 aspect-square">
                    <img 
                      src={image} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {!result && !isAnalyzing && (
                    <button
                      onClick={analyzeImage}
                      className="w-full py-4 bg-bio-dark text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
                    >
                      <Microscope className="w-5 h-5 text-bio-accent" />
                      Mulai Analisis Biologis
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bio-dark p-6 rounded-2xl text-white flex items-center gap-4 shadow-xl"
            >
              <RefreshCw className="w-6 h-6 text-bio-accent animate-spin" />
              <div>
                <p className="font-medium">Sedang Menganalisis...</p>
                <p className="text-xs text-slate-400">Mengidentifikasi struktur seluler dan pola taksonomi</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </section>

        {/* Right Column: Results */}
        <section className="space-y-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-400"
              >
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p>Hasil analisis akan muncul di sini setelah Anda mengunggah gambar.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Identity Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4">
                    <CheckCircle2 className="w-6 h-6 text-bio-green" />
                  </div>
                  <div className="mb-6">
                    <p className="text-xs font-bold text-bio-green uppercase tracking-widest mb-1">Identitas Spesies</p>
                    <h3 className="text-3xl font-bold text-slate-900">{result.commonName}</h3>
                    <p className="text-lg italic text-slate-500 font-serif">{result.scientificName}</p>
                  </div>

                  {result.safetyWarning && (
                    <div className="bg-red-600 text-white p-4 rounded-2xl mb-6 flex items-center gap-3 animate-pulse shadow-lg">
                      <AlertTriangle className="w-8 h-8 shrink-0" />
                      <div>
                        <p className="font-black text-sm leading-tight">PERINGATAN KEAMANAN:</p>
                        <p className="font-bold uppercase tracking-tight">{result.safetyWarning}</p>
                      </div>
                    </div>
                  )}

                  {/* Taxonomy Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(result.taxonomy).map(([key, value]) => (
                      <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{key}</p>
                        <p className="text-xs font-semibold text-slate-700 truncate" title={value}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="flex border-b border-slate-100">
                    <div className="px-6 py-4 border-b-2 border-bio-green bg-slate-50/50">
                      <p className="text-sm font-bold flex items-center gap-2">
                        <Microscope className="w-4 h-4 text-bio-green" />
                        Laporan Teknis
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-8">
                    <section>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-1 h-4 bg-bio-green rounded-full"></div>
                        Analisis Kondisi & Kesehatan
                      </h4>
                      <div className="markdown-body text-slate-600 text-sm">
                        <ReactMarkdown>{result.condition}</ReactMarkdown>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-1 h-4 bg-bio-accent rounded-full"></div>
                        Informasi Ekologis & Fakta
                      </h4>
                      <div className="markdown-body text-slate-600 text-sm">
                        <ReactMarkdown>{result.additionalInfo}</ReactMarkdown>
                      </div>
                    </section>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono uppercase tracking-tighter justify-center">
                  <Info className="w-3 h-3" />
                  BioLens Engine v2.5 • Neural Biological Analysis Active • {new Date().toLocaleDateString()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-5">
        <Dna className="absolute -top-20 -left-20 w-96 h-96 text-bio-green rotate-45" />
        <Microscope className="absolute -bottom-20 -right-20 w-96 h-96 text-bio-green -rotate-12" />
      </div>
    </div>
  );
}
