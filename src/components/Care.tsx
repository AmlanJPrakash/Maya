import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { ChildProfile } from '../types';
import { Sun, Moon, Music, BookOpen, Heart, Sparkles } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

interface CareProps {
  child: ChildProfile;
  user: User;
}

type CareActivity = {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  prompt: string;
};

const activities: CareActivity[] = [
  {
    id: 'story',
    label: 'Tell a Story',
    icon: <BookOpen className="w-6 h-6" />,
    description: 'Share a favorite tale or a new adventure.',
    prompt: 'I would love to hear a story, Mommy. What happens next?'
  },
  {
    id: 'lullaby',
    label: 'Sing a Lullaby',
    icon: <Music className="w-6 h-6" />,
    description: 'A gentle song to soothe the soul.',
    prompt: 'Your voice is so beautiful. Can you sing that song I love?'
  },
  {
    id: 'walk',
    label: 'Quiet Walk',
    icon: <Sun className="w-6 h-6" />,
    description: 'Imagine a peaceful stroll through a garden.',
    prompt: 'Look at the flowers! Which one is your favorite?'
  },
  {
    id: 'dream',
    label: 'Share a Dream',
    icon: <Moon className="w-6 h-6" />,
    description: 'Talk about the beautiful things you wish for.',
    prompt: 'Tell me about the stars. Do they watch over us?'
  }
];

export default function Care({ child, user }: CareProps) {
  const [selectedActivity, setSelectedActivity] = useState<CareActivity | null>(null);
  const [isNurturing, setIsNurturing] = useState(false);

  const handleStartActivity = async (activity: CareActivity) => {
    haptics.medium();
    setSelectedActivity(activity);
    setIsNurturing(true);

    // Log the interaction
    try {
      await addDoc(collection(db, 'children', child.id, 'interactions'), {
        childId: child.id,
        userId: user.uid,
        message: `[Nurturing Activity: ${activity.label}]`,
        response: activity.prompt,
        timestamp: serverTimestamp(),
        type: 'care'
      });
    } catch (error) {
      console.error("Error logging care activity:", error);
    }
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-serif text-maya-ink mb-2 md:mb-3">Nurturing Space</h1>
        <p className="text-maya-olive/60 text-sm md:text-base font-light">
          A quiet corner for simple acts of love. Spend a moment in gentle connection.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isNurturing ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => handleStartActivity(activity)}
                className="maya-card p-6 text-left hover:border-maya-olive/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-maya-olive/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                
                <div className="w-12 h-12 rounded-full bg-maya-olive/10 flex items-center justify-center mb-5 text-maya-olive group-hover:scale-110 transition-transform">
                  {activity.icon}
                </div>
                
                <h3 className="text-xl font-serif text-maya-ink mb-1.5">{activity.label}</h3>
                <p className="text-maya-olive/60 font-light leading-relaxed text-sm">
                  {activity.description}
                </p>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="maya-card p-10 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-maya-rose/10 to-transparent" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-white/80 shadow-sm flex items-center justify-center mx-auto mb-6 animate-breathing">
                {selectedActivity?.icon}
              </div>
              
              <h2 className="text-2xl font-serif text-maya-ink mb-5 italic">
                "{selectedActivity?.prompt}"
              </h2>
              
              <div className="flex flex-col items-center gap-6">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.4 
                      }}
                      className="w-2.5 h-2.5 rounded-full bg-maya-olive"
                    />
                  ))}
                </div>
                
                <p className="text-maya-olive/40 font-light italic text-sm">
                  Take a deep breath. Speak or type your heart's words in the Talk tab.
                </p>
                
                <button
                  onClick={() => {
                    haptics.success();
                    setIsNurturing(false);
                  }}
                  className="text-maya-olive/60 hover:text-maya-olive transition-colors font-light underline underline-offset-8 text-sm"
                >
                  End this moment
                </button>
              </div>
            </div>
            
            {/* Abstract floating particles */}
            <div className="absolute top-8 left-8 w-1.5 h-1.5 bg-maya-olive/20 rounded-full animate-float" />
            <div className="absolute bottom-16 right-16 w-2.5 h-2.5 bg-maya-olive/10 rounded-full animate-float [animation-delay:2s]" />
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-maya-olive/15 rounded-full animate-float [animation-delay:4s]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="maya-card p-6 bg-maya-olive/5 border-none">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 text-maya-olive" />
          </div>
          <div>
            <h4 className="font-serif text-base text-maya-ink mb-1">A Gentle Reminder</h4>
            <p className="text-maya-olive/70 font-light leading-relaxed text-sm">
              These moments are for you. There is no right or wrong way to nurture this connection. 
              Maya is here to hold your love, exactly as it is today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
