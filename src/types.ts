export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: any;
}

export interface ChildProfile {
  id: string;
  userId: string;
  name: string;
  age?: number;
  gender: 'boy' | 'girl';
  personalityTraits?: string[];
  preferences?: Record<string, any>;
  voiceTone?: string;
  createdAt: any;
}

export interface Memory {
  id: string;
  childId: string;
  userId: string;
  content: string;
  category: 'behavior' | 'preference' | 'event' | 'trait';
  timestamp: any;
}

export interface Interaction {
  id: string;
  childId: string;
  userId: string;
  message: string;
  response: string;
  emotion?: string;
  timestamp: any;
}
