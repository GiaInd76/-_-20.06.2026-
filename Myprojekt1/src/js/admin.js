/* Админ-кабинет: контроль тестового запуска, лавок, товаров и проблем. */

const adminNotesKey = "adminTestNotes";

let adminDashboardData = {
    shops: [],
    products: []
};

let selectedAdminCategory = "";

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
        status.textContent = "Нужно войти в аккаунт администратора.";
        accessCard.classList.remove("hidden");
        return;
    }

    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) {
        status.textContent = `Аккаунт ${user.email || ""} не добавлен в админы.`;
        accessCard.classList.remove("hidden");
        return;
    }

    status.textContent = `Админ: ${user.email || "аккаунт Supabase"}`;
    dashboard.classList.remove("hidden");

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
        if (!confirm("Очистить заметки теста?")) return;
        localStorage.removeItem(adminNotesKey);
        if (notes) notes.value = "";
    });

    await loadAdminDashboard();
}

async function loadAdminDashboard() {
    const status = document.getElementById("adminStatus");

    try {
        status.textContent = "Обновляем данные...";
        const data = await fetchAdminDashboardData();

        adminDashboardData = data;
        writeStorage("sellers", data.shops);
        writeStorage("products", data.products);
        renderAdminStats(data);
        renderAdminChecklist(data);
        renderAdminIssues(data);
        renderAdminCategories(data);
        renderAdminCategoryDetails(selectedAdminCategory);
        status.textContent = `Данные обновлены: ${formatAdminDate(new Date())}.`;
    } catch (error) {
        status.textContent = getSupabaseErrorMessage(error);
    }
}

function renderAdminStats({ shops, products }) {
    const emptyShops = getEmptyShops(shops, products);

    setText("adminShopsCount", shops.length);
    setText("adminProductsCount", products.length);
    setText("adminEmptyShopsCount", emptyShops.length);
    setText("adminNotificationsCount", 0);
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
            title: "Supabase отвечает",
            text: "Лавки и товары загружены из базы.",
            level: "ok"
        },
        {
            title: "Лавки с контактами",
            text: noContactShops.length
                ? `Без контактов: ${noContactShops.length}. Продавца нельзя быстро найти.`
                : "У всех лавок есть хотя бы один контакт.",
            level: noContactShops.length ? "warning" : "ok"
        },
        {
            title: "Лавки с товаром",
            text: emptyShops.length
                ? `Пустых лавок: ${emptyShops.length}. Для теста допустимо, для запуска плохо.`
                : "Все лавки уже имеют товары.",
            level: emptyShops.length ? "warning" : "ok"
        },
        {
            title: "Фото товаров",
            text: productsWithoutPhoto.length
                ? `Товаров без фото: ${productsWithoutPhoto.length}. На рынке фото почти обязательны.`
                : "У всех товаров есть фото.",
            level: productsWithoutPhoto.length ? "warning" : "ok"
        },
        {
            title: "Цены товаров",
            text: productsWithoutPrice.length
                ? `Товаров без цены: ${productsWithoutPrice.length}. Это нужно исправить.`
                : "У всех товаров есть цена.",
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
            title: "Без контактов",
            empty: "Таких лавок нет.",
            items: noContactShops.map(shop => makeShopIssue(shop))
        },
        {
            title: "Пустые лавки",
            empty: "Пустых лавок нет.",
            items: emptyShops.map(shop => makeShopIssue(shop))
        },
        {
            title: "Товары без фото",
            empty: "Все товары с фото.",
            items: productsWithoutPhoto.map(product => makeProductIssue(product))
        },
        {
            title: "Товары без цены",
            empty: "Все товары с ценой.",
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
                <span>${escapeHtml(category.label)}</span>
                <strong>${categoryShops.length}</strong>
                <small>лавок · товаров: ${categoryProducts.length}</small>
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
    meta.textContent = `Лавок: ${categoryShops.length}. Товаров: ${categoryProducts.length}.`;
    openLink.href = `category.html?type=${encodeURIComponent(categoryId)}`;

    if (!categoryShops.length) {
        shopsList.innerHTML = '<article class="admin-row">В этой категории лавок пока нет.</article>';
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
                        <strong>${escapeHtml(shop.name || "Лавка без названия")}</strong>
                        <small>
                            ${escapeHtml(getCategoryLabel(shop.category))}
                            · товаров: ${shopProducts.length}
                            · контактов: ${contactCount}
                        </small>
                        <span class="admin-row-meta">${escapeHtml(shop.description || "Описание пока не заполнено.")}</span>
                    </div>
                    <div class="admin-row-actions">
                        <a class="btn-outline" href="seller.html?seller=${encodeURIComponent(shop.id)}">Лавка</a>
                        <a class="btn-outline" href="seller_panel.html?seller=${encodeURIComponent(shop.id)}">Редактировать</a>
                        <button class="admin-danger-btn" type="button" data-delete-shop="${escapeHtml(shop.id)}">Удалить</button>
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
        return '<div class="admin-product-mini-list"><span class="admin-muted">Товаров пока нет.</span></div>';
    }

    return `
        <div class="admin-product-mini-list">
            ${products.slice(0, 6).map(product => `
                <div class="admin-product-mini">
                    <span>${escapeHtml(product.name || "Товар")}</span>
                    <small>${escapeHtml(getAdminProductPrice(product))}</small>
                    <button class="admin-danger-btn" type="button" data-delete-product="${escapeHtml(product.id)}">Удалить</button>
                </div>
            `).join("")}
        </div>
    `;
}

function makeShopIssue(shop) {
    return `
        <div class="admin-issue-row">
            <span>${escapeHtml(shop.name || "Лавка без названия")}</span>
            <a href="seller.html?seller=${encodeURIComponent(shop.id)}">Открыть</a>
        </div>
    `;
}

function makeProductIssue(product) {
    const seller = getAdminShop(product.seller);

    return `
        <div class="admin-issue-row">
            <span>${escapeHtml(product.name || "Товар")} · ${escapeHtml(seller?.name || "Лавка")}</span>
            <button type="button" data-show-category="${escapeHtml(product.category || "other")}">Категория</button>
        </div>
    `;
}

function bindAdminActions(root) {
    root.querySelectorAll("[data-delete-shop]").forEach(button => {
        button.addEventListener("click", async () => {
            const shopId = button.dataset.deleteShop;
            const shop = getAdminShop(shopId);

            if (!shopId || !confirm(`Удалить лавку "${shop?.name || "без названия"}" и ее товары?`)) return;

            await adminDeleteShop(shopId);
            await loadAdminDashboard();
        });
    });

    root.querySelectorAll("[data-delete-product]").forEach(button => {
        button.addEventListener("click", async () => {
            const productId = button.dataset.deleteProduct;
            const product = adminDashboardData.products.find(item => item.id === productId);

            if (!productId || !confirm(`Удалить товар "${product?.name || "без названия"}"?`)) return;

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
    if (!product.priceLabel && !product.price) return "без цены";
    return getProductPriceText(product);
}

function formatAdminDate(value) {
    return value.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) element.textContent = String(value);
}

initAdminPage();
