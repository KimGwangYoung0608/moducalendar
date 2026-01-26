import { useState, useEffect, useCallback } from 'react';
import { User, Category, Schedule, CalendarSettings } from '@/types/calendar';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  SCHEDULES_COLLECTION, 
  SETTINGS_COLLECTION, 
  SETTINGS_DOC_ID 
} from '@/lib/firebase';

interface CalendarData {
  settings: CalendarSettings;
  schedules: Schedule[];
}

const defaultSettings: CalendarSettings = {
  users: [
    { id: '1', name: '사용자1', colorIndex: 1 },
    { id: '2', name: '사용자2', colorIndex: 2 },
  ],
  categories: [
    { id: '1', name: '업무', colorIndex: 1 },
    { id: '2', name: '개인', colorIndex: 2 },
    { id: '3', name: '생일', colorIndex: 3 },
  ],
};

export function useCalendarStore() {
  const [settings, setSettings] = useState<CalendarSettings>(defaultSettings);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Load data from Firebase
  const loadFromFirebase = useCallback(async () => {
    try {
      // Load settings
      const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      const settingsSnap = await getDocs(collection(db, SETTINGS_COLLECTION));
      
      let loadedSettings = defaultSettings;
      settingsSnap.forEach((doc) => {
        if (doc.id === SETTINGS_DOC_ID) {
          const data = doc.data();
          if (data.users && data.categories) {
            loadedSettings = {
              users: data.users,
              categories: data.categories.map((cat: Category, idx: number) => ({
                ...cat,
                colorIndex: cat.colorIndex ?? (idx % 8) + 1,
              })),
            };
          }
        }
      });
      setSettings(loadedSettings);

      // Load schedules
      const schedulesSnap = await getDocs(collection(db, SCHEDULES_COLLECTION));
      const loadedSchedules: Schedule[] = [];
      schedulesSnap.forEach((doc) => {
        loadedSchedules.push({ id: doc.id, ...doc.data() } as Schedule);
      });
      setSchedules(loadedSchedules);
      setLastSync(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load from Firebase:', error);
      setIsLoading(false);
    }
  }, []);

  // Initial load and set up real-time listener
  useEffect(() => {
    loadFromFirebase();

    // Set up real-time listener for schedules
    const schedulesQuery = collection(db, SCHEDULES_COLLECTION);
    const unsubscribeSchedules = onSnapshot(schedulesQuery, (snapshot) => {
      const loadedSchedules: Schedule[] = [];
      snapshot.forEach((doc) => {
        loadedSchedules.push({ id: doc.id, ...doc.data() } as Schedule);
      });
      setSchedules(loadedSchedules);
      setLastSync(new Date());
    });

    // Set up real-time listener for settings
    const settingsQuery = collection(db, SETTINGS_COLLECTION);
    const unsubscribeSettings = onSnapshot(settingsQuery, (snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.id === SETTINGS_DOC_ID) {
          const data = doc.data();
          if (data.users && data.categories) {
            setSettings({
              users: data.users,
              categories: data.categories.map((cat: Category, idx: number) => ({
                ...cat,
                colorIndex: cat.colorIndex ?? (idx % 8) + 1,
              })),
            });
          }
        }
      });
      setLastSync(new Date());
    });

    // Cleanup
    return () => {
      unsubscribeSchedules();
      unsubscribeSettings();
    };
  }, [loadFromFirebase]);

  // Auto-refresh every 5 seconds as backup
  useEffect(() => {
    const interval = setInterval(() => {
      loadFromFirebase();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadFromFirebase]);

  // Save settings to Firebase
  const updateSettings = async (newSettings: CalendarSettings) => {
    setSettings(newSettings);
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), {
        users: newSettings.users,
        categories: newSettings.categories,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to save settings to Firebase:', error);
    }
  };

  // Add schedule to Firebase
  const addSchedule = async (schedule: Omit<Schedule, 'id' | 'createdAt'>) => {
    const newSchedule: Schedule = {
      ...schedule,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    // Optimistic update
    setSchedules(prev => [...prev, newSchedule]);
    
    try {
      await setDoc(doc(db, SCHEDULES_COLLECTION, newSchedule.id), {
        title: newSchedule.title,
        description: newSchedule.description,
        date: newSchedule.date,
        userId: newSchedule.userId,
        categoryId: newSchedule.categoryId,
        createdAt: newSchedule.createdAt,
      });
    } catch (error) {
      console.error('Failed to add schedule to Firebase:', error);
      // Rollback on error
      setSchedules(prev => prev.filter(s => s.id !== newSchedule.id));
    }
  };

  // Delete schedule from Firebase
  const deleteSchedule = async (id: string) => {
    // Optimistic update
    const previousSchedules = schedules;
    setSchedules(prev => prev.filter(s => s.id !== id));
    
    try {
      await deleteDoc(doc(db, SCHEDULES_COLLECTION, id));
    } catch (error) {
      console.error('Failed to delete schedule from Firebase:', error);
      // Rollback on error
      setSchedules(previousSchedules);
    }
  };

  const getSchedulesByDate = (date: string) => {
    return schedules.filter(s => s.date === date);
  };

  const getUserById = (id: string) => {
    return settings.users.find(u => u.id === id);
  };

  const getCategoryById = (id: string) => {
    return settings.categories.find(c => c.id === id);
  };

  return {
    settings,
    schedules,
    isLoading,
    lastSync,
    updateSettings,
    addSchedule,
    deleteSchedule,
    getSchedulesByDate,
    getUserById,
    getCategoryById,
    refreshData: loadFromFirebase,
  };
}
