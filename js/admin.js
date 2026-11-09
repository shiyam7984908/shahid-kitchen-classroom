// Paste each numbered block only inside its matching START / END area.
// JS-01 START: Imports and starting variables
import { menu, statuses } from "../../assets/js/data.js";
import {
  read,
  setStatus,
  toggleAvailability,
  seedOrders,
  clearDemo,
} from "../../assets/js/store.js";
import {
  money,
  photo,
  badge,
  date,
  escape,
  statusLabel,
  notify,
} from "../../assets/js/shared.js";
let view = "orders";
let statusFilter = "all";
let searchText = "";
// JS-01 END
// JS-02 START: showStatistics
function showStatistics(state) {
    const today = new Date().toDateString();
    let todayCount = 0;
    let attentionCount = 0;
    let deliveryCount = 0;
    let sales = 0;
    for (let index = 0; index < state.orders.length; index++) {
      const order = state.orders[index];
      if (new Date(order.createdAt).toDateString() === today) {
        todayCount = todayCount + 1;
        if (order.status === "completed") {
          sales = sales + order.total;
        }
      }
      if (
        order.status === "pending" ||
        order.status === "accepted" ||
        order.status === "preparing"
      ) {
        attentionCount = attentionCount + 1;
      }
      if (order.status === "out-for-delivery") {
        deliveryCount = deliveryCount + 1;
      }
    }
    document.getElementById("staff-today").textContent = todayCount;
    document.getElementById("staff-attention").textContent = attentionCount;
    document.getElementById("staff-delivery").textContent = deliveryCount;
    document.getElementById("staff-sales").textContent = money(sales);
    document.getElementById("staff-order-count").textContent =
      state.orders.length;
  }
// JS-02 END
// JS-03 START: getMatchingOrders
function getMatchingOrders(state) {
    const matches = [];
    for (let index = 0; index < state.orders.length; index++) {
      const order = state.orders[index];
      let rightStatus = false;
      if (statusFilter === "all") {
        rightStatus = true;
      } else if (order.status === statusFilter) {
        rightStatus = true;
      }
      const words = order.id + " " + order.customer.name;
      const rightText = words.toLowerCase().includes(searchText);
      if (rightStatus && rightText) {
        matches.push(order);
      }
    }
    return matches;
  }
// JS-03 END
// JS-04 START: createStatusOptions
function createStatusOptions(order) {
    let html = "";
    for (let index = 0; index < statuses.length; index++) {
      const status = statuses[index];
      let allowed = true;
      if (
        order.fulfillmentType === "pickup" &&
        status === "out-for-delivery"
      ) {
        allowed = false;
      } else if (order.fulfillmentType === "delivery" && status === "ready") {
        allowed = false;
      }
      if (allowed) {
        let selected = "";
        if (status === order.status) {
          selected = "selected";
        }
        // HTML: one dropdown option, not the complete table row.
        html =
          html +
          `<option value="${status}" ${selected}>
          ${statusLabel(status)}</option>`;
      }
    }
    return html;
  }
// JS-04 END
// JS-05 START: createOrderRow
function createOrderRow(order) {
    let method = "Delivery";
    let sampleLabel = "";
    if (order.fulfillmentType === "pickup") {
      method = "Pickup";
    }
    if (order.demo === true) {
      sampleLabel = " · SAMPLE";
    }
    // HTML: one row with six cells. Each cell has a specific job.
    return `
      <tr>
        <td><button class="order-id-button" data-detail="${escape(order.id)}">
          ${escape(order.id)}</button>
          <small>${date(order.createdAt)}${sampleLabel}</small></td>
        <td><strong>${escape(order.customer.name)}</strong>
          <small>${escape(order.customer.phone)}</small></td>
        <td class="text-nowrap">${money(order.total)}</td>
        <td>${method}</td><td>${badge(order.status)}</td>
        <td><select class="form-select form-select-sm status-select"
          data-status="${escape(order.id)}" aria-label="Status for ${escape(order.id)}">
          ${createStatusOptions(order)}</select></td>
      </tr>
    `;
  }
// JS-05 END
// JS-06 START: showOrderRows
function showOrderRows(state) {
    const orders = getMatchingOrders(state);
    let html = "";
    if (orders.length === 0) {
      // HTML: one table row spanning all six columns.
      html = `<tr><td colspan="6"><div class="empty-state py-5">
        <h2>No orders here yet.</h2><p>Load sample orders to practice.</p>
        </div></td></tr>`;
    } else {
      for (let index = 0; index < orders.length; index++) {
        html = html + createOrderRow(orders[index]);
      }
    }
    document.getElementById("staff-order-rows").innerHTML = html;
  }
// JS-06 END
// JS-07 START: createAvailabilityRow
function createAvailabilityRow(product, state) {
    let checked = "checked";
    let label = "Available";
    if (state.unavailable.indexOf(product.id) !== -1) {
      checked = "";
      label = "Sold out";
    }
    // HTML: one product and one labeled switch.
    return `
      <tr>
        <td><div class="admin-menu-item">${photo(product, "checkout-thumb")}
          <strong>${product.name}</strong></div></td>
        <td>${product.category}</td><td>${money(product.price)}</td>
        <td><div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch"
            id="avail-${product.id}" data-available="${product.id}" ${checked}>
          <label class="form-check-label" for="avail-${product.id}">${label}</label>
        </div></td>
      </tr>
    `;
  }
// JS-07 END
// JS-08 START: showAvailability
function showAvailability(state) {
    let html = "";
    for (let index = 0; index < menu.length; index++) {
      html = html + createAvailabilityRow(menu[index], state);
    }
    document.getElementById("staff-menu-rows").innerHTML = html;
  }
// JS-08 END
// JS-09 START: showDetailItems
function showDetailItems(order) {
    let html = "";
    for (let index = 0; index < order.items.length; index++) {
      const entry = order.items[index];
      // HTML: one line in the dialog item list.
      html =
        html +
        `<div class="summary-line">
        <span>${escape(entry.name)} × ${entry.quantity}</span>
        <strong>${money(entry.price * entry.quantity)}</strong></div>`;
    }
    document.getElementById("staff-detail-items").innerHTML = html;
  }
// JS-09 END
// JS-10 START: openOrderDetails
function openOrderDetails(orderId) {
    const orders = read().orders;
    let selected = null;
    for (let index = 0; index < orders.length; index++) {
      if (orders[index].id === orderId) {
        selected = orders[index];
        break;
      }
    }
    if (selected === null) {
      return;
    }
    let address = selected.customer.address;
    if (!address) {
      address = "Pickup at Shahid Kitchen";
    }
    document.getElementById("staff-detail-id").textContent = selected.id;
    document.getElementById("staff-detail-status").innerHTML = badge(
      selected.status,
    );
    document.getElementById("staff-detail-name").textContent =
      selected.customer.name;
    document.getElementById("staff-detail-phone").textContent =
      selected.customer.phone;
    document.getElementById("staff-detail-address").textContent = address;
    document.getElementById("staff-detail-delivery").textContent = money(
      selected.delivery,
    );
    document.getElementById("staff-detail-total").textContent = money(
      selected.total,
    );
    document.getElementById("staff-detail-notes").textContent =
      selected.notes;
    showDetailItems(selected);
    document.getElementById("order-dialog").showModal();
  }
// JS-10 END
// JS-11 START: showCurrentView
function showCurrentView() {
    if (view === "orders") {
      document.getElementById("staff-orders-panel").hidden = false;
      document.getElementById("staff-menu-panel").hidden = true;
    } else {
      document.getElementById("staff-orders-panel").hidden = true;
      document.getElementById("staff-menu-panel").hidden = false;
    }
    const buttons = document.querySelectorAll("[data-view]");
    for (let index = 0; index < buttons.length; index++) {
      if (buttons[index].dataset.view === view) {
        buttons[index].classList.add("active");
      } else {
        buttons[index].classList.remove("active");
      }
    }
    const filters = document.querySelectorAll("[data-filter]");
    for (let index = 0; index < filters.length; index++) {
      if (filters[index].dataset.filter === statusFilter) {
        filters[index].classList.add("active");
      } else {
        filters[index].classList.remove("active");
      }
    }
  }
// JS-11 END
// JS-12 START: refreshStaff
function refreshStaff() {
    const state = read();
    showStatistics(state);
    showCurrentView();
    let hasSamples = false;
    for (let index = 0; index < state.orders.length; index++) {
      if (state.orders[index].demo === true) {
        hasSamples = true;
      }
    }
    document.getElementById("clear-demo").hidden = !hasSamples;
    if (view === "orders") {
      showOrderRows(state);
    } else {
      showAvailability(state);
    }
  }
// JS-12 END
// JS-13 START: handleStaffClick
function handleStaffClick(event) {
    const viewButton = event.target.closest("[data-view]");
    const filterButton = event.target.closest("[data-filter]");
    const detailButton = event.target.closest("[data-detail]");
    if (viewButton !== null) {
      view = viewButton.dataset.view;
      refreshStaff();
    } else if (filterButton !== null) {
      statusFilter = filterButton.dataset.filter;
      refreshStaff();
    } else if (event.target.id === "seed-orders") {
      seedOrders();
      notify("Sample orders loaded.");
    } else if (event.target.id === "clear-demo") {
      clearDemo();
      notify("Sample orders removed.");
    } else if (detailButton !== null) {
      openOrderDetails(detailButton.dataset.detail);
    } else if (event.target.id === "close-dialog") {
      document.getElementById("order-dialog").close();
    }
  }
// JS-13 END
// JS-14 START: handleStaffChange
function handleStaffChange(event) {
    if (event.target.matches("[data-status]")) {
      setStatus(event.target.dataset.status, event.target.value);
      notify("Order status updated.");
    } else if (event.target.matches("[data-available]")) {
      toggleAvailability(event.target.dataset.available);
    }
  }
// JS-14 END
// JS-15 START: handleStaffSearch
function handleStaffSearch(event) {
    searchText = event.target.value.toLowerCase();
    refreshStaff();
  }
// JS-15 END
// JS-16 START: Connect events and start the page
document.addEventListener("click", handleStaffClick);
document.addEventListener("change", handleStaffChange);
document
  .getElementById("admin-search")
  .addEventListener("input", handleStaffSearch);
window.addEventListener("kitchen:change", refreshStaff);
window.addEventListener("kitchen:external", refreshStaff);
refreshStaff();
// JS-16 END