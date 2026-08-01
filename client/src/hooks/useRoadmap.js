import { useEffect, useCallback } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';

/**
 * Hook for managing startup roadmap data and state with Zustand
 */
export function useRoadmap() {
  const { 
    roadmapData, 
    activeTab, 
    setActiveTab, 
    isGenerating,
    completionStatus,
    setRoadmapData,
    updateTaskStatus
  } = useRoadmapStore();

  const loadRoadmap = useCallback(() => {
    const stored = sessionStorage.getItem('startwise_roadmap_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.roadmap?.skill_gap_analysis || parsed.roadmap.skill_gap_analysis.length === 0) {
          sessionStorage.removeItem('startwise_roadmap_data');
        } else {
          setRoadmapData(parsed);
        }
      } catch (err) {
        console.error("Failed to parse roadmap data:", err);
      }
    }
  }, [setRoadmapData]);

  useEffect(() => {
    if (!roadmapData) loadRoadmap();
  }, [roadmapData, loadRoadmap]);

  return {
    data: roadmapData,
    activeTab,
    setActiveTab,
    isGenerating,
    completionStatus,
    updateTaskStatus,
    roadmap: roadmapData?.roadmap,
    stages: roadmapData?.roadmap?.stages || [],
    skills: roadmapData?.roadmap?.skill_gap_analysis || [],
    domainAnalysis: roadmapData?.domain_analysis
  };
}
