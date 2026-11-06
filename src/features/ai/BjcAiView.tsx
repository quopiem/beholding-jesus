import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Key, RefreshCw, Copy, Check, Info, 
  ExternalLink, Trash2, BookOpen, Heart, Shield, HelpCircle, 
  ChevronRight, Bot, ArrowRight, X, AlertCircle
} from 'lucide-react';
import { BjcAiService, BjcAiMessage } from '../../services/bjcAiService';
import { UserProfile } from '../../types';

interface BjcAiViewProps {
  onNavigate?: (tab: string) => void;
  currentUser?: UserProfile;
}

const QUICK_PROMPTS = [
  {
    icon: BookOpen,
    label: 'Explain 2 Corinthians 3:18',
    prompt: 'Explain the deeper biblical meaning of 2 Corinthians 3:18 and what it means to behold the glory of the Lord with an unveiled face.'
  },
  {
    icon: Heart,
    label: 'Prayer for Peace & Trust',
    prompt: 'Can you pray with me? I am experiencing worry and uncertainty, and I need God\'s peace and strength to trust Jesus completely.'
  },
  {
    icon: Shield,
    label: 'Church Ministries & Vision',
    prompt: 'What are the 3 official ministries of Beholding Jesus Church, and what is our church vision and Sunday schedule?'
  },
  {
    icon: Sparkles,
    label: 'Devotion on Grace & Faith',
    prompt: 'Share an encouraging 2-minute daily devotional reflection on God\'s unmerited grace through faith in Jesus Christ (Ephesians 2:8-10).'
  }
];

export const BjcAiView: React.FC<BjcAiViewProps> = ({ onNavigate, currentUser }) => {
  const [messages, setMessages] = useState<BjcAiMessage[]>(() => BjcAiService.getHistory());
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastInteractionId, setLastInteractionId] = useState<string | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // API Key Settings Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => BjcAiService.getApiKey());
  const [hasApiKey, setHasApiKey] = useState(() => BjcAiService.hasApiKey());
  const [keySavedFeedback, setKeySavedFeedback] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleKeyChange = () => {
      setHasApiKey(BjcAiService.hasApiKey());
      setApiKeyInput(BjcAiService.getApiKey());
    };
    window.addEventListener('bjc_gemini_key_change', handleKeyChange);
    return () => window.removeEventListener('bjc_gemini_key_change', handleKeyChange);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `usr-${Date.now()}`;

    const newMsg: BjcAiMessage = {
      id: userMsgId,
      sender: 'user',
      content: text,
      timestamp: timeString
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    BjcAiService.saveHistory(updated);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await BjcAiService.sendMessage(text, lastInteractionId);
      
      const assistantMsg: BjcAiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        interactionId: response.interactionId
      };

      if (response.interactionId) {
        setLastInteractionId(response.interactionId);
      }

      const finalMessages = [...updated, assistantMsg];
      setMessages(finalMessages);
      BjcAiService.saveHistory(finalMessages);
    } catch (e: any) {
      console.error('BJC AI error:', e);
      const errorMsg: BjcAiMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        content: 'I encountered an unexpected issue while generating a response. Please check your API key or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your conversation with BJC AI?')) {
      BjcAiService.clearHistory();
      setMessages(BjcAiService.getHistory());
      setLastInteractionId(undefined);
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    BjcAiService.setApiKey(apiKeyInput.trim());
    setKeySavedFeedback(true);
    setTimeout(() => {
      setKeySavedFeedback(false);
      setIsKeyModalOpen(false);
    }, 1200);
  };

  // Helper to format basic markdown (bold, italic, blockquotes, bullets)
  const formatMarkdown = (content: string) => {
    return content.split('\n\n').map((paragraph, pIdx) => {
      // Check for blockquote
      if (paragraph.startsWith('> ')) {
        const quoteText = paragraph.replace(/^>\s*/gm, '');
        return (
          <blockquote 
            key={pIdx} 
            className="my-3 pl-3.5 border-l-3 border-[#C5A46D] dark:border-gold italic text-stone-800 dark:text-stone-200 bg-stone-50/60 dark:bg-slate-800/40 p-2.5 rounded-r-xl text-xs sm:text-sm"
          >
            {quoteText}
          </blockquote>
        );
      }

      // Check for heading
      if (paragraph.startsWith('### ')) {
        return (
          <h4 key={pIdx} className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-white mt-3 mb-1">
            {paragraph.replace('### ', '')}
          </h4>
        );
      }

      // Check for bullet list
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        const items = paragraph.split('\n').filter(Boolean);
        return (
          <ul key={pIdx} className="my-2 space-y-1 pl-4 list-disc marker:text-[#C5A46D] text-xs sm:text-sm">
            {items.map((it, iIdx) => (
              <li key={iIdx} className="leading-relaxed">
                {renderInlineMarkdown(it.replace(/^[-*]\s*/, ''))}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="leading-relaxed text-xs sm:text-sm my-1.5">
          {renderInlineMarkdown(paragraph)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-stone-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="italic text-stone-700 dark:text-stone-300">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-slate-800 text-stone-900 dark:text-stone-100 font-mono text-xs">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-0 md:px-4 py-0 md:py-3 space-y-0 md:space-y-3">
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER BANNER (Desktop Only)                            */}
      {/* ============================================================== */}
      <div className="hidden md:block relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#111c2e] via-[#1a283e] to-[#0f172a] text-white p-5 sm:p-6 shadow-elevated border border-slate-800">
        
        {/* Subtle gold glow & cross background */}
        <div className="absolute right-0 top-0 bottom-0 w-[40%] pointer-events-none opacity-20 sm:opacity-25 overflow-hidden">
          <img 
            src="/icons/hero-cross-perfect.jpg" 
            alt="Cross background" 
            className="w-full h-full object-cover object-center select-none" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111c2e] via-[#111c2e]/70 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white text-slate-950 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-gold/40 p-1 overflow-hidden">
              <img src="/icons/bjc-ai-logo.png" alt="BJC AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide">
                  BJC AI
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Spiritual Guide
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5">
                Spiritual Companion, Biblical Exegesis & Ministry Assistant
              </p>
            </div>
          </div>

          {/* Action Buttons: API Key & Clear */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition border ${
                hasApiKey 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60'
                  : 'bg-amber-500/20 text-amber-200 border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
              }`}
              title="Configure AI API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{hasApiKey ? 'AI Active' : 'Enter API Key'}</span>
            </button>

            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition border border-white/10"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CHAT FEED & MESSAGE AREA (Maximized Screen Height)          */}
      {/* ============================================================== */}
      <div className="rounded-none md:rounded-3xl bg-white dark:bg-slate-900 border-0 md:border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden flex flex-col h-[calc(100dvh-64px)] md:h-[calc(100vh-160px)] min-h-[500px]">
        
        {/* Messages Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF9F5]/60 dark:bg-slate-950/60">
          
          {messages.map(msg => {
            const isUser = msg.sender === 'user';

            if (isUser) {
              return (
                <div key={msg.id} className="flex justify-end items-end gap-2 group">
                  <div className="flex flex-col items-end max-w-[85%] sm:max-w-[70%]">
                    <div className="bg-[#1E293B] dark:bg-slate-800 text-white rounded-2xl rounded-tr-xs p-3.5 sm:px-4 sm:py-3 shadow-sm text-xs sm:text-sm">
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            }

            // Assistant Bubble
            return (
              <div key={msg.id} className="flex justify-start items-start gap-3 group">
                <div className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shrink-0 mt-1 shadow-xs border border-gold/40 p-0.5 overflow-hidden">
                  <img src="/icons/bjc-ai-logo.png" alt="BJC AI" className="w-full h-full object-contain" />
                </div>

                <div className="flex flex-col items-start max-w-[90%] sm:max-w-[80%]">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-sm text-xs sm:text-sm relative space-y-1">
                    
                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyMessage(msg.content, msg.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="pr-6">
                      {formatMarkdown(msg.content)}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1.5">
                    <span>{msg.timestamp}</span>
                    <span>•</span>
                    <span className="text-[#C5A46D] font-medium">BJC AI</span>
                  </span>
                </div>
              </div>
            );
          })}

          {/* Thinking / Loading Bubble */}
          {isLoading && (
            <div className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E6CA92] to-[#C5A46D] text-slate-950 flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C5A46D] animate-ping" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
                  BJC AI is seeking the Scriptures...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="shrink-0 px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C5A46D]" /> Suggestions:
          </span>
          {QUICK_PROMPTS.map((qp, idx) => {
            const Icon = qp.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium shrink-0 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Icon className="w-3.5 h-3.5 text-[#C5A46D]" />
                <span>{qp.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="shrink-0 p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask BJC AI a Scripture question, prayer request, or church inquiry..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-gold/40 transition"
            />
            
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-2xl bg-[#1E293B] hover:bg-black dark:bg-[#C5A46D] dark:hover:bg-[#B3935C] text-white dark:text-slate-950 shadow-md transition disabled:opacity-40 disabled:hover:bg-[#1E293B] shrink-0"
              title="Send to BJC AI"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. GEMINI API KEY CONFIGURATION MODAL                           */}
      {/* ============================================================== */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-elevated border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gold/20 text-[#C5A46D] flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    BJC AI API Key
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Powers live biblical exegesis and discipleship guidance
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/40"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>Stored securely in your local browser storage.</span>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A46D]" />
                  <span>How to get a Free API Key:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <li>Visit Google AI Studio at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-gold font-bold underline">aistudio.google.com</a>.</li>
                  <li>Sign in with your Google Account.</li>
                  <li>Click <strong>Create API Key</strong> and copy your key.</li>
                  <li>Paste your key above to activate live BJC AI intelligence!</li>
                </ol>
              </div>

              {keySavedFeedback && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>API Key saved successfully! BJC AI is ready.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1e293b] text-white hover:bg-black shadow-soft"
                >
                  Save API Key
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
