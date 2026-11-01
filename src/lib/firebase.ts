import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  initializeFirestore,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocFromServer,
  writeBatch
}
from 'firebase/firestore'; 
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
};
import { Job, GovernmentScheme, UserApplication, UserProfile } from '../types';
import { MOCK_JOBS, MOCK_GOVERNMENT_SCHEMES } from '../data/mockData';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore with experimentalForceLongPolling for seamless reliability in sandboxed/iframe/proxy environments
const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, dbId);

// ---------------- ERROR HANDLING & CONNECTIVITY (SKILL MANDATES) ----------------

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Error Context: ', JSON.stringify(errInfo));
}

// Connection test on boot as mandated by skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.info('Firestore client running with offline tolerance/cache.');
    }
  }
}
testConnection();

// ---------------- AUTH HELPERS ----------------

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

// ---------------- USER PROFILE PERSISTENCE ----------------

export async function fetchOrCreateUserProfile(
  user: FirebaseUser | { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null; phoneNumber?: string | null }, 
  existingData?: Partial<UserProfile>
): Promise<UserProfile> {
  const uid = user.uid;
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data() as UserProfile;
    // Update photoURL or email if changed
    if (user.photoURL && data.photoURL !== user.photoURL) {
      await updateDoc(userRef, { photoURL: user.photoURL });
      data.photoURL = user.photoURL;
    }
    return {
      ...data,
      id: uid,
      email: user.email || data.email || ''
    };
  }

  // Create new profile with smart defaults or existing local state
  const newProfile: UserProfile = {
    id: uid,
    name: user.displayName || existingData?.name || 'Kisan / Karigar',
    email: user.email || '',
    phone: user.phoneNumber || existingData?.phone || '+91 98765 43210',
    photoURL: user.photoURL || undefined,
    language: existingData?.language || 'hi',
    state: existingData?.state || 'Bihar',
    district: existingData?.district || 'Patna',
    skills: existingData?.skills && existingData.skills.length > 0 ? existingData.skills : ['welding', 'motorcycle repair'],
    experienceYears: existingData?.experienceYears ?? 2,
    savedJobIds: existingData?.savedJobIds || ['job-1', 'job-4'],
    appliedJobIds: existingData?.appliedJobIds || [],
    role: 'candidate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

export async function updateUserProfileInFirestore(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

// ---------------- JOBS PERSISTENCE & REAL-TIME SYNC ----------------

export function subscribeJobs(callback: (jobs: Job[]) => void): () => void {
  const jobsCol = collection(db, 'jobs');
  let hasAttemptedSeed = false;

  const unsubscribe = onSnapshot(jobsCol, async (snapshot) => {
    // If empty because only loaded from offline local cache before server response, serve mock data
    if (snapshot.metadata.fromCache && snapshot.empty) {
      callback(MOCK_JOBS);
      return;
    }

    if (snapshot.empty && !hasAttemptedSeed) {
      hasAttemptedSeed = true;
      try {
        const batch = writeBatch(db);
        for (const job of MOCK_JOBS) {
          const ref = doc(db, 'jobs', job.id);
          batch.set(ref, job);
        }
        await batch.commit();
        callback(MOCK_JOBS);
      } catch (err) {
        console.warn('Job seeding non-fatal notice (fallback to local mock):', err);
        callback(MOCK_JOBS);
      }
    } else if (!snapshot.empty) {
      const liveJobs: Job[] = [];
      snapshot.forEach(docSnap => {
        liveJobs.push(docSnap.data() as Job);
      });
      callback(liveJobs);
    } else {
      callback(MOCK_JOBS);
    }
  }, (error) => {
    console.warn('Jobs subscription offline/network notice, falling back to mock catalog:', error.message);
    callback(MOCK_JOBS);
  });

  return unsubscribe;
}

export async function addJobToFirestore(jobData: Partial<Job>): Promise<Job> {
  const id = jobData.id || `job-${Date.now()}`;
  const fullJob: Job = {
    id,
    title: jobData.title || 'General Rural Technician',
    titleHi: jobData.titleHi || 'सामान्य ग्रामीण तकनीशियन',
    employer: jobData.employer || 'Verified Rural Enterprise',
    location: jobData.location || 'Patna',
    state: jobData.state || 'Bihar',
    salaryMin: Number(jobData.salaryMin) || 15000,
    salaryMax: Number(jobData.salaryMax) || 22000,
    requiredSkills: jobData.requiredSkills || ['welding'],
    experienceMinYears: Number(jobData.experienceMinYears) || 0,
    education: jobData.education || '10th / 12th Pass or ITI',
    applicationInfo: jobData.applicationInfo || 'Direct employer call or Walk-in',
    vacancies: Number(jobData.vacancies) || 2,
    workType: jobData.workType || 'Full-time',
    isActive: jobData.isActive !== false,
    isVerified: jobData.isVerified !== false,
    postedDate: jobData.postedDate || 'Today',
    description: jobData.description || 'Rural vocational job posting with hands-on skill requirements.',
    contactPhone: jobData.contactPhone || '+91 98765 00000',
    contactPerson: jobData.contactPerson,
    postedBy: jobData.postedBy,
    perks: jobData.perks || [],
    source: jobData.source || 'local',
    sourceName: jobData.sourceName,
    sourceUrl: jobData.sourceUrl,
    externalId: jobData.externalId,
  };

  const jobRef = doc(db, 'jobs', id);
  try {
    await setDoc(jobRef, fullJob);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `jobs/${id}`);
  }
  return fullJob;
}

export async function batchSaveJobsToFirestore(jobs: Job[]): Promise<number> {
  if (!jobs || jobs.length === 0) return 0;
  try {
    const batch = writeBatch(db);
    let count = 0;
    for (const job of jobs) {
      const ref = doc(db, 'jobs', job.id);
      batch.set(ref, job, { merge: true });
      count++;
    }
    await batch.commit();
    return count;
  } catch (err) {
    console.warn('Batch save jobs skipped/offline:', err);
    return 0;
  }
}

export async function toggleJobStatusInFirestore(jobId: string, currentStatus: boolean): Promise<void> {
  const jobRef = doc(db, 'jobs', jobId);
  try {
    await updateDoc(jobRef, { isActive: !currentStatus });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `jobs/${jobId}`);
  }
}

export async function deleteJobFromFirestore(jobId: string): Promise<void> {
  const jobRef = doc(db, 'jobs', jobId);
  try {
    await deleteDoc(jobRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `jobs/${jobId}`);
  }
}

// ---------------- GOVERNMENT SCHEMES PERSISTENCE ----------------

export function subscribeSchemes(callback: (schemes: GovernmentScheme[]) => void): () => void {
  const schemesCol = collection(db, 'schemes');
  let hasAttemptedSeed = false;

  const unsubscribe = onSnapshot(schemesCol, async (snapshot) => {
    if (snapshot.metadata.fromCache && snapshot.empty) {
      callback(MOCK_GOVERNMENT_SCHEMES);
      return;
    }

    if (snapshot.empty && !hasAttemptedSeed) {
      hasAttemptedSeed = true;
      try {
        const batch = writeBatch(db);
        for (const scheme of MOCK_GOVERNMENT_SCHEMES) {
          const ref = doc(db, 'schemes', scheme.id);
          batch.set(ref, scheme);
        }
        await batch.commit();
        callback(MOCK_GOVERNMENT_SCHEMES);
      } catch (err) {
        console.warn('Schemes seeding notice (fallback to local mock):', err);
        callback(MOCK_GOVERNMENT_SCHEMES);
      }
    } else if (!snapshot.empty) {
      const liveSchemes: GovernmentScheme[] = [];
      snapshot.forEach(docSnap => {
        liveSchemes.push(docSnap.data() as GovernmentScheme);
      });
      callback(liveSchemes);
    } else {
      callback(MOCK_GOVERNMENT_SCHEMES);
    }
  }, (error) => {
    console.warn('Schemes subscription offline/network notice:', error.message);
    callback(MOCK_GOVERNMENT_SCHEMES);
  });

  return unsubscribe;
}

// ---------------- JOB APPLICATIONS PERSISTENCE ----------------

export function subscribeApplications(callback: (applications: UserApplication[]) => void): () => void {
  const appsCol = collection(db, 'applications');
  let hasAttemptedSeed = false;

  const unsubscribe = onSnapshot(appsCol, async (snapshot) => {
    const seedApps: UserApplication[] = [
      {
        id: 'app-101',
        jobId: 'job-1',
        jobTitle: 'Arc & MIG Welder',
        employer: 'ABC Agro Engineering Works',
        applicantName: 'Ravi Kumar',
        applicantPhone: '+91 98765 43210',
        applicantLocation: 'Patna, Bihar',
        applicantSkills: ['welding', 'metal fabrication'],
        appliedDate: 'Yesterday',
        status: 'under_review',
        notes: 'Experienced in agricultural trailers and gate fabrication.'
      },
      {
        id: 'app-102',
        jobId: 'job-5',
        jobTitle: 'Master Tailor & Boutique Stitcher',
        employer: 'Ananya Rural Women Self-Help Producer Co.',
        applicantName: 'Sunita Devi',
        applicantPhone: '+91 94500 88991',
        applicantLocation: 'Lucknow, Uttar Pradesh',
        applicantSkills: ['tailoring'],
        appliedDate: '3 days ago',
        status: 'shortlisted',
        notes: 'Proficient in power sewing machines.'
      }
    ];

    if (snapshot.metadata.fromCache && snapshot.empty) {
      callback(seedApps);
      return;
    }

    if (snapshot.empty && !hasAttemptedSeed) {
      hasAttemptedSeed = true;
      try {
        const batch = writeBatch(db);
        for (const app of seedApps) {
          const ref = doc(db, 'applications', app.id);
          batch.set(ref, app);
        }
        await batch.commit();
        callback(seedApps);
      } catch {
        callback(seedApps);
      }
    } else if (!snapshot.empty) {
      const apps: UserApplication[] = [];
      snapshot.forEach(docSnap => {
        apps.push(docSnap.data() as UserApplication);
      });
      callback(apps);
    } else {
      callback(seedApps);
    }
  }, (error) => {
    console.warn('Applications subscription offline/notice:', error.message);
  });

  return unsubscribe;
}

export async function submitApplicationToFirestore(
  appData: Partial<UserApplication>, 
  userId?: string
): Promise<UserApplication> {
  const id = appData.id || `app-${Date.now()}`;
  const fullApp: UserApplication = {
    id,
    jobId: appData.jobId || 'job-1',
    jobTitle: appData.jobTitle || 'General Application',
    employer: appData.employer || 'Employer',
    applicantName: appData.applicantName || 'Applicant',
    applicantPhone: appData.applicantPhone || '+91 98765 43210',
    applicantLocation: appData.applicantLocation || 'Bihar',
    applicantSkills: appData.applicantSkills || [],
    appliedDate: 'Just now',
    status: (appData.status as any) || 'submitted',
    notes: appData.notes || '',
    applicantId: userId
  };

  const appRef = doc(db, 'applications', id);
  try {
    await setDoc(appRef, fullApp);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `applications/${id}`);
  }

  // If user is authenticated, update their profile's appliedJobIds array
  if (userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentApplied = (userSnap.data().appliedJobIds as string[]) || [];
        if (!currentApplied.includes(fullApp.jobId)) {
          await updateDoc(userRef, {
            appliedJobIds: [...currentApplied, fullApp.jobId]
          });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  }

  return fullApp;
}

export async function updateApplicationStatusInFirestore(
  applicationId: string, 
  status: 'submitted' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'hired' | 'rejected'
): Promise<void> {
  const appRef = doc(db, 'applications', applicationId);
  try {
    await updateDoc(appRef, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `applications/${applicationId}`);
  }
}
