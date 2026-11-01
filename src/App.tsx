import React, { useState, useEffect, useMemo } from 'react';
import { Language, UserProfile, Job, GovernmentScheme, UserApplication, JobMatchResult, SimplifiedScheme, ThirdPartyJobSource } from './types';
import { MOCK_JOBS, MOCK_GOVERNMENT_SCHEMES, DEMO_PERSONAS, SKILL_TAXONOMY } from './data/mockData';
import { THIRD_PARTY_JOBS } from './data/externalJobsData';
import { TRANSLATIONS } from './translations';
import { rankJobsForUser, matchGovernmentSchemes } from './utils/matching';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { SkillInputSection } from './components/SkillInputSection';
import { JobCard } from './components/JobCard';
import { SchemeCard } from './components/SchemeCard';
import { JobDetailsModal } from './components/JobDetailsModal';
import { PlainLanguageExplainerModal } from './components/PlainLanguageExplainerModal';
import { SchemeChatDrawer } from './components/SchemeChatDrawer';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TrainingSection } from './components/TrainingSection';
import { NearbyCentersMap } from './components/NearbyCentersMap';
import { SuccessStoriesSection } from './components/SuccessStoriesSection';
import { DemoSelectorModal } from './components/DemoSelectorModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { KaushalBiodataModal } from './components/KaushalBiodataModal';
import { EmployerPortal } from './components/EmployerPortal';
import { Briefcase, Award, Filter, ArrowUpDown, Sparkles, CheckCircle2, ChevronRight, MapPin, FileText, ShieldAlert, DownloadCloud, Loader2, Landmark, Zap, Globe } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  subscribeJobs,
  subscribeSchemes,
  subscribeApplications,
  addJobToFirestore,
  deleteJobFromFirestore,
  toggleJobStatusInFirestore,
  submitApplicationToFirestore,
  updateUserProfileInFirestore,
  fetchOrCreateUserProfile,
  batchSaveJobsToFirestore,
  updateApplicationStatusInFirestore,
} from './lib/firebase';

export function App() {
  // 1. Core State
  const [currentLanguage, setCurrentLanguage] = useState<Language>('hi');
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'schemes' | 'training' | 'centers' | 'dashboard' | 'admin' | 'employer'>('home');
  
  // Theme State (Dark Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kaushalsetu-theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('kaushalsetu-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr-1',
    name: 'Ravi Kumar',
    phone: '+91 98765 43210',
    preferredLanguage: 'hi',
    skills: ['welding', 'motorcycle repair'],
    state: 'Bihar',
    district: 'Patna',
    experienceYears: 2,
    savedJobIds: ['job-1', 'job-4'],
    appliedJobIds: []
  });

  // Admin Authorization check (Protected Route)
  const isAdmin = Boolean(
    currentUser && (
      userProfile.role === 'admin' ||
      currentUser.email === 'adeshprasad010@gmail.com' ||
      currentUser.email?.includes('admin') ||
      userProfile.id === 'admin-1'
    )
  );

  // Data Stores
  const [jobs, setJobs] = useState<Job[]>(() => {
    const jobMap = new Map<string, Job>();
    [...MOCK_JOBS, ...THIRD_PARTY_JOBS].forEach(j => jobMap.set(j.id, j));
    return Array.from(jobMap.values());
  });
  const [schemes, setSchemes] = useState<GovernmentScheme[]>(MOCK_GOVERNMENT_SCHEMES);
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [isExtractingSkills, setIsExtractingSkills] = useState(false);
  const [demoActive, setDemoActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [selectedJobMatch, setSelectedJobMatch] = useState<JobMatchResult | null>(null);
  const [selectedSchemeForExplain, setSelectedSchemeForExplain] = useState<GovernmentScheme | null>(null);
  const [simplifiedSchemeData, setSimplifiedSchemeData] = useState<SimplifiedScheme | null>(null);
  const [loadingSimplification, setLoadingSimplification] = useState(false);
  const [selectedSchemeForChat, setSelectedSchemeForChat] = useState<GovernmentScheme | null>(null);
  const [showDemoSelector, setShowDemoSelector] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showBiodataModal, setShowBiodataModal] = useState(false);

  // Filters & Sorting for Jobs & Schemes
  const [jobStateFilter, setJobStateFilter] = useState('');
  const [jobSkillFilter, setJobSkillFilter] = useState('');
  const [jobSortBy, setJobSortBy] = useState<'match' | 'salary'>('match');
  const [jobSourceFilter, setJobSourceFilter] = useState<'all' | 'local' | 'ncs' | 'apprenticeship'>('all');
  const [isFetchingExternalJobs, setIsFetchingExternalJobs] = useState(false);
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState('');

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 2. Firebase Auth Listener & Firestore Profile Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        try {
          const profile = await fetchOrCreateUserProfile(user, {
            name: user.displayName || userProfile.name,
            skills: userProfile.skills,
            state: userProfile.state,
            district: userProfile.district,
            phone: userProfile.phone
          });
          
          setUserProfile(prev => ({
            ...prev,
            ...profile,
            id: user.uid,
            name: profile.name || user.displayName || prev.name,
            email: user.email || prev.email,
            photoURL: user.photoURL || prev.photoURL,
            skills: profile.skills && profile.skills.length > 0 ? profile.skills : prev.skills,
            savedJobIds: profile.savedJobIds || prev.savedJobIds,
            appliedJobIds: profile.appliedJobIds || prev.appliedJobIds,
          }));
          showToast(`Welcome, ${user.displayName || 'User'}! Signed in to Firestore.`);
        } catch (e) {
          console.warn('Profile sync warning:', e);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 3. Realtime Firestore Subscriptions for Jobs, Schemes & Applications
  useEffect(() => {
    const unsubJobs = subscribeJobs((liveJobs) => {
      if (liveJobs && liveJobs.length > 0) {
        setJobs(prev => {
          const map = new Map<string, Job>();
          [...liveJobs, ...prev].forEach(j => map.set(j.id, j));
          return Array.from(map.values());
        });
      }
    });

    const unsubSchemes = subscribeSchemes((liveSchemes) => {
      if (liveSchemes && liveSchemes.length > 0) {
        setSchemes(liveSchemes);
      }
    });

    const unsubApps = subscribeApplications((liveApps) => {
      if (liveApps) {
        setApplications(liveApps);
      }
    });

    return () => {
      unsubJobs();
      unsubSchemes();
      unsubApps();
    };
  }, []);

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      showToast(err.message || 'Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out Handler
  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Signed out successfully.');
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Update Profile & Firestore Sync
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    if (currentUser?.uid) {
      try {
        await updateUserProfileInFirestore(currentUser.uid, updates);
        showToast('Profile updated in Firestore.');
      } catch (err) {
        console.warn('Firestore profile update error:', err);
      }
    }
  };

  // 4. Deterministic Matching Engine
  const rankedJobs = useMemo(() => {
    const results = rankJobsForUser(jobs, userProfile.skills, userProfile.state);
    
    return results.filter(res => {
      if (jobSourceFilter !== 'all') {
        if (jobSourceFilter === 'local' && res.job.source && res.job.source !== 'local') {
          return false;
        }
        if (jobSourceFilter === 'ncs' && res.job.source !== 'ncs') {
          return false;
        }
        if (jobSourceFilter === 'apprenticeship' && res.job.source !== 'apprenticeship') {
          return false;
        }
      }
      if (jobStateFilter && res.job.state.toLowerCase() !== jobStateFilter.toLowerCase()) {
        return false;
      }
      if (jobSkillFilter && !res.job.requiredSkills.includes(jobSkillFilter.toLowerCase())) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (jobSortBy === 'salary') {
        if (b.job.salaryMax !== a.job.salaryMax) {
          return b.job.salaryMax - a.job.salaryMax;
        }
        return b.matchPercentage - a.matchPercentage;
      }
      // Strict decreasing order of match score (Highest score first: 100% -> 0%)
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      // Secondary tie-breaker: Location match (home state/district jobs first)
      if (b.locationMatch !== a.locationMatch) {
        return b.locationMatch ? 1 : -1;
      }
      // Tertiary tie-breaker: Number of matched skills
      if (b.matchedSkills.length !== a.matchedSkills.length) {
        return b.matchedSkills.length - a.matchedSkills.length;
      }
      // Quaternary tie-breaker: Maximum salary descending
      if (b.job.salaryMax !== a.job.salaryMax) {
        return b.job.salaryMax - a.job.salaryMax;
      }
      // Quinary: Verified jobs first
      return (b.job.isVerified ? 1 : 0) - (a.job.isVerified ? 1 : 0);
    });
  }, [jobs, userProfile.skills, userProfile.state, jobStateFilter, jobSkillFilter, jobSortBy, jobSourceFilter]);

  // Fetch Third-Party Jobs from NCS, Apprenticeship Portal, or Web
  const handleFetchExternalJobs = async (
    source: ThirdPartyJobSource = 'all',
    liveSearch: boolean = false,
    customQuery?: string
  ) => {
    setIsFetchingExternalJobs(true);
    try {
      const res = await fetch('/api/jobs/external-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          state: jobStateFilter || userProfile.state || '',
          district: userProfile.district || '',
          skill: userProfile.skills[0] || '',
          liveSearch,
          query: customQuery || '',
          saveToStore: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        const fetchedJobs: Job[] = data.jobs || [];
        if (fetchedJobs.length > 0) {
          setJobs(prev => {
            const map = new Map<string, Job>();
            [...fetchedJobs, ...prev].forEach(j => map.set(j.id, j));
            return Array.from(map.values());
          });

          // Also persist batch to Firestore
          try {
            await batchSaveJobsToFirestore(fetchedJobs);
          } catch (e) {
            console.warn('Batch save to Firestore notice:', e);
          }

          showToast(
            currentLanguage === 'hi'
              ? `${fetchedJobs.length} नई सरकारी/अप्रेंटिस नौकरियां जोड़ी गईं!`
              : `Fetched & listed ${fetchedJobs.length} opportunities from NCS & NAPS!`
          );
        } else {
          showToast(
            currentLanguage === 'hi'
              ? 'सभी उपलब्ध बाहरी नौकरियां पहले से सूची में हैं।'
              : 'All available external opportunities are already loaded.'
          );
        }
      } else {
        throw new Error('Failed to fetch third-party jobs');
      }
    } catch (err) {
      console.error('Fetch external jobs error:', err);
      showToast(currentLanguage === 'hi' ? 'नौकरियां लोड करने में समस्या हुई।' : 'Could not fetch external jobs right now.');
    } finally {
      setIsFetchingExternalJobs(false);
    }
  };

  const matchedSchemesList = useMemo(() => {
    const list = matchGovernmentSchemes(schemes, userProfile.skills);
    if (!schemeCategoryFilter) return list;
    return list.filter(item => item.scheme.category.toLowerCase().includes(schemeCategoryFilter.toLowerCase()));
  }, [schemes, userProfile.skills, schemeCategoryFilter]);

  // 5. Handlers
  const handleSkillsChange = (newSkills: string[]) => {
    handleUpdateProfile({ skills: newSkills });
  };

  const handleStateChange = (state: string) => {
    handleUpdateProfile({ state });
  };

  const handleDistrictChange = (district: string) => {
    handleUpdateProfile({ district });
  };

  // Extract skills via Gemini API (with deterministic fallback)
  const handleExtractAndFindJobs = async (inputText: string) => {
    if (!inputText.trim() && userProfile.skills.length === 0) {
      showToast(currentLanguage === 'hi' ? 'कृपया अपना हुनर बोलकर या लिखकर बताएं।' : 'Please speak or describe your skills.');
      return;
    }

    setIsExtractingSkills(true);
    try {
      if (inputText.trim()) {
        const res = await fetch('/api/skills/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: inputText,
            language: currentLanguage
          })
        });
        const data = await res.json();
        if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
          handleSkillsChange(data.skills);
          
          const labels = data.skills.map((s: string) => {
            const def = SKILL_TAXONOMY.find(st => st.canonical === s.toLowerCase());
            if (!def) return s;
            return currentLanguage === 'hi' ? def.labelHi.split('(')[0].trim() : def.labelEn.split('(')[0].trim();
          });
          showToast(currentLanguage === 'hi' ? `✨ स्वतः पहचाने गए हुनर: ${labels.join(', ')}` : `✨ Auto-identified skills: ${labels.join(', ')}`);
        } else {
          showToast(currentLanguage === 'hi' ? 'कोई विशिष्ट हुनर नहीं पहचाना जा सका। कृपया स्पष्ट रूप से बताएं या नीचे दिए हुनर चुनें।' : 'No specific trade skills detected. Please describe your trade or pick from the list below.');
        }
      }

      // Smooth scroll to job results
      setTimeout(() => {
        const resultsElem = document.getElementById('matched-results-section');
        if (resultsElem) {
          resultsElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.warn('Extraction failed:', err);
    } finally {
      setIsExtractingSkills(false);
    }
  };

  // View Job Details + trigger Gemini plain language explanation
  const handleViewJobDetails = async (result: JobMatchResult) => {
    setSelectedJobMatch({ ...result, loadingExplanation: true });

    try {
      const res = await fetch('/api/jobs/explain-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSkills: userProfile.skills,
          job: result.job,
          matchPercentage: result.matchPercentage,
          matchedSkills: result.matchedSkills,
          missingSkills: result.missingSkills,
          language: currentLanguage
        })
      });
      const data = await res.json();
      setSelectedJobMatch(prev => prev ? { ...prev, aiExplanation: data.explanation, loadingExplanation: false } : null);
    } catch (err) {
      setSelectedJobMatch(prev => prev ? { ...prev, loadingExplanation: false } : null);
    }
  };

  // Quick Apply (Saves directly to Firestore and local state)
  const handleApplyToJob = async (applicantData: { name: string; phone: string; experience: string; notes: string }) => {
    if (!selectedJobMatch) return;
    try {
      const newApp: Partial<UserApplication> = {
        jobId: selectedJobMatch.job.id,
        jobTitle: selectedJobMatch.job.title,
        employer: selectedJobMatch.job.employer,
        applicantName: applicantData.name || userProfile.name,
        applicantPhone: applicantData.phone || userProfile.phone,
        applicantLocation: `${userProfile.district || 'Patna'}, ${userProfile.state || 'Bihar'}`,
        applicantSkills: userProfile.skills,
        notes: applicantData.notes,
        status: 'submitted'
      };

      // 1. Submit to Firestore
      const savedApp = await submitApplicationToFirestore(newApp, currentUser?.uid);

      // 2. Update local state
      setApplications(prev => [savedApp, ...prev.filter(a => a.id !== savedApp.id)]);
      const newAppliedIds = Array.from(new Set([...userProfile.appliedJobIds, selectedJobMatch.job.id]));
      handleUpdateProfile({ appliedJobIds: newAppliedIds });
      showToast(t.applicationSuccess);
    } catch (err) {
      console.error('Application error:', err);
      showToast('Application submission failed. Please try again.');
    }
  };

  // Toggle Save Job
  const handleToggleSaveJob = (jobId: string) => {
    const isSaved = userProfile.savedJobIds.includes(jobId);
    const updated = isSaved
      ? userProfile.savedJobIds.filter(id => id !== jobId)
      : [...userProfile.savedJobIds, jobId];
    handleUpdateProfile({ savedJobIds: updated });
    showToast(isSaved ? 'Job removed from saved list' : 'Job saved to your dashboard');
  };

  // Toggle Save Training Video
  const handleToggleSaveTraining = (videoId: string) => {
    const existing = userProfile.savedTrainingIds || [];
    const isSaved = existing.includes(videoId);
    const updated = isSaved
      ? existing.filter(id => id !== videoId)
      : [...existing, videoId];
    handleUpdateProfile({ savedTrainingIds: updated });
    showToast(
      isSaved
        ? (currentLanguage === 'hi' ? 'ट्यूटोरियल हटाया गया' : 'Tutorial removed from saved list')
        : (currentLanguage === 'hi' ? 'ट्यूटोरियल डैशबोर्ड में सहेजा गया' : 'Tutorial saved to your dashboard')
    );
  };

  // Jump to Jobs tab and search for matching skill
  const handleExploreMatchingJobsFromSkill = (skill: string) => {
    setActiveTab('jobs');
    setJobSkillFilter(skill);
    showToast(currentLanguage === 'hi' ? `"${skill}" से संबंधित नौकरियां खोजी जा रही हैं` : `Showing jobs matching "${skill}"`);
  };

  // Explain Scheme Simply (AI)
  const handleExplainSchemeSimply = async (scheme: GovernmentScheme) => {
    setSelectedSchemeForExplain(scheme);
    setLoadingSimplification(true);
    setSimplifiedSchemeData(null);

    try {
      const res = await fetch('/api/schemes/explain-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme,
          language: currentLanguage,
          userSkills: userProfile.skills
        })
      });
      const data = await res.json();
      setSimplifiedSchemeData(data.simplified);
    } catch (err) {
      console.error('Scheme simplification failed:', err);
    } finally {
      setLoadingSimplification(false);
    }
  };

  // Switch to Persona (Demo Mode)
  const handleSelectPersona = (persona: typeof DEMO_PERSONAS[0]) => {
    const newProfile: UserProfile = {
      id: `usr-${persona.id}`,
      name: persona.name,
      phone: '+91 98765 00000',
      preferredLanguage: persona.language,
      skills: [...persona.skills],
      state: persona.state,
      district: persona.district,
      experienceYears: 2,
      savedJobIds: ['job-1'],
      appliedJobIds: []
    };
    setUserProfile(newProfile);
    setCurrentLanguage(persona.language);
    setDemoActive(true);
    setShowDemoSelector(false);
    showToast(`Loaded demo persona: ${persona.name} (${persona.state})`);

    // Scroll to results
    setTimeout(() => {
      const resultsElem = document.getElementById('matched-results-section');
      if (resultsElem) {
        resultsElem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  // Admin Actions with Firestore persistence
  const handleAddJob = async (newJobData: Partial<Job>) => {
    try {
      const createdJob = await addJobToFirestore(newJobData);
      setJobs(prev => [createdJob, ...prev]);
      showToast('New job posted to Firestore successfully');
    } catch (err) {
      console.error('Add job error:', err);
      showToast('Failed to post job.');
    }
  };

  const handleToggleJobStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleJobStatusInFirestore(id, currentStatus);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, isActive: !currentStatus } : j));
      showToast(`Job status set to ${!currentStatus ? 'Active' : 'Inactive'}`);
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteJobFromFirestore(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      showToast('Job removed from Firestore catalog');
    } catch (err) {
      console.error('Delete job error:', err);
    }
  };

  const handleUpdateApplicationStatus = async (
    applicationId: string, 
    status: UserApplication['status']
  ) => {
    try {
      await updateApplicationStatusInFirestore(applicationId, status);
      setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status } : app));
      showToast(currentLanguage === 'hi' ? `आवेदन की स्थिति अपडेट हुई: ${status}` : `Application status updated to ${status}`);
    } catch (err) {
      console.error('Update status error:', err);
      showToast('Failed to update application status');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] dark:bg-[#0A0D12] text-[#2B2927] dark:text-[#F1F5F9] flex flex-col font-sans selection:bg-[#FDF0EA] dark:selection:bg-[#281812] selection:text-[#9C431B] dark:selection:text-[#FB923C] transition-colors duration-200 overflow-x-hidden">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#2B2927] dark:bg-[#1E2633] text-white px-4 py-3 rounded-xl shadow-lg border border-[#3D3A37] dark:border-[#2D3748] flex items-center gap-2 text-xs sm:text-sm font-semibold animate-fadeIn max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-[#CCE0E0] dark:text-[#2DD4BF] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHowItWorks={() => setShowHowItWorks(true)}
        onOpenDemo={() => setShowDemoSelector(true)}
        userProfile={userProfile}
        demoActive={demoActive}
        currentUser={currentUser}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        authLoading={authLoading}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isAdmin={isAdmin}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME (Landing + Input + Results) */}
        {activeTab === 'home' && (
          <div>
            {/* Landing Hero Section */}
            <LandingHero
              currentLanguage={currentLanguage}
              onFindOpportunities={() => {
                const elem = document.getElementById('skill-input-card');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              onHowItWorks={() => setShowHowItWorks(true)}
              onTryDemo={() => setShowDemoSelector(true)}
            />

            {/* Skill Input Section */}
            <SkillInputSection
              currentLanguage={currentLanguage}
              skills={userProfile.skills}
              onSkillsChange={handleSkillsChange}
              selectedState={userProfile.state}
              onStateChange={handleStateChange}
              selectedDistrict={userProfile.district}
              onDistrictChange={handleDistrictChange}
              onExtractAndFindJobs={handleExtractAndFindJobs}
              isLoading={isExtractingSkills}
            />

            {/* Matched Results Section */}
            <div id="matched-results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              
              {/* Job Results Header & Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold text-[#2D5A5A] dark:text-[#2DD4BF] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E87D4D]" />
                    <span>{rankedJobs.length} {currentLanguage === 'hi' ? 'नौकरियां उपलब्ध' : 'matched vacancies'}</span>
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
                    {t.jobResultsTitle}
                  </h2>
                  <p className="text-xs text-[#8B867F] dark:text-[#94A3B8] font-medium mt-0.5">
                    {jobSortBy === 'match' 
                      ? (currentLanguage === 'hi' ? 'उच्चतम मैच स्कोर के घटते क्रम में व्यवस्थित (100% → 0%)' : 'Ranked in decreasing order of match score (100% → 0%)')
                      : (currentLanguage === 'hi' ? 'अधिकतम वेतन के क्रम में व्यवस्थित' : 'Ranked by highest salary')}
                  </p>
                </div>

                {/* Filter & Sort Controls */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Sync / Fetch Third-Party Jobs Button */}
                  <button
                    type="button"
                    onClick={() => handleFetchExternalJobs('all', false)}
                    disabled={isFetchingExternalJobs}
                    className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] dark:bg-[#132238] hover:bg-[#DBEAFE] dark:hover:bg-[#1E3A8A]/50 text-[#1D4ED8] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[#1E3A8A] font-bold text-xs flex items-center gap-1.5 cursor-pointer min-h-[36px] transition-colors disabled:opacity-50"
                    title="Fetch latest verified openings from National Career Service (NCS) and Apprenticeship portals"
                  >
                    {isFetchingExternalJobs ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D4ED8] dark:text-[#60A5FA]" />
                        <span>{t.fetchingExternalJobs}</span>
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#60A5FA]" />
                        <span>{t.fetchExternalJobs}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center bg-white dark:bg-[#161B22] px-2.5 py-1.5 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] font-medium min-h-[36px]">
                    <Filter className="w-3.5 h-3.5 mr-1 text-[#8B867F] dark:text-[#94A3B8]" />
                    <select
                      value={jobStateFilter}
                      onChange={(e) => setJobStateFilter(e.target.value)}
                      className="bg-transparent font-semibold text-[#2B2927] dark:text-[#F1F5F9] focus:outline-hidden cursor-pointer"
                    >
                      <option value="" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">{t.allStates}</option>
                      {['Bihar', 'Uttar Pradesh', 'Rajasthan', 'Maharashtra', 'Gujarat', 'Madhya Pradesh', 'Punjab'].map(st => (
                        <option key={st} value={st} className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center bg-white dark:bg-[#161B22] px-2.5 py-1.5 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] font-medium min-h-[36px]">
                    <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-[#8B867F] dark:text-[#94A3B8]" />
                    <select
                      value={jobSortBy}
                      onChange={(e) => setJobSortBy(e.target.value as any)}
                      className="bg-transparent font-semibold text-[#2B2927] dark:text-[#F1F5F9] focus:outline-hidden cursor-pointer"
                    >
                      <option value="match" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">{t.bestMatch}</option>
                      <option value="salary" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">{t.highestSalary}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Source Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setJobSourceFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    jobSourceFilter === 'all'
                      ? 'bg-[#2D5A5A] dark:bg-[#152E2E] text-white dark:text-[#2DD4BF] border border-[#2D5A5A] dark:border-[#1E4646]'
                      : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
                  }`}
                >
                  {t.allSources} ({jobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setJobSourceFilter('local')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    jobSourceFilter === 'local'
                      ? 'bg-[#2D5A5A] dark:bg-[#152E2E] text-white dark:text-[#2DD4BF] border border-[#2D5A5A] dark:border-[#1E4646]'
                      : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
                  }`}
                >
                  <span>{t.localVerified}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setJobSourceFilter('ncs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    jobSourceFilter === 'ncs'
                      ? 'bg-[#1D4ED8] dark:bg-[#1E3A8A] text-white dark:text-[#BFDBFE] border border-[#1D4ED8]'
                      : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#60A5FA]" />
                  <span>{t.ncsPortal}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setJobSourceFilter('apprenticeship')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    jobSourceFilter === 'apprenticeship'
                      ? 'bg-[#B45309] dark:bg-[#78350F] text-white dark:text-[#FDE68A] border border-[#B45309]'
                      : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-[#D97706] dark:text-[#FBBF24]" />
                  <span>{t.apprenticeshipPortal}</span>
                </button>
              </div>

              {/* Jobs Grid */}
              {rankedJobs.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#161B22] rounded-2xl border border-[#E5E0D5] dark:border-[#262F3D] p-8">
                  <Briefcase className="w-12 h-12 text-[#8B867F] dark:text-[#94A3B8] mx-auto mb-3 opacity-60" />
                  <h3 className="text-lg font-bold text-[#2B2927] dark:text-[#F1F5F9]">{t.noJobsFound}</h3>
                  <p className="text-xs sm:text-sm text-[#8B867F] dark:text-[#94A3B8] mt-1">{t.noJobsSuggestion}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rankedJobs.map((matchResult) => (
                    <JobCard
                      key={matchResult.job.id}
                      matchResult={matchResult}
                      currentLanguage={currentLanguage}
                      onViewDetails={handleViewJobDetails}
                      onQuickApply={(res) => {
                        setSelectedJobMatch(res);
                        handleViewJobDetails(res);
                      }}
                      onToggleSave={handleToggleSaveJob}
                      isSaved={userProfile.savedJobIds.includes(matchResult.job.id)}
                      isApplied={userProfile.appliedJobIds.includes(matchResult.job.id)}
                    />
                  ))}
                </div>
              )}

              {/* Government Schemes Section on Home */}
              <div className="mt-16 pt-12 border-t border-[#E5E0D5] dark:border-[#262F3D]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FDF0EA] dark:bg-[#281812] text-[#9C431B] dark:text-[#FB923C] border border-[#F6D3C2] dark:border-[#4E2619] text-xs font-bold mb-1">
                      <Award className="w-3.5 h-3.5 text-[#E87D4D]" />
                      <span>{schemes.length} {currentLanguage === 'hi' ? 'सरकारी योजनाएं' : 'National Schemes'}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
                      {t.schemeResultsTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B665F] dark:text-[#94A3B8] mt-0.5">
                      {currentLanguage === 'hi'
                        ? 'मुफ्त प्रशिक्षण, प्रमाण पत्र और सरकारी टूलकिट सहायता के लिए आवेदन करें।'
                        : 'Official government schemes offering free vocational training, stipend, and certification.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('schemes')}
                    className="px-3.5 py-2 rounded-lg bg-[#F0ECE1] dark:bg-[#1E2633] hover:bg-[#E5E0D5] dark:hover:bg-[#262F3D] text-[#2B2927] dark:text-[#F1F5F9] font-bold text-xs flex items-center gap-1 cursor-pointer border border-[#E5E0D5] dark:border-[#262F3D] min-h-[36px]"
                  >
                    <span>{currentLanguage === 'hi' ? 'सभी योजनाएं देखें' : 'View All Schemes'}</span>
                    <ChevronRight className="w-4 h-4 text-[#8B867F] dark:text-[#94A3B8]" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedSchemesList.slice(0, 3).map(({ scheme, relevanceScore }) => (
                    <SchemeCard
                      key={scheme.id}
                      scheme={scheme}
                      relevanceScore={relevanceScore}
                      currentLanguage={currentLanguage}
                      onExplainSimply={handleExplainSchemeSimply}
                      onAskChatbot={(sch) => setSelectedSchemeForChat(sch)}
                    />
                  ))}
                </div>
              </div>

              {/* Google Maps Grounding Feature Showcase Banner on Home */}
              <div className="mt-16 bg-[#FAF9F5] dark:bg-[#10151C] border border-[#E5E0D5] dark:border-[#262F3D] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs transition-colors">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#CCE0E0] dark:border-[#1E4646] text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                    <span>{currentLanguage === 'hi' ? 'सत्यापित गूगल मैप्स लोकेटर' : 'Google Maps Grounded Locator'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9]">
                    {currentLanguage === 'hi'
                      ? 'अपने जिले में सरकारी आईटीआई, कौशल केंद्र व सीएससी खोजें'
                      : 'Find Verified Government ITIs, Skill Centers & CSCs Near You'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B665F] dark:text-[#94A3B8] leading-relaxed">
                    {currentLanguage === 'hi'
                      ? 'गूगल मैप्स ग्राउंडिंग की मदद से अपने नजदीकी सरकारी प्रशिक्षण संस्थान, ट्रेड वर्कशॉप और डिजिटल सेवा केंद्रों का सटीक पता, रिव्यू और नेविगेशन रास्ता देखें।'
                      : 'Locate physical government vocational institutes, trade workshops, and Common Service Centres with live Google Maps routes and directions.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('centers')}
                  className="px-6 py-3 bg-[#2D5A5A] dark:bg-[#2DD4BF] hover:bg-[#234747] dark:hover:bg-[#14B8A6] text-white dark:text-[#0D1117] font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer min-h-[44px]"
                >
                  <MapPin className="w-4 h-4 text-white dark:text-[#0D1117]" />
                  <span>{currentLanguage === 'hi' ? 'मैप्स पर केंद्र खोजें' : 'Explore on Google Maps'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* SUCCESS STORIES SECTION */}
              <SuccessStoriesSection
                currentLanguage={currentLanguage}
                onExploreMatchingJobs={(skill) => {
                  setJobSkillFilter(skill);
                  setActiveTab('jobs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToTraining={(_skill) => {
                  setActiveTab('training');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToSchemes={() => {
                  setActiveTab('schemes');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

            </div>
          </div>
        )}

        {/* VIEW 2: JOBS TAB */}
        {activeTab === 'jobs' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
                  {t.jobResultsTitle}
                </h1>
                <p className="text-xs sm:text-sm text-[#8B867F] dark:text-[#94A3B8] font-medium mt-0.5">
                  {jobSortBy === 'match'
                    ? (currentLanguage === 'hi' ? 'उच्चतम मैच स्कोर के घटते क्रम में व्यवस्थित (100% → 0%)' : 'Ranked in decreasing order of match score (100% → 0%)')
                    : (currentLanguage === 'hi' ? 'अधिकतम वेतन के क्रम में व्यवस्थित' : 'Ranked by highest salary')}
                  {' • '}{rankedJobs.length} {currentLanguage === 'hi' ? 'अवसर' : 'openings'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Sync / Fetch Third-Party Jobs Button */}
                <button
                  type="button"
                  onClick={() => handleFetchExternalJobs('all', false)}
                  disabled={isFetchingExternalJobs}
                  className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] dark:bg-[#132238] hover:bg-[#DBEAFE] dark:hover:bg-[#1E3A8A]/50 text-[#1D4ED8] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[#1E3A8A] font-bold text-xs flex items-center gap-1.5 cursor-pointer min-h-[36px] transition-colors disabled:opacity-50"
                  title="Fetch latest verified openings from National Career Service (NCS) and Apprenticeship portals"
                >
                  {isFetchingExternalJobs ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D4ED8] dark:text-[#60A5FA]" />
                      <span>{t.fetchingExternalJobs}</span>
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#60A5FA]" />
                      <span>{t.fetchExternalJobs}</span>
                    </>
                  )}
                </button>

                <select
                  value={jobStateFilter}
                  onChange={(e) => setJobStateFilter(e.target.value)}
                  className="bg-white dark:bg-[#161B22] px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] font-semibold text-[#2B2927] dark:text-[#F1F5F9] cursor-pointer min-h-[36px]"
                >
                  <option value="" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">{t.allStates}</option>
                  {['Bihar', 'Uttar Pradesh', 'Rajasthan', 'Maharashtra', 'Gujarat', 'Madhya Pradesh', 'Punjab'].map(st => (
                    <option key={st} value={st} className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">{st}</option>
                  ))}
                </select>

                <select
                  value={jobSortBy}
                  onChange={(e) => setJobSortBy(e.target.value as any)}
                  className="bg-white dark:bg-[#161B22] px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] font-semibold text-[#2B2927] dark:text-[#F1F5F9] cursor-pointer min-h-[36px]"
                >
                  <option value="match" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">{t.bestMatch}</option>
                  <option value="salary" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">{t.highestSalary}</option>
                </select>
              </div>
            </div>

            {/* Source Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6">
              <button
                type="button"
                onClick={() => setJobSourceFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  jobSourceFilter === 'all'
                    ? 'bg-[#2D5A5A] dark:bg-[#152E2E] text-white dark:text-[#2DD4BF] border border-[#2D5A5A] dark:border-[#1E4646]'
                    : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
                }`}
              >
                {t.allSources} ({jobs.length})
              </button>
              <button
                type="button"
                onClick={() => setJobSourceFilter('local')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  jobSourceFilter === 'local'
                    ? 'bg-[#2D5A5A] dark:bg-[#152E2E] text-white dark:text-[#2DD4BF] border border-[#2D5A5A] dark:border-[#1E4646]'
                    : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
                }`}
              >
                <span>{t.localVerified}</span>
              </button>
              <button
                type="button"
                onClick={() => setJobSourceFilter('ncs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  jobSourceFilter === 'ncs'
                    ? 'bg-[#1D4ED8] dark:bg-[#1E3A8A] text-white dark:text-[#BFDBFE] border border-[#1D4ED8]'
                    : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
                }`}
              >
                <Landmark className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#60A5FA]" />
                <span>{t.ncsPortal}</span>
              </button>
              <button
                type="button"
                onClick={() => setJobSourceFilter('apprenticeship')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  jobSourceFilter === 'apprenticeship'
                    ? 'bg-[#B45309] dark:bg-[#78350F] text-white dark:text-[#FDE68A] border border-[#B45309]'
                    : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[#D97706] dark:text-[#FBBF24]" />
                <span>{t.apprenticeshipPortal}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rankedJobs.map((matchResult) => (
                <JobCard
                  key={matchResult.job.id}
                  matchResult={matchResult}
                  currentLanguage={currentLanguage}
                  onViewDetails={handleViewJobDetails}
                  onQuickApply={(res) => {
                    setSelectedJobMatch(res);
                    handleViewJobDetails(res);
                  }}
                  onToggleSave={handleToggleSaveJob}
                  isSaved={userProfile.savedJobIds.includes(matchResult.job.id)}
                  isApplied={userProfile.appliedJobIds.includes(matchResult.job.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: SCHEMES TAB */}
        {activeTab === 'schemes' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
                  {t.schemeResultsTitle}
                </h1>
                <p className="text-xs sm:text-sm text-[#8B867F] dark:text-[#94A3B8] font-medium mt-0.5">
                  Government initiatives providing free skill certification, financial stipends, and toolkit aid.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <select
                  value={schemeCategoryFilter}
                  onChange={(e) => setSchemeCategoryFilter(e.target.value)}
                  className="bg-white dark:bg-[#161B22] px-3 py-2 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] font-semibold text-[#2B2927] dark:text-[#F1F5F9] cursor-pointer min-h-[36px]"
                >
                  <option value="" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">All Categories</option>
                  <option value="Vocational" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">Vocational Skills</option>
                  <option value="Traditional" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">Traditional Artisans</option>
                  <option value="Rural" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">Rural Placement</option>
                  <option value="Community" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">Community Education</option>
                  <option value="Renewable" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">Solar & Green Energy</option>
                  <option value="Apprenticeship" className="bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9]">National Apprenticeship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedSchemesList.map(({ scheme, relevanceScore }) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  relevanceScore={relevanceScore}
                  currentLanguage={currentLanguage}
                  onExplainSimply={handleExplainSchemeSimply}
                  onAskChatbot={(sch) => setSelectedSchemeForChat(sch)}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: TRAINING & VIDEO TUTORIALS TAB */}
        {activeTab === 'training' && (
          <TrainingSection
            currentLanguage={currentLanguage}
            userProfile={userProfile}
            onExploreMatchingJobs={handleExploreMatchingJobsFromSkill}
            onToggleSaveTraining={handleToggleSaveTraining}
          />
        )}

        {/* VIEW 5: NEARBY CENTERS & GOOGLE MAPS TAB */}
        {activeTab === 'centers' && (
          <NearbyCentersMap
            currentLanguage={currentLanguage}
            userProfile={userProfile}
            initialDistrict={userProfile.district}
            initialState={userProfile.state}
            onExploreMatchingJobs={handleExploreMatchingJobsFromSkill}
            onNavigateToTraining={() => setActiveTab('training')}
          />
        )}

        {/* VIEW 6: USER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <UserDashboard
            userProfile={userProfile}
            jobs={jobs}
            schemes={schemes}
            applications={applications}
            currentLanguage={currentLanguage}
            onViewJobDetails={handleViewJobDetails}
            onQuickApply={(res) => {
              setSelectedJobMatch(res);
              handleViewJobDetails(res);
            }}
            onToggleSaveJob={handleToggleSaveJob}
            onExplainSchemeSimply={handleExplainSchemeSimply}
            onAskSchemeChatbot={(sch) => setSelectedSchemeForChat(sch)}
            onNavigateToHome={() => {
              setActiveTab('home');
              const elem = document.getElementById('skill-input-card');
              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
            }}
            onNavigateToTraining={() => setActiveTab('training')}
            onNavigateToCenters={() => setActiveTab('centers')}
            onToggleSaveTraining={handleToggleSaveTraining}
            onExploreMatchingJobs={handleExploreMatchingJobsFromSkill}
            onOpenBiodata={() => setShowBiodataModal(true)}
            currentUser={currentUser}
            onLogin={handleGoogleLogin}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {/* VIEW 7: ADMIN DASHBOARD - PROTECTED ROUTE */}
        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard
              jobs={jobs}
              schemes={schemes}
              applications={applications}
              currentLanguage={currentLanguage}
              onAddJob={handleAddJob}
              onToggleJobStatus={handleToggleJobStatus}
              onDeleteJob={handleDeleteJob}
              onFetchExternalJobs={() => handleFetchExternalJobs('all', false)}
              isFetchingExternalJobs={isFetchingExternalJobs}
            />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fadeIn">
              <div className="p-8 rounded-2xl bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-800/50">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#2B2927] dark:text-[#F1F5F9] tracking-tight">
                  {currentLanguage === 'hi' ? 'एडमिन एक्सेस आवश्यक है' : 'Restricted Admin Route'}
                </h2>
                <p className="text-xs sm:text-sm text-[#6B665F] dark:text-[#94A3B8] mt-2 mb-6 leading-relaxed">
                  {currentLanguage === 'hi'
                    ? 'यह क्षेत्र केवल सत्यापित प्रशासकों के लिए सुरक्षित है। सामान्य आगंतुकों के लिए यह सुलभ नहीं है।'
                    : 'This administrative portal is protected and only accessible to authorized platform administrators.'}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] font-bold text-xs shadow-xs hover:bg-[#224646] transition-all cursor-pointer"
                  >
                    {currentLanguage === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Return to Home'}
                  </button>
                  {!currentUser && (
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] text-[#2B2927] dark:text-[#F1F5F9] font-bold text-xs hover:bg-[#F0ECE1] transition-all cursor-pointer"
                    >
                      {currentLanguage === 'hi' ? 'एडमिन खाते से साइन इन करें' : 'Sign in with Admin Account'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {/* VIEW 8: EMPLOYER PORTAL (Post Jobs & Manage Candidates) */}
        {activeTab === 'employer' && (
          <EmployerPortal
            jobs={jobs}
            applications={applications}
            userProfile={userProfile}
            currentLanguage={currentLanguage}
            onAddJob={handleAddJob}
            onToggleJobStatus={handleToggleJobStatus}
            onDeleteJob={handleDeleteJob}
            onUpdateProfile={handleUpdateProfile}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onOpenBiodata={(_name, _skills) => setShowBiodataModal(true)}
            currentUser={currentUser}
            onLogin={handleGoogleLogin}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#FAF9F5] dark:bg-[#0D1117] border-t border-[#E5E0D5] dark:border-[#262F3D] py-8 px-4 sm:px-6 lg:px-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B867F] dark:text-[#94A3B8]">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-extrabold text-[#2B2927] dark:text-[#F1F5F9] text-sm">Kaushal<span className="text-[#E87D4D]">Setu</span></span>
            <span>•</span>
            <span>कौशल सेतु - भारत का कौशल और अवसर मंच</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
            <a
              href="/specification.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2D5A5A] dark:hover:text-[#2DD4BF] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Open full application specification and printable PDF"
            >
              <FileText className="w-3.5 h-3.5 text-[#E87D4D]" />
              <span>Specification (Doc / PDF)</span>
            </a>
            <button onClick={() => setShowBiodataModal(true)} className="hover:text-[#2D5A5A] dark:hover:text-[#2DD4BF] font-semibold flex items-center gap-1 cursor-pointer">
              <FileText className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'hi' ? 'कौशल बायोडाटा (PDF)' : 'Kaushal Biodata'}</span>
            </button>
            <button onClick={() => setShowHowItWorks(true)} className="hover:text-[#2B2927] dark:hover:text-[#F1F5F9] cursor-pointer">
              {t.howItWorks}
            </button>
            <button onClick={() => setShowDemoSelector(true)} className="hover:text-[#D56B3A] font-bold text-[#E87D4D] cursor-pointer">
              {t.tryDemo}
            </button>
            {isAdmin && (
              <button onClick={() => setActiveTab('admin')} className="hover:text-[#2B2927] dark:hover:text-[#F1F5F9] cursor-pointer">
                Admin Portal
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* ---------------- MODALS & DRAWERS ---------------- */}

      {/* 1. Job Details Modal */}
      <JobDetailsModal
        matchResult={selectedJobMatch}
        currentLanguage={currentLanguage}
        onClose={() => setSelectedJobMatch(null)}
        onApply={handleApplyToJob}
        isApplied={Boolean(selectedJobMatch && userProfile.appliedJobIds.includes(selectedJobMatch.job.id))}
        userProfile={userProfile}
        onOpenBiodata={() => setShowBiodataModal(true)}
      />

      {/* 2. Plain-Language Government Scheme Explainer Modal */}
      <PlainLanguageExplainerModal
        scheme={selectedSchemeForExplain}
        simplified={simplifiedSchemeData}
        isLoading={loadingSimplification}
        currentLanguage={currentLanguage}
        onClose={() => setSelectedSchemeForExplain(null)}
        onAskQuestions={(sch) => {
          setSelectedSchemeForExplain(null);
          setSelectedSchemeForChat(sch);
        }}
        onLocateNearbyCenters={() => {
          setSelectedSchemeForExplain(null);
          setActiveTab('centers');
        }}
      />

      {/* 3. Scheme Chatbot Drawer */}
      <SchemeChatDrawer
        scheme={selectedSchemeForChat}
        currentLanguage={currentLanguage}
        onClose={() => setSelectedSchemeForChat(null)}
      />

      {/* 4. Demo Selector Modal */}
      {showDemoSelector && (
        <DemoSelectorModal
          currentLanguage={currentLanguage}
          onSelectPersona={handleSelectPersona}
          onClose={() => setShowDemoSelector(false)}
        />
      )}

      {/* 5. How It Works Modal */}
      {showHowItWorks && (
        <HowItWorksModal
          currentLanguage={currentLanguage}
          onClose={() => setShowHowItWorks(false)}
          onGetStarted={() => {
            setShowHowItWorks(false);
            setActiveTab('home');
            const elem = document.getElementById('skill-input-card');
            if (elem) elem.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* 6. Kaushal Biodata & Skill Card Modal (Print & WhatsApp PDF) */}
      <KaushalBiodataModal
        isOpen={showBiodataModal}
        onClose={() => setShowBiodataModal(false)}
        userProfile={userProfile}
        currentLanguage={currentLanguage}
        onUpdateProfile={handleUpdateProfile}
        schemes={schemes}
      />

    </div>
  );
}
export default App;
