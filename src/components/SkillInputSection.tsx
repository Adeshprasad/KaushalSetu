import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { SKILL_TAXONOMY } from '../data/mockData';
import { normalizeToCanonicalSkill } from '../utils/matching';
import { processSpeechEvent } from '../utils/speechHelper';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  MapPin, 
  Plus, 
  X, 
  ArrowRight, 
  Loader2, 
  Volume2, 
  CheckCircle2, 
  Radio, 
  Languages,
  Zap,
  Check
} from 'lucide-react';

interface SkillInputSectionProps {
  currentLanguage: Language;
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  onExtractAndFindJobs: (inputText: string) => Promise<void>;
  isLoading: boolean;
}

const INDIAN_STATES = [
  'Bihar',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Rajasthan',
  'Maharashtra',
  'Tamil Nadu',
  'Jharkhand',
  'West Bengal',
  'Odisha',
  'Gujarat',
  'Punjab',
  'Haryana',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Assam',
  'Chhattisgarh',
  'Uttarakhand',
  'Delhi NCR'
];

const POPULAR_SKILL_CATEGORIES = [
  {
    categoryHi: 'सभी प्रमुख हुनर',
    categoryEn: 'Top Trades',
    skills: ['welding', 'motorcycle repair', 'electrician', 'tailoring', 'solar technician', 'plumber', 'carpenter', 'masonry']
  },
  {
    categoryHi: 'तकनीकी व ऑटोमोबाइल',
    categoryEn: 'Technical & Auto',
    skills: ['welding', 'motorcycle repair', 'electrician', 'solar technician', 'cctv installation', 'mobile repair']
  },
  {
    categoryHi: 'शिल्प, निर्माण व सिलाई',
    categoryEn: 'Craft & Construction',
    skills: ['tailoring', 'embroidery', 'plumber', 'carpenter', 'masonry', 'pottery', 'handicrafts']
  }
];

export const SkillInputSection: React.FC<SkillInputSectionProps> = ({
  currentLanguage,
  skills,
  onSkillsChange,
  selectedState,
  onStateChange,
  selectedDistrict,
  onDistrictChange,
  onExtractAndFindJobs,
  isLoading,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;

  const [rawText, setRawText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micErrorNotice, setMicErrorNotice] = useState<string | null>(null);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [autoExtractStatus, setAutoExtractStatus] = useState<'idle' | 'listening' | 'identifying' | 'success'>('idle');

  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const latestTranscriptRef = useRef('');
  const lastExtractedTextRef = useRef('');

  // Check Web Speech API support and cleanup on unmount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  // Stop recording if language changes mid-session
  useEffect(() => {
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsRecording(false);
      setAutoExtractStatus('idle');
    }
  }, [currentLanguage]);

  // Synchronize loading status with auto-extract indicator
  useEffect(() => {
    if (isLoading && autoExtractStatus !== 'identifying') {
      setAutoExtractStatus('identifying');
    } else if (!isLoading && autoExtractStatus === 'identifying') {
      setAutoExtractStatus('success');
      const timer = setTimeout(() => {
        setAutoExtractStatus('idle');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // AUTOMATIC SKILL IDENTIFICATION TRIGGER HELPER
  // Automatically called on voice pause or mic stop without requiring any manual button click!
  const triggerAutoExtraction = async (text: string) => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    const clean = text.trim();
    if (!clean) return;

    // Prevent immediate duplicate firing of the exact same text
    if (clean === lastExtractedTextRef.current && isLoading) return;

    lastExtractedTextRef.current = clean;
    setAutoExtractStatus('identifying');

    try {
      await onExtractAndFindJobs(clean);
      setAutoExtractStatus('success');
      setTimeout(() => {
        setAutoExtractStatus('idle');
      }, 3500);
    } catch (err) {
      console.warn('Auto extraction failed:', err);
      setAutoExtractStatus('idle');
    }
  };

  const toggleRecording = () => {
    setMicErrorNotice(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    if (isRecording) {
      // User tapped Stop Listening
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Error stopping recognition:', e);
        }
      }
      setIsRecording(false);
      const textToExtract = latestTranscriptRef.current || rawText;
      if (textToExtract.trim()) {
        triggerAutoExtraction(textToExtract);
      } else {
        setAutoExtractStatus('idle');
      }
    } else {
      // User tapped Start Listening
      try {
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (_) {}
          recognitionRef.current = null;
        }

        latestTranscriptRef.current = '';
        setAutoExtractStatus('listening');

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        // Regional language setting for Web Speech API
        if (currentLanguage === 'hi') {
          recognition.lang = 'hi-IN';
        } else if (currentLanguage === 'bn') {
          recognition.lang = 'bn-IN';
        } else if (currentLanguage === 'ta') {
          recognition.lang = 'ta-IN';
        } else if (currentLanguage === 'or') {
          recognition.lang = 'or-IN';
        } else {
          recognition.lang = 'en-IN';
        }

        recognition.onresult = (event: any) => {
          const { fullText } = processSpeechEvent(event);
          if (fullText) {
            setRawText(fullText);
            latestTranscriptRef.current = fullText;

            // AUTOMATIC SKILL IDENTIFICATION:
            // When user pauses speaking for 1.3 seconds, automatically stop listening
            // and immediately extract skills via AI. The user never needs to click any button!
            if (silenceTimeoutRef.current) {
              clearTimeout(silenceTimeoutRef.current);
            }
            silenceTimeoutRef.current = setTimeout(() => {
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                } catch (_) {}
              }
              setIsRecording(false);
              triggerAutoExtraction(latestTranscriptRef.current);
            }, 1300);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'no-speech' || event.error === 'aborted') {
            setIsRecording(false);
            recognitionRef.current = null;
            if (latestTranscriptRef.current) {
              triggerAutoExtraction(latestTranscriptRef.current);
            } else {
              setAutoExtractStatus('idle');
            }
            return;
          }
          if (event.error === 'not-allowed') {
            setMicErrorNotice(
              currentLanguage === 'hi'
                ? 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।'
                : 'Microphone permission denied. Please allow microphone access in your browser.'
            );
          } else if (event.error === 'network') {
            setMicErrorNotice(
              currentLanguage === 'hi'
                ? 'नेटवर्क समस्या के कारण वॉइस सेवा कनेक्ट नहीं हो सकी।'
                : 'Network issue connecting to browser speech recognition.'
            );
          }
          setIsRecording(false);
          recognitionRef.current = null;
          setAutoExtractStatus('idle');
        };

        recognition.onend = () => {
          setIsRecording(false);
          recognitionRef.current = null;
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
          const textToExtract = latestTranscriptRef.current || rawText;
          if (textToExtract.trim()) {
            triggerAutoExtraction(textToExtract);
          } else {
            setAutoExtractStatus('idle');
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
        setIsRecording(false);
        recognitionRef.current = null;
        setAutoExtractStatus('idle');
      }
    }
  };

  const handleAddCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const trimmed = customSkillInput.trim().toLowerCase();
    const canonical = normalizeToCanonicalSkill(trimmed);
    if (!skills.includes(canonical)) {
      onSkillsChange([...skills, canonical]);
    }
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(s => s !== skillToRemove));
  };

  const handleQuickAdd = (canonical: string) => {
    if (!skills.includes(canonical)) {
      onSkillsChange([...skills, canonical]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawText.trim()) {
      triggerAutoExtraction(rawText);
    }
  };

  // Preset sample prompts for instant 1-tap testing
  const samplePrompts = [
    { label: 'वेल्डिंग + बाइक रिपेयर (Ravi)', text: 'मुझे वेल्डिंग और बाइक रिपेयर आता है। मैंने 2 साल गैराज में काम किया है।' },
    { label: 'सिलाई + बुटीक (Sunita)', text: 'मुझे सूट, कुर्ती की सिलाई और बुटीक का काम अच्छे से आता है।' },
    { label: 'बिजली + सोलर पैनल (Ramesh)', text: 'मुझे बिजली की वायरिंग, मोटर और सोलर पैनल फिटिंग का अनुभव है।' },
    { label: 'राजमिस्त्री + प्लंबर', text: 'मैं राजमिस्त्री का काम करता हूँ और नल-पाइप फिटिंग भी जानता हूँ।' }
  ];

  return (
    <section id="skill-input-card" className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      <div className="bg-white dark:bg-[#161B22] rounded-3xl border border-[#E5E0D5] dark:border-[#262F3D] shadow-sm hover:shadow-md transition-all p-4 sm:p-8">
        
        {/* Section Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1F1] dark:bg-[#152E2E] border border-[#CCE0E0] dark:border-[#1E4646] mb-3 text-xs font-bold text-[#2D5A5A] dark:text-[#2DD4BF]">
            <Sparkles className="w-3.5 h-3.5 text-[#E87D4D] animate-spin-slow" />
            <span>AI Voice & Automatic Skill Identification</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight [text-wrap:balance]">
            {t.whatWorkCanYouDo}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B665F] dark:text-[#94A3B8] mt-2 max-w-lg mx-auto font-medium [text-wrap:balance]">
            {currentLanguage === 'hi'
              ? 'सिर्फ बोलिए — AI बिना किसी बटन के स्वतः आपके हुनर को पहचान कर सही नौकरियां खोज देगा।'
              : 'Just speak naturally — AI automatically detects your trade skills and matches jobs with zero extra clicks.'}
          </p>
        </div>

        {/* PRIMARY VOICE INPUT STUDIO CARD */}
        <div className="mb-6 p-6 sm:p-8 bg-gradient-to-b from-[#FAF9F5] via-[#F5F2EA] to-[#ECE7DA] dark:from-[#1A222E] dark:via-[#161D27] dark:to-[#121720] rounded-2xl border-2 border-[#E5E0D5] dark:border-[#2D3A4F] text-center shadow-xs relative overflow-hidden">
          
          {/* Subtle civic watermark pattern */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#2D5A5A]/5 dark:bg-[#2DD4BF]/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#E87D4D]/5 dark:bg-[#E87D4D]/5 rounded-full blur-2xl pointer-events-none"></div>

          {/* Automatic Identification Banner */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-[#1E2633]/90 border border-[#E5E0D5] dark:border-[#2E3B4E] text-[11px] sm:text-xs font-bold text-[#2D5A5A] dark:text-[#2DD4BF] mb-4 shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-[#E87D4D] animate-pulse" />
            <span>
              {currentLanguage === 'hi' 
                ? '✨ ऑटो-डिटेक्शन सक्रिय: बोलते ही हुनर स्वतः पहचाने जाएंगे' 
                : '✨ Auto-Detection Active: Skills automatically extracted when you speak'}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-[#2B2927] dark:text-[#F1F5F9] mb-4 flex items-center justify-center gap-2">
            <Volume2 className="w-4 h-4 text-[#E87D4D]" />
            <span>{t.tellUsYourSkills}</span>
          </p>

          {/* MAIN TACTILE MICROPHONE BUTTON */}
          <div className="relative inline-flex items-center justify-center my-2">
            {/* Pulsing radiating rings while active */}
            {isRecording && (
              <>
                <span className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-rose-500/20 dark:bg-rose-500/30 animate-ping pointer-events-none"></span>
                <span className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-rose-500/30 dark:bg-rose-500/40 animate-pulse pointer-events-none"></span>
              </>
            )}

            <button
              id="voice-input-mic-btn"
              type="button"
              onClick={toggleRecording}
              disabled={!speechSupported}
              className={`relative z-10 flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-full font-extrabold text-sm sm:text-base transition-all duration-200 cursor-pointer shadow-md select-none ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 dark:ring-rose-950/70 scale-105 shadow-rose-600/30'
                  : 'bg-[#2D5A5A] hover:bg-[#234848] text-white hover:shadow-lg active:scale-95'
              } ${!speechSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-6 h-6 animate-pulse" />
                  <span>{t.stopListening}</span>
                  {/* High fidelity dynamic equalizer wave */}
                  <div className="flex items-center gap-1 ml-1.5 h-5">
                    <span className="w-1 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 bg-white rounded-full animate-bounce h-5" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 bg-white rounded-full animate-bounce h-4" style={{ animationDelay: '300ms' }}></span>
                    <span className="w-1 bg-white rounded-full animate-bounce h-6" style={{ animationDelay: '75ms' }}></span>
                    <span className="w-1 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '220ms' }}></span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <span>{t.voiceButtonText}</span>
                  <Sparkles className="w-4 h-4 text-[#E87D4D]" />
                </>
              )}
            </button>
          </div>

          {/* REAL-TIME STATUS DISPLAY */}
          <div className="mt-4 min-h-[44px] flex flex-col items-center justify-center">
            {isRecording && (
              <div className="flex flex-col items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                  <span>{t.listening}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#6B665F] dark:text-[#94A3B8]">
                  {currentLanguage === 'hi'
                    ? '⚡ जैसे ही आप बोलना बंद करेंगे, AI खुद-ब-खुद हुनर पहचान लेगा'
                    : '⚡ AI automatically extracts your skills the moment you pause speaking'}
                </span>
              </div>
            )}

            {autoExtractStatus === 'identifying' && (
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] font-bold text-xs sm:text-sm shadow-xs animate-fadeIn">
                <Loader2 className="w-4 h-4 animate-spin text-[#E87D4D]" />
                <span>
                  {currentLanguage === 'hi'
                    ? '⚡ आवाज़ से हुनर पहचाना जा रहा है और नौकरियां खोजी जा रही हैं...'
                    : '⚡ Auto-identifying trade skills from your voice and finding matching jobs...'}
                </span>
              </div>
            )}

            {autoExtractStatus === 'success' && !isRecording && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {currentLanguage === 'hi'
                    ? '✅ हुनर स्वतः पहचाने गए और नीचे नौकरियां अपडेट की गईं!'
                    : '✅ Skills auto-identified and matched jobs updated below!'}
                </span>
              </div>
            )}

            {!isRecording && autoExtractStatus === 'idle' && (
              <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] font-medium">
                {currentLanguage === 'hi'
                  ? 'हिंदी, भोजपुरी, मैथिली, बांग्ला, तमिल, ओड़िया या इंग्लिश में अपनी भाषा में बोलें'
                  : 'Speak naturally in Hindi, Bengali, Tamil, Odia, English, or your regional dialect'}
              </p>
            )}
          </div>

          {micErrorNotice && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold max-w-md mx-auto animate-fadeIn">
              {micErrorNotice}
            </div>
          )}

          {!speechSupported && (
            <p className="mt-2 text-xs text-[#8B867F] dark:text-[#94A3B8]">{t.voiceUnsupported}</p>
          )}

          {/* Quick 1-Tap Sample Voice Test Chips */}
          <div className="mt-5 pt-4 border-t border-[#E5E0D5]/70 dark:border-[#2D3A4F]/70">
            <div className="flex items-center justify-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E87D4D]" />
              <span className="text-xs font-bold text-[#6B665F] dark:text-[#CBD5E1]">
                {currentLanguage === 'hi' ? 'तुरंत परखें (1-Tap Auto Demo):' : 'Quick Test (1-Tap Auto Demo):'}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setRawText(sample.text);
                    triggerAutoExtraction(sample.text);
                  }}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E2633] hover:bg-[#EBF1F1] dark:hover:bg-[#283243] text-[#2B2927] dark:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#2E3B4E] font-semibold transition-all cursor-pointer text-xs disabled:opacity-50 shadow-2xs hover:border-[#2D5A5A] dark:hover:border-[#2DD4BF]"
                >
                  <span className="text-[#E87D4D] mr-1">⚡</span>
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* TEXT INPUT ALTERNATIVE & LIVE TRANSCRIPT */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="skill-text-input" className="block text-xs font-bold text-[#6B665F] dark:text-[#94A3B8] uppercase tracking-wide">
                {currentLanguage === 'hi' ? 'या यहाँ लिखकर बताएं (वैकल्पिक):' : 'Or write your work description here:'}
              </label>
              {rawText && (
                <button
                  type="button"
                  onClick={() => {
                    setRawText('');
                    latestTranscriptRef.current = '';
                  }}
                  className="text-xs text-[#8B867F] hover:text-rose-600 dark:text-[#94A3B8] dark:hover:text-rose-400 font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                id="skill-text-input"
                rows={3}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={t.textPlaceholder}
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border border-[#E5E0D5] dark:border-[#2D3748] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2D5A5A]/20 dark:focus:ring-[#2DD4BF]/20 outline-hidden bg-[#FAF9F5]/80 dark:bg-[#10151C] text-[#2B2927] dark:text-[#F1F5F9] placeholder-[#8B867F] dark:placeholder-[#64748B] transition-all font-medium resize-y"
              />
            </div>

            {/* Quick helper note explaining automatic process */}
            <div className="mt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                {currentLanguage === 'hi' 
                  ? 'बोलने पर हुनर स्वतः पहचाने जाते हैं। लिखने के बाद भी सीधे Enter दबा सकते हैं।'
                  : 'Voice is 100% automated. When typing, press Enter to match.'}
              </span>

              {rawText.trim() && (
                <button
                  type="button"
                  onClick={() => triggerAutoExtraction(rawText)}
                  disabled={isLoading}
                  className="px-3 py-1 rounded-lg bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer hover:bg-[#224646] dark:hover:bg-[#14B8A6] disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 text-[#E87D4D] dark:text-[#0D1117]" />
                  <span>{currentLanguage === 'hi' ? 'हुनर पहचानें' : 'Extract Skills'}</span>
                </button>
              )}
            </div>
          </div>

          {/* LOCATION FILTERS (State & District) */}
          <div className="mb-6 p-4 sm:p-5 bg-[#FAF9F5] dark:bg-[#121720] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D]">
            <div className="flex items-center gap-1.5 mb-3 text-[#2B2927] dark:text-[#F1F5F9] font-bold text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-[#E87D4D]" />
              <span>{t.whereAreYouLooking}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="user-state-select" className="block text-xs font-semibold text-[#6B665F] dark:text-[#94A3B8] mb-1">
                  {t.stateLabel}
                </label>
                <select
                  id="user-state-select"
                  value={selectedState}
                  onChange={(e) => onStateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#2D3748] bg-white dark:bg-[#161B22] font-semibold text-[#2B2927] dark:text-[#F1F5F9] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] outline-hidden cursor-pointer shadow-2xs"
                >
                  <option value="">{t.allStates}</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="user-district-input" className="block text-xs font-semibold text-[#6B665F] dark:text-[#94A3B8] mb-1">
                  {t.districtLabel}
                </label>
                <input
                  id="user-district-input"
                  type="text"
                  value={selectedDistrict}
                  onChange={(e) => onDistrictChange(e.target.value)}
                  placeholder={t.selectDistrict}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#2D3748] bg-white dark:bg-[#161B22] font-semibold text-[#2B2927] dark:text-[#F1F5F9] placeholder-[#8B867F] dark:placeholder-[#64748B] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] outline-hidden shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* ACTIVE & DETECTED SKILLS TRAY */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-[#6B665F] dark:text-[#94A3B8] uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#E87D4D]" />
                <span>{t.detectedSkills}</span>
              </span>
              <span className="text-xs font-bold text-[#2D5A5A] dark:text-[#2DD4BF] bg-[#EBF1F1] dark:bg-[#152E2E] px-2.5 py-0.5 rounded-full border border-[#CCE0E0] dark:border-[#1E4646]">
                {skills.length} {currentLanguage === 'hi' ? 'हुनर सक्रिय' : 'active skills'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 min-h-[50px] p-3 bg-[#F0ECE1] dark:bg-[#10151C] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D]">
              {skills.length === 0 ? (
                <span className="text-xs text-[#8B867F] dark:text-[#94A3B8] italic font-medium">
                  {t.noSkillsYet}
                </span>
              ) : (
                skills.map((skill) => {
                  const def = SKILL_TAXONOMY.find(s => s.canonical === skill.toLowerCase());
                  const displayName = def
                    ? (currentLanguage === 'hi' ? def.labelHi : def.labelEn)
                    : skill;

                  return (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D5A5A] dark:bg-[#163838] text-white dark:text-[#2DD4BF] border border-transparent dark:border-[#245454] text-xs sm:text-sm font-bold shadow-2xs animate-fadeIn"
                    >
                      <span>{displayName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-[#224646] dark:hover:bg-[#204E4E] rounded-full p-0.5 transition-colors cursor-pointer text-white/80 hover:text-white"
                        title="Remove skill"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })
              )}
            </div>

            {/* Custom Skill Manual Input */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSkill();
                  }
                }}
                placeholder={t.addSkillPlaceholder}
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#2D3748] bg-white dark:bg-[#161B22] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] outline-hidden font-semibold text-[#2B2927] dark:text-[#F1F5F9] placeholder-[#8B867F] dark:placeholder-[#64748B]"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-4 py-2 bg-[#F0ECE1] dark:bg-[#1E2633] hover:bg-[#E5E0D5] dark:hover:bg-[#283243] text-[#2B2927] dark:text-[#F1F5F9] font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-[#E5E0D5] dark:border-[#2D3748]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addSkillBtn}</span>
              </button>
            </div>

            {/* Categorized Quick Trade Suggestions */}
            <div className="mt-4 pt-3 border-t border-[#E5E0D5]/70 dark:border-[#262F3D]/70">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase">
                  {t.quickAddSkills}:
                </span>
                <div className="flex gap-1">
                  {POPULAR_SKILL_CATEGORIES.map((cat, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveCategoryIndex(idx)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors cursor-pointer ${
                        activeCategoryIndex === idx
                          ? 'bg-[#2D5A5A] text-white dark:bg-[#2DD4BF] dark:text-[#0D1117]'
                          : 'bg-[#FAF9F5] dark:bg-[#1A222E] text-[#6B665F] dark:text-[#94A3B8]'
                      }`}
                    >
                      {currentLanguage === 'hi' ? cat.categoryHi : cat.categoryEn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILL_CATEGORIES[activeCategoryIndex].skills.map((canonical) => {
                  const st = SKILL_TAXONOMY.find(s => s.canonical === canonical);
                  if (!st) return null;
                  const isSelected = skills.includes(canonical);

                  return (
                    <button
                      key={canonical}
                      type="button"
                      onClick={() => handleQuickAdd(canonical)}
                      className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#EBF1F1] dark:bg-[#163838] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#245454]'
                          : 'bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#2D3748] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633]'
                      }`}
                    >
                      <span>{currentLanguage === 'hi' ? st.labelHi.split('(')[0] : st.labelEn.split('(')[0]}</span>
                      {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-[#8B867F]" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* MAIN SUBMIT ACTION BUTTON */}
          <div className="pt-2">
            <button
              id="find-jobs-for-me-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#234848] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] font-extrabold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 min-h-[50px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{currentLanguage === 'hi' ? 'हुनर की पहचान और नौकरियां खोजी जा रही हैं...' : 'Extracting skills and finding opportunities...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#E87D4D] dark:text-[#0D1117]" />
                  <span>{t.findJobsForMe}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </section>
  );
};
