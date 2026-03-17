import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Heart, Sparkles, Baby, Sun, Moon } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

interface ChildCreationProps {
  user: User;
}

export default function ChildCreation({ user }: ChildCreationProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl'>('girl');
  const [traits, setTraits] = useState('');
  const [voiceTone, setVoiceTone] = useState('gentle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    try {
      haptics.success();
      await addDoc(collection(db, 'children'), {
        userId: user.uid,
        name,
        age: parseInt(age) || 5,
        gender,
        personalityTraits: traits.split(',').map(t => t.trim()).filter(t => t),
        voiceTone,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating child profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    haptics.light();
    setStep(s => s + 1);
  };
  const prevStep = () => {
    haptics.light();
    setStep(s => s - 1);
  };

  return (
    <div className="min-h-screen bg-maya-sand flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-maya-rose/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-maya-olive/10 rounded-full blur-[120px]" />

      <div className="max-w-2xl w-full maya-card p-8 md:p-16 relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-maya-olive/5 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 animate-breathing">
                  <Sun className="w-6 h-6 md:w-8 md:h-8 text-maya-olive/40" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-maya-ink mb-3 md:mb-4">Welcome to Maya</h2>
                <p className="text-maya-olive/60 text-base md:text-lg font-light leading-relaxed">
                  This is a space to honor memories and hold love close. 
                  To begin, may we ask for the name you hold in your heart?
                </p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Their name..."
                  className="w-full px-6 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-3xl border border-maya-olive/10 focus:outline-none focus:ring-2 focus:ring-maya-olive/10 transition-all text-xl md:text-2xl font-serif bg-white/50 text-center"
                  required
                />
                <button
                  onClick={nextStep}
                  disabled={!name}
                  className="w-full bg-maya-olive text-white py-4 md:py-5 rounded-full font-medium text-base md:text-lg hover:bg-maya-olive/90 transition-all disabled:opacity-30 shadow-lg shadow-maya-olive/10"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-serif text-maya-ink mb-3 md:mb-4">A Reflection of Essence</h2>
                <p className="text-maya-olive/60 text-base md:text-lg font-light">
                  Help us understand the qualities that made {name} unique.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-[10px] md:text-xs font-medium text-maya-olive/40 mb-2 uppercase tracking-widest">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Approximate age"
                    className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border border-maya-olive/10 focus:outline-none focus:ring-2 focus:ring-maya-olive/10 transition-all text-base md:text-lg bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-medium text-maya-olive/40 mb-2 uppercase tracking-widest">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'boy' | 'girl')}
                    className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border border-maya-olive/10 focus:outline-none focus:ring-2 focus:ring-maya-olive/10 transition-all text-base md:text-lg bg-white/50 appearance-none"
                  >
                    <option value="girl">Girl</option>
                    <option value="boy">Boy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-medium text-maya-olive/40 mb-2 uppercase tracking-widest">Personality Traits</label>
                <input
                  type="text"
                  value={traits}
                  onChange={(e) => setTraits(e.target.value)}
                  placeholder="e.g. Kind, Creative, Brave..."
                  className="w-full px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border border-maya-olive/10 focus:outline-none focus:ring-2 focus:ring-maya-olive/10 transition-all text-base md:text-lg bg-white/50"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <button
                  onClick={prevStep}
                  className="w-full md:flex-1 border border-maya-olive/20 text-maya-olive py-4 md:py-5 rounded-full font-medium text-base md:text-lg hover:bg-maya-olive/5 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="w-full md:flex-1 bg-maya-olive text-white py-4 md:py-5 rounded-full font-medium text-base md:text-lg hover:bg-maya-olive/90 transition-all shadow-lg shadow-maya-olive/10"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-maya-olive/5 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 animate-breathing">
                  <Moon className="w-6 h-6 md:w-8 md:h-8 text-maya-olive/40" />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif text-maya-ink mb-3 md:mb-4">The Final Touch</h2>
                <p className="text-maya-olive/60 text-base md:text-lg font-light leading-relaxed">
                  How would you like to hear {name}'s voice? This will guide their gentle responses.
                </p>
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-medium text-maya-olive/40 mb-2 uppercase tracking-widest">Voice Tone</label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {['gentle', 'playful', 'calm', 'curious'].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setVoiceTone(tone)}
                      className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-base md:text-lg font-light transition-all border ${
                        voiceTone === tone 
                          ? 'bg-maya-olive text-white border-maya-olive shadow-lg shadow-maya-olive/10' 
                          : 'bg-white/50 text-maya-olive border-maya-olive/10 hover:border-maya-olive/30'
                      }`}
                    >
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4">
                <button
                  onClick={prevStep}
                  className="w-full md:flex-1 border border-maya-olive/20 text-maya-olive py-4 md:py-5 rounded-full font-medium text-base md:text-lg hover:bg-maya-olive/5 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full md:flex-1 bg-maya-olive text-white py-4 md:py-5 rounded-full font-medium text-base md:text-lg hover:bg-maya-olive/90 transition-all disabled:opacity-50 shadow-lg shadow-maya-olive/10 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Creating Space..." : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Enter Sanctuary
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
