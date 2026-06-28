/* Админ-кабинет: проверка проекта и быстрый переход по категориям. */

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

    list.innerHTML = categories.map(category => {
        const categoryShops = shops.filter(shop => shop.category === category.id);
        const categoryProducts = products.filter(product => product.category === category.id);

        return `
            <button
                class="admin-category-card"
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
            const category = button.dataset.adminCategory || "other";

            window.location.href = `category.html?type=${encodeURIComponent(category)}`;
        });
    });
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) element.textContent = String(value);
}

initAdminPage();
