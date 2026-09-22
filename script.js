// =========================
// 상품 데이터
// =========================

const products = [
  {
    name: "Classic Blazer",
    price: 189000,
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Silk Dress",
    price: 219000,
    image:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Modern Coat",
    price: 289000,
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
  },
];


// =========================
// 상품 선택
// =========================

const productElements = document.querySelectorAll(".product");


// =========================
// 장바구니
// =========================

let cartCount = 0;

const cartIcon = document.querySelector(".header-icons span:last-child");

productElements.forEach((product, index) => {

  product.addEventListener("click", function () {

    cartCount++;

    cartIcon.textContent = `🛍 ${cartCount}`;

    alert(`${products[index].name} 상품이 장바구니에 추가되었습니다.`);

  });

});


// =========================
// 찜하기
// =========================

const heartIcon = document.querySelector(".header-icons span:nth-child(2)");

let isLiked = false;

heartIcon.addEventListener("click", function () {

  isLiked = !isLiked;

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

const searchIcon = document.querySelector(".header-icons span:first-child");

searchIcon.addEventListener("click", function () {

  const keyword = prompt("찾고 싶은 상품을 입력해주세요.");

  if (!keyword) {
    return;
  }

  const result = products.filter(function (product) {

    return product.name
      .toLowerCase()
      .includes(keyword.toLowerCase());

  });

  if (result.length > 0) {

    alert(
      `${result.length}개의 상품을 찾았습니다.\n\n` +
      result.map(product => product.name).join("\n")
    );

  } else {

    alert("검색 결과가 없습니다.");

  }

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