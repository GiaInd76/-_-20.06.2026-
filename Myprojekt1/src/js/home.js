/* Главная страница, навигация, создание лавки и список кабинетов. */

function initMainPage() {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const categoriesToggleBtn = document.getElementById("categoriesToggleBtn");
    const homeAllCategoriesPanel = document.getElementById("homeAllCategoriesPanel");
    const homeAllCategoriesGrid = document.getElementById("homeAllCategoriesGrid");
    const favoritesBtn = document.getElementById("favoritesBtn");
    const sellerStartBtn = document.getElementById("sellerStartBtn");
    const sellerCabinetsBtn = document.getElementById("sellerCabinetsBtn");
    const sellerChoiceModal = document.getElementById("sellerChoiceModal");
    const sellerCabinetChoice = document.getElementById("sellerCabinetChoice");
    const sellerEditChoice = document.getElementById("sellerEditChoice");
    const sellerNewChoice = document.getElementById("sellerNewChoice");
    const homeOffersGrid = document.getElementById("homeOffersGrid");
    const offersFilterBtn = document.getElementById("offersFilterBtn");
    const offersFilterPanel = document.getElementById("offersFilterPanel");
    const offersFilterKey = "homeOfferCategories";

    const showSellerChoiceMessage = text => {
        if (!sellerChoiceModal) return;

        let message = sellerChoiceModal.querySelector(".seller-choice-message");

        if (!message) {
            message = document.createElement("p");
            message.className = "seller-choice-message form-message";
            sellerChoiceModal.querySelector(".seller-choice-content")?.appendChild(message);
        }

        message.textContent = text;
    };

    const getOfferCategoryFilters = () => {
        const savedFilters = readStorage(offersFilterKey, []);

        return Array.isArray(savedFilters) ? savedFilters : [];
    };

    const saveOfferCategoryFilters = filters => {
        writeStorage(offersFilterKey, filters);
    };

    const updateOffersFilterButton = filters => {
        if (!offersFilterBtn) return;

        offersFilterBtn.textContent = filters.length
            ? `${translateInterfaceValue("offers")} · ${filters.length}`
            : translateInterfaceValue("offers");
    };

    const renderOffersFilterPanel = () => {
        if (!offersFilterPanel) return;

        const activeFilters = getOfferCategoryFilters();

        offersFilterPanel.innerHTML = `
            <label class="offers-filter-option">
                <input type="checkbox" value="all" ${activeFilters.length ? "" : "checked"}>
                <span>${escapeHtml(translateInterfaceValue("all"))}</span>
            </label>
            ${categories.map(category => `
                <label class="offers-filter-option">
                    <input
                        type="checkbox"
                        value="${escapeHtml(category.id)}"
                        ${activeFilters.includes(category.id) ? "checked" : ""}
                    >
                    <span>${escapeHtml(getCategoryLabel(category.id))}</span>
                </label>
            `).join("")}
        `;

        updateOffersFilterButton(activeFilters);
    };

    const renderHomeOffers = async () => {
        if (!homeOffersGrid) return;

        const activeFilters = getOfferCategoryFilters();
        let products = [];

        try {
            products = await fetchLatestProductsFromSupabase(activeFilters, 6);
        } catch (error) {
            console.warn("Home offers fallback", error);
            products = readStorage("products")
                .filter(product => {
                    return !activeFilters.length || activeFilters.includes(product.category);
                })
                .map((product, index) => ({ product, index }))
                .sort((first, second) => {
                    const firstDate = Date.parse(
                        first.product.priceChangedAt ||
                        first.product.updatedAt ||
                        first.product.createdAt ||
                        ""
                    );
                    const secondDate = Date.parse(
                        second.product.priceChangedAt ||
                        second.product.updatedAt ||
                        second.product.createdAt ||
                        ""
                    );

                    return (secondDate || second.index) - (firstDate || first.index);
                })
                .slice(0, 6)
                .map(item => item.product);
        }

        if (!products.length) {
            homeOffersGrid.innerHTML = `
                <div class="home-offers-empty">
                    <span>✦</span>
                    <p>${activeFilters.length
                        ? translateInterfaceValue("noFreshOffersInSelectedCategories")
                        : translateInterfaceValue("emptyOffers")}</p>
                </div>
            `;
            return;
        }

        homeOffersGrid.innerHTML = products.map(product => {
            const hasNewPrice = Boolean(product.priceChangedAt);
            const isFavorite = isFavoriteProduct(product.id);

            return `
                <article
                    class="home-offer-card"
                    data-product="${escapeHtml(product.id)}"
                    data-seller="${escapeHtml(product.seller)}"
                >
                    <button
                        class="home-offer-photo"
                        type="button"
                        aria-label="${escapeHtml(translateInterfaceValue("viewProductPhoto"))}: ${escapeHtml(getLocalizedProductName(product))}"
                    >
                        <span class="home-offer-image"></span>
                    </button>
                    <button
                        class="home-offer-favorite ${isFavorite ? "is-active" : ""}"
                        type="button"
                        aria-label="${escapeHtml(translateInterfaceValue("addProductFavorite"))}"
                    >${isFavorite ? "★" : "☆"}</button>
                    <span class="home-offer-badge">${hasNewPrice ? translateInterfaceValue("priceUpdated") : translateInterfaceValue("newBadge")}</span>
                    <strong>${escapeHtml(getLocalizedProductName(product))}</strong>
                    <small>${escapeHtml(getProductPriceText(product))}</small>
                    <button class="home-offer-shop" type="button">${escapeHtml(translateInterfaceValue("goShop"))}</button>
                </article>
            `;
        }).join("");

        homeOffersGrid.querySelectorAll(".home-offer-card").forEach((card, index) => {
            const image = getProductImages(products[index])[0];
            const imageElement = card.querySelector(".home-offer-image");

            if (image && imageElement) {
                imageElement.style.backgroundImage = `url("${image}")`;
                imageElement.classList.add("has-image");
            }
        });
    };

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
                    <strong>${escapeHtml(getCategoryLabel(category.id))}</strong>
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
    renderOffersFilterPanel();
    renderHomeOffers();

    categoriesToggleBtn?.addEventListener("click", toggleAllCategories);

    offersFilterBtn?.addEventListener("click", () => {
        if (!offersFilterPanel) return;

        const isOpen = offersFilterPanel.classList.toggle("is-open");

        offersFilterPanel.setAttribute("aria-hidden", String(!isOpen));
        offersFilterBtn.setAttribute("aria-expanded", String(isOpen));
    });

    offersFilterPanel?.addEventListener("change", event => {
        const input = event.target.closest("input");

        if (!input) return;

        if (input.value === "all") {
            saveOfferCategoryFilters([]);
            renderOffersFilterPanel();
            renderHomeOffers();
            return;
        }

        const selectedFilters = Array.from(
            offersFilterPanel.querySelectorAll("input:not([value='all']):checked")
        ).map(item => item.value);

        saveOfferCategoryFilters(selectedFilters);
        renderOffersFilterPanel();
        renderHomeOffers();
    });

    homeAllCategoriesGrid?.addEventListener("click", event => {
        const card = event.target.closest(".home-all-category-card");
        const category = card?.dataset.category;

        if (!category) return;

        openPage(`category.html?type=${encodeURIComponent(category)}`);
    });

    homeOffersGrid?.addEventListener("click", event => {
        const card = event.target.closest(".home-offer-card");
        const productId = card?.dataset.product;
        const sellerId = card?.dataset.seller;
        const product = readStorage("products")
            .find(item => item.id === productId);

        if (!card || !product) return;
        event.stopPropagation();

        if (event.target.closest(".home-offer-favorite")) {
            toggleFavoriteProduct(product.id);
            renderHomeOffers();
            return;
        }

        if (event.target.closest(".home-offer-photo")) {
            openProductModal(product);
            return;
        }

        if (event.target.closest(".home-offer-shop") && sellerId) {
            openPage(`seller.html?seller=${encodeURIComponent(sellerId)}`);
        }
    });

    favoritesBtn?.addEventListener("click", () => {
        openPage("category.html?favorites=1");
    });

    sellerStartBtn?.addEventListener("click", () => {
        openPage("create_seller.html");
    });

    sellerCabinetsBtn?.addEventListener("click", () => {
        if (sellerChoiceModal) sellerChoiceModal.style.display = "flex";
    });

    sellerCabinetChoice?.addEventListener("click", async () => {
        const user = await requireSellerSession("index.html");
        if (!user) return;

        const seller = getSellerForUser(user);

        if (!seller) {
            showSellerChoiceMessage(translateInterfaceValue("shopNotFoundCreateHint"));
            return;
        }

        openPage(`seller.html?seller=${encodeURIComponent(seller.id)}`);
    });

    sellerEditChoice?.addEventListener("click", async () => {
        const user = await requireSellerSession("index.html");
        if (!user) return;

        const seller = getSellerForUser(user);

        if (!seller) {
            showSellerChoiceMessage(translateInterfaceValue("shopNotFoundCreateHint"));
            return;
        }

        openPage(`seller_panel.html?seller=${encodeURIComponent(seller.id)}`);
    });

    sellerNewChoice?.addEventListener("click", async () => {
        const user = await requireSellerSession("create_seller.html");
        if (!user) return;

        const seller = getSellerForUser(user);

        if (seller) {
            openPage(`seller_panel.html?seller=${encodeURIComponent(seller.id)}`);
            return;
        }

        openPage("create_seller.html");
    });

    sellerChoiceModal?.addEventListener("click", event => {
        if (event.target === sellerChoiceModal) {
            sellerChoiceModal.style.display = "none";
        }
    });

    if (!window.homeLanguageListenerAdded) {
        window.homeLanguageListenerAdded = true;
        window.addEventListener("privoz-language-change", () => {
            renderAllHomeCategories();
            renderOffersFilterPanel();
            renderHomeOffers();
        });
    }
}

function initFavoritesNavigation() {
    document
        .querySelectorAll(".favorites-nav-btn")
        .forEach(button => {
            button.addEventListener("click", () => {
                openPage("category.html?favorites=1");
            });
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
    const createSellerMessage = document.getElementById("createSellerMessage");
    const sellerCreateBlock = document.querySelector(".seller-create-block");
    const cabinetSubtitle = document.querySelector(".cabinet-subtitle");

    fillCategorySelect(sellerCategorySelect);

    const prepareSellerCreationPage = async () => {
        if (!createSellerBtn && !sellerCreateBlock) return;

        if (!isSupabaseReady()) {
            sellerCreateBlock?.classList.add("hidden");
            if (cabinetSubtitle) {
                cabinetSubtitle.textContent = translateInterfaceValue("databaseUnavailableTitle");
            }
            showMessage(
                createSellerMessage,
                translateInterfaceValue("databaseUnavailableMessage")
            );
            renderSellerCabinets();
            return;
        }

        const user = await getCurrentSupabaseUser();
        const existingSeller = getSellerForUser(user);

        if (!existingSeller) {
            renderSellerCabinets();
            return;
        }

        sellerCreateBlock?.classList.add("hidden");

        if (cabinetSubtitle) {
            cabinetSubtitle.textContent = translateInterfaceValue("accountAlreadyHasShop");
        }

        showMessage(
            createSellerMessage,
            translateInterfaceValue("newShopUnavailable")
        );
        renderSellerCabinets();
    };

    prepareSellerCreationPage();

    createSellerBtn?.addEventListener("click", async () => {
        const name = document.getElementById("sellerName").value.trim();
        const description = document.getElementById("sellerDescription").value.trim();
        const category = document.getElementById("sellerCategory").value;
        const open = document.getElementById("openTime").value;
        const close = document.getElementById("closeTime").value;

        if (!name) {
            showMessage(createSellerMessage, translateInterfaceValue("enterShopName"));
            return;
        }

        const sellers = readStorage("sellers");
        const draftSeller = {
            id: makeId(name) || `seller_${Date.now()}`,
            name,
            description,
            category,
            open,
            close,
            findInfo: translateInterfaceValue("noFindInfo"),
            phone: "",
            telegram: "",
            instagram: "",
            viber: "",
            coverImage: "",
            featuredProductIds: []
        };
        const originalText = createSellerBtn.textContent;

        createSellerBtn.disabled = true;
        createSellerBtn.textContent = translateInterfaceValue("saving");
        showMessage(createSellerMessage, translateInterfaceValue("checkingAuthAndSavingShop"));

        try {
            if (!isSupabaseReady()) {
                throw new Error("supabase-unavailable");
            }

            const currentUser = await getCurrentSupabaseUser();

            if (!currentUser) {
                showMessage(createSellerMessage, translateInterfaceValue("sellerLoginRequired"));
                await requireSellerSession("create_seller.html");
                return;
            }

            const existingSeller = getSellerForUser(currentUser);

            if (existingSeller) {
                showMessage(
                    createSellerMessage,
                    translateInterfaceValue("accountAlreadyHasShopOpening")
                );
                openPage(`seller_panel.html?seller=${encodeURIComponent(existingSeller.id)}`);
                return;
            }

            const savedSeller = await saveSellerToSupabase(draftSeller);

            sellers.push(savedSeller);
            writeStorage("sellers", sellers);
            showMessage(createSellerMessage, translateInterfaceValue("shopCreated"));
            openPage(`seller_panel.html?seller=${encodeURIComponent(savedSeller.id)}`);
        } catch (error) {
            console.warn("Seller creation failed", error);
            createSellerBtn.disabled = false;
            createSellerBtn.textContent = originalText;
            showMessage(
                createSellerMessage,
                `${translateInterfaceValue("createShopFailed")}: ${getSupabaseErrorMessage(error)}`
            );
            alert(`${translateInterfaceValue("createShopFailed")}: ${getSupabaseErrorMessage(error)}`);
        }
    });
}

function renderSellerCabinets() {
    const cabinetList = document.getElementById("sellerCabinetList");

    if (!cabinetList) return;

    const user = getCachedSupabaseUser();
    const sellers = readStorage("sellers")
        .filter(seller => !user || seller.ownerId === user.id);

    cabinetList.innerHTML = "";

    if (!sellers.length) {
        cabinetList.innerHTML = `
            <div class="empty-card">
                ${escapeHtml(translateInterfaceValue("noActiveShopCreateAbove"))}
            </div>
        `;
        return;
    }

    sellers.forEach(seller => {
        const card = document.createElement("div");
        card.className = "seller-card";

        card.innerHTML = `
            <h3>${escapeHtml(getLocalizedSellerName(seller))}</h3>
            <p>${escapeHtml(getLocalizedSellerDescription(seller))}</p>
            <span class="category-badge seller-category-badge ${escapeHtml(getCategoryClass(seller.category))}">
                ${escapeHtml(getCategoryLabel(seller.category))}
            </span>

            <div class="product-actions">
                <button
                    class="edit-btn open-cabinet-btn"
                    data-seller="${escapeHtml(seller.id)}"
                    type="button"
                >
                    ${escapeHtml(translateInterfaceValue("editShop"))}
                </button>

                <button
                    class="btn-outline open-shop-btn"
                    data-seller="${escapeHtml(seller.id)}"
                    type="button"
                >
                    ${escapeHtml(translateInterfaceValue("openStorefront"))}
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
