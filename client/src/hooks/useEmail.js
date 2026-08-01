import { useState, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import confetti from 'canvas-confetti';

/**
 * Hook for managing investor email drafting and sending
 */
export function useEmail() {
  const [emailSent, setEmailSent] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSendEmail = useCallback(async () => {
    if (!emailTo || !emailSubject || !emailBody) return;
    setIsSending(true);
    setError(null);

    try {
      // Try sending via server API (Resend)
      await apiClient.post('/email-send', {
        to: emailTo,
        subject: emailSubject,
        body: emailBody
      });
      setEmailSent(true);
      confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.6 } 
      });
    } catch (err) {
      console.warn("Server email failed, falling back to mailto:", err.message);
      // Fallback to mailto: if server email fails (no Resend API key)
      window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      setEmailSent(true);
      confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.6 } 
      });
    } finally {
      setIsSending(false);
    }
  }, [emailTo, emailSubject, emailBody]);

  return {
    emailTo, setEmailTo,
    emailSubject, setEmailSubject,
    emailBody, setEmailBody,
    emailSent, setEmailSent,
    isSending, error,
    handleSendEmail
  };
}
