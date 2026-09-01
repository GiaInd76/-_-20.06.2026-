/* Категорії, картки продавців, вітрина торгової точки та вікна товарів. */

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
                ${escapeHtml(translateInterfaceValue("noCategorySellers"))}
            </div>
        `;
        return;
    }

    sellers.forEach(seller => {
        const card = document.createElement("div");
        card.className = "seller-card";
        card.dataset.seller = seller.id;

        card.innerHTML = `
            <h3>${escapeHtml(getLocalizedSellerName(seller))}</h3>
            <p>${escapeHtml(getLocalizedSellerDescription(seller))}</p>
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
            pageLabel.textContent = translateInterfaceValue("favoriteProducts");
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
                    ${getLocalizedProductName(product) || ""}
                    ${getLocalizedProductDescription(product) || ""}
                    ${getProductDepartment(product)}
                    ${getCategoryLabel(product.category)}
                    ${seller ? getLocalizedSellerName(seller) : ""}
                    ${seller ? getLocalizedSellerDescription(seller) : ""}
                `.toLowerCase();

                return text.includes(search);
            });
        }

        if (pageLabel) {
            pageLabel.textContent = `${translateInterfaceValue("updatedPricePrefix")}: «${params.get("search")}»`;
            pageLabel.classList.remove("hidden");
        }

        renderCategoryProducts(sellerContainer, matchingProducts, {
            showSellerLink: true
        });
        return;
    }

    if (title) {
        if (search) {
            title.textContent = `${translateInterfaceValue("searchPrefix")}: ${params.get("search")}`;
        } else {
            title.textContent = type ? getCategoryLabel(type) : translateInterfaceValue("allCategories");
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

    if (!window.categoryLanguageListenerAdded) {
        window.categoryLanguageListenerAdded = true;
        window.addEventListener("privoz-language-change", initCategoryPage);
    }
}

function renderCategorySellers(container, sellers) {
    if (!container) return;

    container.classList.add("sellers-list");
    container.classList.remove("product-list");

    container.innerHTML = "";

    if (!sellers.length) {
        container.innerHTML = `
            <div class="empty-card">
                ${escapeHtml(translateInterfaceValue("noCategoryShops"))}
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
                                <strong>${escapeHtml(getLocalizedProductName(product))}</strong>
                                <small>${escapeHtml(getProductPriceText(product))}</small>
                            </div>
                        `;
                    }).join("")}
                </div>
            `
            : "";

        card.innerHTML = `
            <div class="seller-card-summary">
                <h3>${escapeHtml(getLocalizedSellerName(seller))}</h3>
                <p>${escapeHtml(getLocalizedSellerDescription(seller))}</p>
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
                ${escapeHtml(translateInterfaceValue("noProductsFound"))}
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
                aria-label="${escapeHtml(translateInterfaceValue("addFavorite"))}"
            >
                ${isFavorite ? "★" : "☆"}
            </button>
            <span class="product-department-label">${escapeHtml(getProductDepartment(product))}</span>
            <h3>${escapeHtml(getLocalizedProductName(product))}</h3>
            <p class="product-description">
                ${escapeHtml(getLocalizedProductDescription(product))}
            </p>
            <div class="product-info">
                <span>${escapeHtml(getProductPriceText(product))}</span>
            </div>
            ${
                getProductImages(product).length
                    ? `<span class="photo-chip">${escapeHtml(getLocalizedPhotoCount(getProductImages(product).length))}</span>`
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
                                ${escapeHtml(translateInterfaceValue("shopPrefix"))}: ${escapeHtml(getSellerName(product.seller))}
                            </span>
                            <span class="seller-link-short">${escapeHtml(translateInterfaceValue("goShop"))}</span>
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
                            ${escapeHtml(translateInterfaceValue("edit"))}
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
                translateInterfaceValue("enterNameAndPrice")
            );
            return;
        }

        if (!isValidProductPrice(price)) {
            showMessage(
                document.getElementById("ownerProductMessage"),
                translateInterfaceValue("invalidPrice")
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
                `${translateInterfaceValue("saveProduct")}: ${getSupabaseErrorMessage(error)}`
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

async function initSellerPage() {
    const sellerPage = document.getElementById("sellerPage");
    const sellerProductsContainer = document.getElementById("sellerProducts");
    const departmentsContainer = document.getElementById("sellerDepartments");
    const editNavBtn = document.getElementById("sellerEditNavBtn");

    if (!sellerPage && !sellerProductsContainer) return;

    if (!window.sellerPageLanguageListenerAdded) {
        window.sellerPageLanguageListenerAdded = true;
        window.addEventListener("privoz-language-change", initSellerPage);
    }

    const seller = getSellerById(currentSeller);

    if (!seller) {
        sellerPage.innerHTML = `
            <h1 class="shop-title">${escapeHtml(translateInterfaceValue("shopNotFound"))}</h1>
            <p class="subtitle">${escapeHtml(translateInterfaceValue("backHomeChooseShop"))}</p>
        `;
        return;
    }

    const ownerMode = isSellerOwnedByCurrentUser(seller);

    setBrandCategory(seller.category);
    document.body.classList.toggle("owner-mode", ownerMode);
    editNavBtn?.classList.toggle("hidden", !ownerMode);
    if (editNavBtn) {
        editNavBtn.onclick = () => {
            openPage(`seller_panel.html?seller=${encodeURIComponent(seller.id)}`);
        };
    }

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
        <h1 class="shop-title">${escapeHtml(getLocalizedSellerName(seller))}</h1>
        <p class="subtitle">${escapeHtml(getLocalizedSellerDescription(seller))}</p>
        <p class="work-time">
            <a
                class="category-badge seller-category-badge seller-category-link ${escapeHtml(getCategoryClass(seller.category))}"
                href="category.html?type=${encodeURIComponent(seller.category || "other")}"
            >
                ${escapeHtml(getCategoryLabel(seller.category))}
            </a>
        </p>
        <p class="work-time">🕒 ${escapeHtml(formatSellerTime(seller.open))} - ${escapeHtml(formatSellerTime(seller.close))}</p>
        <div class="seller-actions">
            <button id="findBtn" class="btn-outline">${escapeHtml(translateInterfaceValue("howToFind"))}</button>
            <button id="sellerQrBtn" class="btn-outline">${escapeHtml(translateInterfaceValue("pageQrCode"))}</button>
            <button id="contactBtn" class="btn-outline">${escapeHtml(translateInterfaceValue("contact"))}</button>
        </div>
    `;

    const qrTitle = document.getElementById("sellerQrTitle");
    const qrHint = document.getElementById("sellerQrHint");
    const qrCloseButton = document.getElementById("sellerQrCloseBtn");

    if (qrTitle) qrTitle.textContent = translateInterfaceValue("pageQrTitle");
    if (qrHint) qrHint.textContent = translateInterfaceValue("pageQrHint");
    if (qrCloseButton) qrCloseButton.setAttribute("aria-label", translateInterfaceValue("close"));

    const findModalText = document.getElementById("findModalText");

    if (findModalText) {
        findModalText.textContent = getLocalizedSellerFindInfo(seller);
    }

    const phoneLink = document.getElementById("sellerPhoneLink");
    const contactLinks = [
        [document.getElementById("sellerTelegramLink"), getSocialHref(seller.telegram, "telegram")],
        [document.getElementById("sellerInstagramLink"), getSocialHref(seller.instagram, "instagram")],
        [document.getElementById("sellerViberLink"), getSocialHref(seller.viber, "viber")]
    ];

    if (phoneLink) {
        const phoneHref = getPhoneHref(seller.phone);
        phoneLink.textContent = seller.phone || translateInterfaceValue("noPhone");
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
