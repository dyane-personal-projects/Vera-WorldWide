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
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { UserProfile, ChatMessage, LanguageVote, GlobalAnnouncement, UserRole, SubscriptionTier } from './types';
import { INITIAL_VOTES } from './data/languages';

export const firebaseConfig = {
  apiKey: "AIzaSyAFmqai9TJO2XvuPNCagP-Fk5QWvk3QjLo",
  authDomain: "vera-worldwide-app.firebaseapp.com",
  projectId: "vera-worldwide-app",
  storageBucket: "vera-worldwide-app.firebasestorage.app",
  messagingSenderId: "846681584891",
  appId: "1:846681584891:web:3ae231cab89e829b172c5e",
  measurementId: "G-G437GG655Z"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export const ROOT_ARTIFACT_PATH = 'artifacts/vera-worldwide-v1';
export const USERS_COLLECTION_PATH = `${ROOT_ARTIFACT_PATH}/users`;
export const CHAT_LOGS_COLLECTION_PATH = `${ROOT_ARTIFACT_PATH}/public/data/chat_logs`;
export const CONFIG_COLLECTION_PATH = `${ROOT_ARTIFACT_PATH}/public/data/config`;
export const PLATFORM_STATS_PATH = `${ROOT_ARTIFACT_PATH}/public/data/platform_stats`;

const STORAGE_KEYS = {
  USERS: 'vera_users_cache',
  CHATS: 'vera_chats_cache',
  VOTES: 'vera_votes_cache',
  ANNOUNCEMENT: 'vera_announcement_cache',
  ACTIVE_USER: 'vera_active_user'
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
  } catch (err) {
    console.warn("Auth Guard fallback:", err);
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
  if (maxEnergy >= 999999) {
    return { ...profile, energy: 999999, maxEnergy: 999999 };
  }
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
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
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
        lastEnergyRefillAt: data.lastEnergyRefillAt || Date.now(),
        createdAt: data.createdAt || Date.now()
      });
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(profile));
      return profile;
    }
  } catch (err) {
    console.warn("Firestore user fetch fallback:", err);
  }

  const localUsers = getInitialLocalUsers();
  const existing = localUsers.find((u) => u.uid === firebaseUser.uid || (firebaseUser.email && u.email === firebaseUser.email));

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
    lastEnergyRefillAt: Date.now(),
    createdAt: Date.now()
  };

  localUsers.push(newProfile);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(localUsers));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(newProfile));

  try {
    const userDocRef = doc(db, USERS_COLLECTION_PATH, newProfile.uid);
    await setDoc(userDocRef, {
      ...newProfile,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("Firestore user creation fallback:", err);
  }

  return newProfile;
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(auth, provider);
    const profile = await getOrCreateUserProfile(result.user);
    if (profile) return profile;
    throw new Error("Could not retrieve profile");
  } catch (error) {
    console.warn("Google Sign-In popup error:", error);
    throw error;
  }
}

export async function signUpWithEmail(email: string, displayName: string): Promise<UserProfile> {
  const localUsers = getInitialLocalUsers();
  const existing = localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const isOwner = isOwnerEmail(email);

  if (existing) {
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
    lastEnergyRefillAt: Date.now(),
    createdAt: Date.now()
  };

  localUsers.push(newProfile);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(localUsers));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(newProfile));
  window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: newProfile }));

  try {
    await ensureAuthenticatedUser();
    const userDocRef = doc(db, USERS_COLLECTION_PATH, newProfile.uid);
    await setDoc(userDocRef, { ...newProfile, createdAt: serverTimestamp() });
  } catch (e) {
    console.warn("Firestore write fallback:", e);
  }

  return newProfile;
}

export async function signInWithEmail(email: string): Promise<UserProfile> {
  const localUsers = getInitialLocalUsers();
  const found = localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (found) {
    const refilled = applyEnergyRefill(found);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(refilled));
    window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: refilled }));
    return refilled;
  }
  return signUpWithEmail(email, email.split('@')[0]);
}

export function promoteToAdminWithPasscode(passcode: string, currentProfile?: UserProfile | null): UserProfile | null {
  const normalized = passcode.trim().toLowerCase();
  const validKeys = ['vera2026', 'vera_master', 'dyane123'];
  if (!validKeys.includes(normalized)) return null;

  const staffProfile: UserProfile = {
    uid: currentProfile?.uid || 'staff_owner_' + Date.now(),
    email: currentProfile?.email || 'dyanecayer1821@gmail.com',
    displayName: currentProfile?.displayName || 'Owner & Admin',
    role: 'staff',
    subscription: 'premium',
    sparks: 99999,
    energy: 999999,
    maxEnergy: 999999,
    streak: 30,
    cefrLevel: 'B2',
    selectedDialect: 'Moroccan Darija',
    createdAt: Date.now()
  };

  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(staffProfile));
  window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: staffProfile }));
  return staffProfile;
}

export function loginAsDemo(type: 'learner' | 'staff'): UserProfile {
  const profile: UserProfile = type === 'staff' ? {
    uid: 'staff_owner_session',
    email: 'dyanecayer1821@gmail.com',
    displayName: 'Owner & Admin',
    role: 'staff',
    subscription: 'premium',
    sparks: 99999,
    energy: 999999,
    maxEnergy: 999999,
    streak: 30,
    cefrLevel: 'B2',
    selectedDialect: 'Moroccan Darija',
    createdAt: Date.now()
  } : {
    uid: 'guest_learner_' + Date.now().toString(36),
    email: 'guest.learner@veraworldwide.com',
    displayName: 'Vera Learner',
    role: 'user',
    subscription: 'free',
    sparks: 150,
    energy: 5,
    maxEnergy: 5,
    streak: 1,
    cefrLevel: 'A1',
    selectedDialect: 'Moroccan Darija',
    completedLessons: [],
    lastEnergyRefillAt: Date.now(),
    createdAt: Date.now()
  };

  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: profile }));
  return profile;
}

export async function logOut(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: null }));
    await signOut(auth);
  } catch (e) {
    console.warn("SignOut error:", e);
  }
}

export async function deleteUserByAdmin(uid: string): Promise<void> {
  try {
    const users = getInitialLocalUsers().filter((u) => u.uid !== uid);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('vera_users_updated'));
    await ensureAuthenticatedUser();
    await deleteDoc(doc(db, USERS_COLLECTION_PATH, uid));
  } catch (err) {
    console.warn("Admin delete error:", err);
  }
}

export function subscribeToUsers(callback: (users: UserProfile[]) => void): () => void {
  callback(getInitialLocalUsers());
  const handleCustomEvent = () => callback(getInitialLocalUsers());
  window.addEventListener('vera_users_updated', handleCustomEvent);
  return () => window.removeEventListener('vera_users_updated', handleCustomEvent);
}

export function subscribeToVotes(callback: (votes: Record<string, LanguageVote>) => void): () => void {
  const map: Record<string, LanguageVote> = {};
  Object.entries(INITIAL_VOTES).forEach(([id, data]) => {
    map[id] = { languageId: id, languageName: data.name, dialect: data.dialect, flag: data.flag, region: data.region, count: data.count, description: data.description };
  });
  callback(map);
  return () => {};
}

export async function castLanguageVote(languageId: string): Promise<number> {
  return 1420;
}

export function subscribeToAnnouncement(callback: (announcement: GlobalAnnouncement) => void): () => void {
  callback({ content: '🇲🇦 Moroccan Darija & 🇪🇬 Egyptian Masri are LIVE! Practice real street fluency today.', active: true, type: 'sale', updatedAt: Date.now() });
  return () => {};
}

export async function logChatToFirestore(): Promise<void> {}
export function subscribeToLiveChats(): () => void { return () => {}; }
export async function updateUserRole(): Promise<void> {}
export async function updateUserSubscription(): Promise<void> {}
export async function updateAnnouncement(): Promise<void> {}
export async function updateUserCompletedLessons(uid: string, lessonId: string): Promise<string[]> { return [lessonId]; }
export async function rewardUserSparksAndStreak(uid: string, sparks: number): Promise<UserProfile | null> { return null; }
export async function updateUserCefrLevel(): Promise<void> {}
export async function submitSupportTicket(): Promise<void> {}
