/* Спільні дані, localStorage, посилання, категорії та робота із зображеннями. */

const params = new URLSearchParams(window.location.search);
let currentSeller = params.get("seller");
let editingProductIndex = null;
let selectedProductImages = [];
let selectedSellerCover = "";
let refreshProductImagePreview = () => {};
let refreshLiveProductPreview = () => {};
let modalProductImages = [];
let modalProductImageIndex = 0;

const imageLimits = {
    product: {
        maxOriginalBytes: 12 * 1024 * 1024,
        maxSize: 1200,
        maxOutputBytes: 420 * 1024,
        startQuality: 0.82,
        minQuality: 0.58
    },
    cover: {
        maxOriginalBytes: 16 * 1024 * 1024,
        maxSize: 1600,
        maxOutputBytes: 620 * 1024,
        startQuality: 0.82,
        minQuality: 0.56
    }
};

const categories = [
    { id: "meat", label: "М'ясо" },
    { id: "fish", label: "Риба та морепродукти" },
    { id: "vegetables", label: "Овочі" },
    { id: "fruits", label: "Фрукти" },
    { id: "milk", label: "Молочна продукція" },
    { id: "bakery", label: "Випічка" },
    { id: "spices", label: "Спеції" },
    { id: "sweets", label: "Солодощі" },
    { id: "clothing", label: "Одяг" },
    { id: "shoes", label: "Взуття" },
    { id: "electronics", label: "Техніка" },
    { id: "discount", label: "Усе по 3" },
    { id: "pets", label: "Зоотовари" },
    { id: "other", label: "Інше" }
];

const units = {
    kg: "кг",
    gram: "г",
    liter: "л",
    piece: "шт",
    pack: "упаковка"
};

const defaultMarket = {
    id: "",
    name: "Ринок Привоз",
    slug: "privoz",
    cityId: "",
    cityName: "Одеса",
    citySlug: "odesa",
    address: "вул. Привозна, 14"
};

function getCurrentMarket() {
    const savedMarket = readStorage("selectedMarket", defaultMarket);

    return {
        ...defaultMarket,
        ...savedMarket
    };
}

function setCurrentMarket(market) {
    if (!market) return;

    writeStorage("selectedMarket", {
        ...defaultMarket,
        ...market
    });

    updateMarketLabels();
}

function getCurrentMarketId() {
    return getCurrentMarket().id || "";
}

function getMarketDisplayName(market = getCurrentMarket()) {
    const cityName = market.cityName || defaultMarket.cityName;
    const marketName = market.name || defaultMarket.name;

    return `${cityName} • ${marketName}`;
}

function updateMarketLabels(root = document) {
    const market = getCurrentMarket();

    root.querySelectorAll("[data-market-label]").forEach(element => {
        element.textContent = getMarketDisplayName(market);
        element.dataset.marketAddress = market.address || "";
        element.classList.toggle("has-market-address", Boolean(market.address));
        element.classList.add("market-switcher-trigger");
        element.setAttribute("role", "button");
        element.setAttribute("tabindex", "0");
        element.setAttribute("aria-haspopup", "dialog");
        element.setAttribute("aria-label", translateInterfaceValue("chooseMarket"));
    });
}

function clearMarketCatalogCache() {
    localStorage.removeItem("sellers");
    localStorage.removeItem("products");
}

async function initMarketSwitcher() {
    const triggers = [...document.querySelectorAll("[data-market-label]")];

    if (!triggers.length) return;

    const modal = document.createElement("div");
    modal.className = "modal market-switcher-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
        <section
            class="market-switcher-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="marketSwitcherTitle"
        >
            <div class="market-switcher-heading">
                <div>
                    <h2 id="marketSwitcherTitle">${escapeHtml(translateInterfaceValue("chooseMarket"))}</h2>
                    <p>${escapeHtml(translateInterfaceValue("marketContentHint"))}</p>
                </div>
                <button
                    class="market-switcher-close"
                    type="button"
                    aria-label="${escapeHtml(translateInterfaceValue("close"))}"
                >×</button>
            </div>
            <div class="market-switcher-list"></div>
            <p class="market-switcher-message" aria-live="polite"></p>
        </section>
    `;
    document.body.appendChild(modal);

    const list = modal.querySelector(".market-switcher-list");
    const message = modal.querySelector(".market-switcher-message");
    const closeButton = modal.querySelector(".market-switcher-close");
    let markets = [];
    let previousFocus = null;

    const close = () => {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        previousFocus?.focus();
    };

    const renderMarkets = () => {
        const currentMarketId = getCurrentMarketId();

        list.innerHTML = markets.map(market => {
            const details = [market.cityName, market.address]
                .filter(Boolean)
                .join(" • ");

            return `
                <button
                    class="market-switcher-option ${market.id === currentMarketId ? "is-active" : ""}"
                    type="button"
                    data-market-id="${escapeHtml(market.id)}"
                >
                    <span>
                        <strong>${escapeHtml(market.name)}</strong>
                        ${details ? `<small>${escapeHtml(details)}</small>` : ""}
                    </span>
                    <span class="market-switcher-check" aria-hidden="true">
                        ${market.id === currentMarketId ? "✓" : ""}
                    </span>
                </button>
            `;
        }).join("");
    };

    const loadMarkets = async () => {
        message.textContent = translateInterfaceValue("loadingMarkets");

        try {
            markets = await fetchMarketsFromSupabase();
            markets = markets.filter(market => market.id);
            renderMarkets();
            message.textContent = markets.length
                ? ""
                : translateInterfaceValue("marketListUnavailable");
        } catch (error) {
            console.warn("Market switcher failed", error);
            markets = readStorage("markets", []).filter(market => market.id);
            renderMarkets();
            message.textContent = markets.length
                ? ""
                : translateInterfaceValue("marketListUnavailable");
        }
    };

    const open = async trigger => {
        previousFocus = trigger;
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        closeButton.focus();
        await loadMarkets();
    };

    triggers.forEach(trigger => {
        trigger.addEventListener("click", event => {
            event.preventDefault();
            open(trigger);
        });
        trigger.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                open(trigger);
            }
        });
    });

    closeButton.addEventListener("click", close);
    modal.addEventListener("click", event => {
        if (event.target === modal) close();
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modal.classList.contains("active")) close();
    });

    list.addEventListener("click", event => {
        const option = event.target.closest("[data-market-id]");
        const selectedMarket = markets.find(market => market.id === option?.dataset.marketId);

        if (!selectedMarket || selectedMarket.id === getCurrentMarketId()) {
            close();
            return;
        }

        setCurrentMarket(selectedMarket);
        clearMarketCatalogCache();

        const pageName = window.location.pathname.split("/").pop();
        const shouldOpenHome = ["seller.html", "seller_panel.html", "create_seller.html"].includes(pageName);

        if (shouldOpenHome) {
            openPage("index.html");
        } else {
            window.location.reload();
        }
    });
}

const homeCategorySuggestions = [
    { id: "meat", icon: "🥩", title: "М'ясо" },
    { id: "fish", icon: "🐟", title: "Риба" },
    { id: "vegetables", icon: "🥬", title: "Овочі" },
    { id: "fruits", icon: "🍎", title: "Фрукти" },
    { id: "milk", icon: "🥛", title: "Молочне" },
    { id: "bakery", icon: "🥐", title: "Випічка" },
    { id: "spices", icon: "🧂", title: "Спеції" },
    { id: "sweets", icon: "🍬", title: "Солодощі" },
    { id: "clothing", icon: "👕", title: "Одяг" },
    { id: "shoes", icon: "👟", title: "Взуття" },
    { id: "electronics", icon: "📱", title: "Техніка" },
    { id: "discount", icon: "🏷️", title: "Усе по 3" },
    { id: "pets", icon: "🐾", title: "Зоотовари" },
    { id: "other", icon: "🛍️", title: "Інше" }
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
    const fallback = category ? category.label : "Інше";

    return typeof getLocalizedCategoryLabel === "function"
        ? getLocalizedCategoryLabel(categoryId, fallback)
        : fallback;
}

function getCategoryClass(categoryId) {
    return `category-${categoryId || "other"}`;
}

function getUnitLabel(unitId) {
    const fallback = units[unitId] || unitId || "";

    return typeof getLocalizedUnitLabel === "function"
        ? getLocalizedUnitLabel(unitId, fallback)
        : fallback;
}

function fillCategorySelect(select, selectedValue = "") {
    if (!select) return;

    select.innerHTML = categories
        .map(category => {
            const selected = category.id === selectedValue ? "selected" : "";

            return `
                <option value="${category.id}" ${selected}>
                    ${getCategoryLabel(category.id)}
                </option>
            `;
        })
        .join("");
}

function getSellerById(sellerId) {
    const sellers = readStorage("sellers");
    return sellers.find(seller => seller.id === sellerId);
}

function getSellerForUser(user = getCachedSupabaseUser()) {
    if (!user) return null;

    const sellers = readStorage("sellers");
    return sellers.find(seller => seller.ownerId === user.id) || null;
}

function isSellerOwnedByCurrentUser(seller, user = getCachedSupabaseUser()) {
    if (!seller) return false;
    if (!user) return false;

    return seller.ownerId === user.id;
}

function getSellerName(sellerId) {
    const seller = getSellerById(sellerId);

    if (!seller) {
        return typeof translateInterfaceValue === "function"
            ? translateInterfaceValue("sellerFallback")
            : "Продавець";
    }

    return typeof getLocalizedSellerName === "function"
        ? getLocalizedSellerName(seller)
        : seller.name;
}

function showMessage(element, text) {
    if (!element) return;
    element.textContent = typeof translateInterfaceText === "function"
        ? translateInterfaceText(text)
        : text;
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
    const currency = typeof getLocalizedCurrencyLabel === "function"
        ? getLocalizedCurrencyLabel()
        : "грн";

    return `${price} ${currency} / ${getUnitLabel(product.unit)}`;
}

function getProductDepartment(product) {
    if (typeof getLocalizedProductDepartment === "function") {
        return getLocalizedProductDepartment(product);
    }

    return String(product?.department || "").trim() || "Інше";
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

function getReadableFileSize(bytes) {
    if (!Number.isFinite(bytes)) return "0 МБ";

    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function getDataUrlBytes(dataUrl) {
    const base64 = String(dataUrl || "").split(",")[1] || "";
    return Math.ceil((base64.length * 3) / 4);
}

function drawImageToDataUrl(image, maxSize, quality) {
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");

    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", quality);
}

function resizeImageFile(file, options = {}) {
    const limits = {
        ...imageLimits.product,
        ...options
    };

    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith("image/")) {
            reject(new Error("not-image"));
            return;
        }

        if (file.size > limits.maxOriginalBytes) {
            reject(new Error("too-large"));
            return;
        }

        const reader = new FileReader();

        reader.addEventListener("error", reject);

        reader.addEventListener("load", () => {
            const image = new Image();

            image.addEventListener("error", reject);

            image.addEventListener("load", () => {
                let quality = limits.startQuality;
                let maxSize = limits.maxSize;
                let result = drawImageToDataUrl(image, maxSize, quality);

                while (
                    getDataUrlBytes(result) > limits.maxOutputBytes &&
                    quality > limits.minQuality
                ) {
                    quality = Math.max(limits.minQuality, quality - 0.08);
                    result = drawImageToDataUrl(image, maxSize, quality);
                }

                while (getDataUrlBytes(result) > limits.maxOutputBytes && maxSize > 760) {
                    maxSize = Math.round(maxSize * 0.86);
                    result = drawImageToDataUrl(image, maxSize, limits.minQuality);
                }

                resolve({
                    dataUrl: result,
                    originalBytes: file.size,
                    compressedBytes: getDataUrlBytes(result)
                });
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
