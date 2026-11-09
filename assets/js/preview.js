// Teacher-supplied sample data for an individual student's live preview.
// It runs only when the page address contains ?practice=1.
import { menu, DELIVERY_FEE } from "./data.js";
import { read, write, seedOrders } from "./store.js";

function createPracticeOrder(id, fulfillmentType, status) {
  const product = menu[0];
  const delivery = fulfillmentType === "delivery" ? DELIVERY_FEE : 0;

  return {
    id,
    customer: {
      name: "Practice Customer",
      phone: "7701234",
      address: fulfillmentType === "delivery" ? "Practice House, Male" : "",
    },
    fulfillmentType,
    notes: "Sample data for your coding lesson.",
    items: [
      {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      },
    ],
    subtotal: product.price,
    delivery,
    total: product.price + delivery,
    status,
    createdAt: new Date().toISOString(),
    paymentMethod:
      fulfillmentType === "pickup" ? "Cash on pickup" : "Cash on delivery",
    classroom: true,
  };
}

export function preparePracticeData() {
  const parameters = new URLSearchParams(location.search);
  if (parameters.get("practice") !== "1") return;

  // Seed once per page in this tab, so refreshing does not undo student tests.
  const page = document.body.dataset.page;
  const flag = "bitehouse-practice-initialized-" + page;
  if (sessionStorage.getItem(flag)) return;

  const state = read();
  let changed = false;

  if (["cart", "checkout"].includes(page) && state.cart.length === 0) {
    state.cart = [
      { id: "food-01", quantity: 1 },
      { id: "drink-01", quantity: 1 },
    ];
    changed = true;
  }

  if (page === "orders" && !state.orders.some((order) => !order.demo)) {
    state.orders.unshift(
      createPracticeOrder("PRACTICE-DELIVERY", "delivery", "preparing"),
      createPracticeOrder("PRACTICE-PICKUP", "pickup", "ready"),
    );
    changed = true;
  }

  if (changed) write(state);
  if (page === "admin") seedOrders();
  sessionStorage.setItem(flag, "1");
}
