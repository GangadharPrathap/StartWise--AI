import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/aiService';
import roadmapService from '../services/roadmapService';
import { apiClient } from '../utils/apiClient';

/**
 * Hook for managing startup idea analysis logic
 */
export function useIdeaAnalysis() {
  const { user } = useAuth();
  const store = useAppStore();
  const roadmapStore = useRoadmapStore();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyzeIdea = useCallback(async () => {
    if (!store.idea.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Parallel execution for better performance
      const [analysisResult, roadmapResult, domainResult] = await Promise.allSettled([
        aiService.analyzeIdea(store.idea, store.selectedCity),
        aiService.generateRoadmap({
          idea_text: store.idea,
          student_year: "Founding Team",
          existing_skills: store.selectedSkills,
          timeline_preference: "Aggressive",
          idea_type: "Tech Startup"
        }),
        roadmapService.suggestDomains(store.idea)
      ]);

      const analysisData = analysisResult.status === 'fulfilled' ? analysisResult.value : null;
      const roadmapData = roadmapResult.status === 'fulfilled' ? roadmapResult.value : null;
      const domainData = domainResult.status === 'fulfilled' ? domainResult.value : null;

      if (!analysisData || !roadmapData) {
        throw new Error('Analysis or roadmap generation failed');
      }

      const finalResult = { 
        ...analysisData, 
        groundingSources: [], 
        city: store.selectedCity 
      };
      
      // Update Analysis Store
      store.setResult(finalResult);
      
      // Update Roadmap Store
      // aiService.generateRoadmap already unwraps the response (status=success → data)
      // So roadmapData here is the raw roadmap object, not wrapped in {status, data}
      const unwrappedRoadmap = roadmapData?.data ?? roadmapData;
      console.log('Roadmap data received:', JSON.stringify(unwrappedRoadmap).substring(0, 500));
      const unwrappedDomain = domainData?.data ?? domainData;
      const formattedRoadmap = { roadmap: unwrappedRoadmap, domain_analysis: unwrappedDomain };
      roadmapStore.setRoadmapData(formattedRoadmap);
      sessionStorage.setItem('startwise_roadmap_data', JSON.stringify(formattedRoadmap));

      await store.addHistoryItem(user, { 
        idea: store.idea, 
        city: store.selectedCity, 
        result: finalResult 
      });

      // Save to PostgreSQL (non-blocking — don't break flow if DB save fails)
      try {
        const startupRes = await apiClient.post('/startups', {
          firebaseUid: user.uid,
          email: user.email,
          title: store.idea.substring(0, 100),
          description: store.idea,
          industry: finalResult?.targetCustomer ? 'Tech' : 'General',
          stage: 'Idea'
        });
        if (startupRes?.id) {
          await apiClient.post('/analysis', {
            startupId: startupRes.id,
            title: store.idea.substring(0, 100),
            description: store.idea,
            industry: 'Tech'
          });
        }
        const { auth } = await import('../services/firebase');
        if (auth?.currentUser) {
          await apiClient.post('/user/save-analysis', {
            firebaseUid: auth.currentUser.uid,
            email: auth.currentUser.email,
            idea: store.idea,
            city: store.selectedCity,
            result: finalResult
          });
        }
      } catch (dbErr) {
        console.warn("DB save (non-critical):", dbErr.message);
      }

      navigate('/roadmap');
    } catch (err) {
      console.error("Generation failed:", err);
      setError(err.message || "Failed to analyze idea. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [store.idea, store.selectedCity, store.setResult, store.addHistoryItem, navigate, user, roadmapStore]);

  return {
    analyzeIdea,
    isAnalyzing,
    error,
    idea: store.idea,
    setIdea: store.setIdea,
    selectedCity: store.selectedCity,
    setSelectedCity: store.setSelectedCity,
    selectedSkills: store.selectedSkills,
    setSelectedSkills: store.setSelectedSkills,
    result: store.result
  };
}
