import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { ChildProfile, Interaction, Memory } from '../types';
import { Heart, MessageCircle, Book, Star, Sparkles, Sun, Moon, Coffee, Wind } from 'lucide-react';
import { format } from 'date-fns';
import ChildAvatar from './ChildAvatar';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/haptics';

interface DashboardProps {
  child: ChildProfile;
  onNavigate: (tab: 'dashboard' | 'chat' | 'care' | 'journal' | 'settings') => void;
}

export default function Dashboard({ child, onNavigate }: DashboardProps) {
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [greeting, setGreeting] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [nudge, setNudge] = useState('');

  const prompts = [
    "Tell me about your day...",
    "Do you want to hear a story?",
    "I'm listening, whenever you're ready.",
    "What's on your heart today?",
    "I remember the way you'd smile..."
  ];

  const nudges = [
    "Would you like to step outside for a bit today?",
    "Remember to take a deep breath. You're doing so well.",
    "Maybe a warm cup of tea would feel nice right now?",
    "The sun is out. A short walk might be gentle for your heart.",
    "It's okay to just be still for a moment."
  ];

  useEffect(() => {
    // Greeting logic
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning... I've been waiting for you.");
    else if (hour < 18) setGreeting("It feels peaceful when you're here.");
    else setGreeting("The evening is quiet... I'm glad you're here.");

    // Nudge logic
    setNudge(nudges[Math.floor(Math.random() * nudges.length)]);

    // Memories fetch
    const memoriesQ = query(
      collection(db, 'children', child.id, 'memories'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubMemories = onSnapshot(memoriesQ, (snapshot) => {
      setRecentMemories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Memory)));
    });

    // Prompt rotation
    const interval = setInterval(() => {
      setPromptIndex(prev => (prev + 1) % prompts.length);
    }, 8000);

    return () => {
      unsubMemories();
      clearInterval(interval);
    };
  }, [child.id]);

  const handleAction = (tab: any) => {
    haptics.light();
    onNavigate(tab);
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto space-y-12 py-8 md:py-12">
      {/* 1. Emotional Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-2"
      >
        <p className="text-maya-olive/40 text-[10px] uppercase tracking-[0.4em] font-bold">Maya Sanctuary</p>
        <motion.h2 
          animate={{ 
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-2xl md:text-3xl font-serif text-maya-ink font-light italic leading-tight"
        >
          {greeting}
        </motion.h2>
      </motion.div>

      {/* 3. Conversation Prompt */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={promptIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 1.5 }}
            className="text-maya-olive/60 font-serif italic text-lg md:text-xl font-light text-center"
          >
            {prompts[promptIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* 4. Care Interaction Buttons */}
      <div className="grid grid-cols-2 gap-4 w-full px-4">
        <ActionButton 
          icon={<MessageCircle className="w-5 h-5" />} 
          label="Talk" 
          onClick={() => handleAction('chat')} 
        />
        <ActionButton 
          icon={<Book className="w-5 h-5" />} 
          label="Storytime" 
          onClick={() => handleAction('chat')} 
        />
        <ActionButton 
          icon={<Wind className="w-5 h-5" />} 
          label="Sit quietly" 
          onClick={() => handleAction('care')} 
        />
        <ActionButton 
          icon={<Heart className="w-5 h-5" />} 
          label="Share memory" 
          onClick={() => handleAction('journal')} 
        />
      </div>

      {/* 5. Memory Glimpse Card */}
      {recentMemories.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleAction('journal')}
          className="w-full px-4"
        >
          <div className="maya-card p-6 text-left relative overflow-hidden group border-maya-olive/10">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Book className="w-12 h-12 text-maya-olive" />
            </div>
            <p className="text-[10px] text-maya-olive/30 uppercase tracking-[0.2em] font-bold mb-3">A Glimpse of Essence</p>
            <p className="text-maya-ink font-serif italic text-lg leading-relaxed opacity-80 line-clamp-2">
              "{recentMemories[Math.floor(Math.random() * recentMemories.length)].content}"
            </p>
            <div className="mt-4 flex items-center gap-2 text-maya-olive/40 text-[10px] font-bold uppercase tracking-widest">
              <span>View Timeline</span>
              <div className="h-px flex-1 bg-maya-olive/10" />
            </div>
          </div>
        </motion.button>
      )}

      {/* 6. Emotional Well-being Nudge */}
      <div className="px-8 py-6 bg-white/30 backdrop-blur-sm rounded-[32px] border border-maya-olive/5 text-center max-w-sm">
        <div className="flex justify-center mb-3">
          <Sun className="w-5 h-5 text-maya-olive/20" />
        </div>
        <p className="text-maya-olive/60 text-sm font-light leading-relaxed italic">
          {nudge}
        </p>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 p-6 bg-white/60 backdrop-blur-sm border border-maya-olive/5 rounded-[32px] hover:bg-white hover:shadow-xl hover:shadow-maya-olive/5 transition-all group"
    >
      <div className="w-12 h-12 rounded-full bg-maya-olive/5 flex items-center justify-center text-maya-olive/40 group-hover:text-maya-olive group-hover:bg-maya-olive/10 transition-all">
        {icon}
      </div>
      <span className="text-xs font-bold text-maya-olive/50 uppercase tracking-widest group-hover:text-maya-olive transition-colors">{label}</span>
    </button>
  );
}
