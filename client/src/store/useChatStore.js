import { create } from 'zustand';

/**
 * Chat Store for VC Simulator and Assistant
 */
export const useChatStore = create((set) => ({
  messages: [],
  isTyping: false,
  isSpeaking: false,
  isListening: false,
  voiceProvider: 'browser',

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setTyping: (isTyping) => set({ isTyping }),
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  setListening: (isListening) => set({ isListening }),
  clearChat: () => set({ messages: [] }),
  resetChat: () => set({ messages: [], isTyping: false, isSpeaking: false, isListening: false }),
}));
