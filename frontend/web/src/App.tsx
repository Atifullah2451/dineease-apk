/**
 * DineEase - Interactive Mobile App & Expo Full-Stack Application
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  Search,
  ShoppingCart,
  Calendar,
  User as UserIcon,
  Star,
  Clock,
  Bike,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Flame,
  Soup,
  Pizza,
  Sandwich,
  Drumstick,
  ArrowLeft,
  Smartphone,
  Code2,
  Sparkles,
  RefreshCw,
  LogOut,
  MapPin,
  Phone,
  Filter,
  Check
} from 'lucide-react';

import {
  INITIAL_RESTAURANTS,
  INITIAL_MENU_ITEMS,
  CUISINE_CATEGORIES
} from './data/seedData.js';
import {
  unifiedService,
  UserProfile,
  Order,
  Booking
} from './services/firebaseClient';
import { ExpoDeveloperHub } from './components/ExpoDeveloperHub';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'cart' | 'bookings' | 'profile'>('home');
  const [activeViewMode, setActiveViewMode] = useState<'mobile' | 'developer'>('mobile');
  const [deviceFrame, setDeviceFrame] = useState<boolean>(true);

  // App Data & Entities
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>(INITIAL_RESTAURANTS);
  const [menuItems, setMenuItems] = useState<any[]>(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Cart State
  const [cartItems, setCartItems] = useState<{ item: any; restaurant: any; quantity: number }[]>([]);
  const [cartRestaurant, setCartRestaurant] = useState<any | null>(null);
  const [conflictModal, setConflictModal] = useState<{
    visible: boolean;
    pendingItem?: any;
    pendingRestaurant?: any;
  }>({ visible: false });

  // Detail / Modal Views
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);
  const [bookingModal, setBookingModal] = useState<{
    visible: boolean;
    restaurant?: any;
  }>({ visible: false });
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'popularity'>('rating');
  const [searchMode, setSearchMode] = useState<'restaurants' | 'dishes'>('restaurants');

  // Booking Form State
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('07:30 PM');
  const [bookingGuests, setBookingGuests] = useState(2);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingSpecial, setBookingSpecial] = useState('');
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null);

  // Checkout Form State
  const [checkoutAddress, setCheckoutAddress] = useState('House 4B, Street 12, Sector F-7, Islamabad');
  const [checkoutPhone, setCheckoutPhone] = useState('+92 300 1234567');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authPhoneInput, setAuthPhoneInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Seeding status
  const [isSeeding, setIsSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial Data Load
  useEffect(() => {
    async function init() {
      const user = await unifiedService.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setBookingName(user.fullName);
        setBookingPhone(user.phone || '+92 300 1234567');
      }

      const rests = await unifiedService.getRestaurants();
      setRestaurants(rests);

      const items = await unifiedService.getMenuItems();
      setMenuItems(items);

      const userOrders = await unifiedService.getOrders(user?.uid);
      setOrders(userOrders);

      const userBookings = await unifiedService.getBookings(user?.uid);
      setBookings(userBookings);
    }
    init();
  }, []);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  }, [cartItems]);

  const deliveryFee = cartRestaurant?.deliveryFee || (cartItems.length > 0 ? 2.50 : 0);
  const cartTotal = cartItems.length > 0 ? Number((cartSubtotal + deliveryFee).toFixed(2)) : 0;
  const cartItemCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // Cart operations
  const addToCart = (item: any, restaurant: any, quantity = 1) => {
    if (cartRestaurant && cartRestaurant.id !== restaurant.id && cartItems.length > 0) {
      setConflictModal({
        visible: true,
        pendingItem: item,
        pendingRestaurant: restaurant,
      });
      return;
    }

    if (!cartRestaurant || cartItems.length === 0) {
      setCartRestaurant(restaurant);
    }

    setCartItems(prev => {
      const idx = prev.findIndex(i => i.item.id === item.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += quantity;
        return next;
      }
      return [...prev, { item, restaurant, quantity }];
    });

    showToast(`Added ${item.name} to cart`);
  };

  const confirmReplaceCart = () => {
    if (conflictModal.pendingItem && conflictModal.pendingRestaurant) {
      setCartRestaurant(conflictModal.pendingRestaurant);
      setCartItems([{
        item: conflictModal.pendingItem,
        restaurant: conflictModal.pendingRestaurant,
        quantity: 1
      }]);
      showToast(`Started new cart with ${conflictModal.pendingRestaurant.name}`);
    }
    setConflictModal({ visible: false });
  };

  const updateCartQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeCartItem(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(i => i.item.id === itemId ? { ...i, quantity: qty } : i)
    );
  };

  const removeCartItem = (itemId: string) => {
    setCartItems(prev => {
      const filtered = prev.filter(i => i.item.id !== itemId);
      if (filtered.length === 0) setCartRestaurant(null);
      return filtered;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCartRestaurant(null);
  };

  // Filtered Restaurants
  const filteredRestaurants = useMemo(() => {
    let list = [...restaurants];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }

    if (selectedCuisine !== 'all') {
      list = list.filter(r =>
        r.cuisine === selectedCuisine || r.cuisineTags?.includes(selectedCuisine)
      );
    }

    if (selectedPrice !== 'All') {
      list = list.filter(r => r.priceRange === selectedPrice);
    }

    if (minRating > 0) {
      list = list.filter(r => r.rating >= minRating);
    }

    if (vegetarianOnly) {
      list = list.filter(r => r.hasVegetarianOptions);
    }

    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => a.priceRange.length - b.priceRange.length);
    } else if (sortBy === 'popularity') {
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    return list;
  }, [restaurants, searchQuery, selectedCuisine, selectedPrice, minRating, vegetarianOnly, sortBy]);

  // Filtered Dishes
  const filteredDishes = useMemo(() => {
    let list = [...menuItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
      );
    }

    if (vegetarianOnly) {
      list = list.filter(d => d.isVegetarian);
    }

    if (selectedCuisine !== 'all') {
      const targetRests = restaurants
        .filter(r => r.cuisine === selectedCuisine || r.cuisineTags?.includes(selectedCuisine))
        .map(r => r.id);
      list = list.filter(d => targetRests.includes(d.restaurantId));
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else {
      list.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }

    return list;
  }, [menuItems, restaurants, searchQuery, vegetarianOnly, selectedCuisine, sortBy]);

  // Place Order Action
  const handlePlaceOrder = async () => {
    if (!currentUser) {
      setAuthModalVisible(true);
      return;
    }
    if (!checkoutAddress.trim()) {
      alert('Please enter delivery address.');
      return;
    }
    if (!checkoutPhone.trim()) {
      alert('Please enter phone number.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const newOrder = await unifiedService.createOrder({
        userId: currentUser.uid,
        customerName: currentUser.fullName,
        restaurantId: cartRestaurant.id,
        restaurantName: cartRestaurant.name,
        items: cartItems.map(i => ({
          id: i.item.id,
          name: i.item.name,
          price: i.item.price,
          quantity: i.quantity,
          totalItemPrice: Number((i.item.price * i.quantity).toFixed(2))
        })),
        subtotal: Number(cartSubtotal.toFixed(2)),
        deliveryFee: Number(deliveryFee.toFixed(2)),
        total: cartTotal,
        deliveryAddress: checkoutAddress,
        phone: checkoutPhone,
        notes: checkoutNotes,
        paymentMethod: 'Cash on Delivery (Demo)'
      });

      setOrders(prev => [newOrder, ...prev]);
      clearCart();
      setConfirmedOrder(newOrder);
      showToast('🎉 Order placed successfully!');
    } catch (e: any) {
      alert(e.message || 'Failed to place order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Table Reservation Action
  const handleConfirmReservation = async () => {
    if (!currentUser) {
      setAuthModalVisible(true);
      return;
    }

    const rest = bookingModal.restaurant || restaurants[0];
    try {
      const newBooking = await unifiedService.createBooking({
        userId: currentUser.uid,
        restaurantId: rest.id,
        restaurantName: rest.name,
        bookingDate,
        timeSlot: bookingTime,
        guestCount: bookingGuests,
        customerName: bookingName || currentUser.fullName,
        contactNumber: bookingPhone || '+92 300 1234567',
        specialRequest: bookingSpecial,
      });

      setBookings(prev => [newBooking, ...prev]);
      setBookingSuccessId(newBooking.id);
      showToast('🎉 Table reserved successfully!');
    } catch (e: any) {
      alert(e.message || 'Failed to reserve table');
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    await unifiedService.cancelBooking(bookingId);
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
    );
    showToast('Reservation cancelled.');
  };

  // Auth Handling
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        const user = await unifiedService.login(authEmail, authPassword);
        setCurrentUser(user);
        setBookingName(user.fullName);
      } else {
        const user = await unifiedService.register(authFullName, authEmail, authPassword, authPhoneInput);
        setCurrentUser(user);
        setBookingName(user.fullName);
      }
      setAuthModalVisible(false);
      showToast(`Welcome, ${currentUser?.fullName || 'Foodie'}!`);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleLogout = async () => {
    await unifiedService.logout();
    setCurrentUser(null);
    showToast('Logged out.');
  };

  // Seed sample data runner
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      setRestaurants(INITIAL_RESTAURANTS);
      setMenuItems(INITIAL_MENU_ITEMS);
      showToast('Database populated with 6 restaurants and authentic menus!');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 font-sans text-slate-100 antialiased overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-orange-500/50 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-orange-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Utensils className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-white text-base tracking-tight">DineEase</h1>
              <span className="text-[10px] uppercase font-extrabold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
                Expo Mobile & Cloud
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Full-Stack Restaurant & Table Booking Platform</p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setActiveViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeViewMode === 'mobile'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
            </button>
            <button
              onClick={() => setActiveViewMode('developer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeViewMode === 'developer'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Expo Guide & Code</span>
            </button>
          </div>

          {activeViewMode === 'mobile' && (
            <button
              onClick={() => setDeviceFrame(!deviceFrame)}
              title={deviceFrame ? 'Switch to Fullscreen Responsive' : 'Switch to Phone Frame'}
              className="hidden md:flex p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs items-center gap-1.5 border border-slate-700/60"
            >
              <Smartphone className="w-4 h-4 text-orange-400" />
              <span className="text-[11px]">{deviceFrame ? 'Frame ON' : 'Fullscreen'}</span>
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="text-xs text-slate-300 font-medium hidden md:block">
                {currentUser.fullName}
              </span>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthModalVisible(true);
              }}
              className="text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 overflow-hidden relative flex justify-center items-center bg-slate-950">
        {activeViewMode === 'developer' ? (
          <div className="w-full h-full overflow-hidden">
            <ExpoDeveloperHub onRunSeed={handleSeedDatabase} isSeeding={isSeeding} />
          </div>
        ) : (
          <div
            className={`transition-all duration-300 ${
              deviceFrame
                ? 'w-full max-w-[420px] h-[92vh] max-h-[880px] my-auto rounded-[44px] border-[10px] border-slate-800 shadow-2xl shadow-orange-950/20 flex flex-col bg-slate-900 overflow-hidden relative ring-1 ring-slate-700'
                : 'w-full h-full flex flex-col bg-slate-900 overflow-hidden'
            }`}
          >
            {/* Phone Top Notch / Status Bar */}
            {deviceFrame && (
              <div className="h-6 bg-slate-900 flex items-center justify-between px-7 shrink-0 text-[10px] text-slate-400 font-bold select-none z-30">
                <span>9:41</span>
                <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto" />
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* Mobile Viewport Screen Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 flex flex-col relative">
              {/* SCREEN: HOME */}
              {activeTab === 'home' && (
                <div className="flex-1 pb-24">
                  {/* Home Header */}
                  <div className="bg-white px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 shadow-xs">
                    <div>
                      <div className="flex items-center gap-1.5 text-orange-600 mb-0.5">
                        <Utensils className="w-4 h-4" />
                        <span className="text-sm font-black tracking-tight">DineEase</span>
                      </div>
                      <h2 className="text-base font-extrabold text-slate-900">
                        Hello, {currentUser?.fullName?.split(' ')[0] || 'Foodie'} 👋
                      </h2>
                      <p className="text-xs text-slate-500">Discover top eats & reserve tables</p>
                    </div>
                    <button
                      onClick={() => {
                        if (currentUser) setActiveTab('profile');
                        else setAuthModalVisible(true);
                      }}
                      className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xs"
                    >
                      {currentUser ? currentUser.fullName.charAt(0) : <UserIcon className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Search Trigger */}
                    <div
                      onClick={() => setActiveTab('search')}
                      className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between text-slate-400 shadow-xs cursor-pointer hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Search className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-medium">Search Pakistani, Italian, Biryani...</span>
                      </div>
                      <Filter className="w-4 h-4 text-slate-400" />
                    </div>

                    {/* Promotion Banner */}
                    <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
                      <div>
                        <span className="bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                          Special Offer
                        </span>
                        <h3 className="font-extrabold text-base mt-1">Book & Dine with 20% Off</h3>
                        <p className="text-orange-100 text-[11px] mt-0.5">Instant table reservation confirmation</p>
                      </div>
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Cuisine Categories */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <h3 className="font-extrabold text-slate-900 text-sm">Explore Cuisines</h3>
                        <button onClick={() => setActiveTab('search')} className="text-xs text-orange-600 font-bold">
                          All
                        </button>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {CUISINE_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCuisine(cat.id);
                              setActiveTab('search');
                            }}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                              selectedCuisine === cat.id
                                ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Popular Dishes Carousel */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <h3 className="font-extrabold text-slate-900 text-sm">Popular Dishes</h3>
                        <button onClick={() => setActiveTab('search')} className="text-xs text-orange-600 font-bold">
                          View Dishes
                        </button>
                      </div>
                      <div className="space-y-2.5">
                        {menuItems.filter(i => i.isPopular).slice(0, 3).map(dish => {
                          const rest = restaurants.find(r => r.id === dish.restaurantId) || restaurants[0];
                          const inCart = cartItems.find(c => c.item.id === dish.id)?.quantity || 0;
                          return (
                            <div
                              key={dish.id}
                              className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center justify-between gap-3 hover:shadow-sm transition-all"
                            >
                              <img
                                src={dish.imageUrl}
                                alt={dish.name}
                                className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2.5 h-2.5 rounded-full ${dish.isVegetarian ? 'bg-green-600' : 'bg-red-600'}`} />
                                  <h4 className="font-extrabold text-xs text-slate-900 truncate">{dish.name}</h4>
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{dish.description}</p>
                                <span className="text-xs font-black text-orange-600 mt-1 block">
                                  ${dish.price.toFixed(2)}
                                </span>
                              </div>
                              <button
                                onClick={() => addToCart(dish, rest, 1)}
                                className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white p-2 rounded-xl shrink-0 transition-transform shadow-xs"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Featured Restaurants */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <h3 className="font-extrabold text-slate-900 text-sm">Featured Restaurants</h3>
                        <span className="text-xs text-slate-400">({restaurants.length} places)</span>
                      </div>
                      <div className="space-y-4">
                        {restaurants.map(rest => (
                          <div
                            key={rest.id}
                            className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all group cursor-pointer"
                            onClick={() => setSelectedRestaurant(rest)}
                          >
                            <div className="relative h-40 bg-slate-200">
                              <img
                                src={rest.imageUrl}
                                alt={rest.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-xs">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span>{rest.rating.toFixed(1)}</span>
                                <span className="text-[10px] text-slate-300">({rest.reviewsCount})</span>
                              </div>
                              <div className="absolute bottom-3 left-3 bg-white text-orange-600 text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-sm">
                                {rest.priceRange}
                              </div>
                            </div>

                            <div className="p-3.5">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-black text-slate-900 text-sm">{rest.name}</h4>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {rest.cuisine} • {rest.address?.split(',')[0]}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{rest.deliveryTime}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Bike className="w-3.5 h-3.5 text-slate-400" />
                                  <span>${rest.deliveryFee.toFixed(2)} Fee</span>
                                </div>
                                {rest.hasVegetarianOptions && (
                                  <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md ml-auto">
                                    Veg Option
                                  </span>
                                )}
                              </div>

                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRestaurant(rest);
                                  }}
                                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl text-center"
                                >
                                  View Menu
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBookingModal({ visible: true, restaurant: rest });
                                  }}
                                  className="flex-1 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold py-2 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Book Table</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN: SEARCH */}
              {activeTab === 'search' && (
                <div className="flex-1 pb-24">
                  {/* Search Header */}
                  <div className="bg-white px-4 pt-4 pb-3 border-b border-slate-100 sticky top-0 z-10 space-y-2.5 shadow-xs">
                    <div className="relative">
                      <Search className="w-4 h-4 text-orange-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search restaurants, cuisines, dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-100 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/50"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Mode Toggle (Restaurants vs Dishes) */}
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                      <button
                        onClick={() => setSearchMode('restaurants')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                          searchMode === 'restaurants'
                            ? 'bg-white text-orange-600 shadow-xs'
                            : 'text-slate-500'
                        }`}
                      >
                        Restaurants ({filteredRestaurants.length})
                      </button>
                      <button
                        onClick={() => setSearchMode('dishes')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                          searchMode === 'dishes'
                            ? 'bg-white text-orange-600 shadow-xs'
                            : 'text-slate-500'
                        }`}
                      >
                        Dishes ({filteredDishes.length})
                      </button>
                    </div>

                    {/* Filter Pills Scroll */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                      {/* Clear Filter Button */}
                      {(searchQuery || selectedCuisine !== 'all' || selectedPrice !== 'All' || minRating > 0 || vegetarianOnly) && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCuisine('all');
                            setSelectedPrice('All');
                            setMinRating(0);
                            setVegetarianOnly(false);
                          }}
                          className="bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0"
                        >
                          <RefreshCw className="w-3 h-3" /> Clear
                        </button>
                      )}

                      {/* Veg Toggle */}
                      <button
                        onClick={() => setVegetarianOnly(!vegetarianOnly)}
                        className={`px-3 py-1 rounded-full font-bold shrink-0 transition-all ${
                          vegetarianOnly
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        🌱 Veg Only
                      </button>

                      {/* 4.7+ Rating */}
                      <button
                        onClick={() => setMinRating(minRating > 0 ? 0 : 4.7)}
                        className={`px-3 py-1 rounded-full font-bold shrink-0 transition-all ${
                          minRating > 0
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        ⭐ 4.7+
                      </button>

                      {/* Cuisines */}
                      {['Pakistani', 'Chinese', 'Italian', 'Fast Food', 'BBQ'].map(c => (
                        <button
                          key={c}
                          onClick={() => setSelectedCuisine(selectedCuisine === c ? 'all' : c)}
                          className={`px-3 py-1 rounded-full font-bold shrink-0 transition-all ${
                            selectedCuisine === c
                              ? 'bg-orange-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {c}
                        </button>
                      ))}

                      {/* Price */}
                      {['$', '$$', '$$$'].map(p => (
                        <button
                          key={p}
                          onClick={() => setSelectedPrice(selectedPrice === p ? 'All' : p)}
                          className={`px-3 py-1 rounded-full font-bold shrink-0 transition-all ${
                            selectedPrice === p
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Results List */}
                  <div className="p-4">
                    {searchMode === 'restaurants' ? (
                      filteredRestaurants.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl p-6 border border-slate-200">
                          <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <h4 className="font-extrabold text-sm text-slate-900">No restaurants found</h4>
                          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or keyword.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredRestaurants.map(rest => (
                            <div
                              key={rest.id}
                              onClick={() => setSelectedRestaurant(rest)}
                              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex gap-3 p-3 items-center"
                            >
                              <img
                                src={rest.imageUrl}
                                alt={rest.name}
                                className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-black text-sm text-slate-900 truncate">{rest.name}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{rest.cuisine} • {rest.priceRange}</p>
                                <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-1">
                                  <span className="flex items-center gap-0.5 font-bold text-amber-600">
                                    <Star className="w-3 h-3 fill-amber-500" /> {rest.rating}
                                  </span>
                                  <span>•</span>
                                  <span>{rest.deliveryTime}</span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      filteredDishes.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl p-6 border border-slate-200">
                          <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <h4 className="font-extrabold text-sm text-slate-900">No dishes match criteria</h4>
                          <p className="text-xs text-slate-500 mt-1">Try searching another dish name.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredDishes.map(dish => {
                            const rest = restaurants.find(r => r.id === dish.restaurantId) || restaurants[0];
                            return (
                              <div
                                key={dish.id}
                                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                              >
                                <img
                                  src={dish.imageUrl}
                                  alt={dish.name}
                                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${dish.isVegetarian ? 'bg-green-600' : 'bg-red-600'}`} />
                                    <h4 className="font-extrabold text-xs text-slate-900 truncate">{dish.name}</h4>
                                  </div>
                                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{dish.description}</p>
                                  <span className="text-xs font-black text-orange-600 mt-1 block">
                                    ${dish.price.toFixed(2)}
                                  </span>
                                </div>
                                <button
                                  onClick={() => addToCart(dish, rest, 1)}
                                  className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white p-2 rounded-xl shrink-0 transition-transform shadow-xs"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* SCREEN: CART */}
              {activeTab === 'cart' && (
                <div className="flex-1 pb-28">
                  <div className="bg-white px-5 py-4 border-b border-slate-100 sticky top-0 z-10 flex items-center justify-between shadow-xs">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">Your Cart</h2>
                      {cartRestaurant && (
                        <p className="text-xs text-orange-600 font-bold">{cartRestaurant.name}</p>
                      )}
                    </div>
                    {cartItems.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="text-xs text-red-600 font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl"
                      >
                        Clear Cart
                      </button>
                    )}
                  </div>

                  <div className="p-4">
                    {cartItems.length === 0 ? (
                      <div className="text-center py-20 bg-white rounded-3xl p-6 border border-slate-200">
                        <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-extrabold text-base text-slate-900">Your cart is empty</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                          Explore our top restaurants and add delicious dishes to start your order.
                        </p>
                        <button
                          onClick={() => setActiveTab('home')}
                          className="mt-5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
                        >
                          Browse Restaurants
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Cart Items List */}
                        <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs divide-y divide-slate-100">
                          {cartItems.map(({ item, quantity }) => (
                            <div key={item.id} className="py-3 first:pt-1 last:pb-1 flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.name}</h4>
                                <span className="text-xs text-slate-500 block mt-0.5">
                                  ${item.price.toFixed(2)} each
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl">
                                <button
                                  onClick={() => updateCartQuantity(item.id, quantity - 1)}
                                  className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 shadow-2xs"
                                >
                                  {quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                                </button>
                                <span className="text-xs font-extrabold text-slate-900 w-4 text-center">{quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(item.id, quantity + 1)}
                                  className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 shadow-2xs"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add More Items Button */}
                        <button
                          onClick={() => {
                            if (cartRestaurant) setSelectedRestaurant(cartRestaurant);
                            else setActiveTab('home');
                          }}
                          className="w-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add more items from {cartRestaurant?.name}</span>
                        </button>

                        {/* Bill Breakdown */}
                        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                          <h4 className="font-extrabold text-xs text-slate-900">Payment Breakdown</h4>
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-bold text-slate-900">${cartSubtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Delivery Fee</span>
                            <span className="font-bold text-slate-900">${deliveryFee.toFixed(2)}</span>
                          </div>
                          <div className="h-px bg-slate-100 my-1" />
                          <div className="flex justify-between text-sm font-extrabold text-slate-900">
                            <span>Total Amount</span>
                            <span className="text-orange-600 font-black">${cartTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Proceed to Checkout CTA */}
                        <button
                          onClick={() => setCheckoutModalVisible(true)}
                          className="w-full bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-black text-sm py-3.5 rounded-2xl shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
                        >
                          <span>Proceed to Checkout</span>
                          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-lg">
                            ${cartTotal.toFixed(2)}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SCREEN: BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="flex-1 pb-24">
                  <div className="bg-white px-5 py-4 border-b border-slate-100 sticky top-0 z-10 flex items-center justify-between shadow-xs">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">My Bookings</h2>
                      <p className="text-xs text-slate-500">Reserved restaurant dining tables</p>
                    </div>
                    <button
                      onClick={() => setBookingModal({ visible: true, restaurant: restaurants[0] })}
                      className="bg-orange-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Book Table
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {bookings.length === 0 ? (
                      <div className="text-center py-20 bg-white rounded-3xl p-6 border border-slate-200">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-extrabold text-base text-slate-900">No table bookings yet</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                          Skip the line by booking a dining table at your favorite restaurant.
                        </p>
                        <button
                          onClick={() => setBookingModal({ visible: true, restaurant: restaurants[0] })}
                          className="mt-5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
                        >
                          Reserve a Table Now
                        </button>
                      </div>
                    ) : (
                      bookings.map(b => (
                        <div
                          key={b.id}
                          className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-black text-sm text-slate-900">{b.restaurantName}</h4>
                              <p className="text-[11px] text-slate-400">ID: #{b.id.slice(-6)}</p>
                            </div>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                                b.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : b.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl text-center text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Date</span>
                              <span className="font-bold text-slate-800">{b.bookingDate}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Time</span>
                              <span className="font-bold text-slate-800">{b.timeSlot}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Guests</span>
                              <span className="font-bold text-slate-800">{b.guestCount} People</span>
                            </div>
                          </div>

                          {b.specialRequest && (
                            <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-xl">
                              "{b.specialRequest}"
                            </p>
                          )}

                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="w-full text-xs text-red-600 font-bold border border-red-200 bg-red-50 hover:bg-red-100 py-2 rounded-xl transition-colors"
                            >
                              Cancel Reservation
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SCREEN: PROFILE */}
              {activeTab === 'profile' && (
                <div className="flex-1 pb-24">
                  <div className="bg-white px-5 py-4 border-b border-slate-100 sticky top-0 z-10 flex items-center justify-between shadow-xs">
                    <h2 className="text-lg font-extrabold text-slate-900">User Profile</h2>
                    {currentUser && (
                      <button
                        onClick={handleLogout}
                        className="text-xs text-red-600 font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-4">
                    {currentUser ? (
                      <>
                        {/* Profile Info Card */}
                        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                            {currentUser.fullName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-base text-slate-900 truncate">{currentUser.fullName}</h3>
                            <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                            <p className="text-xs text-orange-600 font-bold mt-0.5">
                              {currentUser.phone || '+92 300 1234567'}
                            </p>
                          </div>
                        </div>

                        {/* Order History */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-extrabold text-sm text-slate-900">Recent Orders ({orders.length})</h4>
                          </div>

                          {orders.length === 0 ? (
                            <div className="bg-white rounded-3xl p-6 text-center border border-slate-200">
                              <p className="text-xs text-slate-500">No previous orders yet.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {orders.map(ord => (
                                <div
                                  key={ord.id}
                                  className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2.5"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h5 className="font-black text-xs text-slate-900">{ord.restaurantName}</h5>
                                      <span className="text-[10px] text-slate-400">#{ord.id}</span>
                                    </div>
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full uppercase">
                                      {ord.status}
                                    </span>
                                  </div>

                                  <div className="text-xs text-slate-600 space-y-1">
                                    {ord.items.map((i, idx) => (
                                      <div key={idx} className="flex justify-between text-[11px]">
                                        <span>{i.quantity}x {i.name}</span>
                                        <span className="font-medium">${i.totalItemPrice.toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="h-px bg-slate-100" />

                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 truncate max-w-[200px] text-[11px]">
                                      📍 {ord.deliveryAddress}
                                    </span>
                                    <span className="font-black text-orange-600 text-sm">
                                      ${ord.total.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-20 bg-white rounded-3xl p-6 border border-slate-200">
                        <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-extrabold text-base text-slate-900">Sign in to DineEase</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                          Access your saved bookings, order receipts, and delivery addresses.
                        </p>
                        <div className="mt-5 flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setAuthMode('login');
                              setAuthModalVisible(true);
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => {
                              setAuthMode('register');
                              setAuthModalVisible(true);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl"
                          >
                            Create Account
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Tab Bar Navigation */}
              <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200/80 px-4 flex items-center justify-around z-20 shadow-lg">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'home' ? 'text-orange-600 font-extrabold' : 'text-slate-400 font-medium'
                  }`}
                >
                  <Utensils className="w-5 h-5" />
                  <span className="text-[10px]">Home</span>
                </button>

                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'search' ? 'text-orange-600 font-extrabold' : 'text-slate-400 font-medium'
                  }`}
                >
                  <Search className="w-5 h-5" />
                  <span className="text-[10px]">Search</span>
                </button>

                <button
                  onClick={() => setActiveTab('cart')}
                  className={`flex flex-col items-center gap-1 transition-all relative ${
                    activeTab === 'cart' ? 'text-orange-600 font-extrabold' : 'text-slate-400 font-medium'
                  }`}
                >
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-orange-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px]">Cart</span>
                </button>

                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'bookings' ? 'text-orange-600 font-extrabold' : 'text-slate-400 font-medium'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="text-[10px]">Bookings</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    activeTab === 'profile' ? 'text-orange-600 font-extrabold' : 'text-slate-400 font-medium'
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="text-[10px]">Profile</span>
                </button>
              </nav>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: RESTAURANT DETAIL & FULL MENU */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header Image */}
            <div className="relative h-48 bg-slate-900 shrink-0">
              <img
                src={selectedRestaurant.imageUrl}
                alt={selectedRestaurant.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center shadow-md hover:bg-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 right-4 bg-black/80 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{selectedRestaurant.rating} ({selectedRestaurant.reviewsCount})</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedRestaurant.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedRestaurant.description}</p>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 flex-wrap">
                  <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md font-bold">
                    {selectedRestaurant.cuisine}
                  </span>
                  <span>•</span>
                  <span>{selectedRestaurant.priceRange}</span>
                  <span>•</span>
                  <span>Open: {selectedRestaurant.openingHours}</span>
                </div>
              </div>

              {/* Action: Book Table */}
              <button
                onClick={() => {
                  setBookingModal({ visible: true, restaurant: selectedRestaurant });
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                <Calendar className="w-4 h-4 text-orange-400" />
                <span>Reserve a Table at {selectedRestaurant.name}</span>
              </button>

              {/* Menu List */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-extrabold text-sm text-slate-900">Restaurant Menu</h4>
                {menuItems.filter(i => i.restaurantId === selectedRestaurant.id).map(dish => {
                  const inCart = cartItems.find(c => c.item.id === dish.id)?.quantity || 0;
                  return (
                    <div
                      key={dish.id}
                      className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 hover:border-orange-300 transition-colors"
                    >
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${dish.isVegetarian ? 'bg-green-600' : 'bg-red-600'}`} />
                          <h5 className="font-bold text-xs text-slate-900 truncate">{dish.name}</h5>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{dish.description}</p>
                        <span className="text-xs font-black text-orange-600 mt-1 block">
                          ${dish.price.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(dish, selectedRestaurant, 1)}
                        className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {inCart > 0 ? `(${inCart})` : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TABLE RESERVATION */}
      {bookingModal.visible && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-base text-slate-900">Table Reservation</h3>
              </div>
              <button
                onClick={() => {
                  setBookingModal({ visible: false });
                  setBookingSuccessId(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccessId ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-lg text-slate-900">Reservation Confirmed!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your table at <strong>{bookingModal.restaurant?.name}</strong> has been saved.
                </p>
                <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-700 space-y-1">
                  <p><strong>Reservation ID:</strong> #{bookingSuccessId}</p>
                  <p><strong>Date & Time:</strong> {bookingDate} at {bookingTime}</p>
                  <p><strong>Party Size:</strong> {bookingGuests} Guests</p>
                </div>
                <button
                  onClick={() => {
                    setBookingModal({ visible: false });
                    setBookingSuccessId(null);
                    setActiveTab('bookings');
                  }}
                  className="w-full bg-orange-600 text-white font-bold text-xs py-3 rounded-xl shadow-md"
                >
                  View in My Bookings
                </button>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-1">
                <p className="text-xs text-slate-500">
                  Reserving table at <strong className="text-slate-900">{bookingModal.restaurant?.name}</strong>
                </p>

                {/* Date Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>

                {/* Time Slot Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['01:00 PM', '02:30 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'].map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingTime(slot)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          bookingTime === slot
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guest Counter */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Party Size (Guests)</label>
                  <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setBookingGuests(Math.max(1, bookingGuests - 1))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-sm text-slate-900">{bookingGuests} Guests</span>
                    <button
                      type="button"
                      onClick={() => setBookingGuests(Math.min(20, bookingGuests + 1))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact Name & Phone */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="Guest Name"
                    className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Special Request (Optional)</label>
                  <input
                    type="text"
                    value={bookingSpecial}
                    onChange={(e) => setBookingSpecial(e.target.value)}
                    placeholder="Window booth, celebration..."
                    className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleConfirmReservation}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-colors"
                >
                  Confirm Table Reservation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CHECKOUT & DELIVERY */}
      {checkoutModalVisible && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">Checkout & Delivery</h3>
              <button onClick={() => setCheckoutModalVisible(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {confirmedOrder ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-lg text-slate-900">Order Placed!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your meal is being prepared by <strong>{confirmedOrder.restaurantName}</strong>.
                </p>
                <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-700 space-y-1 text-left">
                  <p><strong>Order ID:</strong> #{confirmedOrder.id}</p>
                  <p><strong>Total Bill:</strong> ${confirmedOrder.total.toFixed(2)} (Cash on Delivery)</p>
                  <p><strong>Delivering to:</strong> {confirmedOrder.deliveryAddress}</p>
                </div>
                <button
                  onClick={() => {
                    setConfirmedOrder(null);
                    setCheckoutModalVisible(false);
                    setActiveTab('profile');
                  }}
                  className="w-full bg-orange-600 text-white font-bold text-xs py-3 rounded-xl shadow-md"
                >
                  View in Order History
                </button>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Delivery Address</label>
                  <textarea
                    rows={2}
                    value={checkoutAddress}
                    onChange={(e) => setCheckoutAddress(e.target.value)}
                    className="w-full bg-slate-100 rounded-xl p-2.5 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Order Notes (Optional)</label>
                  <input
                    type="text"
                    value={checkoutNotes}
                    onChange={(e) => setCheckoutNotes(e.target.value)}
                    placeholder="e.g. Ring bell, extra spicy"
                    className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>

                <div className="bg-orange-50 border border-orange-200 p-3 rounded-2xl flex items-center justify-between text-xs">
                  <span className="font-bold text-orange-950">Payment Method:</span>
                  <span className="font-extrabold text-orange-600">Cash on Delivery (Demo)</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Final Amount</span>
                    <span className="text-orange-600">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSubmittingOrder}
                  onClick={handlePlaceOrder}
                  className="w-full bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-black text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingOrder ? 'Placing Order...' : `Confirm & Place Order ($${cartTotal.toFixed(2)})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: SINGLE-RESTAURANT CART CONFLICT */}
      {conflictModal.visible && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h4 className="font-black text-base text-slate-900">Replace Cart Items?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your cart currently contains dishes from <strong>{cartRestaurant?.name}</strong>. Adding this item will start a fresh order from <strong>{conflictModal.pendingRestaurant?.name}</strong>.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConflictModal({ visible: false })}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Keep Current
              </button>
              <button
                onClick={confirmReplaceCart}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm"
              >
                Start New Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: USER AUTHENTICATION */}
      {authModalVisible && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {authMode === 'login' ? 'Sign In to DineEase' : 'Create Account'}
              </h3>
              <button onClick={() => setAuthModalVisible(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-xl border border-red-200">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="e.g. Atif Khan"
                    className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="atif@example.com"
                  className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-colors"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <div className="text-center pt-2 text-xs text-slate-500">
                {authMode === 'login' ? (
                  <span>
                    New here?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-orange-600 font-bold hover:underline"
                    >
                      Create account
                    </button>
                  </span>
                ) : (
                  <span>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-orange-600 font-bold hover:underline"
                    >
                      Sign In
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
