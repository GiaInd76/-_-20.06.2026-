/* Запуск функций после загрузки всех частей сайта. */

async function initApp() {
    const canContinue = await initProtectedSellerPage();

    if (!canContinue) return;

    await getCurrentSupabaseUser();
    await hydrateMarketplaceFromSupabase();

    initBrandHeader();
    initCategoryColors();
    initMainPage();
    initFavoritesNavigation();
    initBackButtons();
    initCategoryCards();
    initSellerCreation();
    if (currentSeller) {
        try {
            await fetchProductsByShopFromSupabase(currentSeller);
        } catch (error) {
            console.warn("Seller scoped sync skipped", error);
        }
    }
    initSellerPanel();
    await initCategoryPage();
    await initSellerPage();
    initOwnerProductEditor();
    initModal();
}

initApp();
