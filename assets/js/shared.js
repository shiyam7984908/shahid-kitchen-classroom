// Provide reusable navigation, pictures, cards and small display helpers.
// Teacher-supplied shared module. Students use it without editing this file.

import { read, add, item } from "./store.js";
import { preparePracticeData } from "./preview.js";
export const money = (amount) =>
  "MVR " + Number(amount).toLocaleString("en-US");
export const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
const icons = {
  bag: '<path d="M6 7h12l2 14H4L6 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  chef: '<path d="M6 15v5h12v-5M6 15a5 5 0 0 1-1-10 5 5 0 0 1 8-2 5 5 0 0 1 7 7 5 5 0 0 1-2 5H6Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  trash: '<path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
  /* HTML */
  /* HTML */
  truck: `
      <path d="M3 5h12v12H3zm12 4h4l3 5v3h-7" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    `,
  star: '<path d="m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1Z"/>',
};
// Choose an SVG drawing by name and return the icon markup.
export function icon(name, className = "") {
  return /* HTML */ `
    <svg
      class="icon ${className}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      ${icons[name] || icons.bag}
    </svg>
  `;
}
// Locate one product picture within the shared food or drink image grid.
export function photo(product, className = "") {
  const imageIndex = product.imageIndex;
  const row = Math.floor(imageIndex / 4);
  const column = imageIndex % 4;
  const rows = product.type === "food" ? 6 : 4;
  return /* HTML */ `
    <div
      class="food-photo ${product.type}-photo ${className}"
      role="img"
      aria-label="${escape(product.name)}"
      style="background-position:${(column * 100) / 3}% ${(row * 100) / (rows - 1)}%"
    ></div>
  `;
}
// Display one product, including a disabled Add button when it is sold out.
export function card(product) {
  const unavailable = read().unavailable.includes(product.id);
  return /* HTML */ `
    <article class="dish-card h-100">
      ${photo(product)}
      <div class="dish-body">
        <div class="dish-category">
          ${escape(product.category)}${product.type === "drink" ? " · COLD TAKEAWAY" : ""}
        </div>
        <h3>${escape(product.name)}</h3>
        <p>${escape(product.description)}</p>
        <div
          class="d-flex justify-content-between align-items-center gap-2"
        >
          <strong>${money(product.price)}</strong>
          <button
            class="btn btn-sm ${unavailable ? "btn-light" : "btn-add"}"
            data-add="${product.id}"
            ${unavailable ? "disabled" : ""}
          >
            ${unavailable ? "Sold out" : "+ Add"}
          </button>
        </div>
      </div>
    </article>
  `;
}
// Translate the saved status value into a readable label.
export function statusLabel(value) {
  return (
    {
      pending: "Order placed",
      accepted: "Accepted",
      preparing: "Preparing",
      ready: "Ready for pickup",
      "out-for-delivery": "Out for delivery",
      completed: "Completed",
      cancelled: "Cancelled",
    }[value] || value
  );
}
// Display a status label with the CSS class for that status.
export function badge(value) {
  return /* HTML */ `
    <span class="status-badge status-${escape(value)}">
      ${escape(statusLabel(value))}
    </span>
  `;
}
// Format an order timestamp as a readable day, month and time.
export function date(value) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
// Display a message and a menu link when a list has no entries.
export function empty(
  title,
  text,
  link = "menu.html",
  label = "Explore the menu",
) {
  return /* HTML */ `
    <div class="empty-state">
      ${icon("bag")}
      <h2>${title}</h2>
      <p>${text}</p>
      <a class="btn btn-brand" href="${link}">${label} ${icon("arrow")}</a>
    </div>
  `;
}
// Display a temporary message, then hide it after 2.6 seconds.
export function notify(message) {
  const noticeElement = document.getElementById("notice");
  noticeElement.textContent = message;
  noticeElement.classList.add("show");
  clearTimeout(window.noticeTimer);
  window.noticeTimer = setTimeout(
    () => noticeElement.classList.remove("show"),
    2600,
  );
}
// Create the common navigation, footer, cart counter and Add-button
// behavior.
export function shell() {
  const page = document.body.dataset.page;
  document.getElementById("site-header").innerHTML = /* HTML */ `
    <div class="topline">
      <div class="container-xl d-flex justify-content-between">
        <span>Freshly made in Malé. Delivered with care.</span>
        <span>${icon("clock")} Open daily · 11:00–23:00</span>
      </div>
    </div>
    <nav class="navbar navbar-expand-md bg-white">
      <div class="container-xl">
        <a class="navbar-brand brand" href="index.html">
          ${icon("chef")}
          <span class="brand-name">Shahid <span>Kitchen</span></span>
          <span class="brand-dot">.</span>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#main-nav"
          aria-controls="main-nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div
          class="offcanvas-md offcanvas-end site-menu"
          tabindex="-1"
          id="main-nav"
          aria-labelledby="menu-title"
        >
          <div class="offcanvas-header">
            <div>
              <div class="eyebrow mb-1">SHAHID KITCHEN</div>
              <h2 class="offcanvas-title" id="menu-title">
                Find your next bite.
              </h2>
            </div>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="offcanvas"
              data-bs-target="#main-nav"
              aria-label="Close navigation"
            ></button>
          </div>
          <div class="offcanvas-body">
            <div class="navbar-nav mx-auto gap-md-4">
              ${[
                ["home", "index.html", "Home"],
                ["menu", "menu.html", "Our menu"],
                ["orders", "orders.html", "My orders"],
              ]
                .map(
                  ([key, url, label]) => /* HTML */ `
                    <a
                      class="nav-link ${page === key ? "active" : ""}"
                      ${page === key ? 'aria-current="page"' : ""}
                      href="${url}"
                    >
                      ${label}
                    </a>
                  `,
                )
                .join("")}
            </div>
            <div class="d-flex align-items-center gap-3 nav-actions">
              <a class="staff-link" href="admin.html">Staff dashboard</a>
              <a class="cart-link" href="cart.html">
                ${icon("bag")}
                <span>Cart</span>
                <span class="cart-count" id="cart-count">0</span>
              </a>
            </div>
            <div class="drawer-note d-md-none">
              ${icon("clock")} Open daily · 11:00–23:00
              <small>Freshly made in Malé. Delivered with care.</small>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `;
  // Bootstrap manages the drawer animation, backdrop, Escape key and focus
  // trap.
  const drawer = document.getElementById("main-nav");
  const menuButton = document.querySelector(".navbar-toggler");
  drawer.addEventListener("show.bs.offcanvas", () =>
    menuButton.setAttribute("aria-expanded", "true"),
  );
  drawer.addEventListener("hidden.bs.offcanvas", () =>
    menuButton.setAttribute("aria-expanded", "false"),
  );
  document.getElementById("site-footer").innerHTML = /* HTML */ `
    <div class="container-xl">
      <div class="row gy-4 footer-main">
        <div class="col-md-5">
          <a class="brand" href="index.html">
            ${icon("chef")}
            <span class="brand-name">Shahid <span>Kitchen</span></span>
            <span class="brand-dot">.</span>
          </a>
          <p>
            Good food. Good mood.
            <br />
            Your neighborhood kitchen, a few clicks away.
          </p>
        </div>
        <div class="col-6 col-md-2">
          <h3>Find your bite</h3>
          <a href="menu.html">Our menu</a>
          <a href="orders.html">My orders</a>
          <a href="cart.html">Your cart</a>
        </div>
        <div class="col-6 col-md-2">
          <h3>Visit the kitchen</h3>
          <p>
            Malé, Maldives
            <br />
            Daily, 11:00–23:00
          </p>
        </div>
        <div class="col-md-3">
          <h3>Made for learning</h3>
          <p>
            A team restaurant demo.
            <br />
            Orders stay in this browser.
          </p>
          <a href="admin.html">Restaurant dashboard ↗</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>
          © ${new Date().getFullYear()} Shahid Kitchen. A little taste of
          happiness.
        </span>
        <span>Bootstrap + vanilla JavaScript</span>
      </div>
    </div>
  `;
  const toast = document.createElement("div");
  toast.id = "notice";
  toast.className = "notice";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.append(toast);
  /* Add the quantities in the cart and update the navigation badge. */
  /* Sum the cart quantities and show the number in the navigation badge. */
  function count() {
    document.getElementById("cart-count").textContent = read().cart.reduce(
      (value, c) => value + c.quantity,
      0,
    );
  }
  count();
  // Refresh this display after state changes in this browser tab.
  window.addEventListener("kitchen:change", count);
  // Forward browser storage changes so the current page can update.
  window.addEventListener("storage", () => {
    count();
    window.dispatchEvent(new Event("kitchen:external"));
  });
  // Listen for button clicks. closest() also handles clicks on an icon
  // inside a button.
  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    if (addButton) {
      try {
        if (add(addButton.dataset.add)) {
          notify(`${item(addButton.dataset.add).name} added to your cart`);
        } else {
          notify("This item is currently unavailable.");
        }
      } catch {
        notify(
          "Browser storage is unavailable. Please enable it to order.",
        );
      }
    }
  });
}

// Teacher helper: replace small static HTML icon slots with SVG drawings.
function fillPageIcons() {
  const slots = document.querySelectorAll("[data-icon]");
  for (let index = 0; index < slots.length; index++) {
    const slot = slots[index];
    slot.outerHTML = icon(slot.dataset.icon);
  }
}

// Prepare sample data before the student page renders.
preparePracticeData();
shell();
fillPageIcons();
