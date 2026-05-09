import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!getApps().length) {
  if (serviceAccountStr) {
    try {
      const serviceAccount = JSON.parse(serviceAccountStr);
      initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error) {
      console.error('Firebase Admin Init Error:', error);
      // Fallback for development without service account (will fail for protected data)
      initializeApp();
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY not found. Admin SDK not fully initialized.');
    initializeApp();
  }
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export { adminAuth, adminDb };
