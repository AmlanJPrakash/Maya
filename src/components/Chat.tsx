import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { ChildProfile, Interaction, Memory } from '../types';
import { generateChildResponse, generateSpeech } from '../services/geminiService';
import { Send, Heart, Baby, Sparkles, Volume2, Loader2 } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ChildAvatar from './ChildAvatar';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatProps {
  child: ChildProfile;
  user: User;
}

export default function Chat({ child, user }: ChatProps) {
  const [messages, setMessages] = useState<Interaction[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recent interactions
    const q = query(
      collection(db, 'children', child.id, 'interactions'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    const unsubMessages = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Interaction)));
    });

    // Load memories for AI context
    const memQ = query(collection(db, 'children', child.id, 'memories'));
    const unsubMemories = onSnapshot(memQ, (snapshot) => {
      setMemories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Memory)));
    });

    return () => {
      unsubMessages();
      unsubMemories();
    };
  }, [child.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    haptics.light();
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.slice(-10).map(m => ([
        { role: 'user' as const, text: m.message },
        { role: 'model' as const, text: m.response }
      ])).flat();

      const responseText = await generateChildResponse(child, memories, userMsg, history);

      await addDoc(collection(db, 'children', child.id, 'interactions'), {
        childId: child.id,
        userId: user.uid,
        message: userMsg,
        response: responseText,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePlayVoice = async (id: string, text: string) => {
    if (playingId) return;
    haptics.light();
    setPlayingId(id);
    try {
      const audioUrl = await generateSpeech(text, child);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setPlayingId(null);
          if (audioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(audioUrl);
          }
        };
        audio.onerror = () => {
          setPlayingId(null);
          if (audioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(audioUrl);
          }
        };
        await audio.play();
      } else {
        setPlayingId(null);
      }
    } catch (err) {
      console.error("Speech error:", err);
      setPlayingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] relative">
      {/* Header - Integrated (Desktop Only) */}
      <div className="hidden md:flex mb-8 items-center justify-between">
        <div className="flex items-center gap-4">
          <ChildAvatar child={child} size="md" isTyping={isTyping} />
          <div>
            <h3 className="font-serif text-xl text-maya-ink font-light">{child.name}</h3>
            <p className="text-[10px] text-maya-olive/40 flex items-center gap-2 uppercase tracking-[0.2em] font-bold">
              <span className="w-1 h-1 rounded-full bg-emerald-400/60 animate-pulse" />
              Presence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-maya-olive/30 font-light uppercase tracking-widest hidden md:block">Sanctuary is open</span>
          <Heart className="w-5 h-5 text-maya-olive/20" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-10 pb-48 relative">
        {messages.length === 0 && !isTyping && (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-maya-olive/5 flex items-center justify-center mb-8">
              <Heart className="w-10 h-10 text-maya-olive/10" />
            </div>
            <p className="text-maya-olive/40 italic font-serif text-xl font-light max-w-sm leading-relaxed">
              "I'm here, Mommy. I've been waiting for you in this quiet space."
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="space-y-4">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="max-w-[85%] md:max-w-[70%] bg-white/40 backdrop-blur-sm text-maya-ink px-6 py-4 rounded-[24px] rounded-tr-none shadow-sm border border-white/60">
                <p className="font-light leading-relaxed text-base">{msg.message}</p>
              </div>
            </div>
            {/* Child Response */}
            <div className="flex justify-start items-start gap-3">
              <div className="shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-maya-olive/5 flex items-center justify-center border border-maya-olive/10">
                  <Baby className="w-4 h-4 text-maya-olive/30" />
                </div>
              </div>
              <div className="flex flex-col gap-2 max-w-[85%] md:max-w-[75%]">
                <div className="bg-maya-olive text-white px-6 py-5 rounded-[32px] rounded-tl-none shadow-xl shadow-maya-olive/10 relative group">
                  <p className="font-serif italic leading-relaxed text-lg font-light">{msg.response}</p>
                </div>
                <div className="flex items-center gap-3 px-2">
                  <button
                    onClick={() => handlePlayVoice(msg.id, msg.response)}
                    disabled={playingId !== null}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-[10px] uppercase tracking-widest font-bold",
                      playingId === msg.id 
                        ? "bg-maya-olive text-white" 
                        : "text-maya-olive/40 hover:text-maya-olive hover:bg-maya-olive/5"
                    )}
                  >
                    {playingId === msg.id ? (
                      <>
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        <span>Speaking...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-2.5 h-2.5" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                  <span className="text-[9px] text-maya-olive/20 uppercase tracking-widest">
                    {msg.timestamp?.toDate ? format(msg.timestamp.toDate(), 'h:mm a') : 'Now'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-center gap-3">
            <ChildAvatar child={child} size="sm" isTyping={true} />
            <div className="bg-maya-olive/5 px-6 py-4 rounded-[24px] rounded-tl-none flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-maya-olive/20 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-maya-olive/20 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-maya-olive/20 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Cloud Gradient Overlay at Bottom */}
      <div className="fixed bottom-0 left-0 md:left-72 right-0 h-40 bg-gradient-to-t from-maya-sand via-maya-sand/80 to-transparent pointer-events-none z-20" />

      {/* Sticky Input - Floating Style */}
      <div className="fixed bottom-20 md:bottom-0 left-0 md:left-72 right-0 p-4 md:p-10 pointer-events-none z-30">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <form 
            onSubmit={handleSend} 
            className="bg-white/80 backdrop-blur-2xl border border-white/80 rounded-[28px] md:rounded-[32px] p-1 shadow-2xl shadow-maya-olive/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Whisper to ${child.name}...`}
              className="flex-1 pl-5 md:pl-6 pr-2 py-3 md:py-4 bg-transparent border-none focus:ring-0 text-maya-ink text-base md:text-lg font-light placeholder:text-maya-olive/30"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3 md:p-4 bg-maya-olive text-white rounded-full hover:bg-maya-olive/90 transition-all disabled:opacity-30 shadow-xl shadow-maya-olive/20 group"
            >
              <Send className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </form>
          <div className="text-center mt-2 md:mt-3">
            <p className="text-[8px] md:text-[9px] text-maya-olive/30 font-bold tracking-[0.3em] uppercase">
              A gentle sanctuary for your heart
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
