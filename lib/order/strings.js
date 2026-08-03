/**
 * User-facing copy for the ordering app.
 *
 * Taken from the phone app's own strings file
 * (Satwik_Farms_React/src/constants/strings.ts) so the two read identically.
 * Add to this file rather than writing copy inline — inventing wording here is
 * how the web app ends up promising something the business does not do.
 */
export const S = {
  APP_NAME: 'Satwik Farms',
  TAGLINE: 'Fresh from farm to your doorstep',
  LOCATION: 'Dar es Salaam, Tanzania',

  // Cart
  CART_TITLE: 'My Cart',
  CART_EMPTY_TITLE: 'Your cart is empty',
  CART_EMPTY_SUBTITLE: 'Browse our products and add items to your cart',
  CART_EMPTY_ACTION: 'Browse Products',
  CART_SUBTOTAL: 'Subtotal',
  CART_DELIVERY_FEE: 'Delivery Fee',
  CART_TOTAL: 'Total',
  CART_DELIVERY_FREE: 'Free',
  CART_CHECKOUT_BUTTON: 'Proceed to Checkout',

  // Checkout
  CHECKOUT_TITLE: 'Checkout',
  CHECKOUT_PAYMENT_METHOD_LABEL: 'Payment Method',
  CHECKOUT_PAYMENT_CASH: 'Cash on Delivery',
  CHECKOUT_PAYMENT_MOBILE: 'Mobile Payment',
  CHECKOUT_PAYMENT_MOBILE_DETAIL: 'M-Pesa, Tigo Pesa, Airtel Money',
  CHECKOUT_PAYMENT_NOTE: 'Payment is collected upon delivery.',
  CHECKOUT_NOTES_LABEL: 'Order Notes (optional)',
  CHECKOUT_NOTES_PLACEHOLDER: 'Any special instructions for your order',
  CHECKOUT_PLACE_ORDER: 'Place Order',
  CHECKOUT_PROCESSING: 'Placing your order...',

  // Orders
  ORDER_CONFIRMED_TITLE: 'Order Confirmed!',
  ORDER_CONFIRMED_MESSAGE: 'Your order has been placed successfully.',
  ORDER_PENDING: 'Your order is being processed.',
  ORDER_HISTORY_TITLE: 'Order History',
  ORDER_HISTORY_EMPTY: 'You have no past orders.',
  ORDER_DETAIL_TITLE: 'Order Details',
  ORDER_ID_LABEL: 'Order ID',
  ORDER_DATE_LABEL: 'Date',
  ORDER_ITEMS_LABEL: 'Order Items',
  ORDER_STATUS: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  },

  // Categories
  CATEGORIES_TITLE: 'Categories',
  CATEGORIES_EMPTY: 'No categories available.',

  // Search
  SEARCH_PLACEHOLDER: 'Search products...',
  SEARCH_EMPTY_TITLE: 'No results found',
  SEARCH_EMPTY_SUBTITLE: 'Try a different search term or browse our categories.',

  // Favourites — the phone app labels this tab "Favorites"
  FAVORITES_TITLE: 'Favorites',
  FAVORITES_EMPTY_TITLE: 'No favourites yet',
  FAVORITES_EMPTY_SUBTITLE: 'Tap the heart on a product to save it here.',

  // Account
  ACCOUNT_TITLE: 'Account',
  ACCOUNT_GUEST: 'Guest',
  ACCOUNT_GUEST_SUBTITLE: 'Add your details to speed up checkout',

  // Address
  ADDRESS_TITLE: 'Delivery Address',
  ADDRESS_SAVED: 'Your details have been saved.',

  // Help
  HELP_TITLE: 'Help',
  HELP_HOW_TO_ORDER_TITLE: 'How to Order',
  HELP_HOW_TO_ORDER_STEPS: [
    'Browse products by category or search for specific items.',
    'Tap on a product to see details, then add it to your cart.',
    'Go to your cart to review items and adjust quantities.',
    'Proceed to checkout, enter your delivery details, and place your order.',
    'Your order will be confirmed by our team.',
  ],
  HELP_CONTACT_TITLE: 'Contact Us',
  HELP_CONTACT_PHONE: '+255 767 211 422',
  HELP_CONTACT_PHONE_HREF: '+255767211422',
  HELP_CONTACT_WHATSAPP: 'Chat with us on WhatsApp',
  HELP_CONTACT_WHATSAPP_HREF: 'https://wa.me/255767211422',
  HELP_CONTACT_EMAIL: 'support@satwikfarms.com',

  // About
  ABOUT_TITLE: 'About Satwik Farms',
  ABOUT_TAGLINE: 'Fresh, organic produce delivered to your doorstep in Dar es Salaam.',
  ABOUT_HOURS_TITLE: 'Business Hours',
  ABOUT_HOURS_WEEKDAY: 'Monday - Saturday: 8:00 AM - 6:00 PM',
  ABOUT_HOURS_WEEKEND: 'Sunday: 9:00 AM - 2:00 PM',

  // FAQ (payment answer is the source of truth for the checkout payment block)
  FAQ_DELIVERY:
    'We deliver within Dar es Salaam. Orders placed before 2 PM are typically '
    + 'delivered the same day. Orders placed after 2 PM are delivered the next day.',

  // Empty / error
  EMPTY_STATE_TITLE: 'Nothing here yet',
  ERROR_LOAD_TITLE: 'We couldn’t load the shop',
  ERROR_LOAD_SUBTITLE: 'Please check your connection and try again.',
  ERROR_RETRY: 'Try again',
};

export default S;
