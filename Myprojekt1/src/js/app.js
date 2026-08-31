/* Запуск лише тих частин сайту, які потрібні поточній сторінці. */

function getCurrentPageName() {
    return window.location.pathname.split("/").pop() || "index.html";
}

async function loadPageData(pageName) {
    if (pageName === "seller.html" && currentSeller) {
        try {
            await fetchShopsByIdsFromSupabase([currentSeller]);
        } catch (error) {
            console.warn("Seller sync skipped", error);
        }
    }

    if (["index.html", "create_seller.html", "seller_panel.html"].includes(pageName)) {
        try {
            await fetchOwnSellerFromSupabase();
        } catch (error) {
            console.warn("Own seller sync skipped", error);
        }
    }
}

async function initCurrentPage(pageName) {
    const pageInitializers = {
        "index.html": async () => {
            initMainPage();
            initCategoryCards();
            initModal();
        },
        "category.html": async () => {
            await initCategoryPage();
            initModal();
        },
        "create_seller.html": async () => initSellerCreation(),
        "seller.html": async () => {
            await initSellerPage();
            initOwnerProductEditor();
            initModal();
        },
        "seller_panel.html": async () => initSellerPanel()
    };

    await pageInitializers[pageName]?.();
}

async function initApp() {
    const pageName = getCurrentPageName();
    const canContinue = await initProtectedSellerPage();

    if (!canContinue) return;

    await getCurrentSupabaseUser();
    await loadPageData(pageName);
    updateMarketLabels();
    await initMarketSwitcher();
    await trackVisitEvent();

    initBrandHeader();
    initCategoryColors();
    initFavoritesNavigation();
    initBackButtons();
    await initCurrentPage(pageName);
}

initApp();
