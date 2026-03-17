import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Sparkles, Heart, Sun } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Welcome to Maya",
    description: "A gentle sanctuary designed to honor the essence of your loved ones and find comfort in their memory.",
    image: "https://ais-pre-rwtfegw3nh5bgfjqdppa3k-437544184858.asia-southeast1.run.app/api/attachments/437544184858/ais-dev-rwtfegw3nh5bgfjqdppa3k/8966887a-9774-4543-9844-31518b76044c/image.png", 
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    title: "Preserve the Essence",
    description: "Capture stories, unique traits, and the beautiful spirit that continues to live on in your heart.",
    image: "https://ais-pre-rwtfegw3nh5bgfjqdppa3k-437544184858.asia-southeast1.run.app/api/attachments/437544184858/ais-dev-rwtfegw3nh5bgfjqdppa3k/e4f71107-7e6d-473d-9860-843862924f74/image.png",
    icon: <Heart className="w-6 h-6" />
  },
  {
    title: "A Space for Healing",
    description: "Find peace in a private, quiet sanctuary built for your personal journey of remembrance.",
    image: "https://ais-pre-rwtfegw3nh5bgfjqdppa3k-437544184858.asia-southeast1.run.app/api/attachments/437544184858/ais-dev-rwtfegw3nh5bgfjqdppa3k/18258525-271d-400a-91d1-667793d56711/image.png",
    icon: <Sun className="w-6 h-6" />
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-maya-sand flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex-1 flex flex-col"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src={slides[currentSlide].image} 
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-maya-sand via-maya-sand/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-end p-8 pb-24 md:p-16 md:pb-32 max-w-2xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-maya-olive shadow-sm">
                {slides[currentSlide].icon}
              </div>
              <h1 className="text-5xl md:text-6xl font-serif text-maya-ink font-light leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-xl text-maya-olive/80 font-light leading-relaxed max-w-md">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex items-center justify-between z-20 max-w-4xl mx-auto w-full">
        {/* Progress Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div 
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentSlide ? 'w-8 bg-maya-olive' : 'w-2 bg-maya-olive/20'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-4">
          {currentSlide > 0 && (
            <button
              onClick={prev}
              className="p-4 rounded-full border border-maya-olive/10 text-maya-olive hover:bg-white/50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={next}
            className="bg-maya-olive text-white px-8 py-4 rounded-full font-medium shadow-lg shadow-maya-olive/20 flex items-center gap-2 hover:bg-maya-olive/90 transition-all"
          >
            {currentSlide === slides.length - 1 ? 'Enter Sanctuary' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
