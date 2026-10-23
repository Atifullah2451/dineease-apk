# DineEase — Full-Stack Expo React Native & Firebase Guide

Welcome to **DineEase**, a modern, beginner-friendly restaurant discovery, food ordering, and table reservation application built with **React Native (Expo)**, **Firebase Authentication**, and **Cloud Firestore**.

---

## 1. Prerequisites

Before running the application on your physical Android phone:
1. **Node.js**: LTS version (Node 18.x or 20.x recommended).
2. **VS Code**: Or your preferred editor.
3. **Expo Go App**: Install **Expo Go** from Google Play Store on your Android phone.
4. **Firebase Account**: Free Google account with access to [Firebase Console](https://console.firebase.google.com).
5. **Network**: Make sure your computer and physical Android phone are connected to the **same Wi-Fi network** (or use `--tunnel` mode).

---

## 2. Setting Up Firebase Console

### Step A: Create a Firebase Project
1. Open [Firebase Console](https://console.firebase.google.com).
2. Click **Add project**, name it `dineease-app`, and click **Create**.

### Step B: Enable Firebase Authentication
1. In the left sidebar, navigate to **Build** > **Authentication**.
2. Click **Get Started**.
3. Under **Sign-in method**, select **Email/Password**.
4. Enable **Email/Password** and click **Save**.

### Step C: Provision Cloud Firestore
1. In the left sidebar, click **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose your nearest Cloud Region (e.g., `nam5` or `eur3` or `asia-east1`).
4. Select **Start in production mode** (or test mode for immediate prototyping) and click **Enable**.

### Step D: Register a Web App & Get Configuration
1. In Project Overview, click the **Web icon `(</>)`** to add a web application.
2. Register app name as `DineEase-Client`.
3. Firebase will display your config credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "dineease-app.firebaseapp.com",
     projectId: "dineease-app",
     storageBucket: "dineease-app.firebasestorage.app",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef..."
   };
   ```

### Step E: Apply Firestore Security Rules
1. In the Firebase console, go to **Firestore Database** > **Rules** tab.
2. Apply the rules from [`backend/config/firestore.rules`](../backend/config/firestore.rules) in the Firebase Console. Use that file as the source of truth.
3. Click **Publish**.

---

## 3. Expo Project Installation Commands

From the project root:

```bash
# 1. Navigate to the Expo project folder
cd frontend

# 2. Install all required dependencies
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage @expo/vector-icons firebase

# 3. Create frontend/.env from .env.example if it does not already exist.
# On PowerShell: Copy-Item .env.example .env

# 4. Fill in your Firebase credentials in .env:
# EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
# EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=dineease-app.firebaseapp.com
# EXPO_PUBLIC_FIREBASE_PROJECT_ID=dineease-app
# EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=dineease-app.firebasestorage.app
# EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
# EXPO_PUBLIC_FIREBASE_APP_ID=...
```

---

## 4. Seeding Firestore with Initial Data

To populate Pakistani, Chinese, Italian, Fast Food, and BBQ restaurants along with their signature menus into Firestore:

```bash
# From workspace root:
npm --prefix backend run seed:firestore
```
This automatically writes documents into the `restaurants` and `menuItems` collections.

---

## 5. Running the App on an Android Phone in Expo Go

1. Make sure your Android device and computer are on the **same Wi-Fi network**.
2. Run the Expo development server:
   ```bash
   npx expo start -c
   ```
   *(The `-c` flag clears Metro cache for a pristine build)*
3. A large QR code will appear in your terminal.
4. Open the **Expo Go** app on your Android phone.
5. Tap **Scan QR code** and point your phone's camera at the terminal screen.
6. The bundle will compile (0% -> 100%) and DineEase will open natively!

### Troubleshooting Connection on Android:
If the QR code does not load or hangs due to router firewalls/client isolation:
- Run with Expo Tunneling:
  ```bash
  npx expo start --tunnel
  ```
  *(Uses secure ngrok tunneling to connect anywhere without Wi-Fi subnet restrictions).*

---

## 6. End-to-End Testing Checklist

Use this 10-step checklist to test every feature of DineEase:

- [ ] **1. User Registration**:
  Open Profile tab > Click "Create New Account" > Enter Name, Email, Password, Phone > Tap Register. Verify user appears in Firebase Authentication and a document is created in `users/{uid}` in Firestore.
- [ ] **2. Persistent Authentication**:
  Close Expo Go completely on your phone and reopen it. Verify you remain logged in and your name appears on the Home screen header.
- [ ] **3. Logout & Password Reset**:
  Go to Profile > Sign Out. Verify account clears. Click "Forgot Password", enter email, and verify password reset message.
- [ ] **4. Restaurant & Dish Search**:
  Go to Search tab > Type "Biryani", "Burger", or "Tagliatelle". Confirm results update instantly in real time.
- [ ] **5. Cuisine & Dietary Filtering**:
  Filter by Pakistani, Chinese, Italian, Fast Food, BBQ. Toggle "Veg Only" to view vegetarian options. Toggle "4.7+ Rating" and price tiers (`$`, `$$`, `$$$`).
- [ ] **6. Menu Browsing**:
  Tap any restaurant card. Verify cover image, opening hours, address, and category pills (Mains, BBQ, Starters, Desserts).
- [ ] **7. Single-Restaurant Cart Guard**:
  Add a dish from LalQila. Then navigate to Bella Roma and try adding a pizza. Confirm the modal alerts you that adding will clear the existing cart from another restaurant.
- [ ] **8. Cart Quantity & Totals**:
  Open Cart tab. Increase and decrease quantities, remove items. Verify subtotal, delivery fee, and grand total calculate with mathematical precision.
- [ ] **9. Checkout & Order Persistence**:
  Tap "Proceed to Checkout". Enter delivery address and phone number. Click "Confirm & Place Order". Confirm success receipt with unique Order ID and verify document in Firestore `orders`.
- [ ] **10. Table Reservation & Cancellation**:
  Tap "Book Table" on any restaurant. Select tomorrow's date, pick a time slot (e.g. 07:30 PM), choose 4 guests. Tap "Confirm Table Reservation". Verify it shows up in "My Bookings" with Confirmed badge. Tap "Cancel Reservation" and confirm the status updates to Cancelled.

## 7. Building an Installable Android APK

From the `frontend` directory, run the following commands in order:

```bash
eas login
eas build:configure
eas build -p android --profile preview
```

The `preview` EAS profile is configured to produce an APK for direct device
installation. The app's Android package is `com.dineease.app`, version is
`1.0.0`, and Android version code is `1`. No custom launcher icon is
configured yet; add a branded icon asset and its path to `app.json` when one
is available.

The current Expo app talks directly to Firebase and has no HTTP API URL. If an
API is added later, use `EXPO_PUBLIC_API_URL`; physical Android devices must
use the development computer's LAN IPv4 address, Android emulators use
`10.0.2.2`, and installed APKs require a publicly reachable HTTPS URL.
