import React, { useState, useRef, useEffect } from 'react';
import { GovernmentScheme, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { X, Send, Bot, User, Loader2, HelpCircle } from 'lucide-react';

interface SchemeChatDrawerProps {
  scheme: GovernmentScheme | null;
  currentLanguage: Language;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const SchemeChatDrawer: React.FC<SchemeChatDrawerProps> = ({
  scheme,
  currentLanguage,
  onClose,
}) => {
  if (!scheme) return null;

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;
  const isHindi = currentLanguage === 'hi';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial greeting when opened
  useEffect(() => {
    const greetingText = isHindi
      ? `नमस्ते! मैं ${scheme.nameHi || scheme.name} का आधिकारिक सहायक हूँ। आप मुझसे पात्रता, आवश्यक दस्तावेज (कागजात), मिलने वाले लाभ या आवेदन करने के तरीके के बारे में पूछ सकते हैं।`
      : `Hello! I am the official assistant for ${scheme.name}. You can ask me about eligibility, required documents, benefits, or how to register.`;

    setMessages([
      {
        id: 'msg-init',
        sender: 'assistant',
        text: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [scheme, currentLanguage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/schemes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme,
          question: query,
          language: currentLanguage,
          history: messages.slice(-4)
        })
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.answer || (isHindi ? 'जानकारी प्राप्त नहीं हो सकी।' : 'Unable to retrieve answer.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: isHindi ? 'नेटवर्क समस्या। कृपया पुनः प्रयास करें।' : 'Network error. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Preset suggested questions
  const suggestedQuestions = isHindi
    ? [
        'क्या मैं इस योजना के लिए पात्र हूँ?',
        'कौन-कौन से कागजात (documents) चाहिए?',
        'आवेदन करने के लिए कहाँ जाना होगा?',
        'क्या मुझे कोई स्टाइपेंड या आर्थिक मदद मिलेगी?'
      ]
    : [
        'Am I eligible for this scheme?',
        'What documents are required?',
        'How and where do I apply?',
        'Is there any financial stipend or toolkit support?'
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div 
        id="scheme-chat-drawer"
        className="w-full max-w-lg bg-white dark:bg-[#161B22] h-full shadow-2xl flex flex-col justify-between animate-slideLeft border-l border-[#E5E0D5] dark:border-[#262F3D] transition-colors"
      >
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#10151C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] flex items-center justify-center font-bold shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-[#2B2927] dark:text-[#F1F5F9]">
                  {t.askAboutScheme}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#2D5A5A] dark:bg-[#2DD4BF] animate-pulse"></span>
              </div>
              <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] font-semibold truncate max-w-[200px] sm:max-w-[240px]">
                {currentLanguage === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B867F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#FAF9F5]/60 dark:bg-[#0D1117]">
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm font-medium leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] rounded-tr-xs'
                    : 'bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#262F3D] rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`text-[10px] block mt-1 ${
                    msg.sender === 'user' ? 'text-[#CCE0E0] dark:text-[#0D1117]/80 text-right' : 'text-[#8B867F] dark:text-[#94A3B8]'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#2B2927] dark:bg-[#262F3D] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-xs text-[#8B867F] dark:text-[#94A3B8] bg-white dark:bg-[#161B22] p-3 rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-[#E87D4D]" />
              <span>{isHindi ? 'योजना के रिकॉर्ड से उत्तर खोजा जा रहा है...' : 'Verifying from scheme data...'}</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="p-3 bg-[#FAF9F5] dark:bg-[#10151C] border-t border-[#E5E0D5] dark:border-[#262F3D]">
          <span className="text-[11px] font-bold text-[#8B867F] dark:text-[#94A3B8] uppercase tracking-wide block mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>{t.suggestedQuestions}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(q)}
                className="text-left px-2.5 py-1 text-[11px] font-semibold rounded-md bg-white dark:bg-[#161B22] hover:bg-[#FDF0EA] dark:hover:bg-[#281812] text-[#2B2927] dark:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#2D3748] hover:border-[#F6D3C2] dark:hover:border-[#4E2619] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-white dark:bg-[#161B22] border-t border-[#E5E0D5] dark:border-[#262F3D] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.askQuestionPlaceholder}
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E0D5] dark:border-[#2D3748] bg-[#FAF9F5] dark:bg-[#10151C] focus:bg-white dark:focus:bg-[#161B22] focus:border-[#2D5A5A] dark:focus:border-[#2DD4BF] outline-hidden font-medium text-[#2B2927] dark:text-[#F1F5F9]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 sm:px-4 sm:py-2.5 bg-[#E87D4D] hover:bg-[#D56B3A] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 min-h-[40px]"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t.send}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
