import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Heart, MessageCircle, Book, LogOut, Baby, Settings as SettingsIcon, Sparkles, Sun } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Components
import ChildCreation from './components/ChildCreation';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import MemoryJournal from './components/MemoryJournal';
import Settings from './components/Settings';
import Care from './components/Care';
import ChildAvatar from './components/ChildAvatar';
import Onboarding from './components/Onboarding';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { haptics } from './utils/haptics';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'care' | 'journal' | 'settings'>('dashboard');
  const [child, setChild] = useState<any>(null);
  const [isChildLoading, setIsChildLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    if (user) {
      setShowOnboarding(false);
      // Create user profile if it doesn't exist
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then((docSnap) => {
        if (!docSnap.exists()) {
          setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            createdAt: serverTimestamp(),
          });
        }
      });

      // Listen for child profile
      const q = query(collection(db, 'children'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setChild({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        } else {
          setChild(null);
        }
        setIsChildLoading(false);
      }, (error) => {
        console.error("Firestore error:", error);
        setIsChildLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsChildLoading(false);
    }
  }, [user]);

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  if (loading || isChildLoading) {
    return (
      <div className="min-h-screen bg-maya-sand flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-maya-olive/5 flex items-center justify-center animate-breathing mb-6">
            <Sparkles className="w-8 h-8 text-maya-olive/40" />
          </div>
          <p className="font-serif text-maya-olive/60 italic text-lg">Holding a space for you...</p>
        </div>
      </div>
    );
  }

  if (!user && showOnboarding) {
    return <Onboarding onComplete={handleLogin} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-maya-sand flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
        {/* Background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-maya-rose/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-maya-olive/10 rounded-full blur-[120px]" />
        
        <div className="max-w-xl relative z-10">
          <div className="w-20 h-20 rounded-full bg-white/50 backdrop-blur-sm shadow-sm flex items-center justify-center mx-auto mb-8 animate-float">
            <Sun className="w-10 h-10 text-maya-olive/60" />
          </div>
          <h1 className="text-6xl font-serif text-maya-ink mb-6 font-light tracking-tight">Maya</h1>
          <p className="text-xl text-maya-olive/80 mb-12 leading-relaxed font-light max-w-md mx-auto">
            A gentle sanctuary for honoring memories and finding comfort. Hold the essence of your love close to your heart.
          </p>
          <button
            onClick={handleLogin}
            className="bg-maya-olive text-white px-10 py-4 rounded-full font-medium hover:bg-maya-olive/90 transition-all shadow-lg shadow-maya-olive/20 flex items-center gap-3 mx-auto text-lg"
          >
            Enter the Sanctuary
          </button>
        </div>
      </div>
    );
  }

  if (!child) {
    return <ChildCreation user={user} />;
  }

  return (
    <div className="min-h-screen bg-maya-sand flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Mobile Header */}
      <header className="md:hidden bg-maya-cream/80 backdrop-blur-md border-b border-maya-olive/10 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <ChildAvatar child={child} size="sm" />
          <div>
            <h2 className="font-serif text-lg text-maya-ink font-light leading-tight">{child.name}</h2>
            <p className="text-[9px] text-maya-olive/50 uppercase tracking-widest font-bold">Sanctuary</p>
          </div>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="p-2 text-maya-olive/40 hover:text-maya-olive/60 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Sidebar - Desktop Only */}
      <nav className="hidden md:flex w-72 bg-maya-cream/80 backdrop-blur-md border-r border-maya-olive/10 p-8 flex-col z-20 h-screen sticky top-0 overflow-y-auto">
        <div className="flex items-center gap-4 mb-12">
          <ChildAvatar child={child} size="sm" />
          <div>
            <h2 className="font-serif text-2xl text-maya-ink font-light">{child.name}</h2>
            <p className="text-xs text-maya-olive/50 uppercase tracking-widest font-medium">Sanctuary</p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<Heart className="w-5 h-5" />}
            label="Home"
          />
          <NavButton 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')}
            icon={<MessageCircle className="w-5 h-5" />}
            label="Talk"
          />
          <NavButton 
            active={activeTab === 'care'} 
            onClick={() => setActiveTab('care')}
            icon={<Sun className="w-5 h-5" />}
            label="Nurture"
          />
          <NavButton 
            active={activeTab === 'journal'} 
            onClick={() => setActiveTab('journal')}
            icon={<Book className="w-5 h-5" />}
            label="Memories"
          />
          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            icon={<SettingsIcon className="w-5 h-5" />}
            label="Settings"
          />
        </div>

        <div className="pt-8 border-t border-maya-olive/10 space-y-3">
          <button
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-maya-olive/60 hover:bg-maya-olive/5 transition-all font-light"
          >
            <LogOut className="w-5 h-5" />
            <span>Leave Space</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-maya-olive/10 px-4 py-2 flex items-center justify-around z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <MobileNavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
          icon={<Heart className="w-5 h-5" />}
          label="Home"
        />
        <MobileNavButton 
          active={activeTab === 'journal'} 
          onClick={() => setActiveTab('journal')}
          icon={<Book className="w-5 h-5" />}
          label="Memories"
        />
        <MobileNavButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
          icon={<SettingsIcon className="w-5 h-5" />}
          label="Settings"
        />
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative">
        <div className="max-w-4xl mx-auto p-6 md:p-12 relative z-10">
          {activeTab === 'dashboard' && <Dashboard child={child} onNavigate={setActiveTab} />}
          {activeTab === 'chat' && <Chat child={child} user={user} />}
          {activeTab === 'care' && <Care child={child} user={user} />}
          {activeTab === 'journal' && <MemoryJournal child={child} user={user} />}
          {activeTab === 'settings' && <Settings child={child} />}
        </div>
        
        {/* Decorative background for main content */}
        <div className="fixed top-0 right-0 w-[50%] h-[50%] bg-maya-rose/10 rounded-full blur-[150px] pointer-events-none" />
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  const handleClick = () => {
    haptics.light();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group",
        active 
          ? "bg-maya-olive text-white shadow-xl shadow-maya-olive/10 translate-x-1" 
          : "text-maya-olive/70 hover:bg-maya-olive/5 hover:translate-x-1"
      )}
    >
      <span className={cn("transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")}>
        {icon}
      </span>
      <span className="font-light text-lg">{label}</span>
    </button>
  );
}

function MobileNavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  const handleClick = () => {
    haptics.light();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
        active ? "text-maya-olive" : "text-maya-olive/40"
      )}
    >
      <div className={cn(
        "p-2 rounded-full transition-all",
        active ? "bg-maya-olive/10 scale-110" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

