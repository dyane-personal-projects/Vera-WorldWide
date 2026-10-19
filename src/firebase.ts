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

// BLUEPRINT RULE 1: Strict Absolute Paths starting with artifacts/vera-worldwide-v1/...
export const ROOT_ARTIFACT_PATH = 'artifacts/vera-worldwide-v1';
export const USERS_COLLECTION_PATH = `${ROOT_ARTIFACT_PATH}/users`;
export const CHAT_LOGS_COLLECTION_PATH = `${ROOT_ARTIFACT_PATH}/public/data/chat_logs`;
export const CONFIG_COLLECTION_PATH = `${ROOT_ARTIFACT_PATH}/public/data/config`;
export const PLATFORM_STATS_PATH = `${ROOT_ARTIFACT_PATH}/public/data/platform_stats`;
export const ARCADE_SESSIONS_PATH = `${ROOT_ARTIFACT_PATH}/public/data/arcade_sessions`;

const STORAGE_KEYS = {
  USERS: 'vera_users_cache',
  CHATS: 'vera_chats_cache',
  VOTES: 'vera_votes_cache',
  ANNOUNCEMENT: 'vera_announcement_cache',
  ACTIVE_USER: 'vera_active_user'
};

const PURGED_PLACEHOLDER_UIDS = ['staff_master_01', 'user_sophia_88', 'user_tariq_09', 'user_clara_41', 'owner_workspace_root'];
const PURGED_PLACEHOLDER_EMAILS = [
  'alex.staff@veraworldwide.com',
  'sophia.v@gmail.com',
  'tariq.nasser@outlook.com',
  'clara.m@yahoo.com'
];

export const ADMIN_EMAILS = ['dyanecayer1821@gmail.com'];

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

// BLUEPRINT RULE 3: Auth Guard — Ensure user is authenticated before any Firestore operation
export async function ensureAuthenticatedUser(): Promise<FirebaseUser | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn("Auth Guard offline fallback:", err);
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
    if (raw) {
      const parsed: UserProfile[] = JSON.parse(raw);
      const sanitized = parsed.filter(
        (u) =>
          !PURGED_PLACEHOLDER_UIDS.includes(u.uid) &&
          !PURGED_PLACEHOLDER_EMAILS.includes(u.email?.toLowerCase() || '')
      );
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sanitized));
      return sanitized;
    }
  } catch (e) {
    console.warn("Storage parse error", e);
  }
  return [];
}

function getInitialLocalChats(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
    if (raw) {
      const parsed: ChatMessage[] = JSON.parse(raw);
      const sanitized = parsed.filter(
        (c) =>
          !['chat_1', 'chat_2', 'chat_3', ...PURGED_PLACEHOLDER_UIDS].includes(c.userId) &&
          !PURGED_PLACEHOLDER_EMAILS.includes(c.userEmail?.toLowerCase() || '')
      );
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(sanitized));
      return sanitized;
    }
  } catch (e) {
    console.warn("Storage parse error", e);
  }
  return [];
}

function getInitialLocalVotes(): Record<string, LanguageVote> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VOTES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Storage parse error", e);
  }

  const voteMap: Record<string, LanguageVote> = {};
  Object.entries(INITIAL_VOTES).forEach(([id, data]) => {
    voteMap[id] = {
      languageId: id,
      languageName: data.name,
      dialect: data.dialect,
      flag: data.flag,
      region: data.region,
      count: data.count,
      description: data.description
    };
  });
  localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(voteMap));
  return voteMap;
}

function getInitialLocalAnnouncement(): GlobalAnnouncement {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Storage parse error", e);
  }

  const def: GlobalAnnouncement = {
    content: '🇲🇦 Moroccan Darija & 🇪🇬 Egyptian Masri are LIVE! Cast your ballot in the Global Dialect Poll for the next drop.',
    active: true,
    type: 'sale',
    updatedAt: Date.now()
  };
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, JSON.stringify(def));
  return def;
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
  const chatData: ChatMessage = {
    id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: chat.userId,
    userEmail: chat.userEmail || 'learner@veraworldwide.com',
    timestamp: Date.now(),
    message: chat.message,
    response: chat.response,
    language: chat.language,
    fluencyScore: chat.fluencyScore ?? 88,
    feedback: chat.feedback || 'Smooth phrasing and good dialect cadence.'
  };

  try {
    const current = getInitialLocalChats();
    const updated = [chatData, ...current.slice(0, 49)];
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vera_chat_logged', { detail: chatData }));
  } catch (err) {
    console.warn("Local chat cache error", err);
  }

  try {
    await ensureAuthenticatedUser();
    const chatDocRef = doc(db, CHAT_LOGS_COLLECTION_PATH, chatData.id!);
    await setDoc(chatDocRef, {
      userId: chatData.userId,
      userEmail: chatData.userEmail,
      timestamp: serverTimestamp(),
      clientTimestamp: chatData.timestamp,
      message: chatData.message,
      response: chatData.response,
      language: chatData.language,
      fluencyScore: chatData.fluencyScore,
      feedback: chatData.feedback
    });
  } catch (err) {
    console.warn("Firestore remote write fallback:", err);
  }
}

// BLUEPRINT RULE 2: No Complex Queries — Fetch entire collection and sort on the frontend
export function subscribeToLiveChats(callback: (chats: ChatMessage[]) => void): () => void {
  callback(getInitialLocalChats());
  const handleCustomEvent = () => callback(getInitialLocalChats());
  window.addEventListener('vera_chat_logged', handleCustomEvent);

  let unsubscribeFirestore = () => {};
  ensureAuthenticatedUser().then((user) => {
    if (!user) return;
    try {
      const chatsCol = collection(db, CHAT_LOGS_COLLECTION_PATH);
      unsubscribeFirestore = onSnapshot(
        chatsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteChats: ChatMessage[] = snapshot.docs
              .map((docSnap) => {
                const data = docSnap.data();
                return {
                  id: docSnap.id,
                  userId: data.userId || 'anon',
                  userEmail: data.userEmail || 'learner@veraworldwide.com',
                  timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.clientTimestamp || Date.now()),
                  message: data.message || '',
                  response: data.response || '',
                  language: data.language || 'Moroccan Darija',
                  fluencyScore: data.fluencyScore,
                  feedback: data.feedback
                };
              })
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 40);
            callback(remoteChats);
            localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(remoteChats));
          }
        },
        (err) => console.warn("Firestore live chat fallback:", err)
      );
    } catch (err) {
      console.warn("Setup live chats error:", err);
    }
  });

  return () => {
    window.removeEventListener('vera_chat_logged', handleCustomEvent);
    unsubscribeFirestore();
  };
}

export function subscribeToUsers(callback: (users: UserProfile[]) => void): () => void {
  callback(getInitialLocalUsers());
  const handleCustomEvent = () => callback(getInitialLocalUsers());
  window.addEventListener('vera_users_updated', handleCustomEvent);

  let unsubscribeFirestore = () => {};
  ensureAuthenticatedUser().then((user) => {
    if (!user) return;
    try {
      const usersRef = collection(db, USERS_COLLECTION_PATH);
      unsubscribeFirestore = onSnapshot(
        usersRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: UserProfile[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                uid: d.id,
                email: data.email || 'user@veraworldwide.com',
                displayName: data.displayName || data.email?.split('@')[0],
                role: (data.role as UserRole) || 'user',
                subscription: (data.subscription as SubscriptionTier) || 'free',
                sparks: data.sparks ?? 100,
                energy: data.energy ?? getMaxEnergyForTier(data.subscription, data.role),
                streak: data.streak ?? 1,
                selectedDialect: data.selectedDialect || 'Moroccan Darija',
                createdAt: data.createdAt || Date.now()
              };
            });
            callback(list);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
          }
        },
        (err) => console.warn("Firestore users sync fallback:", err)
      );
    } catch (err) {
      console.warn("Setup users listener error:", err);
    }
  });

  return () => {
    window.removeEventListener('vera_users_updated', handleCustomEvent);
    unsubscribeFirestore();
  };
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const users = getInitialLocalUsers();
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    users[idx].role = role;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  window.dispatchEvent(new CustomEvent('vera_users_updated'));

  try {
    await ensureAuthenticatedUser();
    const userRef = doc(db, USERS_COLLECTION_PATH, uid);
    await updateDoc(userRef, { role });
  } catch (err) {
    console.warn("Firestore updateUserRole error:", err);
  }
}

export async function updateUserSubscription(uid: string, subscription: SubscriptionTier): Promise<void> {
  const newMaxEnergy = getMaxEnergyForTier(subscription);
  const users = getInitialLocalUsers();
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    users[idx].subscription = subscription;
    users[idx].energy = newMaxEnergy;
    users[idx].maxEnergy = newMaxEnergy;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(users[idx]));
  }
  window.dispatchEvent(new CustomEvent('vera_users_updated'));

  try {
    await ensureAuthenticatedUser();
    const userRef = doc(db, USERS_COLLECTION_PATH, uid);
    await updateDoc(userRef, { subscription, energy: newMaxEnergy, maxEnergy: newMaxEnergy });
  } catch (err) {
    console.warn("Firestore updateUserSubscription error:", err);
  }
}

export function subscribeToVotes(callback: (votes: Record<string, LanguageVote>) => void): () => void {
  callback(getInitialLocalVotes());
  const handleCustomEvent = () => callback(getInitialLocalVotes());
  window.addEventListener('vera_votes_updated', handleCustomEvent);

  let unsubscribe = () => {};
  ensureAuthenticatedUser().then(() => {
    try {
      const votesRef = collection(db, PLATFORM_STATS_PATH);
      unsubscribe = onSnapshot(
        votesRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const map = getInitialLocalVotes();
            snapshot.docs.forEach((docSnap) => {
              const data = docSnap.data();
              if (map[docSnap.id]) {
                map[docSnap.id].count = data.count ?? map[docSnap.id].count;
              } else if (data.languageId) {
                map[docSnap.id] = {
                  languageId: docSnap.id,
                  languageName: data.languageName || 'Dialect',
                  dialect: data.dialect || docSnap.id,
                  flag: data.flag || '🌍',
                  region: data.region || 'Global',
                  count: data.count || 1,
                  description: data.description || ''
                };
              }
            });
            callback(map);
            localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(map));
          }
        },
        (err) => console.warn("Votes snapshot fallback:", err)
      );
    } catch (err) {
      console.warn("Setup votes sync error:", err);
    }
  });

  return () => {
    window.removeEventListener('vera_votes_updated', handleCustomEvent);
    unsubscribe();
  };
}

export async function castLanguageVote(languageId: string, weight: number = 1): Promise<number> {
  const votes = getInitialLocalVotes();
  if (votes[languageId]) {
    votes[languageId].count += weight;
  } else {
    votes[languageId] = {
      languageId,
      languageName: 'Dialect',
      dialect: languageId,
      flag: '🌍',
      region: 'World',
      count: weight,
      description: 'Community supported dialect.'
    };
  }
  localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
  window.dispatchEvent(new CustomEvent('vera_votes_updated'));

  try {
    await ensureAuthenticatedUser();
    const voteRef = doc(db, PLATFORM_STATS_PATH, languageId);
    await setDoc(voteRef, { languageId, count: increment(weight) }, { merge: true });
  } catch (err) {
    console.warn("Firestore vote increment error:", err);
  }
  return votes[languageId]?.count || 1;
}

export function subscribeToAnnouncement(callback: (announcement: GlobalAnnouncement) => void): () => void {
  callback(getInitialLocalAnnouncement());
  const handleCustomEvent = () => callback(getInitialLocalAnnouncement());
  window.addEventListener('vera_announcement_updated', handleCustomEvent);

  let unsubscribe = () => {};
  ensureAuthenticatedUser().then(() => {
    try {
      const annRef = doc(db, CONFIG_COLLECTION_PATH, 'global_announcement');
      unsubscribe = onSnapshot(
        annRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const ann: GlobalAnnouncement = {
              content: data.content || '',
              active: data.active ?? true,
              type: data.type || 'info',
              updatedAt: data.updatedAt || Date.now()
            };
            callback(ann);
            localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, JSON.stringify(ann));
          }
        },
        (err) => console.warn("Announcement sync fallback:", err)
      );
    } catch (err) {
      console.warn("Setup announcement sync error:", err);
    }
  });

  return () => {
    window.removeEventListener('vera_announcement_updated', handleCustomEvent);
    unsubscribe();
  };
}

export async function updateAnnouncement(ann: {
  content: string;
  active: boolean;
  type?: 'info' | 'sale' | 'alert';
}): Promise<void> {
  const updated: GlobalAnnouncement = {
    content: ann.content,
    active: ann.active,
    type: ann.type || 'info',
    updatedAt: Date.now()
  };
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('vera_announcement_updated'));

  try {
    await ensureAuthenticatedUser();
    const annRef = doc(db, CONFIG_COLLECTION_PATH, 'global_announcement');
    await setDoc(annRef, {
      content: updated.content,
      active: updated.active,
      type: updated.type,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore updateAnnouncement error:", err);
  }
}

export async function getOrCreateUserProfile(firebaseUser: FirebaseUser | null): Promise<UserProfile | null> {
  if (!firebaseUser) {
    try {
      const activeJson = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (activeJson) {
        const parsed: UserProfile = JSON.parse(activeJson);
        if (PURGED_PLACEHOLDER_UIDS.includes(parsed.uid)) {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
          return null;
        }
        return applyEnergyRefill(parsed);
      }
    } catch {}
    return null;
  }

  const isOwner = isOwnerEmail(firebaseUser.email);

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
        displayName: data.displayName || firebaseUser.displayName || (isOwner ? 'Owner & Admin' : 'Vera Learner'),
        role,
        subscription,
        sparks: isOwner ? 99999 : (data.sparks ?? 100),
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
    displayName: firebaseUser.displayName || (isOwner ? 'Owner & Admin' : 'New Learner'),
    role: isOwner ? 'staff' : 'user',
    subscription: isOwner ? 'premium' : 'free',
    sparks: isOwner ? 99999 : 100,
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
    console.warn("Popup blocked, falling back to anonymous auth:", error);
    const anonResult = await signInAnonymously(auth);
    const profile = await getOrCreateUserProfile(anonResult.user);
    if (profile) return profile;
    return loginAsDemo('learner');
  }
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
    displayName: displayName || (isOwner ? 'Owner & Admin' : email.split('@')[0]),
    role: isOwner ? 'staff' : 'user',
    subscription: isOwner ? 'premium' : 'free',
    sparks: isOwner ? 99999 : 100,
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
  const isOwner = isOwnerEmail(email);
  const found = localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (found) {
    if (isOwner) {
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

  return signUpWithEmail(email, isOwner ? 'Owner & Admin' : email.split('@')[0]);
}

export function promoteToAdminWithPasscode(passcode: string, currentProfile?: UserProfile | null): UserProfile | null {
  const normalized = passcode.trim().toLowerCase();
  const validKeys = ['vera2026', 'vera_master', 'dyane123'];

  if (!validKeys.includes(normalized)) {
    return null;
  }

  const staffProfile: UserProfile = {
    uid: currentProfile?.uid || 'staff_owner_' + Date.now(),
    email: currentProfile?.email || 'dyanecayer1821@gmail.com',
    displayName: currentProfile?.displayName || 'Owner & Admin',
    role: 'staff',
    subscription: 'premium',
    sparks: 99999,
    energy: 999999,
    maxEnergy: 999999,
    streak: Math.max(currentProfile?.streak || 1, 30),
    cefrLevel: currentProfile?.cefrLevel || 'B2',
    selectedDialect: currentProfile?.selectedDialect || 'Moroccan Darija',
    createdAt: currentProfile?.createdAt || Date.now()
  };

  const localUsers = getInitialLocalUsers();
  const idx = localUsers.findIndex((u) => u.uid === staffProfile.uid || u.email === staffProfile.email);

  if (idx >= 0) {
    localUsers[idx] = staffProfile;
  } else {
    localUsers.push(staffProfile);
  }

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(localUsers));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(staffProfile));
  window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: staffProfile }));

  ensureAuthenticatedUser().then(() => {
    try {
      const userDocRef = doc(db, USERS_COLLECTION_PATH, staffProfile.uid);
      setDoc(userDocRef, {
        role: 'staff',
        subscription: 'premium',
        energy: 999999,
        sparks: 99999
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore admin promotion sync:", err);
    }
  });

  return staffProfile;
}

export function loginAsDemo(type: 'learner' | 'staff'): UserProfile {
  const localUsers = getInitialLocalUsers();
  let profile: UserProfile;

  if (type === 'staff') {
    profile = {
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
      completedLessons: [],
      createdAt: Date.now()
    };
  } else {
    profile = {
      uid: 'guest_learner_' + Date.now().toString(36),
      email: 'guest.learner@veraworldwide.com',
      displayName: 'Guest Learner',
      role: 'user',
      subscription: 'free',
      sparks: 100,
      energy: 5,
      maxEnergy: 5,
      streak: 1,
      cefrLevel: 'A1',
      selectedDialect: 'Moroccan Darija',
      completedLessons: [],
      lastEnergyRefillAt: Date.now(),
      createdAt: Date.now()
    };
  }

  const existingIdx = localUsers.findIndex((u) => u.uid === profile.uid);
  if (existingIdx >= 0) {
    localUsers[existingIdx] = profile;
  } else {
    localUsers.push(profile);
  }

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(localUsers));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: profile }));
  return profile;
}

export async function updateUserCompletedLessons(uid: string, lessonId: string): Promise<string[]> {
  const users = getInitialLocalUsers();
  const idx = users.findIndex((u) => u.uid === uid);
  let updatedLessons: string[] = [lessonId];

  if (idx !== -1) {
    const existing = users[idx].completedLessons || [];
    if (!existing.includes(lessonId)) {
      updatedLessons = [...existing, lessonId];
      users[idx].completedLessons = updatedLessons;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(users[idx]));
      window.dispatchEvent(new CustomEvent('vera_users_updated'));

      try {
        await ensureAuthenticatedUser();
        const userRef = doc(db, USERS_COLLECTION_PATH, uid);
        await updateDoc(userRef, { completedLessons: updatedLessons });
      } catch (err) {
        console.warn("Firestore completed lessons fallback:", err);
      }
    } else {
      updatedLessons = existing;
    }
  }
  return updatedLessons;
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

export async function deleteUserAccount(uid: string): Promise<void> {
  try {
    const users = getInitialLocalUsers().filter((u) => u.uid !== uid);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    window.dispatchEvent(new CustomEvent('vera_auth_changed', { detail: null }));

    await ensureAuthenticatedUser();
    const userRef = doc(db, USERS_COLLECTION_PATH, uid);
    await deleteDoc(userRef);

    if (auth.currentUser && auth.currentUser.uid === uid) {
      await deleteUser(auth.currentUser);
    }
  } catch (err) {
    console.warn("Account deletion handled:", err);
  }
}

export async function rewardUserSparksAndStreak(uid: string, baseSparksEarned: number): Promise<UserProfile | null> {
  const users = getInitialLocalUsers();
  const idx = users.findIndex((u) => u.uid === uid);

  if (idx !== -1) {
    const tier = users[idx].subscription;
    const multiplier = tier === 'plus' || tier === 'premium' || tier === 'unlimited' || users[idx].role === 'staff' ? 2 : 1;
    const finalSparks = baseSparksEarned * multiplier;

    users[idx].sparks = (users[idx].sparks || 0) + finalSparks;
    users[idx].streak = (users[idx].streak || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(users[idx]));
    window.dispatchEvent(new CustomEvent('vera_users_updated'));

    try {
      await ensureAuthenticatedUser();
      const userRef = doc(db, USERS_COLLECTION_PATH, uid);
      await updateDoc(userRef, {
        sparks: increment(finalSparks),
        streak: increment(1)
      });
    } catch (err) {
      console.warn("Firestore sparks update fallback:", err);
    }
    return users[idx];
  }
  return null;
}

export async function updateUserCefrLevel(uid: string, level: string): Promise<void> {
  const users = getInitialLocalUsers();
  const idx = users.findIndex((u) => u.uid === uid);
  if (idx !== -1) {
    users[idx].cefrLevel = level;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(users[idx]));
    window.dispatchEvent(new CustomEvent('vera_users_updated'));
  }

  try {
    await ensureAuthenticatedUser();
    const userRef = doc(db, USERS_COLLECTION_PATH, uid);
    await updateDoc(userRef, { cefrLevel: level });
  } catch (err) {
    console.warn("Firestore CEFR level fallback:", err);
  }
}

export async function submitSupportTicket(ticket: { userId: string; userEmail: string; message: string }): Promise<void> {
  try {
    await ensureAuthenticatedUser();
    const ticketsRef = collection(db, CONFIG_COLLECTION_PATH);
    await setDoc(doc(ticketsRef, 'ticket_' + Date.now()), {
      userId: ticket.userId,
      userEmail: ticket.userEmail,
      message: ticket.message,
      status: 'open',
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("Firestore support ticket fallback:", err);
  }
}
