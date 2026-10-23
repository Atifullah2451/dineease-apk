import React, { useState } from 'react';
import { 
  Terminal, 
  Smartphone, 
  Database, 
  ShieldCheck, 
  CheckSquare, 
  Copy, 
  Check, 
  FileCode, 
  Play, 
  Flame,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { INITIAL_RESTAURANTS, INITIAL_MENU_ITEMS } from '../data/seedData.js';

interface ExpoDeveloperHubProps {
  onRunSeed?: () => void;
  isSeeding?: boolean;
}

export const ExpoDeveloperHub: React.FC<ExpoDeveloperHubProps> = ({ onRunSeed, isSeeding }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
  });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleCheck = (id: number) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const firestoreRulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }
    function isAdmin() {
      return isAuthenticated() && (request.auth.token.admin == true || exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
    }

    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'isAdmin']);
      allow delete: if isAdmin();
    }

    match /restaurants/{restaurantId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /menuItems/{itemId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /orders/{orderId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid && request.resource.data.status in ['pending', 'placed'];
      allow update: if isAdmin() || (isAuthenticated() && resource.data.userId == request.auth.uid && resource.data.status == 'pending' && request.resource.data.status == 'cancelled');
      allow delete: if isAdmin();
    }

    match /bookings/{bookingId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid && request.resource.data.guestCount > 0 && request.resource.data.guestCount <= 20;
      allow update: if isAdmin() || (isAuthenticated() && resource.data.userId == request.auth.uid && resource.data.status in ['pending', 'confirmed'] && request.resource.data.status == 'cancelled');
      allow delete: if isAdmin();
    }
  }
}`;

  return (
    <div className="h-full overflow-y-auto bg-slate-900 text-slate-100 p-6 space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Expo SDK 51 • Android & iOS Ready
            </span>
            <span className="bg-black/30 text-amber-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Firebase Auth & Firestore
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">DineEase Mobile & Cloud Architecture</h2>
          <p className="text-orange-100 text-sm mt-1 max-w-xl">
            This workspace includes the complete, standalone React Native Expo project in <code className="bg-black/20 px-1.5 py-0.5 rounded">expo-app/</code>, configured with clean services, state contexts, and production Firestore rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRunSeed}
            disabled={isSeeding}
            className="flex items-center gap-2 bg-white text-orange-600 font-bold px-4 py-2.5 rounded-xl shadow-lg hover:bg-orange-50 active:scale-95 transition-all text-sm"
          >
            {isSeeding ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-orange-600" />}
            {isSeeding ? 'Seeding Firestore...' : 'Seed Sample Data'}
          </button>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminal Commands Card */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Run in Expo Go on Android</h3>
            </div>
            <button
              onClick={() => copyToClipboard('cd expo-app\nnpx expo install\nnpx expo start -c', 'terminal-start')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-700/50 px-2.5 py-1 rounded-md"
            >
              {copiedKey === 'terminal-start' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'terminal-start' ? 'Copied' : 'Copy Commands'}
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-slate-300 space-y-2">
              <p className="text-slate-500"># 1. Navigate to Expo app directory & install packages</p>
              <p className="text-orange-400 font-semibold">cd expo-app</p>
              <p className="text-orange-400 font-semibold">npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage @expo/vector-icons firebase</p>
              
              <p className="text-slate-500 pt-2"># 2. Start Expo Metro bundler</p>
              <p className="text-emerald-400 font-semibold">npx expo start -c</p>

              <p className="text-slate-500 pt-2"># If router firewall blocks connection, use tunnel mode:</p>
              <p className="text-amber-400 font-semibold">npx expo start --tunnel</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/40 text-xs text-slate-300">
            <Smartphone className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">How to connect physical Android phone:</span>
              <p className="mt-1 text-slate-400">
                1. Install <strong>Expo Go</strong> from Google Play Store.<br />
                2. Connect your phone to the same Wi-Fi as your computer.<br />
                3. Open Expo Go, tap <strong>Scan QR code</strong>, and scan the terminal QR code.
              </p>
            </div>
          </div>
        </div>

        {/* Firestore Collections Schema */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Firestore Database Schema</h3>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-medium">
              5 Collections
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-orange-400 font-bold mb-1">
                <Layers className="w-3.5 h-3.5" /> users
              </div>
              <p className="text-slate-400">uid, fullName, email, phone, createdAt, role</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                <Layers className="w-3.5 h-3.5" /> restaurants
              </div>
              <p className="text-slate-400">name, cuisine, rating, priceRange, address, hours, isActive</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                <Layers className="w-3.5 h-3.5" /> menuItems
              </div>
              <p className="text-slate-400">name, description, price, imageUrl, restaurantId, isVegetarian</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                <Layers className="w-3.5 h-3.5" /> orders
              </div>
              <p className="text-slate-400">userId, restaurantId, items, subtotal, deliveryFee, total, status</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold mb-1">
                <Layers className="w-3.5 h-3.5" /> bookings
              </div>
              <p className="text-slate-400">userId, restaurantId, bookingDate, timeSlot, guestCount, status, customerName, specialRequest</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Rules & Testing Checklist Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Rules Card */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-green-500/10 text-green-400 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Firestore Security Rules</h3>
            </div>
            <button
              onClick={() => copyToClipboard(firestoreRulesSnippet, 'rules')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-700/50 px-2.5 py-1 rounded-md"
            >
              {copiedKey === 'rules' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'rules' ? 'Copied' : 'Copy firestore.rules'}
            </button>
          </div>

          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto leading-relaxed">
            <pre className="text-slate-400">{firestoreRulesSnippet}</pre>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            ✓ Customers only read/update their own profile, orders, and bookings.<br />
            ✓ Public read access for restaurant and dish browsing.<br />
            ✓ Privilege escalation prevention on order and booking statuses.
          </p>
        </div>

        {/* 10-Point Testing Checklist */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Complete Testing Checklist</h3>
            </div>
            <span className="text-xs text-slate-400">10 Functional Checks</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
            {[
              { id: 1, label: 'User Registration with Firebase Auth & Firestore user document creation' },
              { id: 2, label: 'Login & Session persistence across app restarts via AsyncStorage' },
              { id: 3, label: 'Logout & Forgot Password email dispatch trigger' },
              { id: 4, label: 'Search restaurants and dishes by keyword in real time' },
              { id: 5, label: 'Filter by cuisine (Pakistani, Chinese, Italian, Fast Food, BBQ) & Veg Only' },
              { id: 6, label: 'Explore restaurant cover, hours, and categorized menu cards' },
              { id: 7, label: 'Cart single-restaurant conflict guard (prompts before replacing)' },
              { id: 8, label: 'Cart quantity adjustments and subtotal/delivery fee calculation' },
              { id: 9, label: 'Cash on Delivery checkout & unique Firestore order placement' },
              { id: 10, label: 'Atomic table reservation with slot availability and guest cancellation' },
            ].map(item => (
              <label
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                  checklist[item.id] ? 'bg-orange-950/20 text-orange-200 border border-orange-800/30' : 'bg-slate-900/40 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checklist[item.id]}
                  onChange={() => {}}
                  className="mt-0.5 accent-orange-500 rounded"
                />
                <span className="leading-snug">
                  <strong>#{item.id}:</strong> {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
