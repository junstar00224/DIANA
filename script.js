// =========================
// 상품 데이터
// =========================

const products = [
  {
    id: "classic-blazer",
    name: "Classic Blazer",
    price: 189000,
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "silk-dress",
    name: "Silk Dress",
    price: 219000,
    image:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "modern-coat",
    name: "Modern Coat",
    price: 289000,
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
  },
];


// =========================
// 장바구니: 저장 데이터에는 상품 ID와 수량만 보관합니다.
// 가격/이름은 항상 현재 상품 목록에서 가져옵니다.
// =========================
const CART_STORAGE_KEY = "diana.cart.v1";
const MAX_QUANTITY = 99;
const productById = new Map(products.map(product => [product.id, product]));
const cartIcon = document.querySelector("#cart-button");
const cartDialog = document.querySelector("#cart-dialog");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartTotal = document.querySelector("#cart-total");
const cartStatus = document.querySelector("#cart-status");
const storageWarning = document.querySelector("#cart-storage-warning");
const dialogWarning = document.querySelector("#cart-dialog-warning");
const dialogStatus = document.querySelector("#cart-dialog-status");
const closeCart = document.querySelector("#cart-close");
const formatPrice = value => `₩${value.toLocaleString("ko-KR")}`;
let statusTimer;

function announce(message) {
  clearTimeout(statusTimer);
  cartStatus.textContent = message;
  dialogStatus.textContent = message;
  statusTimer = setTimeout(() => {
    cartStatus.textContent = "";
    dialogStatus.textContent = "";
  }, 4500);
}

function warnStorage(message) {
  storageWarning.textContent = message;
  storageWarning.hidden = false;
  dialogWarning.textContent = message;
  dialogWarning.hidden = false;
}

function normalizeCart(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.items)) return [];
  const quantities = new Map();
  data.items.forEach(item => {
    if (!item || !productById.has(item.id) ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) return;
    quantities.set(item.id, Math.min(MAX_QUANTITY, (quantities.get(item.id) || 0) + item.quantity));
  });
  return Array.from(quantities, ([id, quantity]) => ({ id, quantity }));
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw === null ? [] : normalizeCart(JSON.parse(raw));
  } catch {
    warnStorage("저장된 장바구니를 불러오지 못했습니다. 현재 화면에서는 이용할 수 있지만 새로고침 시 내용이 유지되지 않을 수 있습니다.");
    return [];
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items: cart }));
    storageWarning.hidden = true;
    dialogWarning.hidden = true;
  } catch {
    warnStorage("장바구니를 저장하지 못했습니다. 현재 화면에서는 이용할 수 있지만 새로고침 시 변경 내용이 유지되지 않을 수 있습니다.");
  }
}

function makeButton(text, action, id, label, disabled = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.dataset.action = action;
  button.dataset.productId = id;
  button.setAttribute("aria-label", label);
  button.disabled = disabled;
  return button;
}

function renderCart() {
  // Retain keyboard position when changing quantity or removing a row.
  const active = document.activeElement;
  const activeId = active?.dataset.productId;
  const activeAction = active?.dataset.action;
  const hadFocus = cartItems.contains(active);
  cartItems.replaceChildren();
  let count = 0;
  let total = 0;
  cart.forEach(item => {
    const product = productById.get(item.id);
    count += item.quantity;
    total += product.price * item.quantity;
    const row = document.createElement("li");
    row.className = "cart-item";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    const details = document.createElement("div");
    details.className = "cart-item-details";
    const name = document.createElement("h3");
    name.textContent = product.name;
    const unitPrice = document.createElement("p");
    unitPrice.textContent = `단가 ${formatPrice(product.price)}`;
    const controls = document.createElement("div");
    controls.className = "cart-quantity";
    const quantity = document.createElement("input");
    quantity.type = "number";
    quantity.min = "1";
    quantity.max = String(MAX_QUANTITY);
    quantity.step = "1";
    quantity.value = String(item.quantity);
    quantity.dataset.productId = item.id;
    quantity.dataset.action = "quantity";
    quantity.setAttribute("aria-label", `${product.name} 수량`);
    controls.append(
      makeButton("−", "decrease", item.id, `${product.name} 수량 줄이기`, item.quantity === 1),
      quantity,
      makeButton("+", "increase", item.id, `${product.name} 수량 늘리기`, item.quantity === MAX_QUANTITY),
      makeButton("삭제", "remove", item.id, `${product.name} 삭제`)
    );
    const subtotal = document.createElement("p");
    subtotal.className = "cart-subtotal";
    subtotal.textContent = `소계 ${formatPrice(product.price * item.quantity)}`;
    details.append(name, unitPrice, controls, subtotal);
    row.append(image, details);
    cartItems.append(row);
  });
  cartEmpty.hidden = cart.length > 0;
  cartTotal.textContent = formatPrice(total);
  cartIcon.textContent = `🛍 ${count}`;
  cartIcon.setAttribute("aria-label", `장바구니, 총 ${count}개`);
  if (hadFocus) {
    const controls = Array.from(cartItems.querySelectorAll("[data-action]"));
    const next = controls.find(control => control.dataset.productId === activeId && control.dataset.action === activeAction);
    const fallback = controls.find(control => control.dataset.productId === activeId && control.dataset.action === "quantity");
    (next && !next.disabled ? next : fallback || controls[0] || closeCart).focus();
  }
}

function updateCart(message) {
  saveCart();
  renderCart();
  announce(message);
}

function addToCart(id) {
  const product = productById.get(id);
  if (!product) return;
  const item = cart.find(item => item.id === id);
  if (item && item.quantity >= MAX_QUANTITY) {
    announce(`상품별 최대 수량은 ${MAX_QUANTITY}개입니다.`);
    return;
  }
  if (item) item.quantity++;
  else cart.push({ id, quantity: 1 });
  updateCart(`${product.name} 상품이 장바구니에 추가되었습니다.`);
}

document.querySelectorAll(".product").forEach(element => {
  element.addEventListener("click", () => addToCart(element.dataset.productId));
  element.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!event.repeat) addToCart(element.dataset.productId);
    }
  });
});

cartIcon.addEventListener("click", () => cartDialog.showModal());
closeCart.addEventListener("click", () => cartDialog.close());

cartItems.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const item = cart.find(item => item.id === button.dataset.productId);
  if (!item) return;
  const name = productById.get(item.id).name;
  if (button.dataset.action === "remove") {
    cart = cart.filter(entry => entry.id !== item.id);
    updateCart(`${name} 상품을 삭제했습니다.`);
    return;
  }
  const quantity = item.quantity + (button.dataset.action === "increase" ? 1 : -1);
  if (quantity < 1 || quantity > MAX_QUANTITY) return;
  item.quantity = quantity;
  updateCart(`${name} 수량을 ${quantity}개로 변경했습니다.`);
});

cartItems.addEventListener("change", event => {
  const input = event.target.closest('input[data-action="quantity"]');
  if (!input) return;
  const item = cart.find(item => item.id === input.dataset.productId);
  if (!item) return;
  const quantity = Number(input.value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    input.value = String(item.quantity);
    announce(`수량은 1부터 ${MAX_QUANTITY}까지의 정수로 입력해 주세요.`);
    return;
  }
  item.quantity = quantity;
  updateCart(`${productById.get(item.id).name} 수량을 ${quantity}개로 변경했습니다.`);
});

// Another tab may update or clear the cart.
window.addEventListener("storage", event => {
  if (event.key !== CART_STORAGE_KEY && event.key !== null) return;
  cart = loadCart();
  renderCart();
});

renderCart();


// =========================
// 찜하기
// =========================

const heartIcon = document.querySelector("#heart-button");

let isLiked = false;

heartIcon.addEventListener("click", function () {

  isLiked = !isLiked;
  heartIcon.setAttribute("aria-pressed", String(isLiked));

  if (isLiked) {
    heartIcon.textContent = "♥";
    heartIcon.style.color = "red";
  } else {
    heartIcon.textContent = "♡";
    heartIcon.style.color = "black";
  }

});


// =========================
// 검색 기능
// =========================

const searchIcon = document.querySelector("#search-button");
const searchDialog = document.querySelector("#search-dialog");
const searchInput = document.querySelector("#search-input");
const searchResults = document.querySelector("#search-results");
const searchAliases = { "classic-blazer": "블레이저 자켓 재킷", "silk-dress": "실크 드레스 원피스", "modern-coat": "모던 코트 아우터" };
function renderSearch() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const results = products.filter(product => `${product.name} ${searchAliases[product.id]}`.toLocaleLowerCase().includes(query));
  searchResults.replaceChildren();
  document.querySelector("#search-result-title").textContent = query ? "SEARCH RESULTS" : "ALL COLLECTION";
  document.querySelector("#search-count").textContent = `${results.length}개의 상품`;
  document.querySelector("#search-empty").hidden = results.length > 0;
  document.querySelector("#search-feedback").textContent = "";
  results.forEach(product => {
    const row = document.createElement("li");
    const image = document.createElement("img"); image.src = product.image; image.alt = product.name;
    const details = document.createElement("div");
    const name = document.createElement("h4"); name.textContent = product.name;
    const price = document.createElement("p"); price.textContent = formatPrice(product.price);
    const add = document.createElement("button"); add.type = "button"; add.textContent = "장바구니 담기 +";
    add.setAttribute("aria-label", `${product.name} 장바구니 담기`);
    add.addEventListener("click", () => {
      const oldQuantity = cart.find(item => item.id === product.id)?.quantity || 0;
      addToCart(product.id);
      document.querySelector("#search-feedback").textContent = oldQuantity >= MAX_QUANTITY ? `상품별 최대 수량은 ${MAX_QUANTITY}개입니다.` : `${product.name}을 장바구니에 담았습니다.`;
    });
    details.append(name, price, add); row.append(image, details); searchResults.append(row);
  });
}
searchIcon.setAttribute("aria-haspopup", "dialog");
searchIcon.addEventListener("click", () => { renderSearch(); searchDialog.showModal(); searchInput.focus(); });
searchInput.addEventListener("input", renderSearch);
document.querySelector("#search-form").addEventListener("submit", event => { event.preventDefault(); renderSearch(); });
document.querySelectorAll("[data-query]").forEach(button => button.addEventListener("click", () => { searchInput.value = button.dataset.query; renderSearch(); searchInput.focus(); }));
document.querySelector("#search-reset").addEventListener("click", () => { searchInput.value = ""; renderSearch(); searchInput.focus(); });
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => document.getElementById(button.dataset.close).close()));
searchDialog.addEventListener("click", event => {
  const rect = searchDialog.getBoundingClientRect();
  if (event.target === searchDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) searchDialog.close();
});


// =========================
// 스크롤 등장 효과
// =========================

const sections = document.querySelectorAll(".section, .about, .collection-banner");

const observer = new IntersectionObserver(
  function (entries) {

    entries.forEach(function (entry) {

      if (entry.isIntersecting) {

        entry.target.classList.add("show");

      }

    });

  },
  {
    threshold: 0.2,
  }
);


sections.forEach(function (section) {

  observer.observe(section);

});


// =========================
// 페이지 맨 위로
// =========================

const logo = document.querySelector(".logo");

logo.addEventListener("click", function () {

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

});
