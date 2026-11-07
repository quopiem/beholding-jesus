import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, X, Maximize2, Send, Bot, Copy, Check, Key, BookOpen, Heart, Trash2, Move 
} from 'lucide-react';
import { BjcAiService, BjcAiMessage } from '../../services/bjcAiService';

interface BjcAiFloatingButtonProps {
  onOpenFullView: () => void;
  currentTab?: string;
  isHiddenInChat?: boolean;
}

export const BjcAiFloatingButton: React.FC<BjcAiFloatingButtonProps> = ({ 
  onOpenFullView, 
  currentTab,
  isHiddenInChat 
}) => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState<BjcAiMessage[]>(() => BjcAiService.getHistory());
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(() => BjcAiService.hasApiKey());

  // Movable / Draggable Button Position across the entire screen (mobile, tablet, desktop)
  const [customPos, setCustomPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      if (typeof window === 'undefined') return null;
      const saved = localStorage.getItem('bjc_ai_fab_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const minX = 8;
          const maxX = Math.max(minX, window.innerWidth - 110);
          const minY = 12;
          const maxY = Math.max(minY, window.innerHeight - 56);
          return {
            x: Math.min(Math.max(minX, parsed.x), maxX),
            y: Math.min(Math.max(minY, parsed.y), maxY)
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; origX: number; origY: number }>({
    startX: 0, startY: 0, origX: 0, origY: 0
  });
  const hasMovedRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safely keep custom position inside bounds when screen resizes or device rotates
  useEffect(() => {
    const handleResize = () => {
      setCustomPos(prev => {
        if (!prev) return null;
        const minX = 8;
        const maxX = Math.max(minX, window.innerWidth - 110);
        const minY = 12;
        const maxY = Math.max(minY, window.innerHeight - 56);
        const clampedX = Math.min(Math.max(minX, prev.x), maxX);
        const clampedY = Math.min(Math.max(minY, prev.y), maxY);
        if (clampedX !== prev.x || clampedY !== prev.y) {
          const updated = { x: clampedX, y: clampedY };
          try {
            localStorage.setItem('bjc_ai_fab_pos', JSON.stringify(updated));
          } catch {}
          return updated;
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    const handleKey = () => setHasApiKey(BjcAiService.hasApiKey());
    window.addEventListener('bjc_gemini_key_change', handleKey);
    return () => window.removeEventListener('bjc_gemini_key_change', handleKey);
  }, []);

  useEffect(() => {
    const handleChat = (e: any) => {
      setIsChatActive(Boolean(e.detail?.isOpen));
      if (e.detail?.isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('bjc_chat_conversation_view', handleChat);
    window.addEventListener('bjc_direct_chat_view', handleChat);
    return () => {
      window.removeEventListener('bjc_chat_conversation_view', handleChat);
      window.removeEventListener('bjc_direct_chat_view', handleChat);
    };
  }, []);

  // Pointer drag listeners for FAB - enables moving across the entire screen
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isOpen) return;
    const fabEl = fabRef.current;
    if (!fabEl) return;

    const rect = fabEl.getBoundingClientRect();
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMovedRef.current = true;
      const minX = 8;
      const maxX = Math.max(minX, window.innerWidth - 110);
      const minY = 12;
      const maxY = Math.max(minY, window.innerHeight - 56);

      const newX = Math.max(minX, Math.min(maxX, dragStartRef.current.origX + dx));
      const newY = Math.max(minY, Math.min(maxY, dragStartRef.current.origY + dy));
      setCustomPos({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (hasMovedRef.current && customPos) {
      try {
        localStorage.setItem('bjc_ai_fab_pos', JSON.stringify(customPos));
      } catch {}
    } else if (!hasMovedRef.current) {
      // It was a tap / click! Open modal
      setIsOpen(true);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const text = (customPrompt || inputText).trim();
    if (!text || isLoading) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: BjcAiMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: timeString
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    BjcAiService.saveHistory(updated);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await BjcAiService.sendMessage(text);
      const assistantMsg: BjcAiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMsgs = [...updated, assistantMsg];
      setMessages(finalMsgs);
      BjcAiService.saveHistory(finalMsgs);
    } catch {
      const err: BjcAiMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        content: 'I had trouble connecting to the service. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, err]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Safe default positioning when on community tab to never block chat send button
  const defaultPosClass = currentTab === 'community' 
    ? 'bottom-28 md:bottom-8 right-4 sm:right-6' 
    : 'bottom-20 md:bottom-8 right-4 sm:right-6';

  // If not yet mounted in DOM, do not render portal
  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  // If hidden or inside active conversation with someone or GC, do not render to keep message input fully visible
  if (isHiddenInChat || (currentTab === 'community' && isChatActive)) {
    return null;
  }

  return createPortal(
    <>
      {/* Movable Floating Action Button (FAB) - Freely draggable across the entire screen */}
      {!isOpen && (
        <button
          ref={fabRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={customPos ? { 
            position: 'fixed', 
            left: `${customPos.x}px`, 
            top: `${customPos.y}px`, 
            bottom: 'auto', 
            right: 'auto',
            touchAction: 'none'
          } : {
            touchAction: 'none'
          }}
          className={`${!customPos ? `fixed ${defaultPosClass}` : ''} z-[999] group flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full bg-gradient-to-r from-[#111c2e] to-[#1e293b] text-white shadow-[0_8px_25px_rgba(0,0,0,0.35)] border border-[#C5A46D]/60 hover:scale-105 transition-transform duration-150 cursor-grab active:cursor-grabbing select-none touch-none`}
          title="Drag to move anywhere • Tap to chat with BJC AI"
          aria-label="BJC AI Assistant (Drag to move anywhere, tap to chat)"
        >
          <div className="w-6 h-6 rounded-full bg-white text-slate-950 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-0.5 border border-[#C5A46D] pointer-events-none select-none">
            <img src="/icons/bjc-ai-logo.png" alt="BJC AI" className="w-full h-full object-contain rounded-full pointer-events-none select-none" />
          </div>
          <span className="font-serif font-bold text-xs tracking-wide text-white group-hover:text-gold transition select-none pointer-events-none">
            BJC AI
          </span>
          <Move className="w-3 h-3 text-slate-400 group-hover:text-[#C5A46D] opacity-70 pointer-events-none select-none" />
        </button>
      )}

      {/* Floating Assistant Modal / Widget */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-2 sm:right-6 z-[1000] w-[calc(100vw-16px)] sm:w-[420px] h-[520px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-elevated border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="shrink-0 p-3.5 px-4 bg-gradient-to-r from-[#111c2e] to-[#1e293b] text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white text-slate-950 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-0.5 border border-[#C5A46D]">
                <img src="/icons/bjc-ai-logo.png" alt="BJC AI" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm text-white leading-none">
                    BJC AI
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Beholding Jesus Church Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullView();
                }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Open full page view"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="shrink-0 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => handleSendMessage("Share an encouraging verse for today with an uplifting prayer.")}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-gold hover:text-gold shrink-0 transition flex items-center gap-1"
            >
              <Heart className="w-3 h-3 text-rose-500" />
              <span>Daily Encouragement</span>
            </button>
            <button
              onClick={() => handleSendMessage("What is the meaning and context of 2 Corinthians 3:18?")}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-gold hover:text-gold shrink-0 transition flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3 text-gold" />
              <span>2 Cor 3:18 Exegesis</span>
            </button>
          </div>

          {/* Messages Scroll Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#FAF8F5] dark:bg-slate-950 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-card border border-[#C5A46D]/40 flex items-center justify-center p-1.5 overflow-hidden">
                  <img src="/icons/bjc-ai-logo.png" alt="BJC AI" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-slate-800 dark:text-white text-sm mb-1">
                    Welcome to BJC AI
                  </h4>
                  <p className="text-xs text-slate-500 max-w-[260px]">
                    Ask theological questions, seek pastoral encouragement, or explore Sunday sermon topics.
                  </p>
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1E293B] dark:bg-slate-800 text-white rounded-tr-xs shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-xs shadow-xs border border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                    <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-black/5 dark:border-white/5 text-[10px] opacity-60">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'assistant' && (
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="hover:opacity-100 flex items-center gap-1 transition"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" />
                <span>BJC AI is prayerfully reflecting...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="shrink-0 p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
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
                placeholder="Ask about scripture or prayer..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-gold/30"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white flex items-center justify-center transition disabled:opacity-40 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>,
    document.body
  );
};
