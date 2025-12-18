/**
 * Fake Order Generator
 * Generates realistic-looking fake orders for demo purposes
 */

const FIRST_NAMES = [
  "John", "Sarah", "Michael", "Emma", "David", "Olivia", "James", "Sophia",
  "Robert", "Isabella", "William", "Mia", "Richard", "Charlotte", "Joseph", "Amelia",
  "Thomas", "Harper", "Christopher", "Evelyn", "Daniel", "Abigail", "Matthew", "Emily",
  "Anthony", "Elizabeth", "Mark", "Sofia", "Donald", "Avery", "Steven", "Ella"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Walker", "Hall", "Allen",
  "Young", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"
];

const CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
  "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
  "Seattle", "Denver", "Boston", "Portland", "Las Vegas", "Miami", "Atlanta",
  "San Francisco", "London", "Paris", "Tokyo", "Sydney", "Toronto", "Berlin",
  "Moscow", "Madrid", "Rome", "Amsterdam", "Barcelona", "Vienna"
];

const PRODUCT_NAMES = [
  "Premium Wireless Headphones",
  "Organic Cotton T-Shirt",
  "Smart Watch Pro",
  "Leather Backpack",
  "Running Shoes Elite",
  "Stainless Steel Water Bottle",
  "Yoga Mat Premium",
  "Wireless Keyboard",
  "Coffee Maker Deluxe",
  "Sunglasses Classic",
  "Phone Case Designer",
  "Laptop Stand Ergonomic",
  "Bluetooth Speaker Portable",
  "Fitness Tracker Band",
  "Desk Lamp LED",
  "Travel Mug Insulated",
  "Gaming Mouse RGB",
  "Notebook Set Premium",
  "Portable Charger Fast",
  "Camera Tripod Professional"
];

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max with 2 decimal places
 */
function randomPrice(min: number, max: number): string {
  const price = Math.random() * (max - min) + min;
  return price.toFixed(2);
}

/**
 * Pick a random element from an array
 */
function randomPick<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Generate a random customer name in format "FirstName L."
 */
function generateCustomerName(): string {
  const firstName = randomPick(FIRST_NAMES);
  const lastName = randomPick(LAST_NAMES);
  
  // Format: "Anna J." (FirstName + LastName initial)
  return `${firstName} ${lastName.charAt(0)}.`;
}

/**
 * Generate a random order number
 */
function generateOrderNumber(): string {
  return `#${randomInt(1000, 9999)}`;
}

/**
 * Generate a price from real product combinations
 * Example: products [$15, $30] -> possible totals: $15, $30, $45, $60
 */
export function generateRealProductPrice(productPrices: number[]): number {
  if (productPrices.length === 0) {
    // Fallback to random if no products
    return parseFloat(randomPrice(20, 150));
  }

  // Generate random quantity for each product (0-3 items)
  let total = 0;
  let itemCount = 0;
  const maxItems = 3; // Maximum items in order
  
  // Pick 1-3 random products
  const numProducts = randomInt(1, Math.min(productPrices.length, maxItems));
  
  for (let i = 0; i < numProducts; i++) {
    const price = randomPick(productPrices);
    const quantity = randomInt(1, 2); // 1 or 2 items of each product
    total += price * quantity;
    itemCount += quantity;
  }
  
  return parseFloat(total.toFixed(2));
}

/**
 * Generate a fake order
 */
export function generateFakeOrder(
  priceMin: number, 
  priceMax: number, 
  shop: string,
  priceMode: 'random' | 'real_products' = 'random',
  realProductPrices: number[] = []
) {
  const customerName = generateCustomerName();
  const orderNumber = generateOrderNumber();
  
  // Generate price based on mode
  let totalPrice: string;
  if (priceMode === 'real_products' && realProductPrices.length > 0) {
    totalPrice = generateRealProductPrice(realProductPrices).toFixed(2);
  } else {
    totalPrice = randomPrice(priceMin, priceMax);
  }
  
  const productName = randomPick(PRODUCT_NAMES);
  
  // Generate a realistic timestamp (within last 1 hour)
  const minutesAgo = randomInt(1, 60);
  const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000);

  return {
    id: `fake-${Date.now()}-${randomInt(1000, 9999)}`,
    shopifyOrderId: `fake-${Date.now()}-${randomInt(1000, 9999)}`,
    orderNumber,
    shop,
    totalPrice,
    currency: "USD",
    customerName,
    productName, // Custom field for fake orders
    createdAt: createdAt.toISOString(),
  };
}

/**
 * Generate multiple fake orders
 */
export function generateFakeOrders(
  count: number,
  priceMin: number,
  priceMax: number,
  shop: string
) {
  return Array.from({ length: count }, () => 
    generateFakeOrder(priceMin, priceMax, shop)
  );
}

