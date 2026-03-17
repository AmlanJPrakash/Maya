import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ChildProfile } from '../types';
import { Settings as SettingsIcon, Save, Baby, MessageSquare } from 'lucide-react';

interface SettingsProps {
  child: ChildProfile;
}

export default function Settings({ child }: SettingsProps) {
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(child.age?.toString() || '');
  const [gender, setGender] = useState<'boy' | 'girl'>(child.gender || 'girl');
  const [traits, setTraits] = useState(child.personalityTraits?.join(', ') || '');
  const [voiceTone, setVoiceTone] = useState(child.voiceTone || 'gentle');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      await updateDoc(doc(db, 'children', child.id), {
        name,
        age: parseInt(age) || 5,
        gender,
        personalityTraits: traits.split(',').map(t => t.trim()).filter(t => t),
        voiceTone,
      });
      setMessage('Profile updated successfully.');
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-maya-olive/10 flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-maya-olive" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-maya-ink">Sanctuary Settings</h1>
          <p className="text-maya-olive/60 text-sm md:text-base">Refine how {child.name}'s presence is felt.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white/80 backdrop-blur-sm rounded-[32px] p-6 md:p-10 shadow-sm border border-maya-olive/5 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-maya-olive/40 mb-2 uppercase tracking-[0.2em]">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-maya-olive/10 focus:outline-none focus:ring-4 focus:ring-maya-olive/5 transition-all text-lg font-light bg-white/50"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-maya-olive/40 mb-2 uppercase tracking-[0.2em]">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-maya-olive/10 focus:outline-none focus:ring-4 focus:ring-maya-olive/5 transition-all text-lg font-light bg-white/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-maya-olive/40 mb-2 uppercase tracking-[0.2em]">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'boy' | 'girl')}
              className="w-full px-6 py-4 rounded-2xl border border-maya-olive/10 focus:outline-none focus:ring-4 focus:ring-maya-olive/5 transition-all text-lg font-light bg-white/50 appearance-none"
            >
              <option value="girl">Girl</option>
              <option value="boy">Boy</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-maya-olive/40 mb-3 uppercase tracking-[0.2em]">Voice Tone</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['gentle', 'playful', 'calm', 'curious'].map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => setVoiceTone(tone)}
                className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                  voiceTone === tone 
                    ? 'bg-maya-olive text-white border-maya-olive shadow-lg shadow-maya-olive/20' 
                    : 'bg-white/50 text-maya-olive/60 border-maya-olive/10 hover:border-maya-olive/30'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-maya-olive/40 italic flex items-center gap-2 font-medium">
            <MessageSquare className="w-3 h-3" />
            This influences how {child.name} communicates with you.
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-maya-olive/40 mb-2 uppercase tracking-[0.2em]">Personality Traits</label>
          <textarea
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
            placeholder="e.g. Kind, Creative, Brave (comma separated)"
            className="w-full px-6 py-4 rounded-2xl border border-maya-olive/10 focus:outline-none focus:ring-4 focus:ring-maya-olive/5 transition-all text-lg font-light bg-white/50 min-h-[100px] placeholder:text-maya-olive/20"
          />
        </div>

        {message && (
          <p className={`text-sm font-medium ${message.includes('success') ? 'text-emerald-600' : 'text-rose-500'}`}>
            {message}
          </p>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-maya-olive text-white py-5 rounded-full font-medium text-lg hover:bg-maya-olive/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-maya-olive/20"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Preserving..." : "Save Sanctuary Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
