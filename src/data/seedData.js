/**
 * DineEase Realistic Seed Data
 * Cuisines: Pakistani, Chinese, Italian, Fast Food, BBQ
 */

export const INITIAL_RESTAURANTS = [
  {
    id: 'rest_lalqila',
    name: 'LalQila Traditional Feast',
    description: 'Authentic Mughlai & Pakistani heritage cuisine, charcoal seekh kababs, handi curries, and fragrant biryanis.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    cuisine: 'Pakistani',
    cuisineTags: ['Pakistani', 'BBQ'],
    rating: 4.8,
    reviewsCount: 324,
    priceRange: '$$',
    deliveryTime: '25-40 min',
    deliveryFee: 2.50,
    address: '14 Shahrah-e-Faisal, Clifton, Karachi',
    phone: '+92 21 3438 8366',
    openingHours: '12:00 PM - 11:30 PM',
    hasVegetarianOptions: true,
    isActive: true,
    availableSlots: ['12:30 PM', '01:30 PM', '07:00 PM', '08:30 PM', '09:30 PM']
  },
  {
    id: 'rest_dynasty',
    name: 'Dynasty Imperial Wok',
    description: 'Authentic Cantonese & Sichuan flavors, handcrafted dumplings, sizzling beef, and wok-tossed chow mein.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
    cuisine: 'Chinese',
    cuisineTags: ['Chinese', 'Fast Food'],
    rating: 4.7,
    reviewsCount: 218,
    priceRange: '$$',
    deliveryTime: '30-45 min',
    deliveryFee: 3.00,
    address: '45 Pearl Boulevard, Gulberg III, Lahore',
    phone: '+92 42 3575 1290',
    openingHours: '01:00 PM - 11:00 PM',
    hasVegetarianOptions: true,
    isActive: true,
    availableSlots: ['01:00 PM', '02:30 PM', '07:30 PM', '09:00 PM']
  },
  {
    id: 'rest_bellaroma',
    name: 'Bella Roma Trattoria',
    description: 'Classic artisanal Italian wood-fired Neapolitan pizzas, handmade ribbons of tagliatelle, and creamy tiramisu.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    cuisine: 'Italian',
    cuisineTags: ['Italian'],
    rating: 4.9,
    reviewsCount: 412,
    priceRange: '$$$',
    deliveryTime: '35-50 min',
    deliveryFee: 4.00,
    address: '22 Marina Promenade, F-7/2, Islamabad',
    phone: '+92 51 265 4488',
    openingHours: '12:30 PM - 10:30 PM',
    hasVegetarianOptions: true,
    isActive: true,
    availableSlots: ['01:00 PM', '02:00 PM', '06:30 PM', '08:00 PM', '09:30 PM']
  },
  {
    id: 'rest_urbanburger',
    name: 'Urban Smash & Fries',
    description: 'Juicy double-smashed certified Angus patties, melted cheddar, brioche buns, and parmesan truffle fries.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
    cuisine: 'Fast Food',
    cuisineTags: ['Fast Food'],
    rating: 4.6,
    reviewsCount: 540,
    priceRange: '$',
    deliveryTime: '15-30 min',
    deliveryFee: 1.50,
    address: '8 Commercial Market, DHA Phase 5, Karachi',
    phone: '+92 21 3584 7120',
    openingHours: '11:00 AM - 01:00 AM',
    hasVegetarianOptions: true,
    isActive: true,
    availableSlots: ['01:00 PM', '03:00 PM', '07:00 PM', '08:30 PM', '10:00 PM']
  },
  {
    id: 'rest_kolachi',
    name: 'Kolachi Waterfront Grill',
    description: 'Iconic seaside charcoal grill, juicy Reshmi kababs, Dum Pukht mutton ribs, and sizzling hot plates under the night sky.',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80',
    cuisine: 'BBQ',
    cuisineTags: ['BBQ', 'Pakistani'],
    rating: 4.9,
    reviewsCount: 680,
    priceRange: '$$$',
    deliveryTime: '40-55 min',
    deliveryFee: 3.50,
    address: 'Beach Avenue, Do Darya, Phase 8, Karachi',
    phone: '+92 21 3606 9642',
    openingHours: '06:00 PM - 12:30 AM',
    hasVegetarianOptions: false,
    isActive: true,
    availableSlots: ['06:30 PM', '08:00 PM', '09:30 PM', '11:00 PM']
  },
  {
    id: 'rest_greenlotus',
    name: 'Green Lotus Fresh Bowls',
    description: '100% wholesome vegetarian and plant-rich nourish bowls, rainbow salads, and cold-pressed elixirs.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
    cuisine: 'Italian',
    cuisineTags: ['Italian', 'Fast Food'],
    rating: 4.5,
    reviewsCount: 195,
    priceRange: '$$',
    deliveryTime: '20-35 min',
    deliveryFee: 2.00,
    address: '17 Blue Area, Jinnah Avenue, Islamabad',
    phone: '+92 51 280 1199',
    openingHours: '10:00 AM - 09:30 PM',
    hasVegetarianOptions: true,
    isActive: true,
    availableSlots: ['11:30 AM', '01:00 PM', '03:00 PM', '06:30 PM', '08:00 PM']
  }
];

export const INITIAL_MENU_ITEMS = [
  // LalQila items
  {
    id: 'menu_lq_1',
    restaurantId: 'rest_lalqila',
    name: 'Mughlai Mutton Biryani',
    description: 'Long-grain aged basmati rice cooked on slow flame with tender mutton shanks and whole aromatics.',
    price: 11.50,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    category: 'Mains',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true
  },
  {
    id: 'menu_lq_2',
    restaurantId: 'rest_lalqila',
    name: 'Reshmi Malai Boti',
    description: 'Boneless chicken cubes marinated in heavy cream, green chillies, and grilled to melt-in-mouth perfection.',
    price: 9.80,
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    category: 'BBQ Specialties',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true
  },
  {
    id: 'menu_lq_3',
    restaurantId: 'rest_lalqila',
    name: 'Paneer Makhani Handi',
    description: 'Fresh cottage cheese cubes simmered in a velvet tomato cream sauce laced with fenugreek leaves.',
    price: 8.20,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    category: 'Vegetarian',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'menu_lq_4',
    restaurantId: 'rest_lalqila',
    name: 'Garlic Butter Roghni Naan',
    description: 'Tandoor-baked flaky leavened bread brushed with farm butter and toasted sesame.',
    price: 2.00,
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
    category: 'Breads & Sides',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'menu_lq_5',
    restaurantId: 'rest_lalqila',
    name: 'Shahi Kheer Brulee',
    description: 'Slow-simmered rice pudding with crushed pistachios, saffron threads, and edible silver foil.',
    price: 4.50,
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    category: 'Desserts',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false
  },

  // Dynasty items
  {
    id: 'menu_dyn_1',
    restaurantId: 'rest_dynasty',
    name: 'Steamed Prawn & Chicken Dim Sum',
    description: 'Translucent crystal wrappers filled with tiger prawns, ginger, and scallions served with chili crunch.',
    price: 7.90,
    imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
    category: 'Starters',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true
  },
  {
    id: 'menu_dyn_2',
    restaurantId: 'rest_dynasty',
    name: 'Crispy Szechuan Beef',
    description: 'Thin shredded flank steak tossed in sweet and tangy spicy chili reduction with bell peppers.',
    price: 10.90,
    imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
    category: 'Mains',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true
  },
  {
    id: 'menu_dyn_3',
    restaurantId: 'rest_dynasty',
    name: 'Tofu & Edamame Lo Mein',
    description: 'Wok-charred egg noodles with golden tofu, bok choy, snap peas, and dark soy garlic glaze.',
    price: 8.50,
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    category: 'Vegetarian',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'menu_dyn_4',
    restaurantId: 'rest_dynasty',
    name: 'Jasmine Green Tea with Lotus',
    description: 'Premium loose-leaf blossom tea steeped with honey and calming citrus.',
    price: 3.00,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    category: 'Beverages',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false
  },

  // Bella Roma items
  {
    id: 'menu_br_1',
    restaurantId: 'rest_bellaroma',
    name: 'Margherita Burrata D.O.P.',
    description: 'San Marzano tomato base, fresh basil, extra virgin olive oil, and a crown of creamy molten burrata.',
    price: 12.00,
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    category: 'Woodfired Pizza',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true
  },
  {
    id: 'menu_br_2',
    restaurantId: 'rest_bellaroma',
    name: 'Truffle Mushroom Tagliatelle',
    description: 'Fresh egg pasta tossed with wild porcini mushrooms, parmesan cream, and black truffle oil.',
    price: 13.50,
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d62810a9?auto=format&fit=crop&w=800&q=80',
    category: 'Pasta',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true
  },
  {
    id: 'menu_br_3',
    restaurantId: 'rest_bellaroma',
    name: 'Pollo Alla Parmigiana',
    description: 'Crispy breaded chicken breast topped with rich pomodoro sauce and melted mozzarella fior di latte.',
    price: 12.80,
    imageUrl: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=800&q=80',
    category: 'Mains',
    isVegetarian: false,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'menu_br_4',
    restaurantId: 'rest_bellaroma',
    name: 'Espresso Classic Tiramisu',
    description: 'Savoiardi ladyfingers soaked in espresso, whipped mascarpone cream, and dark cocoa powder.',
    price: 5.50,
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    category: 'Desserts',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false
  },

  // Urban Burger items
  {
    id: 'menu_ub_1',
    restaurantId: 'rest_urbanburger',
    name: 'Double Truffle Smash Burger',
    description: 'Two smashed beef patties, truffle aioli, Swiss cheese, caramelized onions on buttered brioche.',
    price: 8.90,
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    category: 'Burgers',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true
  },
  {
    id: 'menu_ub_2',
    restaurantId: 'rest_urbanburger',
    name: 'Nashville Hot Crispy Chicken',
    description: 'Buttermilk fried chicken breast dipped in cayenne oil, house pickles, and creamy coleslaw.',
    price: 7.80,
    imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
    category: 'Burgers',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true
  },
  {
    id: 'menu_ub_3',
    restaurantId: 'rest_urbanburger',
    name: 'Crispy Halloumi & Avocado Burger',
    description: 'Golden grilled halloumi cheese block, sliced avocado, chili jam, and crisp rocket leaves.',
    price: 7.20,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    category: 'Vegetarian',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false
  },
  {
    id: 'menu_ub_4',
    restaurantId: 'rest_urbanburger',
    name: 'Parmesan Loaded Truffle Fries',
    description: 'Hand-cut russet potato fries drizzled with white truffle oil, rosemary, and aged pecorino.',
    price: 4.20,
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    category: 'Sides',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true
  },

  // Kolachi items
  {
    id: 'menu_kol_1',
    restaurantId: 'rest_kolachi',
    name: 'Kolachi Special Shinwari Karahi',
    description: 'Tender mutton cooked in pure animal fat with tomatoes, green chillies, and freshly cracked black pepper.',
    price: 14.50,
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    category: 'Karahi & Handi',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true
  },
  {
    id: 'menu_kol_2',
    restaurantId: 'rest_kolachi',
    name: 'Smoked Beef Bihari Kabab',
    description: 'Wafer-thin beef slices tenderized with raw papaya and pan-fried with mustard oil on hot coals.',
    price: 10.50,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    category: 'BBQ Specialties',
    isVegetarian: false,
    isAvailable: true,
    isPopular: true
  },

  // Green Lotus items
  {
    id: 'menu_gl_1',
    restaurantId: 'rest_greenlotus',
    name: 'Mediterranean Quinoa Harvest Bowl',
    description: 'Herbed quinoa, kalamata olives, cherry tomatoes, creamy hummus, grilled zucchini, and lemon tahini.',
    price: 8.80,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    category: 'Bowls',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true
  },
  {
    id: 'menu_gl_2',
    restaurantId: 'rest_greenlotus',
    name: 'Immunity Cold-Pressed Citrus Splash',
    description: 'Fresh squeezed valencia oranges, ginger root, turmeric, and crisp organic apple.',
    price: 3.80,
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    category: 'Beverages',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false
  }
];

export const CUISINE_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'Utensils' },
  { id: 'Pakistani', label: 'Pakistani', icon: 'Flame' },
  { id: 'Chinese', label: 'Chinese', icon: 'Soup' },
  { id: 'Italian', label: 'Italian', icon: 'Pizza' },
  { id: 'Fast Food', label: 'Fast Food', icon: 'Sandwich' },
  { id: 'BBQ', label: 'BBQ', icon: 'Drumstick' },
];
