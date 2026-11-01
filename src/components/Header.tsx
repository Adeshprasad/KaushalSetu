import React, { useState, useRef, useEffect } from 'react';
import { Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../translations';
import {
  Home,
  Briefcase,
  Award,
  GraduationCap,
  MapPin,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  Check,
  ChevronDown,
  Building2
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: 'home' | 'jobs' | 'schemes' | 'training' | 'centers' | 'dashboard' | 'admin' | 'employer';
  setActiveTab: (tab: 'home' | 'jobs' | 'schemes' | 'training' | 'centers' | 'dashboard' | 'admin' | 'employer') => void;
  onOpenHowItWorks?: () => void;
  onOpenDemo?: () => void;
  userProfile: UserProfile;
  demoActive?: boolean;
  currentUser?: FirebaseUser | null;
  onLogin?: () => void;
  onLogout?: () => void;
  authLoading?: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  activeTab,
  setActiveTab,
  userProfile,
  currentUser,
  onLogin,
  onLogout,
  authLoading = false,
  theme,
  onToggleTheme,
  isAdmin = false
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.hi;
  const isHindi = currentLanguage === 'hi';

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'en', label: 'English', native: 'English' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
  ];

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Primary Nav Items - Strictly: Home, Jobs, Govt Schemes, Training, Map & Centers
  const primaryNavItems = [
    {
      id: 'home' as const,
      labelHi: 'मुख्य पृष्ठ',
      labelEn: 'Home',
      icon: Home
    },
    {
      id: 'jobs' as const,
      labelHi: 'नौकरियां',
      labelEn: 'Jobs',
      icon: Briefcase
    },
    {
      id: 'schemes' as const,
      labelHi: 'सरकारी योजनाएं',
      labelEn: 'Govt Schemes',
      icon: Award
    },
    {
      id: 'training' as const,
      labelHi: 'प्रशिक्षण',
      labelEn: 'Training',
      icon: GraduationCap
    },
    {
      id: 'centers' as const,
      labelHi: 'नक्शा व केंद्र',
      labelEn: 'Map & Centers',
      icon: MapPin
    }
  ];

  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 dark:bg-[#0D1117]/95 backdrop-blur-md border-b border-[#E5E0D5] dark:border-[#262F3D] shadow-xs transition-colors">
      {/* Top civic gradient highlight line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#E87D4D] via-[#2D5A5A] to-[#E87D4D]"></div>

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-4">
          
          {/* LEFT: Logo & Primary Left-Aligned Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-6 lg:gap-8 shrink-0">
            {/* Logo & Brand */}
            <div 
              id="brand-logo-button"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0 select-none"
              title="KaushalSetu Portal"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#2D5A5A] dark:bg-[#204747] text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-2xs group-hover:bg-[#224646] dark:group-hover:bg-[#2A5E5E] transition-colors border border-[#3E7070] dark:border-[#2D6161] shrink-0">
                <span>क</span>
              </div>
              <span className="font-extrabold text-lg sm:text-xl text-[#2B2927] dark:text-[#F1F5F9] tracking-tight leading-none whitespace-nowrap">
                Kaushal<span className="text-[#E87D4D]">Setu</span>
              </span>
            </div>

            {/* Primary Desktop Nav Links (Left-aligned next to brand) */}
            <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
              {primaryNavItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`h-9 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] font-bold border border-[#2D5A5A]/30 dark:border-[#2DD4BF]/40 shadow-2xs'
                        : 'text-[#6B665F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] hover:bg-[#F0ECE1]/70 dark:hover:bg-[#1E2633]'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{isHindi ? item.labelHi : item.labelEn}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: Actions, Shortcuts & Auth Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">

            {/* Mobile-Only Persistent Shortcuts: Jobs & Map/Centers */}
            <div className="flex lg:hidden items-center gap-1">
              <button
                type="button"
                onClick={() => handleNavClick('jobs')}
                aria-label="Jobs"
                title={isHindi ? 'नौकरियां' : 'Jobs'}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center transition-colors shadow-2xs cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border-[#2D5A5A]/40 dark:border-[#2DD4BF]/50'
                    : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('centers')}
                aria-label="Map & Centers"
                title={isHindi ? 'नक्शा व केंद्र' : 'Map & Centers'}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center transition-colors shadow-2xs cursor-pointer ${
                  activeTab === 'centers'
                    ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border-[#2D5A5A]/40 dark:border-[#2DD4BF]/50'
                    : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633]'
                }`}
              >
                <MapPin className="w-4 h-4 text-[#E87D4D]" />
              </button>
            </div>

            {/* Employer / Post Job Action Button */}
            <button
              id="employer-portal-nav-btn"
              type="button"
              onClick={() => handleNavClick('employer')}
              aria-label="Employer Portal and Job Posting"
              title={isHindi ? 'नियोक्ता व ठेकेदार पोर्टल (नौकरी पोस्ट करें)' : 'Employer Portal (Post a Job)'}
              className={`h-9 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap shrink-0 ${
                activeTab === 'employer'
                  ? 'bg-[#E87D4D] text-white border border-[#D96836] shadow-sm'
                  : 'bg-white dark:bg-[#161B22] text-[#E87D4D] dark:text-[#FB923C] border border-[#E87D4D]/40 dark:border-[#FB923C]/40 hover:bg-[#FDF0EA] dark:hover:bg-[#281812]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline-block">{isHindi ? 'नियोक्ता / जॉब पोस्ट' : 'Employer / Post Job'}</span>
              <span className="sm:hidden">{isHindi ? 'नियोक्ता' : 'Post Job'}</span>
            </button>

            {/* Theme Toggle - Desktop & Tablet (In mobile menu on small screens) */}
            <button
              id="theme-toggle-nav-btn"
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="hidden md:flex w-9 h-9 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] transition-colors items-center justify-center cursor-pointer shadow-2xs shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#2D5A5A]" />
              )}
            </button>

            {/* Language Selector - Desktop & Tablet (In mobile menu on small screens) */}
            <div className="hidden md:block relative shrink-0" ref={languageDropdownRef}>
              <button
                id="language-globe-dropdown-btn"
                type="button"
                onClick={() => setLanguageDropdownOpen(prev => !prev)}
                aria-label="Select Language"
                title="Select Language / भाषा चुनें"
                aria-expanded={languageDropdownOpen}
                className="w-9 h-9 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] hover:text-[#2B2927] dark:hover:text-[#F1F5F9] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <Globe className="w-4 h-4" />
              </button>

              {/* Language Floating Menu */}
              {languageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] shadow-lg py-1.5 z-50 animate-fadeIn">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#8B867F] dark:text-[#64748B] tracking-wider border-b border-[#E5E0D5] dark:border-[#262F3D] mb-1">
                    Language / भाषा
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLanguageDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        currentLanguage === lang.code
                          ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] font-bold'
                          : 'text-[#2B2927] dark:text-[#F1F5F9] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.native}</span>
                        <span className="text-[10px] text-[#8B867F] dark:text-[#64748B]">({lang.label})</span>
                      </div>
                      {currentLanguage === lang.code && (
                        <Check className="w-3.5 h-3.5 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Controls: Sign In Button OR User Avatar Profile Dropdown */}
            {currentUser ? (
              <div className="relative shrink-0" ref={userDropdownRef}>
                <button
                  id="user-avatar-profile-btn"
                  type="button"
                  onClick={() => setUserDropdownOpen(prev => !prev)}
                  aria-expanded={userDropdownOpen}
                  aria-label="User profile and navigation menu"
                  className="h-8 sm:h-9 flex items-center gap-1.5 bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] rounded-lg px-1.5 sm:px-2 shadow-2xs hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633] transition-colors cursor-pointer"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-5 h-5 rounded-full object-cover border border-[#CCE0E0] dark:border-[#262F3D]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] flex items-center justify-center text-[10px] font-bold">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline-block text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] truncate max-w-[85px]">
                    {currentUser.displayName?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8B867F] dark:text-[#94A3B8]" />
                </button>

                {/* User Avatar Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#161B22] border border-[#E5E0D5] dark:border-[#262F3D] shadow-lg py-2 z-50 animate-fadeIn">
                    
                    {/* User Identity Header */}
                    <div className="px-3.5 py-2 border-b border-[#E5E0D5] dark:border-[#262F3D] mb-1">
                      <p className="text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] truncate">
                        {currentUser.displayName || userProfile.name || 'Candidate'}
                      </p>
                      <p className="text-[11px] text-[#8B867F] dark:text-[#94A3B8] truncate mt-0.5">
                        {currentUser.email || userProfile.phone || 'Signed in'}
                      </p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold">
                          <ShieldCheck className="w-3 h-3" />
                          Administrator
                        </span>
                      )}
                    </div>

                    {/* Dashboard Option */}
                    <button
                      id="dropdown-nav-dashboard"
                      type="button"
                      onClick={() => {
                        handleNavClick('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        activeTab === 'dashboard'
                          ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] font-bold'
                          : 'text-[#2B2927] dark:text-[#F1F5F9] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                        <span>{isHindi ? 'मेरा डैशबोर्ड' : 'Dashboard'}</span>
                      </div>
                      {userProfile.skills.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#E87D4D]"></span>
                      )}
                    </button>

                    {/* Employer Portal Option */}
                    <button
                      id="dropdown-nav-employer"
                      type="button"
                      onClick={() => {
                        handleNavClick('employer');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        activeTab === 'employer'
                          ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] font-bold'
                          : 'text-[#2B2927] dark:text-[#F1F5F9] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#E87D4D]" />
                        <span>{isHindi ? 'नियोक्ता / नौकरी पोस्ट करें' : 'Employer Portal & Post Jobs'}</span>
                      </div>
                    </button>

                    {/* Admin Option */}
                    {isAdmin && (
                      <button
                        id="dropdown-nav-admin"
                        type="button"
                        onClick={() => {
                          handleNavClick('admin');
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                          activeTab === 'admin'
                            ? 'bg-[#2B2927] dark:bg-[#F1F5F9] text-white dark:text-[#0D1117] font-bold'
                            : 'text-[#2B2927] dark:text-[#F1F5F9] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633]'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-[#E87D4D]" />
                        <span>{isHindi ? 'एडमिन कंसोल' : 'Admin Console'}</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-[#E5E0D5] dark:border-[#262F3D]"></div>

                    {/* Sign Out Action */}
                    {onLogout && (
                      <button
                        id="dropdown-signout-btn"
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{isHindi ? 'साइन आउट' : 'Sign out'}</span>
                      </button>
                    )}

                  </div>
                )}
              </div>
            ) : (
              /* Sign In Button: Compact on mobile, expanded on sm+ */
              <button
                id="google-signin-header-btn"
                type="button"
                onClick={onLogin}
                disabled={authLoading}
                aria-label="Sign in"
                className="h-8 sm:h-9 flex items-center gap-1.5 px-2 sm:px-3 text-xs font-bold rounded-lg bg-white dark:bg-[#161B22] hover:bg-[#FAF9F5] dark:hover:bg-[#1E2633] text-[#2B2927] dark:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#262F3D] shadow-2xs transition-colors cursor-pointer shrink-0"
                title="Sign in with Google"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden sm:inline">{isHindi ? 'साइन इन' : 'Sign in'}</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9] hover:bg-[#F0ECE1] dark:hover:bg-[#1E2633] transition-colors flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E0D5] dark:border-[#262F3D] bg-[#FAF9F5] dark:bg-[#0D1117] px-3.5 py-3.5 shadow-xl animate-fadeIn transition-colors">
          
          {/* Mobile Quick Bar: Language Selector & Theme Toggle */}
          <div className="mb-3.5 pb-3 border-b border-[#E5E0D5] dark:border-[#262F3D] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#8B867F] dark:text-[#94A3B8] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#E87D4D]" />
                <span>भाषा / Language</span>
              </span>

              {/* Theme Toggle Button inside mobile menu */}
              <button
                type="button"
                onClick={onToggleTheme}
                className="h-7.5 px-2.5 rounded-lg border border-[#E5E0D5] dark:border-[#262F3D] bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#2D5A5A]" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Language Chips (One-tap selection for rural youth) */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {languages.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onLanguageChange(lang.code);
                    }}
                    className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] shadow-xs'
                        : 'bg-white dark:bg-[#161B22] text-[#6B665F] dark:text-[#94A3B8] border border-[#E5E0D5] dark:border-[#262F3D] hover:bg-[#F0ECE1]'
                    }`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-[10px] opacity-75 font-normal">({lang.label})</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Navigation Links */}
          <div className="space-y-1">
            {primaryNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer min-h-[44px] ${
                    isActive
                      ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#2D5A5A]/40 dark:border-[#2DD4BF]/50 shadow-2xs'
                      : 'text-[#2B2927] dark:text-[#F1F5F9] hover:bg-[#F0ECE1] dark:hover:bg-[#161B22]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#2D5A5A] dark:text-[#2DD4BF]' : 'text-[#E87D4D]'}`} />
                    <span>{isHindi ? item.labelHi : item.labelEn}</span>
                  </div>
                  {isActive && <div className="w-2 h-2 rounded-full bg-[#2D5A5A] dark:bg-[#2DD4BF]"></div>}
                </button>
              );
            })}

            {/* Signed-in Profile or Sign In in Drawer */}
            <div className="pt-2.5 mt-2.5 border-t border-[#E5E0D5] dark:border-[#262F3D]">
              {currentUser ? (
                <div className="space-y-1.5">
                  <div className="px-3.5 py-2 bg-white dark:bg-[#161B22] rounded-xl border border-[#E5E0D5] dark:border-[#262F3D] flex items-center gap-2.5">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'User'}
                        className="w-7 h-7 rounded-full object-cover border border-[#CCE0E0]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] flex items-center justify-center text-xs font-bold">
                        {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#2B2927] dark:text-[#F1F5F9] truncate">
                        {currentUser.displayName || userProfile.name || 'Candidate'}
                      </p>
                      <p className="text-[10px] text-[#8B867F] dark:text-[#94A3B8] truncate">
                        {currentUser.email || 'Logged in'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavClick('dashboard')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer min-h-[44px] ${
                      activeTab === 'dashboard'
                        ? 'bg-[#EBF1F1] dark:bg-[#152E2E] text-[#2D5A5A] dark:text-[#2DD4BF] border border-[#2D5A5A]/40'
                        : 'bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#262F3D]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-[#2D5A5A] dark:text-[#2DD4BF]" />
                      <span>{isHindi ? 'मेरा डैशबोर्ड' : 'My Dashboard'}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('employer')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer min-h-[44px] ${
                      activeTab === 'employer'
                        ? 'bg-[#E87D4D] text-white shadow-xs'
                        : 'bg-[#FDF0EA] dark:bg-[#281812] text-[#9C431B] dark:text-[#FB923C] border border-[#F6D3C2] dark:border-[#4E2619]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-[#E87D4D]" />
                      <span>{isHindi ? 'नियोक्ता / नौकरी पोस्ट करें' : 'Employer Portal / Post Job'}</span>
                    </div>
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-white/40 dark:bg-black/40">Free</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleNavClick('admin')}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer min-h-[44px] ${
                        activeTab === 'admin'
                          ? 'bg-[#2B2927] dark:bg-[#F1F5F9] text-white dark:text-[#0D1117]'
                          : 'bg-white dark:bg-[#161B22] text-[#2B2927] dark:text-[#F1F5F9] border border-[#E5E0D5] dark:border-[#262F3D]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-[#E87D4D]" />
                      <span>{isHindi ? 'एडमिन कंसोल' : 'Admin Console'}</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'साइन आउट' : 'Sign out'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogin?.();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#2D5A5A] dark:bg-[#2DD4BF] text-white dark:text-[#0D1117] font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer min-h-[44px]"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{isHindi ? 'Google से साइन इन करें' : 'Sign in with Google'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('employer')}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FDF0EA] dark:bg-[#281812] text-[#9C431B] dark:text-[#FB923C] border border-[#F6D3C2] dark:border-[#4E2619] font-bold text-xs flex items-center justify-center gap-2 shadow-2xs cursor-pointer min-h-[44px]"
                  >
                    <Building2 className="w-4 h-4 text-[#E87D4D]" />
                    <span>{isHindi ? 'नियोक्ता / ठेकेदार लॉगिन व जॉब पोस्ट' : 'Employer Portal / Post Jobs'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
