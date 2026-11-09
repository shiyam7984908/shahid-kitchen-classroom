// Paste each numbered block only inside its matching START / END area.
// JS-01 START: Imports and starting variables
import { menu } from "../../assets/js/data.js";
import { card } from "../../assets/js/shared.js";
let type = "food";
let category = "All";
let searchText = "";
let sortOrder = "recommended";
const parameters = new URLSearchParams(location.search);
if (parameters.get("type") === "drink") {
  type = "drink";
}
if (parameters.has("category")) {
  category = parameters.get("category");
}
// JS-01 END
// JS-02 START: getCategories
function getCategories() {
    const categories = ["All"];
    for (let index = 0; index < menu.length; index++) {
      const product = menu[index];
      if (product.type === type) {
        if (categories.indexOf(product.category) === -1) {
          categories.push(product.category);
        }
      }
    }
    return categories;
  }
// JS-02 END
// JS-03 START: createCategoryButton
function createCategoryButton(name) {
    let count = 0;
    for (let index = 0; index < menu.length; index++) {
      const product = menu[index];
      if (product.type === type) {
        if (name === "All" || product.category === name) {
          count = count + 1;
        }
      }
    }
    let buttonClass = "filter-pill";
    let pressed = "false";
    if (name === category) {
      buttonClass = "filter-pill active";
      pressed = "true";
    }
    // HTML: one filter button and its small product count.
    return `
      <button class="${buttonClass}" data-category="${name}"
        aria-pressed="${pressed}">
        ${name}<span class="category-count">${count}</span>
      </button>
    `;
  }
// JS-03 END
// JS-04 START: showCategoryControls
function showCategoryControls() {
    const categories = getCategories();
    if (categories.indexOf(category) === -1) {
      category = "All";
    }
    const buttons = document.querySelectorAll("[data-type]");
    for (let index = 0; index < buttons.length; index++) {
      const button = buttons[index];
      if (button.dataset.type === type) {
        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");
      } else {
        button.classList.remove("active");
        button.setAttribute("aria-pressed", "false");
      }
    }
    let html = "";
    for (let index = 0; index < categories.length; index++) {
      html = html + createCategoryButton(categories[index]);
    }
    document.getElementById("categories").innerHTML = html;
  }
// JS-04 END
// JS-05 START: getMatchingProducts
function getMatchingProducts() {
    const matches = [];
    for (let index = 0; index < menu.length; index++) {
      const product = menu[index];
      const rightType = product.type === type;
      let rightCategory = false;
      if (category === "All") {
        rightCategory = true;
      } else if (product.category === category) {
        rightCategory = true;
      }
      const words =
        product.name + " " + product.description + " " + product.category;
      const rightText = words.toLowerCase().includes(searchText);
      if (rightType && rightCategory && rightText) {
        matches.push(product);
      }
    }
    return matches;
  }
// JS-05 END
// JS-06 START: compareLowPrice
function compareLowPrice(first, second) {
    return first.price - second.price;
  }
// JS-06 END
// JS-07 START: compareHighPrice
function compareHighPrice(first, second) {
    return second.price - first.price;
  }
// JS-07 END
// JS-08 START: compareNames
function compareNames(first, second) {
    const firstName = first.name.toLowerCase();
    const secondName = second.name.toLowerCase();
    if (firstName < secondName) {
      return -1;
    } else if (firstName > secondName) {
      return 1;
    } else {
      return 0;
    }
  }
// JS-08 END
// JS-09 START: refreshMenu
function refreshMenu() {
    showCategoryControls();
    const products = getMatchingProducts();
    if (sortOrder === "low") {
      products.sort(compareLowPrice);
    } else if (sortOrder === "high") {
      products.sort(compareHighPrice);
    } else if (sortOrder === "name") {
      products.sort(compareNames);
    }
    let unit = "dishes";
    if (type === "drink") {
      unit = "drinks";
    }
    document.getElementById("result-count").textContent =
      products.length + " " + unit + " to brighten your day";
      let html = "";
      if (products.length === 0) {
        // HTML: one empty-result message inside the results area.
        html = `<div class="empty-state"><h2>No bites found</h2>
          <p>Try a different search or category.</p>
          <button class="btn btn-brand" id="reset-filters">Reset filters</button></div>`;
      } else {
        for (let index = 0; index < products.length; index++) {
          // HTML: one column containing a teacher-supplied product card.
          html =
            html +
            `<div class="col-sm-6 col-lg-4 col-xl-3">
            ${card(products[index])}</div>`;
        }
      }
      document.getElementById("menu-grid").innerHTML = html;
  }
// JS-09 END
// JS-10 START: handleMenuClick
function handleMenuClick(event) {
    const typeButton = event.target.closest("[data-type]");
    const categoryButton = event.target.closest("[data-category]");
    if (typeButton !== null) {
      type = typeButton.dataset.type;
      category = "All";
    } else if (categoryButton !== null) {
      category = categoryButton.dataset.category;
    } else if (event.target.id === "reset-filters") {
      searchText = "";
      category = "All";
      document.getElementById("search").value = "";
    } else {
      return;
    }
    refreshMenu();
  }
// JS-10 END
// JS-11 START: handleSearchInput
function handleSearchInput(event) {
    searchText = event.target.value.trim().toLowerCase();
    refreshMenu();
  }
// JS-11 END
// JS-12 START: handleSortChange
function handleSortChange(event) {
    sortOrder = event.target.value;
    refreshMenu();
  }
// JS-12 END
// JS-13 START: Connect events and start the page
document.addEventListener("click", handleMenuClick);
document
  .getElementById("search")
  .addEventListener("input", handleSearchInput);
document
  .getElementById("sort")
  .addEventListener("change", handleSortChange);
window.addEventListener("kitchen:external", refreshMenu);
refreshMenu();
// JS-13 END