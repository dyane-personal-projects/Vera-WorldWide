import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInAnonymously,
  deleteUser,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import {
  UserProfile,
  LanguageVote,
  GlobalAnnouncement,
  UserRole,
  SubscriptionTier,
  ChatMessage
} from './types';
import { INITIAL_VOTES } from './data/languages';

export const firebaseConfig = {
  apiKey: 'AIzaSyAFmqai9TJO2XvuPNCagP-Fk5QWvk3QjLo',
  authDomain: 'vera-worldwide-app.firebaseapp.com',
  projectId: 'vera-worldwide-app',
  storageBucket: 'vera-worldwide-app.firebasestorage.app',
  messagingSenderId: '846681584891',
  appId: '1:846681584891:web:3ae231cab89e829b172c5e',
  measurementId: 'G-G437GG655Z'
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export const ROOT_ARTIFACT_PATH = 'artifacts/vera-worldwide-v1';
export const USERS_COLLECTION_PATH = `${ROOT_ARTIFACT_PATH}/users`;

const STORAGE_KEYS = {
  USERS: 'vera_users_cache',
  CHATS: 'vera_chats_cache',
  VOTES: 'vera_votes_cache',
  ANNOUNCEMENT: 'vera_announcement_cache',
  ACTIVE_USER: 'vera_active_user',
  TICKETS: 'vera_support_tickets_cache'
};

export const ADMIN_EMAILS = ['dyanecayer1821@gmail.com'];

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export async function ensureAuthenticatedUser(): Promise<FirebaseUser | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch {
    return null;
  }
}

export function getMaxEnergyForTier(tier?: SubscriptionTier, role?: UserRole): number {
  if (role === 'staff' || tier === 'premium' || tier === 'unlimited') return 999999;
  if (tier === 'plus') return 15;
  return 5;
}

export function applyEnergyRefill(profile: UserProfile): UserProfile {
  const maxEnergy = getMaxEnergyForTier(profile.subscription, profile.role);
  if (maxEnergy >= 999999) return { ...profile, energy: 999999, maxEnergy: 999999 };
  const now = Date.now();
  const lastRefill = profile.lastEnergyRefillAt || now;
  const hoursElapsed = (now - lastRefill) / (1000 * 60 * 60);
  const zapsToRestore = Math.floor(hoursElapsed / 4);
  if (zapsToRestore > 0 && (profile.energy ?? 5) < maxEnergy) {
    return {
      ...profile,
      energy: Math.min(maxEnergy, (profile.energy ?? 5) + zapsToRestore),
      maxEnergy,
      lastEnergyRefillAt: now
    };
  }
  return { ...profile, maxEnergy, lastEnergyRefillAt: profile.lastEnergyRefillAt || now };
}

function getInitialLocalUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  const ownerAccount: UserProfile = {
    uid: 'owner_workspace_root',
    email: 'dyanecayer1821@gmail.com',
    displayName: 'Dyane (Owner & Admin)',
    role: 'staff',
    subscription: 'premium',
    sparks: 99999,
    energy: 999999,
    maxEnergy: 999999,
    streak: 30,
    cefrLevel: 'B2',
    selectedDialect: 'Moroccan Darija',
    completedLessons: ['l1', 'l2'],
    createdAt: Date.now()
  };
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([ownerAccount]));
  return [ownerAccount];
}

function getInitialLocalChats(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function getInitialLocalVotes(): Record<string, LanguageVote> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VOTES);
    if (raw) return JSON.parse(raw);
  } catch {}
  const map: Record<string, LanguageVote> = {};
  Object.entries(INITIAL_VOTES).forEach(([id, data]) => {
    map[id] = {
      languageId: id,
      languageName: data.name,
      dialect: data.dialect,
      flag: data.flag,
      region: data.region,
      count: data.count,
      description: data.description
    };
  });
  localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(map));
  return map;
}

function getInitialLocalAnnouncement(): GlobalAnnouncement {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENT);
    if (raw) return JSON.parse(raw);
  } catch {}
  const def: GlobalAnnouncement = {
    content: '🇲🇦 Moroccan Darija & 🇪🇬 Egyptian Masri are LIVE! Connect 1-on-1 with real local teachers today.',
    active: true,
    type: 'sale',
    updatedAt: Date.now()
  };
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, JSON.stringify(def));
  return def;
}

export async function getOrCreateUserProfile(firebaseUser: FirebaseUser | null): Promise<UserProfile | null> {
  if (!firebaseUser) {
    try {
      const activeJson = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (activeJson) return applyEnergyRefill(JSON.parse(activeJson));
    } catch {}
    return null;
  }

  const isOwner = isOwnerEmail(firebaseUser.email);
  const userRealName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Learner';

  try {
    const userDocRef = doc(db, USERS_COLLECTION_PATH, firebaseUser.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const role: UserRole = isOwner ? 'staff' : ((data.role as UserRole) || 'user');
      const subscription: SubscriptionTier = isOwner ? 'premium' : ((data.subscription as SubscriptionTier) || 'free');
      const maxEnergy = getMaxEnergyForTier(subscription, role);
      const profile = applyEnergyRefill({
        uid: firebaseUser.uid,
        email: data.email || firebaseUser.email || 'learner@veraworldwide.com',
        displayName: data.displayName || userRealName,
        role,
        subscription,
        sparks: isOwner ? 99999 : (data.sparks ?? 150),
        energy: isOwner ? 999999 : (data.energy ?? maxEnergy),
        maxEnergy,
        streak: data.streak ?? 1,
        cefrLevel: data.cefrLevel || 'A1',
        selectedDialect: data.selectedDialect || 'Moroccan Darija',
        completedLessons: data.completedLessons || [],
        savedVocab: data.savedVocab || [],
        lastEnergyRefillAt: data.lastEnergyRefillAt || Date.now(),
        createdAt: data.createdAt || Date.now()
      });
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(profile));
      return profile;
    }
  } catch {}

  const localUsers = getInitialLocalUsers();
  const existing = localUsers.find(
    (u) => u.uid === firebaseUser.uid || (firebaseUser.email && u.email.toLowerCase() === firebaseUser.email.toLowerCase())
  );
  if (existing) {
    if (isOwner) {
      existing.role = 'staff';
      existing.subscription = 'premium';
      existing.energy = 999999;
      existing.sparks = 99999;
    }
    const refilled = applyEnergyRefill(existing);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(refilled));
    return refilled;
  }

  const newProfile: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || 'learner@veraworldwide.com',
    displayName: userRealName,
    role: isOwner ? 'staff' : 'user',
    subscription: isOwner ? 'premium' : 'free',
    sparks: isOwner ? 99999 : 150,
    energy: isOwner ? 999999 : 5,
    maxEnergy: isOwner ? 999999 : 5,
    streak: 1,
    cefrLevel: 'A1',
    selectedDialect: 'Moroccan Darija',
    completedLessons: [],
    savedVocab: [],
    lastEnergyRefillAt: Date.now(),
    createdAt: Date.now()
  };

  localUsers.push(newProfile);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(localUsers));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(newProfile));
  window.dispatchEvent(new CustomEvent('vera_users_updated'));

  try {
    const userDocRef = doc(db, USERS_COLLECTION_PATH, newProfile.uid);
    await setDoc(userDocRef, { ...newProfile, createdAt: serverTimestamp() });
  } catch {}
  return newProfile;
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const profile = await getOrCreateUserProfile(result.user);
  if (profile) return profile;
  throw new Error('Could not retrieve profile');
}

export async function signUpWithEmail(email: string, displayName: string): Promise<UserProfile> {
  const localUsers = getInitialLocalUsers();
  const existing = localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const isOwner = isOwnerEmail(email);

  if (existing) {
    if (isOwner) {
      existing.role = 'staff';
      existing.subscription = 'premium';
      existing.energy = 999999;
      existing.sparks = 99999;
    }
    const refilled = applyEnergyRefill(existing);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(refilled));
    window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: refilled }));
    return refilled;
  }

  const newProfile: UserProfile = {
    uid: 'user_' + Math.random().toString(36).substring(2, 9),
    email,
    displayName: displayName || email.split('@')[0],
    role: isOwner ? 'staff' : 'user',
    subscription: isOwner ? 'premium' : 'free',
    sparks: isOwner ? 99999 : 150,
    energy: isOwner ? 999999 : 5,
    maxEnergy: isOwner ? 999999 : 5,
    streak: 1,
    cefrLevel: 'A1',
    selectedDialect: 'Moroccan Darija',
    completedLessons: [],
    savedVocab: [],
    lastEnergyRefillAt: Date.now(),
    createdAt: Date.now()
  };

  localUsers.push(newProfile);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(localUsers));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(newProfile));
  window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: newProfile }));
  window.dispatchEvent(new CustomEvent('vera_users_updated'));

  try {
    await ensureAuthenticatedUser();
    await setDoc(doc(db, USERS_COLLECTION_PATH, newProfile.uid), { ...newProfile, createdAt: serverTimestamp() });
  } catch {}
  return newProfile;
}

export async function signInWithEmail(email: string): Promise<UserProfile> {
  const localUsers = getInitialLocalUsers();
  const found = localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (found) {
    if (isOwnerEmail(email)) {
      found.role = 'staff';
      found.subscription = 'premium';
      found.energy = 999999;
      found.sparks = 99999;
    }
    const refilled = applyEnergyRefill(found);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(refilled));
    window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: refilled }));
    return refilled;
  }
  return signUpWithEmail(email, email.split('@')[0]);
}

export function promoteToAdminWithPasscode(passcode: string, currentProfile?: UserProfile | null): UserProfile | null {
  const normalized = passcode.trim().toLowerCase();
  const validKeys = ['vera2026', 'vera_master', 'dyane123', 'admin', 'dyane'];
  if (!validKeys.includes(normalized)) return null;

  const staffProfile: UserProfile = {
    uid: currentProfile?.uid || 'staff_owner_' + Date.now(),
    email: currentProfile?.email || 'dyanecayer1821@gmail.com',
    displayName: currentProfile?.displayName || 'Dyane (Owner & Admin)',
    role: 'staff',
    subscription: 'premium',
    sparks: 99999,
    energy: 999999,
    maxEnergy: 999999,
    streak: 30,
    cefrLevel: currentProfile?.cefrLevel || 'B2',
    selectedDialect: currentProfile?.selectedDialect || 'Moroccan Darija',
    completedLessons: currentProfile?.completedLessons || ['l1', 'l2'],
    createdAt: Date.now()
  };

  const users = getInitialLocalUsers();
  const idx = users.findIndex((u) => u.uid === staffProfile.uid || u.email === staffProfile.email);
  if (idx >= 0) users[idx] = staffProfile;
  else users.push(staffProfile);

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(staffProfile));
  window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: staffProfile }));
  window.dispatchEvent(new CustomEvent('vera_users_updated'));
  return staffProfile;
}

export function loginAsDemo(type: 'learner' | 'staff'): UserProfile {
  const profile: UserProfile =
    type === 'staff'
      ? {
          uid: 'staff_owner_session',
          email: 'dyanecayer1821@gmail.com',
          displayName: 'Dyane (Owner & Admin)',
          role: 'staff',
          subscription: 'premium',
          sparks: 99999,
          energy: 999999,
          maxEnergy: 999999,
          streak: 30,
          cefrLevel: 'B2',
          selectedDialect: 'Moroccan Darija',
          completedLessons: ['l1', 'l2'],
          createdAt: Date.now()
        }
      : {
          uid: 'guest_learner_' + Date.now().toString(36),
          email: 'guest.learner@veraworldwide.com',
          displayName: 'Vera Explorer',
          role: 'user',
          subscription: 'free',
          sparks: 250,
          energy: 5,
          maxEnergy: 5,
          streak: 1,
          cefrLevel: 'A1',
          selectedDialect: 'Moroccan Darija',
          completedLessons: [],
          lastEnergyRefillAt: Date.now(),
          createdAt: Date.now()
        };

  const users = getInitialLocalUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === profile.email.toLowerCase());
  if (idx >= 0) users[idx] = profile;
  else users.push(profile);

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: profile }));
  window.dispatchEvent(new CustomEvent('vera_users_updated'));
  return profile;
}

export async function logOut(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: null }));
    await signOut(auth);
  } catch {}
}

export async function deleteUserAccount(uid: string): Promise<void> {
  try {
    const users = getInitialLocalUsers().filter((u) => u.uid !== uid);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    const activeRaw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (activeRaw && JSON.parse(activeRaw)?.uid === uid) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
      window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: null }));
    }
    window.dispatchEvent(new CustomEvent('vera_users_updated'));
    await ensureAuthenticatedUser();
    await deleteDoc(doc(db, USERS_COLLECTION_PATH, uid));
    if (auth.currentUser && auth.currentUser.uid === uid) {
      await deleteUser(auth.currentUser);
    }
  } catch {}
}

export async function deleteUserByAdmin(uid: string): Promise<void> {
  await deleteUserAccount(uid);
}

export function subscribeToUsers(callback: (users: UserProfile[]) => void): () => void {
  callback(getInitialLocalUsers());
  const handleCustomEvent = () => callback(getInitialLocalUsers());
  window.addEventListener('vera_users_updated', handleCustomEvent);
  return () => window.removeEventListener('vera_users_updated', handleCustomEvent);
}

export function subscribeToVotes(callback: (votes: Record<string, LanguageVote>) => void): () => void {
  callback(getInitialLocalVotes());
  const handleEvent = () => callback(getInitialLocalVotes());
  window.addEventListener('vera_votes_updated', handleEvent);
  return () => window.removeEventListener('vera_votes_updated', handleEvent);
}

export async function castLanguageVote(languageId: string, weight: number = 1): Promise<number> {
  const votes = getInitialLocalVotes();
  if (votes[languageId]) {
    votes[languageId].count += weight;
  } else {
    votes[languageId] = {
      languageId,
      languageName: languageId,
      dialect: languageId,
      flag: '🌍',
      region: 'Global',
      count: weight,
      description: 'Community requested dialect track.'
    };
  }
  localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
  window.dispatchEvent(new CustomEvent('vera_votes_updated'));
  return votes[languageId].count;
}

export function subscribeToAnnouncement(callback: (announcement: GlobalAnnouncement) => void): () => void {
  callback(getInitialLocalAnnouncement());
  const handleEvent = () => callback(getInitialLocalAnnouncement());
  window.addEventListener('vera_announcement_updated', handleEvent);
  return () => window.removeEventListener('vera_announcement_updated', handleEvent);
}

export async function updateAnnouncement(ann: {
  content: string;
  active: boolean;
  type?: 'info' | 'sale' | 'alert';
}): Promise<void> {
  const updated: GlobalAnnouncement = {
    content: ann.content,
    active: ann.active,
    type: ann.type || 'sale',
    updatedAt: Date.now()
  };
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('vera_announcement_updated'));
}

export async function logChatToFirestore(chat: {
  userId: string;
  userEmail?: string;
  message: string;
  response: string;
  language: string;
  fluencyScore?: number;
  feedback?: string;
}): Promise<void> {
  const entry: ChatMessage = {
    id: 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    userId: chat.userId,
    userEmail: chat.userEmail || 'learner@veraworldwide.com',
    timestamp: Date.now(),
    message: chat.message,
    response: chat.response,
    language: chat.language,
    fluencyScore: chat.fluencyScore ?? 94,
    feedback: chat.feedback || ''
  };
  const current = getInitialLocalChats();
  const updated = [entry, ...current.slice(0, 99)];
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('vera_chat_logged', { detail: entry }));
}

export function subscribeToLiveChats(callback: (chats: ChatMessage[]) => void): () => void {
  callback(getInitialLocalChats());
  const handleEvent = () => callback(getInitialLocalChats());
  window.addEventListener('vera_chat_logged', handleEvent);
  return () => window.removeEventListener('vera_chat_logged', handleEvent);
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const users = getInitialLocalUsers();
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    users[idx].role = role;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    const activeRaw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (activeRaw && JSON.parse(activeRaw)?.uid === uid) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(users[idx]));
      window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: users[idx] }));
    }
    window.dispatchEvent(new CustomEvent('vera_users_updated'));
  }
}

export async function updateUserSubscription(uid: string, subscription: SubscriptionTier): Promise<void> {
  const users = getInitialLocalUsers();
  const idx = users.findIndex((u) => u.uid === uid);
  const maxEnergy = getMaxEnergyForTier(subscription);
  if (idx !== -1) {
    users[idx].subscription = subscription;
    users[idx].energy = maxEnergy;
    users[idx].maxEnergy = maxEnergy;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    const activeRaw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (activeRaw && JSON.parse(activeRaw)?.uid === uid) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(users[idx]));
      window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: users[idx] }));
    }
    window.dispatchEvent(new CustomEvent('vera_users_updated'));
  }
}

export async function updateUserCompletedLessons(uid: string, lessonId: string): Promise<string[]> {
  const users = getInitialLocalUsers();
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    const existing = users[idx].completedLessons || [];
    const updated = Array.from(new Set([...existing, lessonId]));
    users[idx].completedLessons = updated;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('vera_users_updated'));
    return updated;
  }
  return [lessonId];
}

export async function rewardUserSparksAndStreak(uid: string, sparks: number): Promise<UserProfile | null> {
  const users = getInitialLocalUsers();
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    users[idx].sparks = (users[idx].sparks || 150) + sparks;
    users[idx].streak = (users[idx].streak || 1) + 1;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(users[idx]));
    window.dispatchEvent(new CustomEvent('vera_users_updated'));
    return users[idx];
  }
  return null;
}

export async function updateUserCefrLevel(uid: string, cefrLevel: string): Promise<void> {
  const users = getInitialLocalUsers();
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    users[idx].cefrLevel = cefrLevel;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('vera_users_updated'));
  }
}

export async function submitSupportTicket(ticket: {
  userId: string;
  userEmail: string;
  message: string;
}): Promise<void> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({ id: 'ticket_' + Date.now(), ...ticket, createdAt: Date.now() });
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(list));
  } catch {}
}
