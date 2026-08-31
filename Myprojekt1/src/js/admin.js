/* Админ-кабинет: контроль тестового запуска, лавок, товаров и проблем. */

const adminNotesKey = "adminTestNotes";

let adminDashboardData = {
    shops: [],
    products: [],
    visits: []
};

let selectedAdminCategory = "";
let selectedVisitPeriod = "day";

function t(key) {
    return typeof translateInterfaceValue === "function"
        ? translateInterfaceValue(key)
        : key;
}

async function initAdminPage() {
    const status = document.getElementById("adminStatus");
    const accessCard = document.getElementById("adminAccessCard");
    const dashboard = document.getElementById("adminDashboard");
    const refreshButton = document.getElementById("adminRefreshBtn");
    const logoutButton = document.getElementById("adminLogoutBtn");
    const notes = document.getElementById("adminTestNotes");
    const clearNotesButton = document.getElementById("adminClearNotesBtn");

    if (!status || !accessCard || !dashboard) return;

    const user = await getCurrentSupabaseUser();

    if (!user) {
        status.textContent = t("adminLoginRequired");
        accessCard.classList.remove("hidden");
        return;
    }

    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) {
        status.textContent = `${user.email || ""} ${t("adminNotAllowed")}`;
        accessCard.classList.remove("hidden");
        return;
    }

    status.textContent = `${t("adminAccount")}: ${user.email || t("supabaseAccount")}`;
    dashboard.classList.remove("hidden");
    trackVisitEvent();

    refreshButton?.addEventListener("click", loadAdminDashboard);
    logoutButton?.addEventListener("click", async () => {
        await signOutSeller();
        window.location.href = "index.html";
    });

    if (notes) {
        notes.value = localStorage.getItem(adminNotesKey) || "";
        notes.addEventListener("input", () => {
            localStorage.setItem(adminNotesKey, notes.value);
        });
    }

    clearNotesButton?.addEventListener("click", () => {
        if (!confirm(t("clearTestNotesQuestion"))) return;
        localStorage.removeItem(adminNotesKey);
        if (notes) notes.value = "";
    });

    await loadAdminDashboard();
}

async function loadAdminDashboard() {
    const status = document.getElementById("adminStatus");

    try {
        status.textContent = t("loadingData");
        const data = await fetchAdminDashboardData();

        adminDashboardData = data;
        writeStorage("sellers", data.shops);
        writeStorage("products", data.products);
        renderAdminStats(data);
        renderAdminVisits(data.visits || []);
        renderAdminChecklist(data);
        renderAdminIssues(data);
        renderAdminCategories(data);
        renderAdminCategoryDetails(selectedAdminCategory);
        status.textContent = `${t("dataUpdated")}: ${formatAdminDate(new Date())}.`;
    } catch (error) {
        status.textContent = getSupabaseErrorMessage(error);
    }
}

function renderAdminStats({ shops, products, visits = [] }) {
    const emptyShops = getEmptyShops(shops, products);
    const periodVisits = getVisitsForPeriod(visits, selectedVisitPeriod);

    setText("adminShopsCount", shops.length);
    setText("adminProductsCount", products.length);
    setText("adminEmptyShopsCount", emptyShops.length);
    setText("adminNotificationsCount", 0);
    setText("adminVisitsCount", periodVisits.length);
}

function renderAdminVisits(visits) {
    const periodVisits = getVisitsForPeriod(visits, selectedVisitPeriod);
    const uniqueSessions = new Set(periodVisits.map(visit => visit.sessionId).filter(Boolean));
    const pageCounts = periodVisits.reduce((map, visit) => {
        const key = getAdminVisitLabel(visit);
        map.set(key, (map.get(key) || 0) + 1);
        return map;
    }, new Map());
    const rows = [...pageCounts.entries()]
        .sort((first, second) => second[1] - first[1])
        .slice(0, 8);
    const breakdown = document.getElementById("adminVisitBreakdown");

    setText("adminVisitsTotal", periodVisits.length);
    setText("adminVisitsUnique", uniqueSessions.size);
    setText("adminVisitsPages", pageCounts.size);

    document.querySelectorAll("[data-visit-period]").forEach(button => {
        button.classList.toggle("is-active", button.dataset.visitPeriod === selectedVisitPeriod);
    });

    if (!breakdown) return;

    if (!visits.length) {
        breakdown.innerHTML = `<p class="admin-muted">Статистика з’явиться після застосування SQL і перших відвідувань.</p>`;
        bindAdminVisitFilter();
        return;
    }

    if (!rows.length) {
        breakdown.innerHTML = `<p class="admin-muted">За обраний період відвідувань немає.</p>`;
        bindAdminVisitFilter();
        return;
    }

    breakdown.innerHTML = rows.map(([label, count]) => `
        <div class="admin-visit-row">
            <span>${escapeHtml(label)}</span>
            <strong>${count}</strong>
        </div>
    `).join("");

    bindAdminVisitFilter();
}

function bindAdminVisitFilter() {
    document.querySelectorAll("[data-visit-period]").forEach(button => {
        if (button.dataset.boundVisitFilter) return;

        button.dataset.boundVisitFilter = "1";
        button.addEventListener("click", () => {
            selectedVisitPeriod = button.dataset.visitPeriod || "day";
            renderAdminStats(adminDashboardData);
            renderAdminVisits(adminDashboardData.visits || []);
        });
    });
}

function getVisitsForPeriod(visits, period) {
    const dayMs = 24 * 60 * 60 * 1000;
    const ranges = {
        day: dayMs,
        week: dayMs * 7,
        month: dayMs * 30,
        year: dayMs * 365
    };
    const fromTime = Date.now() - (ranges[period] || ranges.day);

    return (visits || []).filter(visit => {
        const time = new Date(visit.createdAt || 0).getTime();
        return Number.isFinite(time) && time >= fromTime;
    });
}

function getAdminVisitLabel(visit) {
    const pageTypeLabels = {
        home: "Главная",
        category: "Категория",
        seller: "Страница торговой точки",
        sellerPanel: "Кабинет продавца",
        createSeller: "Создание торговой точки",
        auth: "Вхід",
        admin: "Админка",
        favorites: "Обране"
    };

    return pageTypeLabels[visit.pageType] || visit.path || "Страница";
}

function renderAdminChecklist({ shops, products }) {
    const checklist = document.getElementById("adminChecklist");

    if (!checklist) return;

    const noContactShops = getNoContactShops(shops);
    const emptyShops = getEmptyShops(shops, products);
    const productsWithoutPhoto = products.filter(product => !getProductImages(product).length);
    const productsWithoutPrice = products.filter(product => !product.priceLabel && !product.price);

    const checks = [
        {
            title: t("supabaseWorks"),
            text: t("loadedFromDatabase"),
            level: "ok"
        },
        {
            title: t("shopsWithContacts"),
            text: noContactShops.length
                ? `${t("noContacts")}: ${noContactShops.length}. ${t("noContactsProblem")}`
                : t("allShopsHaveContact"),
            level: noContactShops.length ? "warning" : "ok"
        },
        {
            title: t("shopsWithProducts"),
            text: emptyShops.length
                ? `${t("emptyShops")}: ${emptyShops.length}. ${t("emptyShopsProblem")}`
                : t("allShopsHaveProducts"),
            level: emptyShops.length ? "warning" : "ok"
        },
        {
            title: t("productPhotos"),
            text: productsWithoutPhoto.length
                ? `${t("productsWithoutPhoto")}: ${productsWithoutPhoto.length}. ${t("photoRequired")}`
                : t("allProductsHavePhotos"),
            level: productsWithoutPhoto.length ? "warning" : "ok"
        },
        {
            title: t("productPrices"),
            text: productsWithoutPrice.length
                ? `${t("productsWithoutPrice")}: ${productsWithoutPrice.length}. ${t("mustFix")}`
                : t("allProductsHavePrices"),
            level: productsWithoutPrice.length ? "danger" : "ok"
        }
    ];

    checklist.innerHTML = checks.map(check => `
        <article class="admin-check-item ${check.level === "ok" ? "" : `is-${check.level}`}">
            <span class="admin-check-icon">${check.level === "ok" ? "✓" : "!"}</span>
            <div>
                <strong>${escapeHtml(check.title)}</strong>
                <p>${escapeHtml(check.text)}</p>
            </div>
        </article>
    `).join("");
}

function renderAdminIssues({ shops, products }) {
    const issues = document.getElementById("adminIssuesList");

    if (!issues) return;

    const noContactShops = getNoContactShops(shops);
    const emptyShops = getEmptyShops(shops, products);
    const productsWithoutPhoto = products.filter(product => !getProductImages(product).length);
    const productsWithoutPrice = products.filter(product => !product.priceLabel && !product.price);

    const blocks = [
        {
            title: t("noContacts"),
            empty: t("noneSuchShops"),
            items: noContactShops.map(shop => makeShopIssue(shop))
        },
        {
            title: t("emptyShops"),
            empty: t("noEmptyShops"),
            items: emptyShops.map(shop => makeShopIssue(shop))
        },
        {
            title: t("productsWithoutPhoto"),
            empty: t("allProductsWithPhotos"),
            items: productsWithoutPhoto.map(product => makeProductIssue(product))
        },
        {
            title: t("productsWithoutPrice"),
            empty: t("allProductsWithPrices"),
            items: productsWithoutPrice.map(product => makeProductIssue(product))
        }
    ];

    issues.innerHTML = blocks.map(block => `
        <article class="admin-issue-card">
            <div class="admin-issue-head">
                <strong>${escapeHtml(block.title)}</strong>
                <span>${block.items.length}</span>
            </div>
            <div class="admin-issue-list">
                ${block.items.length
                    ? block.items.slice(0, 5).join("")
                    : `<p class="admin-muted">${escapeHtml(block.empty)}</p>`}
            </div>
        </article>
    `).join("");

    bindAdminActions(issues);
}

function renderAdminCategories({ shops, products }) {
    const list = document.getElementById("adminCategoriesList");

    if (!list) return;

    if (!selectedAdminCategory && categories.length) {
        selectedAdminCategory = categories[0].id;
    }

    list.innerHTML = categories.map(category => {
        const categoryShops = shops.filter(shop => shop.category === category.id);
        const categoryProducts = products.filter(product => product.category === category.id);
        const activeClass = category.id === selectedAdminCategory ? "is-active" : "";

        return `
            <button
                class="admin-category-card ${activeClass}"
                type="button"
                data-admin-category="${escapeHtml(category.id)}"
            >
                <span>${escapeHtml(getCategoryLabel(category.id))}</span>
                <strong>${categoryShops.length}</strong>
                <small>${t("shopsCountShort")} · ${t("productsCountShort")}: ${categoryProducts.length}</small>
            </button>
        `;
    }).join("");

    list.querySelectorAll("[data-admin-category]").forEach(button => {
        button.addEventListener("click", () => {
            selectedAdminCategory = button.dataset.adminCategory || "other";
            renderAdminCategories(adminDashboardData);
            renderAdminCategoryDetails(selectedAdminCategory);
        });
    });
}

function renderAdminCategoryDetails(categoryId) {
    const details = document.getElementById("adminCategoryDetails");
    const title = document.getElementById("adminCategoryTitle");
    const meta = document.getElementById("adminCategoryMeta");
    const openLink = document.getElementById("adminOpenCategoryLink");
    const shopsList = document.getElementById("adminCategoryShops");

    if (!details || !title || !meta || !openLink || !shopsList || !categoryId) return;

    const { shops, products } = adminDashboardData;
    const categoryShops = shops.filter(shop => shop.category === categoryId);
    const categoryProducts = products.filter(product => product.category === categoryId);

    details.classList.remove("hidden");
    title.textContent = getCategoryLabel(categoryId);
    meta.textContent = `${t("shops")}: ${categoryShops.length}. ${t("products")}: ${categoryProducts.length}.`;
    openLink.href = `category.html?type=${encodeURIComponent(categoryId)}`;

    if (!categoryShops.length) {
        shopsList.innerHTML = `<article class="admin-row">${escapeHtml(t("noShopsInCategory"))}</article>`;
        return;
    }

    shopsList.innerHTML = categoryShops.map(shop => {
        const shopProducts = products.filter(product => product.seller === shop.id);
        const contactCount = [shop.phone, shop.telegram, shop.instagram, shop.viber]
            .filter(Boolean).length;

        return `
            <article class="admin-row">
                <div class="admin-row-main">
                    <div class="admin-row-title">
                        <strong>${escapeHtml(shop.name || t("shopWithoutName"))}</strong>
                        <small>
                            ${escapeHtml(getCategoryLabel(shop.category))}
                            · ${t("productsCountShort")}: ${shopProducts.length}
                            · ${t("contactsCountShort")}: ${contactCount}
                        </small>
                        <span class="admin-row-meta">${escapeHtml(shop.description || t("noDescription"))}</span>
                        <label>
                            ${escapeHtml(t("moderationStatus"))}
                            <select data-shop-moderation="${escapeHtml(shop.id)}">
                                ${["pending", "active", "blocked"].map(status => `
                                    <option value="${status}" ${shop.moderationStatus === status ? "selected" : ""}>
                                        ${escapeHtml(t(`moderation_${status}`))}
                                    </option>
                                `).join("")}
                            </select>
                        </label>
                    </div>
                    <div class="admin-row-actions">
                        <a class="btn-outline" href="seller.html?seller=${encodeURIComponent(shop.id)}">${t("shop")}</a>
                        <a class="btn-outline" href="seller_panel.html?seller=${encodeURIComponent(shop.id)}">${t("edit")}</a>
                        <button class="admin-danger-btn" type="button" data-delete-shop="${escapeHtml(shop.id)}">${t("delete")}</button>
                    </div>
                </div>
                ${renderAdminProductMiniList(shopProducts)}
            </article>
        `;
    }).join("");

    bindAdminActions(shopsList);
}

function renderAdminProductMiniList(products) {
    if (!products.length) {
        return `<div class="admin-product-mini-list"><span class="admin-muted">${escapeHtml(t("noProductsYet"))}</span></div>`;
    }

    return `
        <div class="admin-product-mini-list">
            ${products.slice(0, 6).map(product => `
                <div class="admin-product-mini">
                    <span>${escapeHtml(product.name || t("productFallback"))}</span>
                    <small>${escapeHtml(getAdminProductPrice(product))}</small>
                    <button class="admin-danger-btn" type="button" data-delete-product="${escapeHtml(product.id)}">${t("delete")}</button>
                </div>
            `).join("")}
        </div>
    `;
}

function makeShopIssue(shop) {
    return `
        <div class="admin-issue-row">
            <span>${escapeHtml(shop.name || t("shopWithoutName"))}</span>
            <a href="seller.html?seller=${encodeURIComponent(shop.id)}">${t("open")}</a>
        </div>
    `;
}

function makeProductIssue(product) {
    const seller = getAdminShop(product.seller);

    return `
        <div class="admin-issue-row">
            <span>${escapeHtml(product.name || t("productFallback"))} · ${escapeHtml(seller?.name || t("shop"))}</span>
            <button type="button" data-show-category="${escapeHtml(product.category || "other")}">${t("categoryTitle")}</button>
        </div>
    `;
}

function bindAdminActions(root) {
    root.querySelectorAll("[data-shop-moderation]").forEach(select => {
        select.addEventListener("change", async () => {
            select.disabled = true;
            try {
                await adminUpdateShopModeration(select.dataset.shopModeration, select.value);
                await loadAdminDashboard();
            } catch (error) {
                console.warn("Moderation update failed", error);
                select.disabled = false;
                alert(getSupabaseErrorMessage(error));
            }
        });
    });

    root.querySelectorAll("[data-delete-shop]").forEach(button => {
        button.addEventListener("click", async () => {
            const shopId = button.dataset.deleteShop;
            const shop = getAdminShop(shopId);

            if (!shopId || !confirm(`${t("deleteShopConfirmPrefix")} "${shop?.name || t("shopWithoutName")}" ${t("deleteShopConfirmSuffix")}`)) return;

            await adminDeleteShop(shopId);
            await loadAdminDashboard();
        });
    });

    root.querySelectorAll("[data-delete-product]").forEach(button => {
        button.addEventListener("click", async () => {
            const productId = button.dataset.deleteProduct;
            const product = adminDashboardData.products.find(item => item.id === productId);

            if (!productId || !confirm(`${t("deleteProductConfirmPrefix")} "${product?.name || t("productWithoutName")}"?`)) return;

            await adminDeleteProduct(productId);
            await loadAdminDashboard();
        });
    });

    root.querySelectorAll("[data-show-category]").forEach(button => {
        button.addEventListener("click", () => {
            selectedAdminCategory = button.dataset.showCategory || "other";
            renderAdminCategories(adminDashboardData);
            renderAdminCategoryDetails(selectedAdminCategory);
            document.getElementById("adminCategoryDetails")?.scrollIntoView({ behavior: "smooth" });
        });
    });
}

function getNoContactShops(shops) {
    return shops.filter(shop => {
        return !shop.phone && !shop.telegram && !shop.instagram && !shop.viber;
    });
}

function getEmptyShops(shops, products) {
    return shops.filter(shop => {
        return !products.some(product => product.seller === shop.id);
    });
}

function getAdminShop(shopId) {
    return adminDashboardData.shops.find(shop => shop.id === shopId);
}

function getAdminProductPrice(product) {
    if (!product.priceLabel && !product.price) return t("noPrice");
    return getProductPriceText(product);
}

function formatAdminDate(value) {
    return value.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) element.textContent = String(value);
}

initAdminPage();
