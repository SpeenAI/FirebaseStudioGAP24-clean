import * as admin from 'firebase-admin';

let adminApp: admin.app.App | null = null;

if (!admin.apps.length) {
  try {
    adminApp = admin.initializeApp();
  } catch (e) {
    console.warn(
      "Firebase Admin SDK could not be initialized. This might be expected in some development environments.",
      e
    );
    adminApp = null;
  }
} else {
  adminApp = admin.app();
}

// Only attempt to get Firestore if adminApp was successfully initialized
const adminDb = adminApp ? adminApp.firestore() : null;

export { adminDb };
