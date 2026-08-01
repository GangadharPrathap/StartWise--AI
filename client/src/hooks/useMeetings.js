import { useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/apiClient';
import confetti from 'canvas-confetti';

/**
 * Hook for managing meeting scheduling and sessions
 */
export function useMeetings() {
  const { user } = useAuth();
  const store = useAppStore();
  const [isScheduling, setIsScheduling] = useState(false);
  const [schedulingSuccess, setSchedulingSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleScheduleMeeting = useCallback(async (meetingData) => {
    setIsScheduling(true);
    setError(null);
    setSchedulingSuccess(false);
    
    try {
      // Save to Firebase Firestore
      await store.addMeeting(user, meetingData);
      
      // Also save to PostgreSQL (non-blocking)
      try {
        await apiClient.post('/meetings/save', {
          firebaseUid: user.uid,
          email: user.email,
          investorName: meetingData.investorName || meetingData.investor || 'Unknown',
          scheduledAt: meetingData.scheduledAt || meetingData.date || new Date().toISOString(),
          meetingLink: meetingData.meetingLink || ''
        });
      } catch (dbErr) {
        console.warn("Meeting DB save (non-critical):", dbErr.message);
      }

      setSchedulingSuccess(true);
      confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.6 } 
      });
    } catch (err) {
      console.error("Scheduling Error:", err);
      setError(err.message || "Failed to schedule meeting.");
    } finally {
      setIsScheduling(false);
    }
  }, [store.addMeeting]);

  const resetStatus = useCallback(() => {
    setSchedulingSuccess(false);
    setError(null);
  }, []);

  return {
    handleScheduleMeeting,
    isScheduling,
    schedulingSuccess,
    error,
    resetStatus,
    meetings: store.meetings,
    selectedInvestorForMeeting: store.selectedInvestorForMeeting
  };
}
