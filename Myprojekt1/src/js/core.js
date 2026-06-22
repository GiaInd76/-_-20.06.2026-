/* Общие данные, localStorage, ссылки, категории и работа с изображениями. */

const params = new URLSearchParams(window.location.search);
let currentSeller = params.get("seller");
let editingProductIndex = null;
let selectedProductImages = [];
let selectedSellerCover = "";
let refreshProductImagePreview = () => {};
let refreshLiveProductPreview = () => {};
const sessionProductIds = new Set();
let modalProductImages = [];
let modalProductImageIndex = 0;

const categories = [
    { id: "meat", label: "Мясо" },
    { id: "fish", label: "Рыба и морепродукты" },
    { id: "vegetables", label: "Овощи" },
    { id: "fruits", label: "Фрукты" },
    { id: "milk", label: "Молочная продукция" },
    { id: "bakery", label: "Выпечка" },
    { id: "spices", label: "Специи" },
    { id: "sweets", label: "Сладости" },
    { id: "clothing", label: "Одежда" },
    { id: "shoes", label: "Обувь" },
    { id: "electronics", label: "Техника" },
    { id: "discount", label: "Всё по 3" },
    { id: "pets", label: "Зоотовары" },
    { id: "other", label: "Другое" }
];

const units = {
    kg: "кг",
    gram: "г",
    liter: "л",
    piece: "шт",
    pack: "упаковка"
};

const homeCategorySuggestions = [
    { id: "meat", icon: "🥩", title: "Мясо" },
    { id: "fish", icon: "🐟", title: "Рыба" },
    { id: "vegetables", icon: "🥬", title: "Овощи" },
    { id: "fruits", icon: "🍎", title: "Фрукты" },
    { id: "milk", icon: "🥛", title: "Молочка" },
    { id: "bakery", icon: "🥐", title: "Выпечка" },
    { id: "spices", icon: "🧂", title: "Специи" },
    { id: "sweets", icon: "🍬", title: "Сладости" },
    { id: "clothing", icon: "👕", title: "Одежда" },
    { id: "shoes", icon: "👟", title: "Обувь" },
    { id: "electronics", icon: "📱", title: "Техника" },
    { id: "discount", icon: "🏷️", title: "Всё по 3" },
    { id: "pets", icon: "🐾", title: "Зоотовары" },
    { id: "other", icon: "🛍️", title: "Другое" }
];

function readStorage(key, fallback = []) {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

function getPhoneHref(value) {
    const phone = String(value || "").trim();
    const normalized = phone.replace(/[^+\d]/g, "");
    return normalized ? `tel:${normalized}` : "";
}

function getSocialHref(value, service) {
    const contact = String(value || "").trim();

    if (!contact) return "";

    if (/^https?:\/\//i.test(contact)) return contact;

    const account = contact.replace(/^@/, "");

    if (service === "telegram") {
        return `https://t.me/${encodeURIComponent(account)}`;
    }

    if (service === "instagram") {
        return `https://instagram.com/${encodeURIComponent(account)}`;
    }

    if (service === "viber") {
        const phone = account.replace(/[^+\d]/g, "");
        return phone ? `viber://chat?number=${encodeURIComponent(phone)}` : "";
    }

    return "";
}

function makeId(value) {
    return value
        .trim()
        .toLowerCase()
        .replaceAll(" ", "_")
        .replace(/_+/g, "_");
}

function getCategoryLabel(categoryId) {
    const category = categories.find(item => item.id === categoryId);
    return category ? category.label : "Другое";
}

function getCategoryClass(categoryId) {
    return `category-${categoryId || "other"}`;
}

function getUnitLabel(unitId) {
    return units[unitId] || unitId || "";
}

function fillCategorySelect(select, selectedValue = "") {
    if (!select) return;

    select.innerHTML = categories
        .map(category => {
            const selected = category.id === selectedValue ? "selected" : "";

            return `
                <option value="${category.id}" ${selected}>
                    ${category.label}
                </option>
            `;
        })
        .join("");
}

function getSellerById(sellerId) {
    const sellers = readStorage("sellers");
    return sellers.find(seller => seller.id === sellerId);
}

function getSellerName(sellerId) {
    const seller = getSellerById(sellerId);
    return seller ? seller.name : "Продавец";
}

function showMessage(element, text) {
    if (!element) return;
    element.textContent = text;
}

function normalizeProductPrice(value) {
    return String(value || "")
        .trim()
        .replace(/\s*(\/|-|–|—)\s*/g, "$1");
}

function isValidProductPrice(value) {
    const price = normalizeProductPrice(value);

    return /^\d+(?:[.,]\d{1,2})?(?:(?:\/|-|–|—)\d+(?:[.,]\d{1,2})?)?$/.test(price);
}

function getProductPriceText(product) {
    const price = product.priceLabel || product.price;
    return `${price} грн / ${getUnitLabel(product.unit)}`;
}

function getProductDepartment(product) {
    return String(product?.department || "").trim() || "Другое";
}

function getProductImages(product) {
    if (Array.isArray(product?.images)) {
        const images = product.images.filter(Boolean).slice(0, 2);

        if (images.length) return images;
    }

    return product?.image ? [product.image] : [];
}

function renderDepartmentSuggestions() {
    const suggestions = document.getElementById("departmentSuggestions");

    if (!suggestions) return;

    const departments = [...new Set(
        readStorage("products")
            .filter(product => product.seller === currentSeller)
            .map(product => String(product.department || "").trim())
            .filter(Boolean)
    )].sort((first, second) => first.localeCompare(second, "ru"));

    suggestions.innerHTML = departments
        .map(department => `<option value="${escapeHtml(department)}"></option>`)
        .join("");
}

function getFavoriteProducts() {
    return readStorage("favoriteProducts");
}

function isFavoriteProduct(productId) {
    return getFavoriteProducts().includes(productId);
}

function toggleFavoriteProduct(productId) {
    const favorites = getFavoriteProducts();
    const index = favorites.indexOf(productId);

    if (index === -1) {
        favorites.push(productId);
    } else {
        favorites.splice(index, 1);
    }

    writeStorage("favoriteProducts", favorites);
}

function resizeImageFile(file, maxSize = 900, quality = 0.78) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener("error", reject);

        reader.addEventListener("load", () => {
            const image = new Image();

            image.addEventListener("error", reject);

            image.addEventListener("load", () => {
                const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                const canvas = document.createElement("canvas");

                canvas.width = Math.round(image.width * scale);
                canvas.height = Math.round(image.height * scale);

                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                resolve(canvas.toDataURL("image/jpeg", quality));
            });

            image.src = reader.result;
        });

        reader.readAsDataURL(file);
    });
}

function openPage(url) {
    window.location.href = url;
}

function initBrandHeader() {
    // Бренд показываем только на главной странице.
    return;
}

function setBrandCategory(categoryId) {
    const brand = document.querySelector(".brand-title");

    if (!brand || !categoryId) return;

    categories.forEach(category => {
        brand.classList.remove(getCategoryClass(category.id));
    });

    brand.classList.add(getCategoryClass(categoryId));
}

function initCategoryColors() {
    document
        .querySelectorAll("[data-category]")
        .forEach(element => {
            element.classList.add(getCategoryClass(element.dataset.category));
        });
}
