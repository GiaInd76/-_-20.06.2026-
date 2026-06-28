/* Админ-кабинет: проверка проекта и просмотр лавок по категориям. */

let selectedAdminCategory = "";
let adminDashboardData = {
    shops: [],
    products: []
};

async function initAdminPage() {
    const status = document.getElementById("adminStatus");
    const accessCard = document.getElementById("adminAccessCard");
    const dashboard = document.getElementById("adminDashboard");
    const refreshButton = document.getElementById("adminRefreshBtn");
    const logoutButton = document.getElementById("adminLogoutBtn");

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
        renderAdminCategories(data);
        status.textContent = "Данные админки обновлены.";
    } catch (error) {
        status.textContent = getSupabaseErrorMessage(error);
    }
}

function renderAdminStats({ shops, products }) {
    const emptyShops = shops.filter(shop => {
        return !products.some(product => product.seller === shop.id);
    });
    setText("adminShopsCount", shops.length);
    setText("adminProductsCount", products.length);
    setText("adminEmptyShopsCount", emptyShops.length);
    setText("adminNotificationsCount", 0);
}

function renderAdminChecklist({ shops, products }) {
    const checklist = document.getElementById("adminChecklist");

    if (!checklist) return;

    const noContactShops = shops.filter(shop => {
        return !shop.phone && !shop.telegram && !shop.instagram && !shop.viber;
    });
    const emptyShops = shops.filter(shop => {
        return !products.some(product => product.seller === shop.id);
    });
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
                ? `Контакты не заполнены у лавок: ${noContactShops.length}. Перед запуском лучше заполнить.`
                : "У всех лавок есть хотя бы один контакт.",
            level: noContactShops.length ? "warning" : "ok"
        },
        {
            title: "Лавки с товаром",
            text: emptyShops.length
                ? `Пустых лавок: ${emptyShops.length}. Можно оставить для теста, но покупателю будет грустно.`
                : "Все лавки уже имеют товары.",
            level: emptyShops.length ? "warning" : "ok"
        },
        {
            title: "Фото товаров",
            text: productsWithoutPhoto.length
                ? `Товаров без фото: ${productsWithoutPhoto.length}. Для рынка фото почти обязательны.`
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

function renderAdminCategories({ shops, products }) {
    const list = document.getElementById("adminCategoriesList");

    if (!list) return;

    if (!selectedAdminCategory) {
        const categoryWithShops = categories.find(category => {
            return shops.some(shop => shop.category === category.id);
        });

        selectedAdminCategory = categoryWithShops?.id || categories[0]?.id || "other";
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
        });
    });

    renderAdminCategoryShops(adminDashboardData);
}

function renderAdminCategoryShops({ shops, products }) {
    const list = document.getElementById("adminCategoryShopsList");

    if (!list) return;

    const categoryShops = shops.filter(shop => shop.category === selectedAdminCategory);
    const title = getCategoryLabel(selectedAdminCategory);

    if (!categoryShops.length) {
        list.innerHTML = `<div class="empty-card">В категории «${escapeHtml(title)}» лавок пока нет.</div>`;
        return;
    }

    list.innerHTML = categoryShops.map(shop => {
        const count = products.filter(product => product.seller === shop.id).length;
        const contacts = [shop.phone, shop.telegram, shop.instagram, shop.viber]
            .filter(Boolean)
            .length;

        return `
            <article class="admin-row" data-shop="${escapeHtml(shop.id)}">
                <div class="admin-row-main">
                    <div class="admin-row-title">
                        <strong>${escapeHtml(shop.name || "Без названия")}</strong>
                        <small>${escapeHtml(title)} · товаров: ${count} · контактов: ${contacts}</small>
                    </div>
                    <div class="admin-row-actions">
                        <a class="btn-outline" href="category.html?type=${encodeURIComponent(selectedAdminCategory)}">Категория</a>
                        <a class="btn-outline" href="seller.html?seller=${encodeURIComponent(shop.id)}">Лавка</a>
                        <button class="admin-danger-btn" type="button" data-delete-shop="${escapeHtml(shop.id)}">
                            Удалить
                        </button>
                    </div>
                </div>
                <p class="admin-row-meta">${escapeHtml(shop.description || "Описание не заполнено.")}</p>
            </article>
        `;
    }).join("");

    list.querySelectorAll("[data-delete-shop]").forEach(button => {
        button.addEventListener("click", async () => {
            const shopId = button.dataset.deleteShop;
            const shop = shops.find(item => item.id === shopId);

            if (!confirm(`Удалить лавку "${shop?.name || "без названия"}" и её товары?`)) return;

            button.disabled = true;
            try {
                await adminDeleteShop(shopId);
                await loadAdminDashboard();
            } catch (error) {
                alert(getSupabaseErrorMessage(error));
                button.disabled = false;
            }
        });
    });
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) element.textContent = String(value);
}

initAdminPage();
