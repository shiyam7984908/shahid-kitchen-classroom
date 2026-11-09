// Read and update the cart and orders in this browser. No server is used.
// Teacher-supplied shared module. Students use it without editing this file.

import { menu, DELIVERY_FEE } from "./data.js";
// All saved app data is kept under this one browser storage key.
const KEY = "bitehouse-v1";
const empty = () => ({
  cart: [],
  orders: [],
  unavailable: [],
  lastOrder: null,
});
// Parse saved JSON; recover to an empty state if storage is absent or
// damaged.
export function read() {
  try {
    const state = JSON.parse(localStorage.getItem(KEY));
    return state && Array.isArray(state.cart) && Array.isArray(state.orders)
      ? {
          ...empty(),
          ...state,
        }
      : empty();
  } catch {
    return empty();
  }
}
// Save JSON and broadcast a change event to this page.
export function write(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("kitchen:change"));
}
// Find one product by its unique ID.
export function item(id) {
  return menu.find((product) => product.id === id);
}
// Join the saved product IDs and quantities with their product details.
export function cartLines() {
  return read()
    .cart.filter((cartEntry) => item(cartEntry.id))
    .map((cartEntry) => ({
      ...item(cartEntry.id),
      quantity: cartEntry.quantity,
    }));
}
// Calculate subtotal and delivery. Pickup has no delivery charge.
export function totals(type = "delivery") {
  const subtotal = cartLines().reduce(
    (sum, cartEntry) => sum + cartEntry.price * cartEntry.quantity,
    0,
  );
  const delivery = subtotal && type === "delivery" ? DELIVERY_FEE : 0;
  return {
    subtotal,
    delivery,
    total: subtotal + delivery,
  };
}
// Add one available product, or increase its existing quantity up to 99.
export function add(id) {
  const state = read();
  if (!item(id) || state.unavailable.includes(id)) {
    return false;
  }
  const cartEntry = state.cart.find((cartEntry) => cartEntry.id === id);
  if (cartEntry) {
    cartEntry.quantity = Math.min(99, cartEntry.quantity + 1);
  } else {
    state.cart.push({
      id,
      quantity: 1,
    });
  }
  write(state);
  return true;
}
// Set one quantity between 0 and 99. Zero removes the entry.
export function quantity(id, nextQuantity) {
  const state = read();
  state.cart = state.cart
    .map((cartEntry) =>
      cartEntry.id === id
        ? {
            ...cartEntry,
            quantity: Math.min(99, Math.max(0, nextQuantity)),
          }
        : cartEntry,
    )
    .filter((cartEntry) => cartEntry.quantity > 0);
  write(state);
}
// Validate the cart, snapshot product details, save the order and empty the
// cart.
export function placeOrder(customer, fulfillmentType, notes) {
  const state = read();
  const lines = cartLines();
  if (!lines.length) {
    throw Error("Your cart is empty.");
  }
  if (lines.some((cartEntry) => state.unavailable.includes(cartEntry.id))) {
    throw Error("An item is unavailable. Please update your cart.");
  }
  const order = {
    id: "BH-" + Date.now().toString(36).toUpperCase(),
    customer,
    fulfillmentType,
    notes,
    items: lines.map((cartEntry) => ({
      id: cartEntry.id,
      name: cartEntry.name,
      price: cartEntry.price,
      quantity: cartEntry.quantity,
    })),
    ...totals(fulfillmentType),
    status: "pending",
    createdAt: new Date().toISOString(),
    paymentMethod:
      fulfillmentType === "pickup" ? "Cash on pickup" : "Cash on delivery",
  };
  state.orders.unshift(order);
  state.lastOrder = order.id;
  state.cart = [];
  write(state);
  return order;
}
// Find an order by ID, replace its status and save.
export function setStatus(id, status) {
  const state = read();
  const order = state.orders.find((order) => order.id === id);
  if (order) {
    order.status = status;
  }
  write(state);
}
// Toggle a product ID in the sold-out list and save.
export function toggleAvailability(id) {
  const state = read();
  state.unavailable = state.unavailable.includes(id)
    ? state.unavailable.filter((productId) => productId !== id)
    : [...state.unavailable, id];
  write(state);
}
// Add marked sample orders once for dashboard practice.
export function seedOrders() {
  const state = read();
  if (state.orders.some((order) => order.demo)) {
    return;
  }
  const samples = [
    ["Aishath Rana", "preparing", 0],
    ["Ahmed Ali", "pending", 3],
    ["Fathimath Noor", "out-for-delivery", 10],
    ["Hassan Adam", "completed", 12],
  ];
  samples.forEach(([name, status, index], i) => {
    const product = menu[index];
    state.orders.push({
      id: "DEMO-" + (1042 - i),
      customer: {
        name,
        phone: "7700000",
        address: "Demo address, Malé",
      },
      fulfillmentType: "delivery",
      notes: "Sample order for team practice.",
      items: [
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ],
      subtotal: product.price,
      delivery: DELIVERY_FEE,
      total: product.price + DELIVERY_FEE,
      status,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      paymentMethod: "Cash on delivery",
      demo: true,
    });
  });
  write(state);
}
// Remove only sample orders, preserving customer practice orders.
export function clearDemo() {
  const state = read();
  state.orders = state.orders.filter((order) => !order.demo);
  write(state);
}
