# DineEase

DineEase has an Expo React Native app in `frontend/`, a separate Vite web client
in `frontend/web/`, and Firebase backend support in `backend/`. The existing
mobile app connects directly to Firebase; this repository did not contain an
Express server or HTTP API, so there is currently no backend API URL to
configure.

## Requirements

- Node.js LTS (Node 20 or newer recommended)
- npm
- Expo Go for Android development, or EAS CLI access for APK builds

## Configure Firebase

Copy `frontend/.env.example` to `frontend/.env` and fill in the Firebase web-app
configuration from Firebase Console. The Expo client uses these `EXPO_PUBLIC_`
values for Firebase Authentication and Firestore. These values are included in
the client bundle; they are not server secrets. Restrict the Firebase API key
and enforce access with Firebase Authentication and Firestore rules.

To seed Firestore, copy `backend/.env.example` to `backend/.env` and fill in
the `FIREBASE_*` values. The seed script uses Firebase's client SDK and the
existing Firestore rules; it does not use a service-account credential.
Keep server-only keys such as `GEMINI_API_KEY` in `backend/.env`, never in
`frontend/.env` or `frontend/web/.env`.

All `.env` files are ignored by Git. Do not replace an existing local `.env`
when copying an example.

## Run the Expo app

```powershell
cd frontend
npm ci
npx expo start
```

Scan the QR code with Expo Go. For a physical Android phone, the phone and
development computer should be on the same Wi-Fi network; if LAN discovery is
blocked, run `npx expo start --tunnel`.

## Build an Android APK with EAS

The existing `preview` profile in `frontend/eas.json` is configured to produce
an APK. From the Expo project directory:

```powershell
cd frontend
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

`app.json` already contains the Android application ID and EAS project ID.
Expo `EXPO_PUBLIC_` configuration is embedded in the APK, so do not place
private backend credentials in it.

## Run the web client

The existing Vite app is retained as a separate web frontend:

```powershell
cd frontend/web
npm ci
```

Copy `frontend/web/.env.example` to `.env` and set its `VITE_FIREBASE_*`
values, then start it with:

```powershell
npm run dev
```

## Backend support

`backend/` currently contains Firestore security rules and the Firestore seed
tool, not an Express API. To install its independent dependencies:

```powershell
cd backend
npm ci
```

After configuring `backend/.env`, run `npm run seed:firestore` only when you
intend to write the initial restaurant and menu documents to Firestore. No
`npm start` or HTTP API is available until a backend server and routes are
implemented.

If an API is added later, use `EXPO_PUBLIC_API_URL` for the mobile app:

- Physical Android device: use the development computer's LAN IPv4 address
  (for example, `http://192.168.1.25:4000`), not `localhost`.
- Android emulator: use `http://10.0.2.2:4000` to reach the host computer.
- Installed APK: configure a publicly reachable HTTPS API URL before the EAS
  build; a local or LAN-only URL will not work outside that network.

There is no API client or `EXPO_PUBLIC_API_URL` setting in the current app;
Firebase calls remain direct and unchanged.
