import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { generateAvatarImage, generateAvatarStats } from '../services/geminiService';
import type { AvatarStats } from '../services/geminiService';

export interface UserProfile {
  name: string;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  hairColor: string;
}

export interface UserMetrics {
  calories: number;
  sleepHours: number;
  exerciseMins: number;
}

export interface SystemIssue {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'done';
}

export interface FeatureEnhancement {
  id: string;
  title: string;
}

interface StoreContextType {
  profile: UserProfile;
  metrics: UserMetrics;
  issues: SystemIssue[];
  enhancements: FeatureEnhancement[];
  avatarImageUrl: string | null;
  avatarStats: AvatarStats | null;
  isGeneratingAvatar: boolean;
  avatarError: string | null;
  setProfile: (profile: Partial<UserProfile>) => void;
  setMetrics: (metrics: Partial<UserMetrics>) => void;
  toggleIssueStatus: (id: string) => void;
  resetDailyMetrics: () => void;
  triggerAvatarGeneration: (latestMetrics?: Partial<UserMetrics>) => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: 'Gym Hero',
  gender: 'male',
  height: 175,
  weight: 70,
  hairColor: '#4A3423',
};

const defaultMetrics: UserMetrics = {
  calories: 0,
  sleepHours: 0,
  exerciseMins: 0,
};

import { extendedInitialIssues as initialIssues, extendedInitialEnhancements as initialEnhancements } from '../data/seedData';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile);
  const [metrics, setMetricsState] = useState<UserMetrics>(defaultMetrics);
  const [issues, setIssuesState] = useState<SystemIssue[]>(initialIssues);
  const [enhancements, setEnhancementsState] = useState<FeatureEnhancement[]>(initialEnhancements);
  
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [avatarStats, setAvatarStats] = useState<AvatarStats | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Load from localStorage on mount and sync across tabs
  useEffect(() => {
    const loadState = () => {
      const savedProfile = localStorage.getItem('gymastic_profile');
      const savedMetrics = localStorage.getItem('gymastic_metrics');
      const savedIssues = localStorage.getItem('gymastic_issues');
      const savedAvatar = localStorage.getItem('gymastic_avatar_url');
      const savedStats = localStorage.getItem('gymastic_avatar_stats');

      if (savedProfile) setProfileState(JSON.parse(savedProfile));
      if (savedMetrics) setMetricsState(JSON.parse(savedMetrics));
      if (savedIssues) {
        const parsedIssues = JSON.parse(savedIssues);
        if (parsedIssues.length < 50) {
          setIssuesState(initialIssues);
          localStorage.setItem('gymastic_issues', JSON.stringify(initialIssues));
        } else {
          setIssuesState(parsedIssues);
        }
      } else {
        localStorage.setItem('gymastic_issues', JSON.stringify(initialIssues));
      }
      if (savedAvatar) setAvatarImageUrl(savedAvatar);
      if (savedStats) setAvatarStats(JSON.parse(savedStats));
    };

    loadState(); // Initial load

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gymastic_profile' && e.newValue) setProfileState(JSON.parse(e.newValue));
      if (e.key === 'gymastic_metrics' && e.newValue) setMetricsState(JSON.parse(e.newValue));
      if (e.key === 'gymastic_issues' && e.newValue) setIssuesState(JSON.parse(e.newValue));
      if (e.key === 'gymastic_avatar_url') setAvatarImageUrl(e.newValue);
      if (e.key === 'gymastic_avatar_stats' && e.newValue) setAvatarStats(JSON.parse(e.newValue));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setProfile = (newProfile: Partial<UserProfile>) => {
    const updated = { ...profile, ...newProfile };
    setProfileState(updated);
    localStorage.setItem('gymastic_profile', JSON.stringify(updated));
  };

  const setMetrics = (newMetrics: Partial<UserMetrics>) => {
    const updated = { ...metrics, ...newMetrics };
    setMetricsState(updated);
    localStorage.setItem('gymastic_metrics', JSON.stringify(updated));
  };

  const toggleIssueStatus = (id: string) => {
    const updated = issues.map(iss => 
      iss.id === id ? { ...iss, status: (iss.status === 'open' ? 'done' : 'open') as 'open' | 'done' } : iss
    );
    setIssuesState(updated);
    localStorage.setItem('gymastic_issues', JSON.stringify(updated));
  };

  const resetDailyMetrics = () => {
    setMetricsState(defaultMetrics);
    localStorage.setItem('gymastic_metrics', JSON.stringify(defaultMetrics));
  };

  const triggerAvatarGeneration = useCallback(
    async (latestMetrics?: Partial<UserMetrics>) => {
      setIsGeneratingAvatar(true);
      setAvatarError(null);

      const effectiveMetrics = latestMetrics ? { ...metrics, ...latestMetrics } : metrics;

      try {
        const url = await generateAvatarImage(profile, effectiveMetrics);
        const stats = await generateAvatarStats(profile, effectiveMetrics);
        setAvatarImageUrl(url);
        setAvatarStats(stats);
        localStorage.setItem('gymastic_avatar_url', url);
        localStorage.setItem('gymastic_avatar_stats', JSON.stringify(stats));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error generating avatar.';
        setAvatarError(msg);
      } finally {
        setIsGeneratingAvatar(false);
      }
    },
    [profile, metrics]
  );

  return (
    <StoreContext.Provider
      value={{
        profile,
        metrics,
        issues,
        enhancements,
        avatarImageUrl,
        avatarStats,
        isGeneratingAvatar,
        avatarError,
        setProfile,
        setMetrics,
        toggleIssueStatus,
        resetDailyMetrics,
        triggerAvatarGeneration,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
