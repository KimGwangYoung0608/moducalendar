import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD1iKtF8S37EocRVcBqgqjcWuE5lx24MNU",
  authDomain: "calendar-909f9.firebaseapp.com",
  databaseURL: "https://calendar-909f9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "calendar-909f9",
  storageBucket: "calendar-909f9.firebasestorage.app",
  messagingSenderId: "777457243293",
  appId: "1:777457243293:web:8ed3caec9af7dfa133f074"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections
const SCHEDULES_COLLECTION = 'schedules';
const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'calendar-settings';

export { db, collection, doc, setDoc, getDocs, deleteDoc, onSnapshot, query, orderBy, SCHEDULES_COLLECTION, SETTINGS_COLLECTION, SETTINGS_DOC_ID };
