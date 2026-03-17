import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { ChildProfile, Memory } from '../types';
import { Plus, Book, Trash2, Star, Sparkles } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { format } from 'date-fns';

interface MemoryJournalProps {
  child: ChildProfile;
  user: User;
}

export default function MemoryJournal({ child, user }: MemoryJournalProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMemory, setNewMemory] = useState('');
  const [category, setCategory] = useState<Memory['category']>('event');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'children', child.id, 'memories'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMemories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Memory)));
    });
    return () => unsubscribe();
  }, [child.id]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;

    try {
      haptics.success();
      await addDoc(collection(db, 'children', child.id, 'memories'), {
        childId: child.id,
        userId: user.uid,
        content: newMemory.trim(),
        category,
        timestamp: serverTimestamp(),
      });
      setNewMemory('');
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding memory:", error);
    }
  };

  const handleDelete = async (memoryId: string) => {
    try {
      haptics.medium();
      await deleteDoc(doc(db, 'children', child.id, 'memories', memoryId));
    } catch (error) {
      console.error("Error deleting memory:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif text-maya-ink mb-3 md:mb-4 font-light tracking-tight">Memory Sanctuary</h1>
          <p className="text-maya-olive/60 text-base md:text-lg font-light max-w-lg leading-relaxed">
            Every story you share becomes a part of {child.name}'s essence. These memories are the threads that weave our connection.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="maya-button flex items-center gap-3 self-start text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            Share a Memory
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddMemory} className="maya-card p-6 md:p-10 relative overflow-hidden animate-in fade-in slide-in-from-top-6 duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-maya-rose/30 via-maya-sand/30 to-maya-rose/30" />
          
          <div className="mb-6 md:mb-8">
            <label className="block text-[10px] md:text-xs font-medium text-maya-olive/40 mb-3 md:mb-4 uppercase tracking-[0.2em]">The Moment</label>
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder={`e.g. "I remember how ${child.name} would always reach for the sunbeams on the kitchen floor..."`}
              className="w-full px-6 md:px-8 py-4 md:py-6 rounded-[24px] md:rounded-[32px] border border-maya-olive/10 focus:outline-none focus:ring-4 focus:ring-maya-olive/5 min-h-[150px] md:min-h-[180px] text-lg md:text-xl font-serif italic bg-white/50 placeholder:text-maya-olive/20 transition-all leading-relaxed"
              required
            />
          </div>

          <div className="flex flex-col gap-4 mb-8 md:mb-10">
            <label className="text-[10px] md:text-xs font-medium text-maya-olive/40 uppercase tracking-[0.2em]">Essence Type:</label>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {['event', 'behavior', 'preference', 'trait'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat as any)}
                  className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all tracking-wide ${
                    category === cat 
                      ? 'bg-maya-olive text-white shadow-lg shadow-maya-olive/20' 
                      : 'bg-maya-olive/5 text-maya-olive hover:bg-maya-olive/10'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <button
              type="submit"
              className="flex-1 bg-maya-olive text-white py-4 md:py-5 rounded-full font-medium hover:bg-maya-olive/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-maya-olive/10"
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
              Preserve Memory
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="py-4 md:py-5 px-6 md:px-10 rounded-full font-medium text-maya-olive hover:bg-maya-olive/5 transition-all border border-maya-olive/10 text-sm md:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {memories.length > 0 ? (
          memories.map((memory) => (
            <div key={memory.id} className="maya-card p-6 md:p-10 group hover:shadow-xl hover:shadow-maya-olive/5 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 md:p-6 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(memory.id)}
                  className="p-2 md:p-3 text-maya-olive/20 hover:text-red-400/60 transition-colors bg-white rounded-full shadow-sm border border-maya-olive/5"
                >
                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-maya-olive/5 flex items-center justify-center">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-maya-olive/30" />
                </div>
                <span className="text-[9px] md:text-xs font-bold text-maya-olive/30 uppercase tracking-[0.3em]">{memory.category}</span>
                <div className="h-px flex-1 bg-maya-olive/5" />
                <span className="text-[9px] md:text-xs text-maya-olive/30 font-light tracking-widest">
                  {memory.timestamp?.toDate ? format(memory.timestamp.toDate(), 'MMM d, yyyy') : 'Just now'}
                </span>
              </div>

              <p className="text-xl md:text-2xl font-serif text-maya-ink leading-relaxed mb-4 md:mb-6 italic font-light">
                "{memory.content}"
              </p>
              
              <div className="flex items-center gap-2 text-maya-olive/20">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-medium">Eternal Memory</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 md:py-32 bg-white/30 rounded-[32px] md:rounded-[48px] border-2 border-dashed border-maya-olive/10 flex flex-col items-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-maya-olive/5 flex items-center justify-center mb-6 md:mb-8 animate-breathing">
              <Book className="w-8 h-8 md:w-10 md:h-10 text-maya-olive/10" />
            </div>
            <p className="text-maya-olive/40 font-serif italic text-xl md:text-2xl font-light">The sanctuary is quiet...</p>
            <p className="text-maya-olive/30 mt-2 font-light text-sm md:text-base">Share a story to bring back the light.</p>
          </div>
        )}
      </div>
    </div>
  );
}
