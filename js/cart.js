// Paste each numbered block only inside its matching START / END area.
// JS-01 START: Imports and starting variables
import { menu } from "./assets/js/data.js";
import { cartLines, totals, quantity } from "./assets/js/store.js";
import { money, photo, card, icon, empty } from "./assets/js/shared.js";
// JS-01 END
// JS-02 START: createCartRow
function createCartRow(entry) {
    const linePrice = entry.price * entry.quantity;
    let disabled = "";
    if (entry.quantity >= 99) {
      disabled = "disabled";
    }
     // HTML: one repeated cart row. data-value is the next quantity.
  return `
  <div class="cart-row">
    ${photo(entry, "cart-thumb")}
    <div class="cart-item-info">
      <h2>${entry.name}</h2><span>${money(entry.price)} each</span>
    </div>
    <div class="quantity-control">
      <button data-qty="${entry.id}" data-value="${entry.quantity - 1}"
        aria-label="Decrease ${entry.name} quantity">−</button>
      <span>${entry.quantity}</span>
      <button data-qty="${entry.id}" data-value="${entry.quantity + 1}"
        aria-label="Increase ${entry.name} quantity" ${disabled}>+</button>
    </div>
    <strong>${money(linePrice)}</strong>
    <button class="icon-button remove-button" data-qty="${entry.id}"
      data-value="0" aria-label="Remove ${entry.name}">
      ${icon("trash")}
      </button>
      </div>
     `;
}
// JS-02 END
// JS-03 START: showCartRows
function showCartRows(entries) {
    let html = "";
    let itemCount = 0;
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      html = html + createCartRow(entry);
      itemCount = itemCount + entry.quantity;
    }
    document.getElementById("cart-rows").innerHTML = html;
    document.getElementById("cart-item-count").textContent =
      itemCount + " items in your bag";
  }
// JS-03 END
// JS-04 START: showCartTotals
function showCartTotals() {
    const prices = totals();
    document.getElementById("cart-subtotal").textContent = money(
      prices.subtotal,
    );
    document.getElementById("cart-delivery").textContent = money(
      prices.delivery,
    );
    document.getElementById("cart-total").textContent = money(prices.total);
  }
// JS-04 END
// JS-05 START: showRecommendations
function showRecommendations() {
    const ids = ["food-18", "food-20", "drink-01", "drink-07"];
    let html = "";
    for (let index = 0; index < menu.length; index++) {
      const product = menu[index];
      if (ids.indexOf(product.id) !== -1) {
        // HTML: one recommendation column.
        html = html + `<div class="col-sm-6 col-lg-3">${card(product)}</div>`;
      }
    }
    document.getElementById("cart-recommendations").innerHTML = html;
  }
// JS-05 END
// JS-06 START: refreshCart
function refreshCart() {
    const entries = cartLines();
    if (entries.length === 0) {
      document.getElementById("cart-empty").hidden = false;
      document.getElementById("cart-content").hidden = true;
      document.getElementById("cart-empty").innerHTML = empty(
        "Your next great meal is waiting.",
        "Your cart is empty. Let us find you something delicious.",
      );
    } else {
      document.getElementById("cart-empty").hidden = true;
      document.getElementById("cart-content").hidden = false;
      showCartRows(entries);
      showCartTotals();
      showRecommendations();
    }
  }
// JS-06 END
// JS-07 START: handleQuantityClick
function handleQuantityClick(event) {
    const button = event.target.closest("[data-qty]");
    if (button !== null) {
      const productId = button.dataset.qty;
      const nextQuantity = Number(button.dataset.value);
      quantity(productId, nextQuantity);
    }
  }
// JS-07 END
// JS-08 START: Connect events and start the page
document.addEventListener("click", handleQuantityClick);
window.addEventListener("kitchen:change", refreshCart);
window.addEventListener("kitchen:external", refreshCart);
refreshCart();
// JS-08 END