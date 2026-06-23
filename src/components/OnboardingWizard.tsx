import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMusicStore } from '../store/musicStore';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

const LANGUAGES = [
  { id: 'Tamil', label: 'Tamil', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=200' },
  { id: 'Telugu', label: 'Telugu', image: 'https://images.unsplash.com/photo-1512411993414-7221d60ea1eb?auto=format&fit=crop&q=80&w=200' },
  { id: 'Hindi', label: 'Hindi', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=200' },
  { id: 'English', label: 'English', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?auto=format&fit=crop&q=80&w=200' }
];

const DIRECTORS = [
  { id: 'A.R. Rahman', label: 'A.R. Rahman', image: '/covers/ARR.jpg' }, // fallback generic if no specific
  { id: 'Anirudh', label: 'Anirudh', image: '/covers/anirudh.avif' },
  { id: 'Thaman S', label: 'Thaman S', image: '/covers/thaman.jpg' },
  { id: 'Sai Abhyankkar', label: 'Sai Abhyankkar', image: '/covers/Sai-Abhyankkar.avif' },
  { id: 'Pritam', label: 'Pritam', image: '/covers/pritam.jpg' }
];

// Fallback images if the specific ones don't exist
const getDirectorImage = (id: string) => {
  if (id === 'Sai Abhyankkar') return '/covers/Sai-Abhyankkar.avif';
  return `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80&sig=${id.replace(/\s/g, '')}`;
};

export function OnboardingWizard() {
  const { completeOnboarding } = useMusicStore();
  const [step, setStep] = useState(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedDirectors, setSelectedDirectors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleLanguage = (id: string) => {
    setSelectedLanguages(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const toggleDirector = (id: string) => {
    setSelectedDirectors(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (selectedLanguages.length > 0) setStep(2);
  };

  const handleComplete = async () => {
    if (selectedDirectors.length === 0) return;
    setIsSubmitting(true);
    await completeOnboarding(selectedLanguages, selectedDirectors);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 sm:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-gradient-to-br from-gray-900 via-black to-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal/20 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-ocean/20 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="relative z-10 p-8 sm:p-12 flex flex-col min-h-[600px]">
          {/* Header */}
          <div className="flex flex-col gap-2 mb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-wider flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-teal" /> 
              {step === 1 ? "What languages do you listen to?" : "Who are your favorite creators?"}
            </h1>
            <p className="text-slate-400 text-sm">
              {step === 1 ? "Select at least one language to personalize your feed." : "Select your favorite music directors."}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center relative">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                  {LANGUAGES.map(lang => {
                    const isSelected = selectedLanguages.includes(lang.id);
                    return (
                      <div 
                        key={lang.id}
                        onClick={() => toggleLanguage(lang.id)}
                        className={`relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 border-2 ${isSelected ? 'border-teal shadow-[0_0_20px_rgba(45,212,191,0.3)] scale-105' : 'border-transparent hover:border-white/20'}`}
                      >
                        <img src={lang.image} alt={lang.label} className="w-full aspect-[4/5] object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-bold text-lg tracking-wide">{lang.label}</h3>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 bg-teal rounded-full p-1 shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                  {DIRECTORS.map(dir => {
                    const isSelected = selectedDirectors.includes(dir.id);
                    return (
                      <div 
                        key={dir.id}
                        onClick={() => toggleDirector(dir.id)}
                        className={`relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 border-2 ${isSelected ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] scale-105' : 'border-transparent hover:border-white/20'}`}
                      >
                        <img src={getDirectorImage(dir.id)} alt={dir.label} className="w-full aspect-square object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 text-center">
                          <h3 className="text-white font-bold text-sm tracking-tight leading-tight">{dir.label}</h3>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-emerald-400 rounded-full p-1 shadow-lg">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="mt-10 flex justify-between items-center border-t border-white/10 pt-6">
            <div className="flex gap-2">
              <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 1 ? 'bg-teal' : 'bg-white/20'}`} />
              <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 2 ? 'bg-teal' : 'bg-white/20'}`} />
            </div>
            
            {step === 1 ? (
              <button 
                onClick={handleNext}
                disabled={selectedLanguages.length === 0}
                className="py-3 px-8 bg-white text-black font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleComplete}
                disabled={selectedDirectors.length === 0 || isSubmitting}
                className="py-3 px-8 bg-gradient-to-r from-ocean to-teal text-white font-bold text-sm rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <>Complete <Check className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
