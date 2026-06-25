/* Запуск функций после загрузки всех частей сайта. */

async function initApp() {
    await initProtectedSellerPage();
    await hydrateMarketplaceFromSupabase();

    initBrandHeader();
    initCategoryColors();
    initMainPage();
    initFavoritesNavigation();
    initBackButtons();
    initCategoryCards();
    initSellerCreation();
    initSellerPanel();
    initFishPage();
    initCategoryPage();
    initSellerPage();
    initOwnerProductEditor();
    initModal();
}

initApp();
