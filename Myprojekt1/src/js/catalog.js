/* Категории, карточки продавцов, витрина лавки и окна товаров. */

function formatSellerTime(value) {
    const time = String(value || "").trim();

    if (!time) return "--:--";

    const match = time.match(/^(\d{1,2}):(\d{2})/);

    if (!match) return time;

    return `${match[1].padStart(2, "0")}:${match[2]}`;
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
            <span>🕒 ${escapeHtml(formatSellerTime(seller.open))} - ${escapeHtml(formatSellerTime(seller.close))}</span>
        `;

        card.addEventListener("click", () => {
            openPage(`seller.html?seller=${encodeURIComponent(seller.id)}`);
        });

        container.appendChild(card);
    });
}

async function initCategoryPage() {
    const title = document.getElementById("categoryTitle");
    const sellerContainer = document.getElementById("categorySellers");
    const pageLabel = document.getElementById("categoryPageLabel");

    if (!title && !sellerContainer) return;

    const type = params.get("type");
    const search = (params.get("search") || "").trim().toLowerCase();
    const showFavorites = params.get("favorites") === "1";
    let sellers = readStorage("sellers");
    let products = readStorage("products");

    document.body.classList.toggle("favorites-page", showFavorites);

    if (showFavorites) {
        const favoriteIds = getFavoriteProducts();
        let favoriteProducts = products.filter(product => favoriteIds.includes(product.id));

        try {
            favoriteProducts = await fetchProductsByIdsFromSupabase(favoriteIds);
            sellers = readStorage("sellers");
        } catch (error) {
            console.warn("Favorites fallback", error);
        }

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
        let matchingProducts = [];

        try {
            matchingProducts = await searchProductsFromSupabase(search);
            sellers = readStorage("sellers");
        } catch (error) {
            console.warn("Search fallback", error);
            matchingProducts = products.filter(product => {
                const seller = sellers.find(item => item.id === product.seller);
                const text = `
                    ${product.name || ""}
                    ${product.description || ""}
                    ${getProductDepartment(product)}
                    ${getCategoryLabel(product.category)}
                    ${seller?.name || ""}
                    ${seller?.description || ""}
                `.toLowerCase();

                return text.includes(search);
            });
        }

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

    try {
        const categoryData = await fetchCategoryDataFromSupabase(type);
        sellers = categoryData.sellers;
        products = categoryData.products;
    } catch (error) {
        console.warn("Category fallback", error);
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

    const allProducts = readStorage("products");

    sellers.forEach(seller => {
        const card = document.createElement("div");
        card.className = "seller-card";
        card.dataset.seller = seller.id;
        const sellerProducts = allProducts.filter(product => product.seller === seller.id);
        const featuredIds = Array.isArray(seller.featuredProductIds)
            ? seller.featuredProductIds.slice(0, 3)
            : [];
        const featuredProducts = featuredIds
            .map(id => sellerProducts.find(product => product.id === id))
            .filter(Boolean);
        const productsToShow = featuredProducts.length
            ? featuredProducts
            : sellerProducts.slice(0, 3);
        const featuredMarkup = productsToShow.length
            ? `
                <div class="seller-featured-products">
                    ${productsToShow.map(product => {
                        const image = getProductImages(product)[0];

                        return `
                            <div class="seller-featured-product">
                                <div
                                    class="seller-featured-image ${image ? "has-image" : ""}"
                                    ${image ? `style="background-image: url('${escapeHtml(image)}')"` : ""}
                                ></div>
                                <strong>${escapeHtml(product.name)}</strong>
                                <small>${escapeHtml(getProductPriceText(product))}</small>
                            </div>
                        `;
                    }).join("")}
                </div>
            `
            : "";

        card.innerHTML = `
            <div class="seller-card-summary">
                <h3>${escapeHtml(seller.name)}</h3>
                <p>${escapeHtml(seller.description || "Описание пока не заполнено.")}</p>
                <span class="category-badge seller-category-badge ${escapeHtml(getCategoryClass(seller.category))}">
                    ${escapeHtml(getCategoryLabel(seller.category))}
                </span>
                <span>🕒 ${escapeHtml(formatSellerTime(seller.open))} - ${escapeHtml(formatSellerTime(seller.close))}</span>
            </div>
            ${featuredMarkup}
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
    const ownerMode = options.ownerMode === true;

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
            <span class="product-department-label">${escapeHtml(getProductDepartment(product))}</span>
            <h3>${escapeHtml(product.name)}</h3>
            <p class="product-description">
                ${escapeHtml(product.description || "Описание пока не заполнено.")}
            </p>
            <div class="product-info">
                <span>${escapeHtml(getProductPriceText(product))}</span>
            </div>
            ${
                getProductImages(product).length
                    ? `<span class="photo-chip">${getProductImages(product).length} фото</span>`
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
            ${
                ownerMode
                    ? `
                        <button
                            class="owner-edit-product-btn"
                            data-product="${escapeHtml(product.id)}"
                            type="button"
                        >
                            Редактировать
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

        card
            .querySelector(".owner-edit-product-btn")
            ?.addEventListener("click", event => {
                event.stopPropagation();
                openOwnerProductEditor(product);
            });

        container.appendChild(card);
    });
}

function openOwnerProductEditor(product) {
    const seller = getSellerById(currentSeller);

    if (!isSellerOwnedByCurrentUser(seller)) return;

    const modal = document.getElementById("ownerProductModal");

    if (!modal || product.seller !== currentSeller) return;

    modal.dataset.product = product.id;
    document.getElementById("ownerProductName").value = product.name || "";
    document.getElementById("ownerProductDepartment").value = product.department || "";
    document.getElementById("ownerProductPrice").value = product.priceLabel || product.price || "";
    document.getElementById("ownerProductUnit").value = product.unit || "kg";
    document.getElementById("ownerProductDescription").value = product.description || "";
    showMessage(document.getElementById("ownerProductMessage"), "");
    modal.style.display = "flex";
}

function initOwnerProductEditor() {
    const modal = document.getElementById("ownerProductModal");
    const saveButton = document.getElementById("saveOwnerProductBtn");
    const cancelButton = document.getElementById("cancelOwnerProductBtn");
    const seller = getSellerById(currentSeller);

    if (!modal || !isSellerOwnedByCurrentUser(seller)) return;

    saveButton?.addEventListener("click", async () => {
        const products = readStorage("products");
        const productIndex = products.findIndex(product => {
            return product.id === modal.dataset.product && product.seller === currentSeller;
        });

        if (productIndex === -1) return;

        const name = document.getElementById("ownerProductName").value.trim();
        const price = normalizeProductPrice(document.getElementById("ownerProductPrice").value);

        if (!name || !price) {
            showMessage(
                document.getElementById("ownerProductMessage"),
                "Введите название и цену."
            );
            return;
        }

        if (!isValidProductPrice(price)) {
            showMessage(
                document.getElementById("ownerProductMessage"),
                "Цена может быть числом или диапазоном, например 630/650."
            );
            return;
        }

        const oldProduct = products[productIndex];
        const oldPrice = oldProduct.priceLabel || oldProduct.price;
        const now = new Date().toISOString();

        const updatedProduct = {
            ...oldProduct,
            name,
            department: document.getElementById("ownerProductDepartment").value.trim(),
            price,
            priceLabel: price,
            unit: document.getElementById("ownerProductUnit").value,
            description: document.getElementById("ownerProductDescription").value.trim(),
            updatedAt: now,
            priceChangedAt: oldPrice !== price
                ? now
                : (oldProduct.priceChangedAt || null)
        };

        saveButton.disabled = true;

        try {
            products[productIndex] = isSupabaseReady()
                ? await saveProductToSupabase(updatedProduct)
                : updatedProduct;

            writeStorage("products", products);
            modal.style.display = "none";
            saveButton.disabled = false;
            initSellerPage();
        } catch (error) {
            console.warn("Owner product save failed", error);
            saveButton.disabled = false;
            showMessage(
                document.getElementById("ownerProductMessage"),
                `Не удалось сохранить товар: ${getSupabaseErrorMessage(error)}`
            );
        }
    });

    cancelButton?.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
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
    modalProductImages = getProductImages(product);
    modalProductImageIndex = 0;
    updateProductModalImage();
    title.textContent = product.name || "Товар";
    price.textContent = getProductPriceText(product);
    modal.style.display = "flex";
}

function updateProductModalImage() {
    const image = document.getElementById("productModalImage");

    if (!image) return;

    const currentImage = modalProductImages[modalProductImageIndex] || "";

    image.classList.toggle("has-image", Boolean(currentImage));
    image.style.backgroundImage = currentImage ? `url("${currentImage}")` : "";
    image.textContent = currentImage ? "" : "Фото товара";
}

async function initSellerPage() {
    const sellerPage = document.getElementById("sellerPage");
    const sellerProductsContainer = document.getElementById("sellerProducts");
    const departmentsContainer = document.getElementById("sellerDepartments");
    const editNavBtn = document.getElementById("sellerEditNavBtn");

    if (!sellerPage && !sellerProductsContainer) return;

    const seller = getSellerById(currentSeller);

    if (!seller) {
        sellerPage.innerHTML = `
            <h1 class="shop-title">Продавец не найден</h1>
            <p class="subtitle">Вернитесь на главную и выберите лавку заново.</p>
        `;
        return;
    }

    const ownerMode = isSellerOwnedByCurrentUser(seller);

    setBrandCategory(seller.category);
    document.body.classList.toggle("owner-mode", ownerMode);
    editNavBtn?.classList.toggle("hidden", !ownerMode);
    editNavBtn?.addEventListener("click", () => {
        openPage(`seller_panel.html?seller=${encodeURIComponent(seller.id)}`);
    });

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
        <p class="work-time">🕒 ${escapeHtml(formatSellerTime(seller.open))} - ${escapeHtml(formatSellerTime(seller.close))}</p>
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

    let products = readStorage("products")
        .filter(product => product.seller === currentSeller);

    try {
        products = await fetchProductsByShopFromSupabase(currentSeller);
    } catch (error) {
        console.warn("Seller products fallback", error);
    }

    if (departmentsContainer && products.length) {
        const departments = [...new Set(products.map(getProductDepartment))];

        departmentsContainer.classList.remove("hidden");
        departmentsContainer.innerHTML = "";

        departments.forEach((department, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `department-filter-btn ${index === 0 ? "is-active" : ""}`;
            button.textContent = department;

            button.addEventListener("click", () => {
                departmentsContainer
                    .querySelectorAll(".department-filter-btn")
                    .forEach(item => item.classList.remove("is-active"));

                button.classList.add("is-active");

                const filteredProducts = products
                    .filter(product => getProductDepartment(product) === department);

                renderCategoryProducts(sellerProductsContainer, filteredProducts, {
                    ownerMode
                });
            });

            departmentsContainer.appendChild(button);
        });

        renderCategoryProducts(
            sellerProductsContainer,
            products.filter(product => getProductDepartment(product) === departments[0]),
            { ownerMode }
        );
    } else {
        renderCategoryProducts(sellerProductsContainer, products, { ownerMode });
    }
}

function initModal() {
    document.addEventListener("click", event => {
        const modal = document.getElementById("modal");
        const contactModal = document.getElementById("contactModal");
        const productModal = document.getElementById("productModal");

        if (
            productModal &&
            productModal.style.display === "flex" &&
            event.target.id === "productModalImage" &&
            modalProductImages.length > 1
        ) {
            modalProductImageIndex = (modalProductImageIndex + 1) % modalProductImages.length;
            updateProductModalImage();
            return;
        }

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
