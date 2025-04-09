import admin from "firebase-admin"

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if we have all required Firebase environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

    // Only initialize if we have the required credentials
    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    } else {
      console.warn("Firebase credentials not available. Firebase services will not work.")
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error)
  }
}

// Create a safer version of Firestore that checks if Firebase is initialized
const getFirestore = () => {
  if (!admin.apps.length) {
    return {
      collection: () => ({
        doc: () => ({
          get: async () => ({ exists: false, data: () => ({}) }),
          set: async () => {},
          update: async () => {},
        }),
        where: () => ({
          where: () => ({
            get: async () => ({ empty: true, forEach: () => {} }),
          }),
          orderBy: () => ({
            orderBy: () => ({
              limit: () => ({
                get: async () => ({ empty: true, forEach: () => {} }),
              }),
            }),
          }),
          get: async () => ({ empty: true, forEach: () => {} }),
        }),
      }),
    }
  }
  return admin.firestore()
}

export const db = getFirestore()
