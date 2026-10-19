export type UserRole = 'user' | 'staff';
export type SubscriptionTier = 'free' | 'plus' | 'unlimited' | 'premium';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  subscription: SubscriptionTier;
  tier?: SubscriptionTier; // Friendly alias
  sparks?: number;
  energy?: number;
  maxEnergy?: number;
  streak?: number;
  cefrLevel?: string;
  selectedDialect?: string;
  dialectName?: string;
  nativeLanguage?: string;
  motivation?: string;
  completedLessons?: string[];
  savedVocab?: string[];
  lastEnergyRefillAt?: number;
  createdAt?: number;
}

export interface ChatMessage {
  id?: string;
  userId: string;
  userEmail?: string;
  timestamp: number;
  message: string;
  response: string;
  language: string;
  fluencyScore?: number;
  feedback?: string;
}

export interface LanguageVote {
  languageId: string;
  languageName: string;
  dialect: string;
  flag: string;
  region: string;
  count: number;
  description: string;
}

export interface GlobalAnnouncement {
  content: string;
  active: boolean;
  type?: 'info' | 'sale' | 'alert';
  updatedAt?: number;
}

export interface DialectTrack {
  id: string;
  name: string;
  dialect: string;
  flag: string;
  region: string;
  continent: 'North America' | 'South America' | 'Europe' | 'Africa' | 'Asia' | 'Middle East';
  status: 'active' | 'coming_soon';
  level: string;
  samplePhrase: string;
  translation: string;
  persona: string;
  description: string;
  culturalNote: string;
}

export interface LessonNode {
  id: string;
  title: string;
  focus: string;
  type: 'standard' | 'boss' | 'rapid_fire';
  cost: number;
  rewardSparks?: number;
  status: 'completed' | 'unlocked' | 'locked';
  persona?: string;
  isReadingLesson?: boolean;
}

export interface LearningModule {
  number: number;
  title: string;
  focus: string;
  lessons: LessonNode[];
  boss: LessonNode;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  message: string;
  category?: 'billing' | 'audio' | 'curriculum' | 'bug' | 'feature';
  createdAt: number;
  status?: 'open' | 'resolved';
}

export type ActiveView = 
  | 'landing' 
  | 'tutor' 
  | 'admin' 
  | 'dashboard' 
  | 'arcade' 
  | 'vocab' 
  | 'store' 
  | 'placement'
  | 'legal'
  | 'privacy'
  | 'terms'
  | 'support';
