
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { INITIAL_RESTAURANTS, INITIAL_MENU_ITEMS } from '../../frontend/web/src/data/seedData.js';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

async function seed() {
  console.log('🚀 Starting DineEase Firestore seeding...');

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('❌ Error: Missing Firebase configuration in .env!');
    console.log('Please set FIREBASE_API_KEY and FIREBASE_PROJECT_ID in backend/.env before running this script.');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    console.log(`📍 Seeding ${INITIAL_RESTAURANTS.length} restaurants...`);
    for (const restaurant of INITIAL_RESTAURANTS) {
      await setDoc(doc(db, 'restaurants', restaurant.id), {
        ...restaurant,
        createdAt: new Date().toISOString()
      }, { merge: true });
      console.log(`  ✓ Restaurant added: ${restaurant.name}`);
    }

    console.log(`🍽️ Seeding ${INITIAL_MENU_ITEMS.length} menu items...`);
    for (const item of INITIAL_MENU_ITEMS) {
      await setDoc(doc(db, 'menuItems', item.id), {
        ...item,
        createdAt: new Date().toISOString()
      }, { merge: true });
      console.log(`  ✓ Menu item added: ${item.name} (${item.price}$)`);
    }

    console.log('🎉 Firestore database successfully populated with DineEase seed data!');
  } catch (error) {
    console.error('❌ Failed to seed Firestore:', error);
    process.exit(1);
  }
}

seed();
