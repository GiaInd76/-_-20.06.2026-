/* Подключение к Supabase, авторизация и синхронизация данных. */

const SUPABASE_URL = "https://sdsmnahyobzmrafkexud.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TG6YRcuVzOUsQLOGbwj2Ew_305uGI-P";

const supabaseClient = window.supabase?.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: "pkce"
        }
    }
);

let cachedSupabaseUser = null;

function withTimeout(promise, ms, label = "operation") {
    let timeoutId;

    const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`${label}-timeout`));
        }, ms);
    });

    return Promise.race([promise, timeout])
        .finally(() => clearTimeout(timeoutId));
}

const sanitizeReturnUrl = window.ReturnUrlSecurity?.sanitizeReturnUrl
    || (() => "index.html");

function getSafeReturnUrl() {
    return sanitizeReturnUrl(new URLSearchParams(window.location.search).get("return"));
}

function getAuthCallbackUrl(mode, returnUrl = getSafeReturnUrl()) {
    const callback = new URL("auth.html", window.location.href);
    callback.searchParams.set("mode", mode);
    callback.searchParams.set("return", sanitizeReturnUrl(returnUrl));
    return callback.href;
}

async function getCurrentSupabaseUser() {
    if (!supabaseClient) return null;

    const sessionResult = await supabaseClient.auth.getSession();

    if (!sessionResult.data?.session) {
        cachedSupabaseUser = null;
        return null;
    }

    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
        console.warn("Supabase user validation failed", error);
        cachedSupabaseUser = null;
        await supabaseClient.auth.signOut();
        return null;
    }

    cachedSupabaseUser = data.user || null;

    if (!cachedSupabaseUser) {
        await supabaseClient.auth.signOut();
    }

    return cachedSupabaseUser;
}

function getCachedSupabaseUser() {
    return cachedSupabaseUser;
}

async function signOutSeller() {
    cachedSupabaseUser = null;

    if (!supabaseClient) return;

    const { error } = await supabaseClient.auth.signOut();

    if (error) throw error;
}

async function updateCurrentUserPassword(newPassword) {
    if (!supabaseClient) throw new Error("supabase-unavailable");

    const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
    });

    if (error) throw error;
}

async function getActiveAuthUser(authData = null) {
    const sessionUser = authData?.session?.user || authData?.user || null;

    if (sessionUser) {
        cachedSupabaseUser = sessionUser;
        return sessionUser;
    }

    return getCurrentSupabaseUser();
}

async function requireSellerSession(returnUrl = window.location.href) {
    const user = await getCurrentSupabaseUser();

    if (user) return user;

    const localReturnUrl = new URL(returnUrl, window.location.href);
    const returnPath = sanitizeReturnUrl(
        `${localReturnUrl.pathname.split("/").pop()}${localReturnUrl.search}`
    );

    window.location.replace(`auth.html?return=${encodeURIComponent(returnPath)}`);
    return null;
}

function getSupabaseErrorMessage(error) {
    const text = key => typeof translateInterfaceValue === "function"
        ? translateInterfaceValue(key)
        : key;

    if (!error) return text("unknownError");

    const errorText = `${error.message || ""} ${error.details || ""}`.toLowerCase();

    const missingColumn = getMissingColumnName(error);

    if (error.message === "auth-required") {
        return text("sellerSignInFirst");
    }

    if (error.message === "supabase-unavailable") {
        return text("databaseNotConnectedShort");
    }

    if (error.message === "shop-not-synced") {
        return text("saveShopProfileFirst");
    }

    if (error.message === "shop-owner-required") {
        return text("shopBelongsToAnotherAccount");
    }

    if (error.message === "admin-required") {
        return text("noAdminRights");
    }

    if (error.message.endsWith("-timeout")) {
        return text("supabaseTimeout");
    }

    if (error.message === "Email not confirmed") {
        return text("emailNotConfirmed");
    }

    if (error.code === "42501" || errorText.includes("row-level security")) {
        return text("permissionDeniedBySecurityRules");
    }

    if (errorText.includes("invalid login credentials")) {
        return text("invalidLoginCredentials");
    }

    if (errorText.includes("user already registered") || errorText.includes("already been registered")) {
        return text("accountAlreadyRegistered");
    }

    if (errorText.includes("email rate limit") || errorText.includes("rate limit exceeded")) {
        return text("emailRateLimitExceeded");
    }

    if (errorText.includes("captcha")) {
        return text("captchaFailed");
    }

    if (errorText.includes("failed to fetch") || errorText.includes("network")) {
        return text("networkRequestFailed");
    }

    if (errorText.includes("mime type") || errorText.includes("content type")) {
        return text("unsupportedImageType");
    }

    if (errorText.includes("maximum allowed size") || errorText.includes("payload too large")) {
        return text("uploadedFileTooLarge");
    }

    if (errorText.includes("bucket not found")) {
        return text("imageStorageUnavailable");
    }

    if (["23502", "23503", "23514"].includes(error.code)) {
        return text("invalidDataRejected");
    }

    if (errorText.includes("password") && errorText.includes("characters")) {
        return text("passwordRequirementsError");
    }

    if (error.code === "23505") {
        return text("accountAlreadyHasShop");
    }

    if (missingColumn) {
        return `${text("missingColumnPrefix")} ${missingColumn}. ${text("runRepairSql")}`;
    }

    if (error.code === "PGRST204") {
        return text("schemaOutdated");
    }

    return text("supabaseUnknownError");
}

function getMissingColumnName(error) {
    const text = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`;
    const match = text.match(/'([^']+)' column/i) || text.match(/column "?([a-z0-9_]+)"?/i);

    return match?.[1] || "";
}

function isSupabaseReady() {
    return Boolean(supabaseClient);
}

function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        .test(String(value || ""));
}

function isDataUrl(value) {
    return /^data:image\/[a-z0-9.+-]+;base64,/i.test(String(value || ""));
}

function dataUrlToBlob(dataUrl) {
    const [header, base64] = String(dataUrl).split(",");
    const mime = header.match(/^data:(.*?);base64$/)?.[1] || "image/jpeg";
    const binary = atob(base64 || "");
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: mime });
}

async function uploadMarketplaceImage(image, folder) {
    if (!isDataUrl(image)) return image || "";

    const user = await getCurrentSupabaseUser();

    if (!supabaseClient || !user) {
        throw new Error("auth-required");
    }

    const blob = dataUrlToBlob(image);
    const fileName = `${user.id}/${folder}/${crypto.randomUUID()}.jpg`;
    const { error } = await supabaseClient.storage
        .from("product-images")
        .upload(fileName, blob, {
            contentType: blob.type || "image/jpeg",
            upsert: false
        });

    if (error) throw error;

    const { data } = supabaseClient.storage
        .from("product-images")
        .getPublicUrl(fileName);

    return data.publicUrl || "";
}

async function uploadMarketplaceImages(images, folder) {
    const imageList = Array.isArray(images) ? images : [];
    const uploaded = [];
    const newlyUploaded = [];

    try {
        for (const image of imageList.slice(0, 2)) {
            if (!image) continue;
            const uploadedUrl = await uploadMarketplaceImage(image, folder);
            uploaded.push(uploadedUrl);
            if (isDataUrl(image)) newlyUploaded.push(uploadedUrl);
        }
    } catch (error) {
        await removeMarketplaceImages(newlyUploaded).catch(cleanupError => {
            console.warn("Partial image upload cleanup failed", cleanupError);
        });
        throw error;
    }

    return uploaded;
}

function getStoragePathFromPublicUrl(url) {
    const value = String(url || "");
    const marker = "/storage/v1/object/public/product-images/";

    if (!value.includes(marker)) return "";

    return decodeURIComponent(value.split(marker)[1] || "").split("?")[0];
}

async function removeMarketplaceImages(urls) {
    if (!supabaseClient) throw new Error("supabase-unavailable");

    const paths = [...new Set((urls || []).map(getStoragePathFromPublicUrl).filter(Boolean))];

    if (!paths.length) return;

    const { error } = await supabaseClient.storage
        .from("product-images")
        .remove(paths);

    if (error) throw error;
}

function toLocalSeller(row) {
    return {
        id: row.id,
        ownerId: row.owner_id || "",
        marketId: row.market_id || "",
        name: row.name || "",
        description: row.description || "",
        category: row.category || "other",
        open: row.open_time || "",
        close: row.close_time || "",
        findInfo: row.find_info || "",
        phone: row.phone || "",
        telegram: row.telegram || "",
        instagram: row.instagram || "",
        viber: row.viber || "",
        coverImage: row.cover_url || "",
        moderationStatus: row.moderation_status || "active",
        featuredProductIds: Array.isArray(row.featured_product_ids)
            ? row.featured_product_ids
            : []
    };
}

function toLocalProduct(row) {
    const images = Array.isArray(row.image_urls) && row.image_urls.length
        ? row.image_urls.filter(Boolean).slice(0, 2)
        : (row.image_url ? [row.image_url] : []);

    return {
        id: row.id,
        seller: row.shop_id,
        name: row.name || "",
        department: row.department || "",
        category: row.category || "other",
        price: row.price_label || row.price || "",
        priceLabel: row.price_label || row.price || "",
        unit: row.unit || "kg",
        description: row.description || "",
        image: images[0] || "",
        images,
        createdAt: row.created_at || "",
        updatedAt: row.updated_at || row.created_at || "",
        priceChangedAt: row.price_changed_at || null
    };
}

function toLocalVisit(row) {
    return {
        id: row.id,
        marketId: row.market_id || "",
        path: row.path || "",
        pageType: row.page_type || "",
        sellerId: row.seller_id || "",
        category: row.category || "",
        sessionId: row.session_id || "",
        createdAt: row.created_at || ""
    };
}

function mergeLocalRows(storageKey, rows) {
    if (!Array.isArray(rows) || !rows.length) return;

    const currentRows = readStorage(storageKey);
    const rowMap = new Map(currentRows.map(row => [row.id, row]));

    rows.forEach(row => {
        if (row?.id) rowMap.set(row.id, row);
    });

    writeStorage(storageKey, Array.from(rowMap.values()));
}

async function fetchMarketsFromSupabase() {
    if (!supabaseClient) return [];

    const [citiesResult, marketsResult] = await withTimeout(
        Promise.all([
            supabaseClient
                .from("cities")
                .select("id,name,slug,country_code,is_active")
                .eq("is_active", true),
            supabaseClient
                .from("markets")
                .select("id,city_id,name,slug,address,description,is_active")
                .eq("is_active", true)
        ]),
        7000,
        "fetch-markets"
    );

    if (citiesResult.error) throw citiesResult.error;
    if (marketsResult.error) throw marketsResult.error;

    const cityMap = new Map((citiesResult.data || []).map(city => [city.id, city]));
    const markets = (marketsResult.data || []).map(market => {
        const city = cityMap.get(market.city_id) || {};

        return {
            id: market.id,
            name: market.name || "",
            slug: market.slug || "",
            cityId: market.city_id || "",
            cityName: city.name || "Одеса",
            citySlug: city.slug || "odesa",
            address: market.address || "",
            description: market.description || ""
        };
    });

    writeStorage("markets", markets);

    return markets;
}

async function ensureSelectedMarketFromSupabase() {
    const currentMarket = getCurrentMarket();

    if (currentMarket.id) return currentMarket;

    try {
        const markets = await fetchMarketsFromSupabase();
        const privozMarket = markets.find(market => market.slug === "privoz") || markets[0];

        if (privozMarket) {
            setCurrentMarket(privozMarket);
            return privozMarket;
        }
    } catch (error) {
        console.warn("Market sync skipped", error);
    }

    return currentMarket;
}

function applyCurrentMarketToShopRequest(request) {
    const marketId = getCurrentMarketId();

    return marketId ? request.eq("market_id", marketId) : request;
}

async function fetchCurrentMarketShopIdsFromSupabase(categoryId = "") {
    if (!supabaseClient) return [];

    await ensureSelectedMarketFromSupabase();

    let request = supabaseClient
        .from("shops")
        .select("id");

    request = applyCurrentMarketToShopRequest(request);

    if (categoryId) {
        request = request.eq("category", categoryId);
    }

    const { data, error } = await withTimeout(request, 7000, "fetch-market-shops");

    if (error) throw error;

    return (data || []).map(row => row.id).filter(Boolean);
}

async function fetchShopsByIdsFromSupabase(shopIds) {
    if (!supabaseClient) return [];

    const ids = [...new Set((shopIds || []).filter(isUuid))];

    if (!ids.length) return [];

    const request = applyCurrentMarketToShopRequest(
        supabaseClient
            .from("shops")
            .select("*")
            .in("id", ids)
    );
    const { data, error } = await withTimeout(
        request,
        7000,
        "fetch-shops"
    );

    if (error) throw error;

    const sellers = (data || []).map(toLocalSeller);
    mergeLocalRows("sellers", sellers);

    return sellers;
}

async function fetchOwnSellerFromSupabase() {
    if (!supabaseClient) return null;

    const user = await getCurrentSupabaseUser();

    if (!user) return null;

    const { data, error } = await withTimeout(
        supabaseClient
            .from("shops")
            .select("*")
            .eq("owner_id", user.id)
            .maybeSingle(),
        7000,
        "fetch-own-shop"
    );

    if (error) throw error;
    if (!data) return null;

    const seller = toLocalSeller(data);
    mergeLocalRows("sellers", [seller]);

    return seller;
}

async function fetchLatestProductsFromSupabase(categoryIds = [], limit = 6) {
    if (!supabaseClient) return readStorage("products").slice(0, limit);

    const marketShopIds = await fetchCurrentMarketShopIdsFromSupabase();

    if (!marketShopIds.length) return [];

    let request = supabaseClient
        .from("products")
        .select("*")
        .in("shop_id", marketShopIds)
        .order("updated_at", { ascending: false })
        .limit(limit);

    const filters = (categoryIds || []).filter(Boolean);

    if (filters.length) {
        request = request.in("category", filters);
    }

    const { data, error } = await withTimeout(request, 7000, "fetch-latest-products");

    if (error) throw error;

    const products = (data || []).map(toLocalProduct);
    mergeLocalRows("products", products);
    await fetchShopsByIdsFromSupabase(products.map(product => product.seller));

    return products;
}

async function fetchProductsByShopFromSupabase(shopId) {
    if (!supabaseClient || !isUuid(shopId)) {
        return readStorage("products").filter(product => product.seller === shopId);
    }

    const { data, error } = await withTimeout(
        supabaseClient
            .from("products")
            .select("*")
            .eq("shop_id", shopId)
            .order("updated_at", { ascending: false }),
        7000,
        "fetch-shop-products"
    );

    if (error) throw error;

    const products = (data || []).map(toLocalProduct);
    const otherProducts = readStorage("products")
        .filter(product => product.seller !== shopId);

    writeStorage("products", [...otherProducts, ...products]);

    return products;
}

async function fetchProductsByIdsFromSupabase(productIds) {
    if (!supabaseClient) {
        const ids = new Set(productIds || []);
        return readStorage("products").filter(product => ids.has(product.id));
    }

    const ids = [...new Set((productIds || []).filter(isUuid))];

    if (!ids.length) return [];

    const { data, error } = await withTimeout(
        supabaseClient
            .from("products")
            .select("*")
            .in("id", ids),
        7000,
        "fetch-products-by-id"
    );

    if (error) throw error;

    const currentMarketId = getCurrentMarketId();
    const allowedShopIds = new Set(await fetchCurrentMarketShopIdsFromSupabase());
    const products = (data || [])
        .map(toLocalProduct)
        .filter(product => !currentMarketId || allowedShopIds.has(product.seller));

    mergeLocalRows("products", products);
    await fetchShopsByIdsFromSupabase(products.map(product => product.seller));

    return products;
}

async function fetchCategoryDataFromSupabase(categoryId) {
    if (!supabaseClient) {
        return {
            sellers: readStorage("sellers")
                .filter(seller => !categoryId || seller.category === categoryId),
            products: readStorage("products")
                .filter(product => !categoryId || product.category === categoryId)
        };
    }

    const categoryFilter = categoryId || "";
    let shopRequest = supabaseClient.from("shops").select("*");

    shopRequest = applyCurrentMarketToShopRequest(shopRequest);

    if (categoryFilter) {
        shopRequest = shopRequest.eq("category", categoryFilter);
    }

    const marketShopIds = await fetchCurrentMarketShopIdsFromSupabase();
    let productRequest = supabaseClient.from("products").select("*");

    if (marketShopIds.length) {
        productRequest = productRequest.in("shop_id", marketShopIds);
    } else {
        productRequest = productRequest.eq("shop_id", "00000000-0000-0000-0000-000000000000");
    }

    if (categoryFilter) {
        productRequest = productRequest.eq("category", categoryFilter);
    } else {
        productRequest = productRequest.limit(60);
    }

    const [shopsResult, productsResult] = await withTimeout(
        Promise.all([
            shopRequest.order("created_at", { ascending: false }),
            productRequest.order("updated_at", { ascending: false })
        ]),
        8000,
        "fetch-category"
    );

    if (shopsResult.error) throw shopsResult.error;
    if (productsResult.error) throw productsResult.error;

    const products = (productsResult.data || []).map(toLocalProduct);
    const productShopIds = products.map(product => product.seller);
    const extraSellers = await fetchShopsByIdsFromSupabase(productShopIds);
    const sellers = [
        ...(shopsResult.data || []).map(toLocalSeller),
        ...extraSellers
    ].filter((seller, index, list) => {
        return list.findIndex(item => item.id === seller.id) === index;
    });

    mergeLocalRows("sellers", sellers);
    mergeLocalRows("products", products);

    return { sellers, products };
}

async function searchProductsFromSupabase(searchText) {
    const query = String(searchText || "").trim();

    if (!supabaseClient || !query) {
        return readStorage("products");
    }

    const marketShopIds = await fetchCurrentMarketShopIdsFromSupabase();

    if (!marketShopIds.length) return [];

    const { data, error } = await withTimeout(
        supabaseClient
            .from("products")
            .select("*")
            .in("shop_id", marketShopIds)
            .order("updated_at", { ascending: false })
            .limit(200),
        8000,
        "search-products"
    );

    if (error) throw error;

    const queryLower = query.toLowerCase();
    const products = (data || [])
        .map(toLocalProduct)
        .filter(product => {
            const texts = [
                product.name,
                product.description,
                product.department,
                getCategoryLabel(product.category)
            ].join(" ").toLowerCase();

            return texts.includes(queryLower);
        });

    mergeLocalRows("products", products);
    await fetchShopsByIdsFromSupabase(products.map(product => product.seller));

    return products;
}

async function hydrateMarketplaceFromSupabase() {
    if (!supabaseClient) return;

    await ensureSelectedMarketFromSupabase();

    let shopsResult;
    let productsResult;
    const marketShopIds = await fetchCurrentMarketShopIdsFromSupabase();
    const productRequest = marketShopIds.length
        ? supabaseClient
            .from("products")
            .select("*")
            .in("shop_id", marketShopIds)
            .order("updated_at", { ascending: false })
            .limit(60)
        : supabaseClient
            .from("products")
            .select("*")
            .eq("shop_id", "00000000-0000-0000-0000-000000000000");

    try {
        [shopsResult, productsResult] = await withTimeout(
            Promise.all([
                applyCurrentMarketToShopRequest(
                    supabaseClient
                        .from("shops")
                        .select("*")
                ).order("created_at", { ascending: true }),
                productRequest
            ]),
            6000,
            "hydrate-marketplace"
        );
    } catch (error) {
        console.warn("Supabase sync timeout", error);
        return;
    }

    if (shopsResult.error || productsResult.error) {
        console.warn("Supabase sync skipped", shopsResult.error || productsResult.error);
        return;
    }

    writeStorage("sellers", (shopsResult.data || []).map(toLocalSeller));
    writeStorage("products", (productsResult.data || []).map(toLocalProduct));
}

async function saveSellerToSupabase(seller) {
    if (!supabaseClient) throw new Error("supabase-unavailable");

    const user = await getCurrentSupabaseUser();

    if (!user) throw new Error("auth-required");

    const coverUrl = await uploadMarketplaceImage(seller.coverImage, "covers");
    const payload = {
        owner_id: user.id,
        market_id: seller.marketId || getCurrentMarketId(),
        name: seller.name,
        description: seller.description || "",
        category: seller.category || "other",
        open_time: seller.open || null,
        close_time: seller.close || null,
        find_info: seller.findInfo || "",
        phone: seller.phone || "",
        telegram: seller.telegram || "",
        instagram: seller.instagram || "",
        viber: seller.viber || "",
        cover_url: coverUrl || null,
        featured_product_ids: Array.isArray(seller.featuredProductIds)
            ? seller.featuredProductIds.slice(0, 3)
            : []
    };
    const request = isUuid(seller.id)
        ? supabaseClient
            .from("shops")
            .update(payload)
            .eq("id", seller.id)
            .eq("owner_id", user.id)
            .select()
            .single()
        : supabaseClient
            .from("shops")
            .insert(payload)
            .select()
            .single();
    const { data, error } = await withTimeout(request, 12000, "save-seller");

    if (error) throw error;

    return toLocalSeller(data);
}

async function assertCurrentUserOwnsShop(shopId) {
    if (!supabaseClient || !isUuid(shopId)) {
        throw new Error("shop-not-synced");
    }

    const user = await getCurrentSupabaseUser();

    if (!user) throw new Error("auth-required");

    const { data, error } = await supabaseClient
        .from("shops")
        .select("id")
        .eq("id", shopId)
        .eq("owner_id", user.id)
        .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("shop-owner-required");

    return user;
}

async function deleteSellerFromSupabase(sellerId) {
    if (!supabaseClient) throw new Error("supabase-unavailable");
    if (!isUuid(sellerId)) return;

    const user = await getCurrentSupabaseUser();

    if (!user) throw new Error("auth-required");

    const { data: shopData, error: shopFetchError } = await supabaseClient
        .from("shops")
        .select("cover_url")
        .eq("id", sellerId)
        .eq("owner_id", user.id)
        .maybeSingle();

    if (shopFetchError) throw shopFetchError;
    if (!shopData) throw new Error("shop-owner-required");

    const { data: productRows, error: productFetchError } = await supabaseClient
        .from("products")
        .select("image_url,image_urls")
        .eq("shop_id", sellerId);

    if (productFetchError) throw productFetchError;

    const imageUrls = [
        shopData.cover_url,
        ...(productRows || []).flatMap(product => [
            product.image_url,
            ...(Array.isArray(product.image_urls) ? product.image_urls : [])
        ])
    ];

    await removeMarketplaceImages(imageUrls);

    const productsResult = await supabaseClient
        .from("products")
        .delete()
        .eq("shop_id", sellerId);

    if (productsResult.error) throw productsResult.error;

    const { error } = await supabaseClient
        .from("shops")
        .delete()
        .eq("id", sellerId)
        .eq("owner_id", user.id);

    if (error) throw error;
}

async function saveProductToSupabase(product) {
    if (!supabaseClient) throw new Error("supabase-unavailable");

    if (!isUuid(product.seller)) throw new Error("shop-not-synced");
    await assertCurrentUserOwnsShop(product.seller);

    const originalImages = getProductImages(product);
    const images = await uploadMarketplaceImages(
        originalImages,
        `products/${product.seller}`
    );
    const newlyUploadedImages = images.filter((url, index) => isDataUrl(originalImages[index]));
    const payload = {
        shop_id: product.seller,
        name: product.name,
        department: product.department || "",
        category: product.category || "other",
        price: product.priceLabel || product.price || "",
        price_label: product.priceLabel || product.price || "",
        unit: product.unit || "kg",
        description: product.description || "",
        image_url: images[0] || null,
        image_urls: images
    };
    const request = isUuid(product.id)
        ? supabaseClient
            .from("products")
            .update(payload)
            .eq("id", product.id)
            .select()
            .single()
        : supabaseClient
            .from("products")
            .insert(payload)
            .select()
            .single();
    let result;

    try {
        result = await withTimeout(request, 12000, "save-product");
    } catch (error) {
        await removeMarketplaceImages(newlyUploadedImages).catch(cleanupError => {
            console.warn("Uploaded image cleanup failed", cleanupError);
        });
        throw error;
    }

    const { data, error } = result;

    if (error) {
        await removeMarketplaceImages(newlyUploadedImages).catch(cleanupError => {
            console.warn("Uploaded image cleanup failed", cleanupError);
        });
        throw error;
    }

    return toLocalProduct(data);
}

async function deleteProductFromSupabase(productId) {
    if (!supabaseClient) throw new Error("supabase-unavailable");
    if (!isUuid(productId)) return;

    const productResult = await supabaseClient
        .from("products")
        .select("shop_id")
        .eq("id", productId)
        .maybeSingle();

    if (productResult.error) throw productResult.error;
    if (!productResult.data?.shop_id) return;

    await assertCurrentUserOwnsShop(productResult.data.shop_id);

    const { error } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", productId);

    if (error) throw error;
}

async function isCurrentUserAdmin() {
    if (!supabaseClient) return false;

    const user = await getCurrentSupabaseUser();

    if (!user) return false;

    const { data, error } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.warn("Admin check failed", error);
        return false;
    }

    return Boolean(data);
}

async function fetchAdminDashboardData() {
    if (!supabaseClient) throw new Error("supabase-unavailable");

    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) throw new Error("admin-required");

    const [shopsResult, productsResult] = await withTimeout(
        Promise.all([
            supabaseClient
                .from("shops")
                .select("*")
                .order("created_at", { ascending: false }),
            supabaseClient
                .from("products")
                .select("*")
                .order("updated_at", { ascending: false })
        ]),
        9000,
        "admin-dashboard"
    );

    if (shopsResult.error) throw shopsResult.error;
    if (productsResult.error) throw productsResult.error;

    const visits = await fetchAdminVisitsSafely();

    return {
        shops: (shopsResult.data || []).map(toLocalSeller),
        products: (productsResult.data || []).map(toLocalProduct),
        visits
    };
}

async function fetchAdminVisitsSafely() {
    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

    try {
        const { data, error } = await withTimeout(
            supabaseClient
                .from("visit_events")
                .select("id,market_id,path,page_type,seller_id,category,session_id,created_at")
                .gte("created_at", yearAgo)
                .order("created_at", { ascending: false })
                .limit(5000),
            7000,
            "admin-visits"
        );

        if (error) {
            console.warn("Visit analytics unavailable", error);
            return [];
        }

        return (data || []).map(toLocalVisit);
    } catch (error) {
        console.warn("Visit analytics unavailable", error);
        return [];
    }
}

function getVisitSessionId() {
    const key = "rynokOnlineVisitSessionId";
    let sessionId = localStorage.getItem(key);

    if (!sessionId) {
        sessionId = crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        localStorage.setItem(key, sessionId);
    }

    return sessionId;
}

function getVisitPageType() {
    const path = window.location.pathname.split("/").pop() || "index.html";

    if (path === "index.html" && window.location.search.includes("favorites=1")) return "favorites";
    if (path === "index.html" || path === "") return "home";
    if (path === "category.html") return "category";
    if (path === "seller.html") return "seller";
    if (path === "seller_panel.html") return "sellerPanel";
    if (path === "create_seller.html") return "createSeller";
    if (path === "auth.html") return "auth";
    if (path === "admin.html") return "admin";

    return path.replace(".html", "");
}

async function trackVisitEvent() {
    const visitKey = `visitTracked:${window.location.href}`;

    if (!supabaseClient || sessionStorage.getItem(visitKey)) return;

    const params = new URLSearchParams(window.location.search);
    const sellerId = params.get("seller") || "";
    const payload = {
        market_id: typeof getCurrentMarketId === "function"
            ? getCurrentMarketId() || null
            : null,
        path: `${window.location.pathname.split("/").pop() || "index.html"}${window.location.search}`,
        page_type: getVisitPageType(),
        seller_id: isUuid(sellerId) ? sellerId : null,
        category: params.get("type") || "",
        session_id: getVisitSessionId(),
        user_agent: navigator.userAgent.slice(0, 300)
    };

    sessionStorage.setItem(visitKey, "1");

    try {
        const { error } = await supabaseClient
            .from("visit_events")
            .insert(payload);

        if (error) {
            console.warn("Visit tracking skipped", error);
            sessionStorage.removeItem(visitKey);
        }
    } catch (error) {
        console.warn("Visit tracking skipped", error);
        sessionStorage.removeItem(visitKey);
    }
}

async function adminDeleteProduct(productId) {
    if (!supabaseClient) throw new Error("supabase-unavailable");
    if (!isUuid(productId)) return;

    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) throw new Error("admin-required");

    const { error } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", productId);

    if (error) throw error;
}

async function adminDeleteShop(shopId) {
    if (!supabaseClient) throw new Error("supabase-unavailable");
    if (!isUuid(shopId)) return;

    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) throw new Error("admin-required");

    const productsResult = await supabaseClient
        .from("products")
        .delete()
        .eq("shop_id", shopId);

    if (productsResult.error) throw productsResult.error;

    const { error } = await supabaseClient
        .from("shops")
        .delete()
        .eq("id", shopId);

    if (error) throw error;
}

async function adminUpdateShopModeration(shopId, moderationStatus) {
    const allowedStatuses = new Set(["pending", "active", "blocked"]);

    if (!supabaseClient) throw new Error("supabase-unavailable");
    if (!isUuid(shopId) || !allowedStatuses.has(moderationStatus)) return;
    if (!await isCurrentUserAdmin()) throw new Error("admin-required");

    const { error } = await supabaseClient
        .from("shops")
        .update({ moderation_status: moderationStatus })
        .eq("id", shopId);

    if (error) throw error;
}

async function initProtectedSellerPage() {
    const requiresAuth = document.body.dataset.sellerAuth === "required";
    const ownerView = new URLSearchParams(window.location.search).get("owner") === "1";

    if (!requiresAuth && !ownerView) return true;

    if (!isSupabaseReady()) {
        document.body.innerHTML = `
            <main class="container">
                <section class="glass-card auth-card">
                    <h1>${escapeHtml(translateInterfaceValue("databaseNotConnectedTitle"))}</h1>
                    <p>${escapeHtml(translateInterfaceValue("databaseUnavailableCabinet"))}</p>
                    <a class="nav-pill" href="index.html">${escapeHtml(translateInterfaceValue("home"))}</a>
                </section>
            </main>
        `;
        return false;
    }

    const user = await requireSellerSession(window.location.href);

    return Boolean(user);
}

function initAuthPage() {
    const form = document.getElementById("authForm");
    const emailInput = document.getElementById("authEmail");
    const passwordInput = document.getElementById("authPassword");
    const passwordConfirmInput = document.getElementById("authPasswordConfirm");
    const passwordConfirmField = document.getElementById("authPasswordConfirmField");
    const loginModeButton = document.getElementById("loginModeBtn");
    const registerModeButton = document.getElementById("registerModeBtn");
    const forgotPasswordButton = document.getElementById("forgotPasswordBtn");
    const passwordResetPanel = document.getElementById("passwordResetPanel");
    const newPasswordInput = document.getElementById("newPassword");
    const newPasswordConfirmInput = document.getElementById("newPasswordConfirm");
    const saveNewPasswordButton = document.getElementById("saveNewPasswordBtn");
    const captchaContainer = document.getElementById("captchaContainer");
    const message = document.getElementById("authMessage");
    const urlParams = new URLSearchParams(window.location.search);
    const callbackMode = urlParams.get("mode");
    const turnstileSiteKey = document.querySelector('meta[name="turnstile-site-key"]')?.content.trim();
    let authMode = "login";
    let captchaToken = "";
    let captchaWidgetId = null;

    if (!form || !supabaseClient) return;

    trackVisitEvent();

    form.querySelectorAll("[data-password-toggle]").forEach(toggleButton => {
        toggleButton.addEventListener("click", () => {
            const targetInput = document.getElementById(toggleButton.dataset.passwordToggle);
            if (!targetInput) return;

            const shouldShow = targetInput.type === "password";
            targetInput.type = shouldShow ? "text" : "password";
            toggleButton.setAttribute("aria-pressed", String(shouldShow));

            const label = translateInterfaceValue(shouldShow ? "hidePassword" : "showPassword");
            toggleButton.setAttribute("aria-label", label);
            toggleButton.setAttribute("title", label);
        });
    });

    const showAuthMessage = text => {
        if (!message) return;

        message.textContent = text || "";
        message.classList.toggle("visible", Boolean(text));
    };

    const setBusy = isBusy => {
        loginModeButton.disabled = isBusy;
        registerModeButton.disabled = isBusy;
        if (forgotPasswordButton) forgotPasswordButton.disabled = isBusy;
        if (saveNewPasswordButton) saveNewPasswordButton.disabled = isBusy;
    };

    const getCredentials = () => ({
        email: emailInput.value.trim(),
        password: passwordInput.value
    });

    const credentialsAreValid = credentials => (
        emailInput.validity.valid && credentials.email.length <= 254 &&
        credentials.password.length >= 8 && credentials.password.length <= 128
    );

    const resetCaptcha = () => {
        captchaToken = "";
        if (captchaWidgetId !== null && window.turnstile) {
            window.turnstile.reset(captchaWidgetId);
        }
    };

    const renderCaptcha = () => {
        if (!turnstileSiteKey || !captchaContainer || captchaWidgetId !== null) return;

        const renderWidget = () => {
            if (!window.turnstile || captchaWidgetId !== null) return;
            captchaWidgetId = window.turnstile.render(captchaContainer, {
                sitekey: turnstileSiteKey,
                callback: token => { captchaToken = token; },
                "expired-callback": () => { captchaToken = ""; },
                "error-callback": () => { captchaToken = ""; }
            });
        };

        captchaContainer.classList.remove("hidden");

        if (window.turnstile) {
            renderWidget();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.addEventListener("load", renderWidget, { once: true });
        document.head.appendChild(script);
    };

    const setAuthMode = mode => {
        authMode = mode === "register" ? "register" : "login";
        const isRegister = authMode === "register";

        passwordConfirmInput.classList.toggle("hidden", !isRegister);
        passwordConfirmField?.classList.toggle("hidden", !isRegister);
        passwordConfirmInput.required = isRegister;
        passwordInput.autocomplete = isRegister ? "new-password" : "current-password";
        captchaContainer?.classList.toggle("hidden", !turnstileSiteKey);
        showAuthMessage("");

        renderCaptcha();
    };

    const finishAuthCallback = async () => {
        if (callbackMode !== "confirm") return false;

        setBusy(true);
        showAuthMessage(translateInterfaceValue("confirmingEmail"));

        const user = await getCurrentSupabaseUser();

        setBusy(false);

        if (!user) {
            showAuthMessage(translateInterfaceValue("emailConfirmationFailed"));
            return true;
        }

        showAuthMessage(translateInterfaceValue("emailConfirmed"));
        window.setTimeout(() => window.location.replace(getSafeReturnUrl()), 500);
        return true;
    };

    if (callbackMode === "password-reset") {
        passwordResetPanel?.classList.remove("hidden");
        newPasswordInput?.focus();
    }

    const signIn = async () => {
        const credentials = getCredentials();

        if (!credentialsAreValid(credentials)) {
            showAuthMessage(translateInterfaceValue("enterEmailAndPassword"));
            return;
        }

        if (turnstileSiteKey && !captchaToken) {
            showAuthMessage(translateInterfaceValue("completeCaptcha"));
            return;
        }

        setBusy(true);
        showAuthMessage(translateInterfaceValue("signingIn"));

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            ...credentials,
            options: { captchaToken: captchaToken || undefined }
        });

        setBusy(false);
        resetCaptcha();

        if (error) {
            showAuthMessage(getSupabaseErrorMessage(error));
            return;
        }

        const user = await getActiveAuthUser(data);

        if (!user) {
            showAuthMessage(translateInterfaceValue("signInNotPersisted"));
            return;
        }

        window.location.replace(getSafeReturnUrl());
    };

    forgotPasswordButton?.addEventListener("click", async () => {
        const email = emailInput.value.trim();

        if (!email || !emailInput.validity.valid || email.length > 254) {
            showAuthMessage(translateInterfaceValue("enterEmailForPasswordReset"));
            emailInput.focus();
            return;
        }

        if (turnstileSiteKey && !captchaToken) {
            showAuthMessage(translateInterfaceValue("completeCaptcha"));
            return;
        }

        setBusy(true);
        showAuthMessage(translateInterfaceValue("sendingPasswordReset"));

        const redirectTo = getAuthCallbackUrl("password-reset", getSafeReturnUrl());
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo,
            captchaToken: captchaToken || undefined
        });

        setBusy(false);
        resetCaptcha();

        if (error) {
            showAuthMessage(getSupabaseErrorMessage(error));
            return;
        }

        showAuthMessage(translateInterfaceValue("passwordResetEmailSent"));
    });

    saveNewPasswordButton?.addEventListener("click", async () => {
        const newPassword = newPasswordInput?.value || "";
        const repeatedPassword = newPasswordConfirmInput?.value || "";

        if (newPassword.length < 8 || newPassword.length > 128) {
            showAuthMessage(translateInterfaceValue("enterNewPassword"));
            newPasswordInput?.focus();
            return;
        }

        if (newPassword !== repeatedPassword) {
            showAuthMessage(translateInterfaceValue("passwordsDoNotMatch"));
            newPasswordConfirmInput?.focus();
            return;
        }

        setBusy(true);
        showAuthMessage(translateInterfaceValue("savingNewPassword"));

        try {
            await updateCurrentUserPassword(newPassword);
            showAuthMessage(translateInterfaceValue("passwordChanged"));
            newPasswordInput.value = "";
            newPasswordConfirmInput.value = "";
        } catch (error) {
            showAuthMessage(getSupabaseErrorMessage(error));
        } finally {
            setBusy(false);
        }
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (authMode === "login") {
            await signIn();
            return;
        }

        const credentials = getCredentials();
        const repeatedPassword = passwordConfirmInput?.value || "";

        if (!credentialsAreValid(credentials)) {
            showAuthMessage(translateInterfaceValue("enterEmailAndPassword"));
            return;
        }

        if (credentials.password !== repeatedPassword) {
            if (!repeatedPassword) {
                showAuthMessage(translateInterfaceValue("repeatPasswordAgain"));
                passwordConfirmInput?.focus();
                return;
            }
            showAuthMessage(translateInterfaceValue("passwordsDoNotMatch"));
            passwordConfirmInput?.focus();
            return;
        }

        if (turnstileSiteKey && !captchaToken) {
            showAuthMessage(translateInterfaceValue("completeCaptcha"));
            return;
        }

        setBusy(true);
        showAuthMessage(translateInterfaceValue("creatingAccount"));

        const { error } = await supabaseClient.auth.signUp({
            ...credentials,
            options: {
                emailRedirectTo: getAuthCallbackUrl("confirm"),
                captchaToken: captchaToken || undefined
            }
        });

        setBusy(false);
        resetCaptcha();

        if (error) {
            showAuthMessage(getSupabaseErrorMessage(error));
            return;
        }

        showAuthMessage(translateInterfaceValue("accountCreatedConfirmEmail"));
    });

    loginModeButton.addEventListener("click", () => setAuthMode("login"));
    registerModeButton.addEventListener("click", () => setAuthMode("register"));
    window.addEventListener("privoz-language-change", () => setAuthMode(authMode));

    setAuthMode(urlParams.get("auth") === "register" ? "register" : "login");
    finishAuthCallback();
}
