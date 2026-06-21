const params = new URLSearchParams(window.location.search);
let currentSeller = params.get("seller");
let editingProductIndex = null;
let selectedProductImage = "";
let selectedSellerCover = "";

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
    { id: "vegetables", icon: "♧", title: "Овощи" },
    { id: "fruits", icon: "🍊", title: "Фрукты" },
    { id: "milk", icon: "◌", title: "Молочка" },
    { id: "bakery", icon: "🥐", title: "Выпечка" },
    { id: "spices", icon: "♧", title: "Специи" },
    { id: "sweets", icon: "●", title: "Сладости" },
    { id: "clothing", icon: "△", title: "Одежда" },
    { id: "shoes", icon: "⌁", title: "Обувь" },
    { id: "electronics", icon: "ϟ", title: "Техника" },
    { id: "discount", icon: "◇", title: "Всё по 3" },
    { id: "pets", icon: "⋯", title: "Зоотовары" },
    { id: "other", icon: "◇", title: "Другое" }
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

function getProductPriceText(product) {
    return `${product.price} грн / ${getUnitLabel(product.unit)}`;
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

function initMainPage() {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const categoriesToggleBtn = document.getElementById("categoriesToggleBtn");
    const homeAllCategoriesPanel = document.getElementById("homeAllCategoriesPanel");
    const homeAllCategoriesGrid = document.getElementById("homeAllCategoriesGrid");
    const favoritesBtn = document.getElementById("favoritesBtn");
    const sellerStartBtn = document.getElementById("sellerStartBtn");
    const sellerCabinetsBtn = document.getElementById("sellerCabinetsBtn");

    const renderAllHomeCategories = () => {
        if (!homeAllCategoriesGrid) return;

        homeAllCategoriesGrid.innerHTML = homeCategorySuggestions
            .map(category => `
                <button
                    class="home-all-category-card ${escapeHtml(getCategoryClass(category.id))}"
                    data-category="${escapeHtml(category.id)}"
                    type="button"
                >
                    <span>${escapeHtml(category.icon)}</span>
                    <strong>${escapeHtml(category.title)}</strong>
                </button>
            `)
            .join("");
    };

    const toggleAllCategories = () => {
        if (!homeAllCategoriesPanel) return;

        const isOpen = homeAllCategoriesPanel.classList.toggle("is-open");

        homeAllCategoriesPanel.setAttribute("aria-hidden", String(!isOpen));
        categoriesToggleBtn?.setAttribute("aria-expanded", String(isOpen));
    };

    const startSearch = () => {
        const value = searchInput?.value.trim();

        if (!value) return;

        openPage(`category.html?search=${encodeURIComponent(value)}`);
    };

    searchBtn?.addEventListener("click", startSearch);

    searchInput?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            startSearch();
        }
    });

    renderAllHomeCategories();

    categoriesToggleBtn?.addEventListener("click", toggleAllCategories);

    homeAllCategoriesGrid?.addEventListener("click", event => {
        const card = event.target.closest(".home-all-category-card");
        const category = card?.dataset.category;

        if (!category) return;

        openPage(`category.html?type=${encodeURIComponent(category)}`);
    });

    favoritesBtn?.addEventListener("click", () => {
        openPage("category.html?favorites=1");
    });

    sellerStartBtn?.addEventListener("click", () => {
        openPage("create_seller.html");
    });

    sellerCabinetsBtn?.addEventListener("click", () => {
        openPage("create_seller.html");
    });
}

function initBackButtons() {
    const allCabinetsBtn = document.getElementById("allCabinetsBtn");

    document
        .querySelectorAll(".back-home-btn:not(#allCabinetsBtn)")
        .forEach(button => {
            button.addEventListener("click", () => {
                if (window.history.length > 1) {
                    window.history.back();
                    return;
                }

                openPage("index.html");
            });
        });

    allCabinetsBtn?.addEventListener("click", event => {
        event.stopPropagation();
        openPage("create_seller.html");
    });
}

function initCategoryCards() {
    document
        .querySelectorAll(".category-card")
        .forEach(card => {
            card.addEventListener("click", () => {
                const category = card.dataset.category;

                if (!category) return;

                openPage(`category.html?type=${encodeURIComponent(category)}`);
            });
        });
}

function initSellerCreation() {
    const createSellerBtn = document.getElementById("createSellerBtn");
    const sellerCategorySelect = document.getElementById("sellerCategory");

    fillCategorySelect(sellerCategorySelect);
    renderSellerCabinets();

    createSellerBtn?.addEventListener("click", () => {
        const name = document.getElementById("sellerName").value.trim();
        const description = document.getElementById("sellerDescription").value.trim();
        const category = document.getElementById("sellerCategory").value;
        const open = document.getElementById("openTime").value;
        const close = document.getElementById("closeTime").value;

        if (!name) return;

        const sellers = readStorage("sellers");
        const baseId = makeId(name) || `seller_${Date.now()}`;
        let id = baseId;
        let counter = 2;

        while (sellers.some(seller => seller.id === id)) {
            id = `${baseId}_${counter}`;
            counter += 1;
        }

        sellers.push({
            id,
            name,
            description,
            category,
            open,
            close,
            findInfo: "Информация о месте пока не заполнена.",
            phone: "",
            telegram: "",
            instagram: "",
            viber: ""
        });

        writeStorage("sellers", sellers);
        openPage(`seller_panel.html?seller=${encodeURIComponent(id)}`);
    });
}

function renderSellerCabinets() {
    const cabinetList = document.getElementById("sellerCabinetList");

    if (!cabinetList) return;

    const sellers = readStorage("sellers");

    cabinetList.innerHTML = "";

    if (!sellers.length) {
        cabinetList.innerHTML = `
            <div class="empty-card">
                Пока нет созданных лавок. Создайте первую выше.
            </div>
        `;
        return;
    }

    sellers.forEach(seller => {
        const card = document.createElement("div");
        card.className = "seller-card";

        card.innerHTML = `
            <h3>${escapeHtml(seller.name)}</h3>
            <p>${escapeHtml(seller.description || "Описание пока не заполнено.")}</p>
            <span class="category-badge seller-category-badge ${escapeHtml(getCategoryClass(seller.category))}">
                ${escapeHtml(getCategoryLabel(seller.category))}
            </span>

            <div class="product-actions">
                <button
                    class="edit-btn open-cabinet-btn"
                    data-seller="${escapeHtml(seller.id)}"
                    type="button"
                >
                    Редактировать лавку
                </button>

                <button
                    class="btn-outline open-shop-btn"
                    data-seller="${escapeHtml(seller.id)}"
                    type="button"
                >
                    Открыть витрину
                </button>
            </div>
        `;

        cabinetList.appendChild(card);
    });

    cabinetList
        .querySelectorAll(".open-cabinet-btn")
        .forEach(button => {
            button.addEventListener("click", () => {
                openPage(`seller_panel.html?seller=${encodeURIComponent(button.dataset.seller)}`);
            });
        });

    cabinetList
        .querySelectorAll(".open-shop-btn")
        .forEach(button => {
            button.addEventListener("click", () => {
                openPage(`seller.html?seller=${encodeURIComponent(button.dataset.seller)}`);
            });
        });
}

function initSellerPanel() {
    const saveProfileBtn = document.getElementById("saveSellerProfileBtn");
    const addProductBtn = document.getElementById("addProductBtn");

    if (!saveProfileBtn && !addProductBtn) return;

    const nameInput = document.getElementById("profileSellerName");
    const descriptionInput = document.getElementById("profileSellerDescription");
    const findInfoInput = document.getElementById("profileFindInfo");
    const phoneInput = document.getElementById("profilePhone");
    const telegramInput = document.getElementById("profileTelegram");
    const instagramInput = document.getElementById("profileInstagram");
    const viberInput = document.getElementById("profileViber");
    const categorySelect = document.getElementById("profileSellerCategory");
    const openInput = document.getElementById("profileOpenTime");
    const closeInput = document.getElementById("profileCloseTime");
    const productCategorySelect = document.getElementById("category");
    const productFormTitle = document.getElementById("productFormTitle");
    const cancelEditProductBtn = document.getElementById("cancelEditProductBtn");
    const productImageInput = document.getElementById("productImage");
    const productImagePreview = document.getElementById("productImagePreview");
    const productImageLabel = document.getElementById("productImageLabel");
    const productImageStatus = document.getElementById("productImageStatus");
    const removeProductImageBtn = document.getElementById("removeProductImageBtn");
    const sellerCoverInput = document.getElementById("sellerCoverImage");
    const sellerCoverPreview = document.getElementById("sellerCoverPreview");
    const removeSellerCoverBtn = document.getElementById("removeSellerCoverBtn");
    const profileMessage = document.getElementById("profileMessage");
    const productMessage = document.getElementById("productMessage");
    const toggleProfileBtn = document.getElementById("toggleProfileBtn");
    const sellerProfilePanel = document.getElementById("sellerProfilePanel");
    const seller = getSellerById(currentSeller);

    selectedSellerCover = seller?.coverImage || "";

    fillCategorySelect(categorySelect, seller?.category);
    fillCategorySelect(productCategorySelect);

    if (seller) {
        nameInput.value = seller.name || "";
        descriptionInput.value = seller.description || "";
        findInfoInput.value = seller.findInfo || "";
        phoneInput.value = seller.phone || "";
        telegramInput.value = seller.telegram || "";
        instagramInput.value = seller.instagram || "";
        viberInput.value = seller.viber || "";
        openInput.value = seller.open || "";
        closeInput.value = seller.close || "";
    }

    const updateSellerCoverPreview = () => {
        if (!sellerCoverPreview || !removeSellerCoverBtn) return;

        if (!selectedSellerCover) {
            sellerCoverPreview.classList.add("hidden");
            sellerCoverPreview.style.backgroundImage = "";
            removeSellerCoverBtn.classList.add("hidden");
            return;
        }

        sellerCoverPreview.classList.remove("hidden");
        sellerCoverPreview.style.backgroundImage = `url("${selectedSellerCover}")`;
        removeSellerCoverBtn.classList.remove("hidden");
    };

    const updateProductImagePreview = () => {
        if (!productImagePreview || !removeProductImageBtn) return;

        if (!selectedProductImage) {
            productImagePreview.classList.add("hidden");
            productImagePreview.style.backgroundImage = "";
            removeProductImageBtn.classList.add("hidden");
            productImageStatus?.classList.add("hidden");
            if (productImageLabel) {
                productImageLabel.textContent = "Добавить фото товара";
            }
            return;
        }

        productImagePreview.classList.remove("hidden");
        productImagePreview.style.backgroundImage = `url("${selectedProductImage}")`;
        removeProductImageBtn.classList.remove("hidden");

        if (productImageLabel) {
            productImageLabel.textContent = "Заменить фото товара";
        }

        if (productImageStatus) {
            productImageStatus.textContent = editingProductIndex !== null
                ? "✓ У товара уже есть фото"
                : "✓ Фото выбрано";
            productImageStatus.classList.remove("hidden");
        }
    };

    updateSellerCoverPreview();

    const setProfilePanelOpen = isOpen => {
        if (!toggleProfileBtn || !sellerProfilePanel) return;

        sellerProfilePanel.classList.toggle("is-collapsed", !isOpen);
        toggleProfileBtn.setAttribute("aria-expanded", String(isOpen));
        toggleProfileBtn.textContent = isOpen
            ? "Закрыть профиль"
            : "Редактировать лавку";
    };

    toggleProfileBtn?.addEventListener("click", () => {
        const isOpen = sellerProfilePanel?.classList.contains("is-collapsed");
        setProfilePanelOpen(Boolean(isOpen));
    });

    sellerCoverInput?.addEventListener("change", () => {
        const file = sellerCoverInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showMessage(profileMessage, "Выберите изображение для фона.");
            sellerCoverInput.value = "";
            return;
        }

        resizeImageFile(file)
            .then(imageData => {
                selectedSellerCover = imageData;
                updateSellerCoverPreview();
                showMessage(profileMessage, "Фон лавки выбран. Сохраните профиль.");
            })
            .catch(() => {
                selectedSellerCover = "";
                sellerCoverInput.value = "";
                updateSellerCoverPreview();
                showMessage(profileMessage, "Не удалось загрузить фон лавки.");
            });
    });

    removeSellerCoverBtn?.addEventListener("click", () => {
        selectedSellerCover = "";
        if (sellerCoverInput) {
            sellerCoverInput.value = "";
        }
        updateSellerCoverPreview();
        showMessage(profileMessage, "Фон убран. Сохраните профиль.");
    });

    const resetProductForm = () => {
        editingProductIndex = null;
        selectedProductImage = "";
        productFormTitle.textContent = "Добавить товар";
        addProductBtn.textContent = "Добавить товар";
        cancelEditProductBtn.classList.add("hidden");
        document.getElementById("productName").value = "";
        document.getElementById("price").value = "";
        document.getElementById("productDescription").value = "";
        if (productImageInput) {
            productImageInput.value = "";
        }
        updateProductImagePreview();
    };

    productImageInput?.addEventListener("change", () => {
        const file = productImageInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showMessage(productMessage, "Выберите изображение.");
            productImageInput.value = "";
            return;
        }

        resizeImageFile(file)
            .then(imageData => {
                selectedProductImage = imageData;
                updateProductImagePreview();
                showMessage(productMessage, "Фото выбрано и подготовлено.");
            })
            .catch(() => {
                showMessage(productMessage, "Не удалось загрузить фото.");
                selectedProductImage = "";
                productImageInput.value = "";
                updateProductImagePreview();
            });
    });

    removeProductImageBtn?.addEventListener("click", () => {
        selectedProductImage = "";
        if (productImageInput) {
            productImageInput.value = "";
        }
        updateProductImagePreview();
        showMessage(productMessage, "Фото убрано.");
    });

    cancelEditProductBtn?.addEventListener("click", () => {
        resetProductForm();
        showMessage(productMessage, "Редактирование отменено.");
    });

    saveProfileBtn?.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const findInfo = findInfoInput.value.trim();
        const phone = phoneInput.value.trim();
        const telegram = telegramInput.value.trim();
        const instagram = instagramInput.value.trim();
        const viber = viberInput.value.trim();
        const category = categorySelect.value;
        const open = openInput.value;
        const close = closeInput.value;

        if (!name) {
            showMessage(profileMessage, "Введите название лавки.");
            return;
        }

        const sellers = readStorage("sellers");
        let sellerIndex = sellers.findIndex(item => item.id === currentSeller);

        if (sellerIndex === -1) {
            currentSeller = makeId(name) || `seller_${Date.now()}`;
            sellerIndex = sellers.length;
        }

        const existingSeller = sellers[sellerIndex] || {};

        sellers[sellerIndex] = {
            ...existingSeller,
            id: currentSeller,
            name,
            description,
            category,
            open,
            close,
            findInfo,
            phone,
            telegram,
            instagram,
            viber,
            coverImage: selectedSellerCover
        };

        writeStorage("sellers", sellers);
        window.history.replaceState(null, "", `seller_panel.html?seller=${encodeURIComponent(currentSeller)}`);
        showMessage(profileMessage, "Профиль лавки сохранён.");
        renderPanelProducts();
        setProfilePanelOpen(false);
    });

    addProductBtn?.addEventListener("click", () => {
        if (!currentSeller) {
            showMessage(productMessage, "Сначала сохраните профиль лавки.");
            return;
        }

        const name = document.getElementById("productName").value.trim();
        const category = document.getElementById("category").value;
        const price = document.getElementById("price").value.trim();
        const unit = document.getElementById("unit").value;
        const description = document.getElementById("productDescription").value.trim();

        if (!name || !price) {
            showMessage(productMessage, "Введите название товара и цену.");
            return;
        }

        const products = readStorage("products");

        if (editingProductIndex !== null) {
            const oldProduct = products[editingProductIndex];

            if (!oldProduct || oldProduct.seller !== currentSeller) {
                showMessage(productMessage, "Не удалось найти товар для редактирования.");
                resetProductForm();
                return;
            }

            products[editingProductIndex] = {
                ...oldProduct,
                name,
                category,
                price,
                unit,
                description,
                image: selectedProductImage
            };
        } else {
            products.push({
                id: `product_${Date.now()}`,
                seller: currentSeller,
                name,
                category,
                price,
                unit,
                description,
                image: selectedProductImage
            });
        }

        writeStorage("products", products);
        showMessage(
            productMessage,
            editingProductIndex !== null ? "Товар сохранён." : "Товар добавлен."
        );
        resetProductForm();
        renderPanelProducts();
    });

    renderPanelProducts();
}

function renderPanelProducts() {
    const productList = document.getElementById("productList");

    if (!productList) return;

    const products = readStorage("products");
    const sellerProducts = products
        .map((product, index) => ({ ...product, storageIndex: index }))
        .filter(product => product.seller === currentSeller);

    productList.innerHTML = "";

    if (!sellerProducts.length) {
        productList.innerHTML = `
            <div class="empty-card">
                Пока товаров нет. Добавьте первый товар выше.
            </div>
        `;
        return;
    }

    sellerProducts.forEach(product => {
        const div = document.createElement("div");
        div.className = "product-card";

        div.innerHTML = `
            <h3>${escapeHtml(product.name)}</h3>
            <p class="product-description">
                ${escapeHtml(product.description || "Описание пока не заполнено.")}
            </p>
            <div class="product-info">
                <span>${escapeHtml(getProductPriceText(product))}</span>
            </div>
            ${
                product.image
                    ? `<span class="photo-chip">Фото</span>`
                    : ""
            }
            <div class="product-actions">
                <button class="edit-btn" data-index="${product.storageIndex}">
                    Редактировать
                </button>

                <button class="delete-btn" data-index="${product.storageIndex}">
                    Удалить
                </button>
            </div>
        `;

        productList.appendChild(div);
    });

    document
        .querySelectorAll(".edit-btn")
        .forEach(button => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.index);
                const products = readStorage("products");
                const product = products[index];

                if (!product || product.seller !== currentSeller) return;

                editingProductIndex = index;
                document.getElementById("productName").value = product.name || "";
                document.getElementById("category").value = product.category || "other";
                document.getElementById("price").value = product.price || "";
                document.getElementById("unit").value = product.unit || "kg";
                document.getElementById("productDescription").value = product.description || "";
                selectedProductImage = product.image || "";
                updateProductImagePreview();
                document.getElementById("productFormTitle").textContent = "Редактировать товар";
                document.getElementById("addProductBtn").textContent = "Сохранить товар";
                document.getElementById("cancelEditProductBtn").classList.remove("hidden");
                showMessage(document.getElementById("productMessage"), "Редактируете товар.");
                document.getElementById("productName").focus();
            });
        });

    document
        .querySelectorAll(".delete-btn")
        .forEach(button => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.index);
                const products = readStorage("products");

                products.splice(index, 1);
                writeStorage("products", products);
                editingProductIndex = null;
                renderPanelProducts();
            });
        });
}

function renderSellersList(containerId, filterCategory = "") {
    const container = document.getElementById(containerId);

    if (!container) return;

    const sellers = readStorage("sellers")
        .filter(seller => !filterCategory || seller.category === filterCategory);

    container.innerHTML = "";

    if (!sellers.length) {
        container.innerHTML = `
            <div class="empty-card">
                В этой категории пока нет продавцов.
            </div>
        `;
        return;
    }

    sellers.forEach(seller => {
        const card = document.createElement("div");
        card.className = "seller-card";
        card.dataset.seller = seller.id;

        card.innerHTML = `
            <h3>${escapeHtml(seller.name)}</h3>
            <p>${escapeHtml(seller.description || "Описание пока не заполнено.")}</p>
            <span class="category-badge seller-category-badge ${escapeHtml(getCategoryClass(seller.category))}">
                ${escapeHtml(getCategoryLabel(seller.category))}
            </span>
            <span>🕒 ${escapeHtml(seller.open || "--:--")} - ${escapeHtml(seller.close || "--:--")}</span>
        `;

        card.addEventListener("click", () => {
            openPage(`seller.html?seller=${encodeURIComponent(seller.id)}`);
        });

        container.appendChild(card);
    });
}

function initFishPage() {
    renderSellersList("fishSellers", "fish");
}

function initCategoryPage() {
    const title = document.getElementById("categoryTitle");
    const sellerContainer = document.getElementById("categorySellers");
    const pageLabel = document.getElementById("categoryPageLabel");

    if (!title && !sellerContainer) return;

    const type = params.get("type");
    const search = (params.get("search") || "").trim().toLowerCase();
    const showFavorites = params.get("favorites") === "1";
    const sellers = readStorage("sellers");
    const products = readStorage("products");

    if (showFavorites) {
        const favoriteIds = getFavoriteProducts();
        const favoriteProducts = products.filter(product => favoriteIds.includes(product.id));

        if (pageLabel) {
            pageLabel.textContent = "Избранные товары";
            pageLabel.classList.remove("hidden");
        }

        renderCategoryProducts(sellerContainer, favoriteProducts, {
            showSellerLink: true
        });
        return;
    }

    if (search) {
        const matchingProducts = products.filter(product => {
            const seller = sellers.find(item => item.id === product.seller);
            const text = `
                ${product.name || ""}
                ${product.description || ""}
                ${getCategoryLabel(product.category)}
                ${seller?.name || ""}
                ${seller?.description || ""}
            `.toLowerCase();

            return text.includes(search);
        });

        if (pageLabel) {
            pageLabel.textContent = `Найденные товары: «${params.get("search")}»`;
            pageLabel.classList.remove("hidden");
        }

        renderCategoryProducts(sellerContainer, matchingProducts, {
            showSellerLink: true
        });
        return;
    }

    if (title) {
        if (search) {
            title.textContent = `Поиск: ${params.get("search")}`;
        } else {
            title.textContent = type ? getCategoryLabel(type) : "Все категории";
        }
    }

    if (type) {
        setBrandCategory(type);
    }

    const filteredSellers = sellers.filter(seller => {
        if (!type) return true;

        const hasProductInCategory = products.some(product => {
            return product.seller === seller.id && product.category === type;
        });

        return seller.category === type || hasProductInCategory;
    });

    renderCategorySellers(sellerContainer, filteredSellers);
}

function renderCategorySellers(container, sellers) {
    if (!container) return;

    container.classList.add("sellers-list");
    container.classList.remove("product-list");

    container.innerHTML = "";

    if (!sellers.length) {
        container.innerHTML = `
            <div class="empty-card">
                В этой категории пока никого нет.
            </div>
        `;
        return;
    }

    sellers.forEach(seller => {
        const card = document.createElement("div");
        card.className = "seller-card";
        card.dataset.seller = seller.id;

        card.innerHTML = `
            <h3>${escapeHtml(seller.name)}</h3>
            <p>${escapeHtml(seller.description || "Описание пока не заполнено.")}</p>
            <span class="category-badge seller-category-badge ${escapeHtml(getCategoryClass(seller.category))}">
                ${escapeHtml(getCategoryLabel(seller.category))}
            </span>
            <span>🕒 ${escapeHtml(seller.open || "--:--")} - ${escapeHtml(seller.close || "--:--")}</span>
        `;

        card.addEventListener("click", () => {
            openPage(`seller.html?seller=${encodeURIComponent(seller.id)}`);
        });

        container.appendChild(card);
    });
}

function renderCategoryProducts(container, products, options = {}) {
    if (!container) return;

    const showSellerLink = options.showSellerLink === true;

    container.classList.add("product-list");
    container.classList.remove("sellers-list");

    container.innerHTML = "";

    if (!products.length) {
        container.innerHTML = `
            <div class="empty-card">
                Товары пока не найдены.
            </div>
        `;
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        const isFavorite = isFavoriteProduct(product.id);

        card.innerHTML = `
            <button
                class="favorite-btn ${isFavorite ? "is-active" : ""}"
                data-product="${escapeHtml(product.id)}"
                type="button"
                aria-label="Добавить в избранное"
            >
                ${isFavorite ? "★" : "☆"}
            </button>
            <h3>${escapeHtml(product.name)}</h3>
            <p class="product-description">
                ${escapeHtml(product.description || "Описание пока не заполнено.")}
            </p>
            <div class="product-info">
                <span>${escapeHtml(getProductPriceText(product))}</span>
            </div>
            ${
                product.image
                    ? `<span class="photo-chip">Фото</span>`
                    : ""
            }
            ${
                showSellerLink
                    ? `
                        <button
                            class="product-seller-link"
                            data-seller="${escapeHtml(product.seller)}"
                            type="button"
                        >
                            <span class="seller-link-full">
                                Лавка: ${escapeHtml(getSellerName(product.seller))}
                            </span>
                            <span class="seller-link-short">В лавку</span>
                        </button>
                    `
                    : ""
            }
        `;

        card.addEventListener("click", event => {
            event.stopPropagation();
            openProductModal(product);
        });

        card
            .querySelector(".favorite-btn")
            ?.addEventListener("click", event => {
                event.stopPropagation();
                toggleFavoriteProduct(product.id);
                renderCategoryProducts(container, products, options);
            });

        card
            .querySelector(".product-seller-link")
            ?.addEventListener("click", event => {
                event.stopPropagation();
                openPage(`seller.html?seller=${encodeURIComponent(product.seller)}`);
            });

        container.appendChild(card);
    });
}

function openProductModal(product) {
    const modal = document.getElementById("productModal");
    const image = document.getElementById("productModalImage");
    const title = document.getElementById("productModalTitle");
    const price = document.getElementById("productModalPrice");

    if (!modal || !image || !title || !price) return;

    categories.forEach(category => {
        modal.classList.remove(getCategoryClass(category.id));
    });
    modal.classList.add(getCategoryClass(product.category));
    image.classList.toggle("has-image", Boolean(product.image));
    image.style.backgroundImage = product.image ? `url("${product.image}")` : "";
    image.textContent = product.image ? "" : "Фото товара";
    title.textContent = product.name || "Товар";
    price.textContent = getProductPriceText(product);
    modal.style.display = "flex";
}

function initSellerPage() {
    const sellerPage = document.getElementById("sellerPage");
    const sellerProductsContainer = document.getElementById("sellerProducts");

    if (!sellerPage && !sellerProductsContainer) return;

    const seller = getSellerById(currentSeller);

    if (!seller) {
        sellerPage.innerHTML = `
            <h1 class="shop-title">Продавец не найден</h1>
            <p class="subtitle">Вернитесь на главную и выберите лавку заново.</p>
        `;
        return;
    }

    setBrandCategory(seller.category);

    sellerPage.classList.toggle("has-cover", Boolean(seller.coverImage));

    if (seller.coverImage) {
        sellerPage.style.setProperty(
            "--seller-cover-image",
            `url("${seller.coverImage}")`
        );
    } else {
        sellerPage.style.removeProperty("--seller-cover-image");
    }

    sellerPage.innerHTML = `
        <h1 class="shop-title">${escapeHtml(seller.name)}</h1>
        <p class="subtitle">${escapeHtml(seller.description || "Описание пока не заполнено.")}</p>
        <p class="work-time">
            <span class="category-badge seller-category-badge ${escapeHtml(getCategoryClass(seller.category))}">
                ${escapeHtml(getCategoryLabel(seller.category))}
            </span>
        </p>
        <p class="work-time">🕒 ${escapeHtml(seller.open || "--:--")} - ${escapeHtml(seller.close || "--:--")}</p>
        <div class="seller-actions">
            <button id="findBtn" class="btn-outline">Как найти</button>
            <button id="contactBtn" class="btn-outline">Связаться</button>
        </div>
    `;

    const findModalText = document.getElementById("findModalText");

    if (findModalText) {
        findModalText.textContent =
            seller.findInfo || "Информация о месте пока не заполнена.";
    }

    const phoneLink = document.getElementById("sellerPhoneLink");
    const contactLinks = [
        [document.getElementById("sellerTelegramLink"), getSocialHref(seller.telegram, "telegram")],
        [document.getElementById("sellerInstagramLink"), getSocialHref(seller.instagram, "instagram")],
        [document.getElementById("sellerViberLink"), getSocialHref(seller.viber, "viber")]
    ];

    if (phoneLink) {
        const phoneHref = getPhoneHref(seller.phone);
        phoneLink.textContent = seller.phone || "Номер пока не указан";
        phoneLink.classList.toggle("is-empty", !phoneHref);

        if (phoneHref) {
            phoneLink.setAttribute("href", phoneHref);
        } else {
            phoneLink.removeAttribute("href");
        }
    }

    contactLinks.forEach(([link, href]) => {
        if (!link) return;

        link.classList.toggle("is-empty", !href);

        if (href) {
            link.setAttribute("href", href);
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
        } else {
            link.removeAttribute("href");
            link.removeAttribute("target");
            link.removeAttribute("rel");
        }
    });

    const products = readStorage("products")
        .filter(product => product.seller === currentSeller);

    renderCategoryProducts(sellerProductsContainer, products);
}

function initModal() {
    document.addEventListener("click", event => {
        const modal = document.getElementById("modal");
        const contactModal = document.getElementById("contactModal");
        const productModal = document.getElementById("productModal");

        if (productModal && productModal.style.display === "flex") {
            productModal.style.display = "none";
            return;
        }

        if (!modal) return;

        if (event.target.id === "findBtn") {
            modal.style.display = "flex";
            return;
        }

        if (event.target.id === "contactBtn") {
            if (contactModal) contactModal.style.display = "flex";
            return;
        }

        const openInfoModal = event.target.closest(".info-modal");

        if (openInfoModal && openInfoModal.style.display === "flex") {
            if (event.target.closest("a[href]")) {
                openInfoModal.style.display = "none";
                return;
            }

            openInfoModal.style.display = "none";
            return;
        }

        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}

initBrandHeader();
initCategoryColors();
initMainPage();
initBackButtons();
initCategoryCards();
initSellerCreation();
initSellerPanel();
initFishPage();
initCategoryPage();
initSellerPage();
initModal();
