/* Запуск функций после загрузки всех частей сайта. */

async function initApp() {
    const canContinue = await initProtectedSellerPage();

    if (!canContinue) return;

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
