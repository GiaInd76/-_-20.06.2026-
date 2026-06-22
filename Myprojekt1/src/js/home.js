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
        if (sellerChoiceModal) sellerChoiceModal.style.display = "flex";
    });

    sellerCabinetChoice?.addEventListener("click", () => {
        const sellers = readStorage("sellers");
        const seller = sellers[sellers.length - 1];

        if (!seller) {
            openPage("create_seller.html");
            return;
        }

        openPage(`seller.html?seller=${encodeURIComponent(seller.id)}&owner=1`);
    });

    sellerEditChoice?.addEventListener("click", () => {
        const sellers = readStorage("sellers");
        const seller = sellers[sellers.length - 1];

        if (!seller) {
            openPage("create_seller.html");
            return;
        }

        openPage(`seller_panel.html?seller=${encodeURIComponent(seller.id)}`);
    });

    sellerNewChoice?.addEventListener("click", () => {
        openPage("create_seller.html");
    });

    sellerChoiceModal?.addEventListener("click", event => {
        if (event.target === sellerChoiceModal) {
            sellerChoiceModal.style.display = "none";
        }
    });
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
