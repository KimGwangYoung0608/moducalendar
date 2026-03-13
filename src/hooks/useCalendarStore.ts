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
import { COLOR_COUNT } from '@/lib/colors';

interface CalendarData {
  settings: CalendarSettings;
  schedules: Schedule[];
}

const defaultSettings: CalendarSettings = {
  users: [
    { id: '1', name: '사용자1', colorIndex: 1 },
    { id: '2', name: '사용자2', colorIndex: 2 },
    { id: '3', name: '김광영', colorIndex: 3 },
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
                colorIndex: cat.colorIndex ?? (idx % COLOR_COUNT) + 1,
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
                colorIndex: cat.colorIndex ?? (idx % COLOR_COUNT) + 1,
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
      const scheduleData: Record<string, unknown> = {
        title: newSchedule.title,
        description: newSchedule.description,
        date: newSchedule.date,
        userId: newSchedule.userId,
        categoryId: newSchedule.categoryId,
        createdAt: newSchedule.createdAt,
      };
      
      // Add files if present
      if (newSchedule.files && newSchedule.files.length > 0) {
        scheduleData.files = newSchedule.files;
      }
      
      // Add address if present
      if (newSchedule.address) {
        scheduleData.address = newSchedule.address;
      }
      
      await setDoc(doc(db, SCHEDULES_COLLECTION, newSchedule.id), scheduleData);
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

  // Toggle schedule completion status
  const toggleScheduleComplete = async (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;

    const newIsCompleted = !schedule.isCompleted;
    
    // Optimistic update
    const previousSchedules = schedules;
    setSchedules(prev => prev.map(s => 
      s.id === id ? { ...s, isCompleted: newIsCompleted } : s
    ));
    
    try {
      const scheduleData: Record<string, unknown> = {
        title: schedule.title,
        description: schedule.description,
        date: schedule.date,
        userId: schedule.userId,
        categoryId: schedule.categoryId,
        createdAt: schedule.createdAt,
        isCompleted: newIsCompleted,
      };
      
      // Preserve files if present
      if (schedule.files && schedule.files.length > 0) {
        scheduleData.files = schedule.files;
      }
      
      // Preserve address if present
      if (schedule.address) {
        scheduleData.address = schedule.address;
      }
      
      await setDoc(doc(db, SCHEDULES_COLLECTION, id), scheduleData);
    } catch (error) {
      console.error('Failed to toggle schedule completion in Firebase:', error);
      // Rollback on error
      setSchedules(previousSchedules);
    }
  };

  // Update schedule in Firebase
  const updateSchedule = async (id: string, updates: Partial<Omit<Schedule, 'id' | 'createdAt'>>) => {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;

    const updatedSchedule = { ...schedule, ...updates };
    
    // Optimistic update
    const previousSchedules = schedules;
    setSchedules(prev => prev.map(s => 
      s.id === id ? updatedSchedule : s
    ));
    
    try {
      const scheduleData: Record<string, unknown> = {
        title: updatedSchedule.title,
        description: updatedSchedule.description,
        date: updatedSchedule.date,
        userId: updatedSchedule.userId,
        categoryId: updatedSchedule.categoryId,
        createdAt: updatedSchedule.createdAt,
        isCompleted: updatedSchedule.isCompleted ?? false,
      };
      
      // Add files if present
      if (updatedSchedule.files && updatedSchedule.files.length > 0) {
        scheduleData.files = updatedSchedule.files;
      }
      
      // Add address if present
      if (updatedSchedule.address) {
        scheduleData.address = updatedSchedule.address;
      }
      
      await setDoc(doc(db, SCHEDULES_COLLECTION, id), scheduleData);
    } catch (error) {
      console.error('Failed to update schedule in Firebase:', error);
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
    updateSchedule,
    deleteSchedule,
    toggleScheduleComplete,
    getSchedulesByDate,
    getUserById,
    getCategoryById,
    refreshData: loadFromFirebase,
  };
}
