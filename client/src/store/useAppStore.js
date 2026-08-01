import { create } from 'zustand';
import { collection, query, where, orderBy, onSnapshot, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * App Store for General UI, Idea Analysis and Global Collections
 */
export const useAppStore = create((set) => ({
  // --- UI State ---
  isLoading: false,
  notifications: [],
  modals: {
    analysis: false,
    settings: false,
    meeting: false
  },
  
  // --- Core Domain State ---
  idea: '',
  selectedCity: 'Delhi NCR',
  selectedSkills: [],
  result: null,
  history: [],
  meetings: [],
  selectedInvestor: null,
  selectedInvestorForMeeting: null,
  
  // --- Actions ---
  setLoading: (isLoading) => set({ isLoading }),
  setIdea: (idea) => set({ idea }),
  setSelectedCity: (selectedCity) => set({ selectedCity }),
  setSelectedSkills: (selectedSkills) => set({ selectedSkills }),
  setResult: (result) => set({ result }),
  setHistory: (history) => set({ history }),
  setMeetings: (meetings) => set({ meetings }),
  setSelectedInvestor: (selectedInvestor) => set({ selectedInvestor }),
  setSelectedInvestorForMeeting: (selectedInvestorForMeeting) => set({ selectedInvestorForMeeting }),
  
  setModal: (modalName, isOpen) => set((state) => ({
    modals: { ...state.modals, [modalName]: isOpen }
  })),

  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now(), ...notification }]
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  // --- Firebase Operations ---
  addHistoryItem: async (user, data) => {
    if (user && db) {
      await addDoc(collection(db, `users/${user.uid}/kits`), {
        ...data,
        createdAt: serverTimestamp()
      });
    }
  },

  addMeeting: async (user, meetingData) => {
    if (user && db) {
      await addDoc(collection(db, 'meetings'), {
        ...meetingData,
        founderId: user.uid,
        status: 'confirmed',
        createdAt: serverTimestamp(),
      });
    }
  },

  // --- Subscriptions ---
  subscribeToHistory: (user) => {
    if (!user || !db) {
      set({ history: [] });
      return () => {};
    }
    const q = query(collection(db, `users/${user.uid}/kits`), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      set({ history: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
    });
  },

  subscribeToMeetings: (user) => {
    if (!user || !db) {
      set({ meetings: [] });
      return () => {};
    }
    const q = query(collection(db, 'meetings'), where('founderId', '==', user.uid), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      set({ meetings: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
    });
  }
}));
