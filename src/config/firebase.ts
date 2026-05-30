/**
 * Firebase configuration
 *
 * HOW TO SET UP (5 minutes):
 *  1. Go to https://console.firebase.google.com
 *  2. Create a new project (e.g. "poreless-app")
 *  3. Click the </> Web icon to add a web app
 *  4. Copy the firebaseConfig values and paste them below
 *  5. In Firebase console → Authentication → Sign-in method → enable Email/Password
 *
 * The app will work without this (local auth fallback) but Firebase
 * gives you a real user database, password reset emails, and Google sign-in.
 */

export const FIREBASE_CONFIG = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT_ID.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID',
};

/** Set to true once you have pasted real Firebase credentials above */
export const FIREBASE_ENABLED = false;

/**
 * Google Vision API key for face scan AI.
 *
 * HOW TO GET ONE (free tier — 1000 requests/month):
 *  1. Go to https://console.cloud.google.com
 *  2. Enable "Cloud Vision API"
 *  3. Create an API key under APIs & Services → Credentials
 *  4. Paste it below
 */
export const VISION_API_KEY = 'YOUR_GOOGLE_VISION_API_KEY';
export const VISION_ENABLED = false;

/**
 * Gemini API key — powers the AI Label Recognizer (OCR → structured product
 * profile), smarter skin analysis, and AR step-completion detection.
 *
 * HOW TO GET ONE (free tier):
 *  1. Go to https://aistudio.google.com/app/apikey
 *  2. Create an API key
 *  3. Paste it below and flip GEMINI_ENABLED to true
 *
 * Until then every Gemini-backed feature runs a realistic local simulation,
 * so nothing crashes and the UX is identical. Dropping the key in here is the
 * only change needed to go live.
 */
export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
export const GEMINI_ENABLED = false;
export const GEMINI_MODEL = 'gemini-2.0-flash';
