/* Подключение к Supabase, авторизация и синхронизация данных. */

const SUPABASE_URL = "https://sdsmnahyobzmrafkexud.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TG6YRcuVzOUsQLOGbwj2Ew_305uGI-P";

const supabaseClient = window.supabase?.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

let cachedSupabaseUser = null;

function getSafeReturnUrl() {
    const requestedUrl = new URLSearchParams(window.location.search).get("return");

    if (!requestedUrl || requestedUrl.includes("://") || requestedUrl.startsWith("//")) {
        return "index.html";
    }

    return requestedUrl;
}

async function getCurrentSupabaseUser() {
    if (!supabaseClient) return null;

    const { data, error } = await supabaseClient.auth.getUser();

    if (error) return null;
    cachedSupabaseUser = data.user || null;
    return cachedSupabaseUser;
}

function getCachedSupabaseUser() {
    return cachedSupabaseUser;
}

async function requireSellerSession(returnUrl = window.location.href) {
    const user = await getCurrentSupabaseUser();

    if (user) return user;

    const localReturnUrl = new URL(returnUrl, window.location.href);
    const returnPath = `${localReturnUrl.pathname.split("/").pop()}${localReturnUrl.search}`;

    window.location.href = `auth.html?return=${encodeURIComponent(returnPath)}`;
    return null;
}

function getSupabaseErrorMessage(error) {
    if (!error) return "Неизвестная ошибка.";

    if (error.message === "auth-required") {
        return "Сначала войдите в аккаунт продавца.";
    }

    if (error.message === "shop-not-synced") {
        return "Сначала сохраните профиль лавки в базе.";
    }

    return error.message || "Неизвестная ошибка Supabase.";
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

    for (const image of imageList.slice(0, 2)) {
        if (!image) continue;
        uploaded.push(await uploadMarketplaceImage(image, folder));
    }

    return uploaded;
}

function toLocalSeller(row) {
    return {
        id: row.id,
        ownerId: row.owner_id || "",
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

async function hydrateMarketplaceFromSupabase() {
    if (!supabaseClient) return;

    const [shopsResult, productsResult] = await Promise.all([
        supabaseClient
            .from("shops")
            .select("*")
            .order("created_at", { ascending: true }),
        supabaseClient
            .from("products")
            .select("*")
            .order("created_at", { ascending: true })
    ]);

    if (shopsResult.error || productsResult.error) {
        console.warn("Supabase sync skipped", shopsResult.error || productsResult.error);
        return;
    }

    writeStorage("sellers", (shopsResult.data || []).map(toLocalSeller));
    writeStorage("products", (productsResult.data || []).map(toLocalProduct));
}

async function saveSellerToSupabase(seller) {
    if (!supabaseClient) return seller;

    const user = await getCurrentSupabaseUser();

    if (!user) throw new Error("auth-required");

    const coverUrl = await uploadMarketplaceImage(seller.coverImage, "covers");
    const payload = {
        owner_id: user.id,
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
    const { data, error } = await request;

    if (error) throw error;

    return toLocalSeller(data);
}

async function deleteSellerFromSupabase(sellerId) {
    if (!supabaseClient || !isUuid(sellerId)) return;

    const user = await getCurrentSupabaseUser();

    if (!user) throw new Error("auth-required");

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
    if (!supabaseClient) return product;

    const user = await getCurrentSupabaseUser();

    if (!user) throw new Error("auth-required");
    if (!isUuid(product.seller)) throw new Error("shop-not-synced");

    const images = await uploadMarketplaceImages(
        getProductImages(product),
        `products/${product.seller}`
    );
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
        image_urls: images,
        updated_at: product.updatedAt || new Date().toISOString(),
        price_changed_at: product.priceChangedAt || null
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
    const { data, error } = await request;

    if (error) throw error;

    return toLocalProduct(data);
}

async function deleteProductFromSupabase(productId) {
    if (!supabaseClient || !isUuid(productId)) return;

    const { error } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", productId);

    if (error) throw error;
}

async function initProtectedSellerPage() {
    const requiresAuth = document.body.dataset.sellerAuth === "required";
    const ownerView = new URLSearchParams(window.location.search).get("owner") === "1";

    if (!requiresAuth && !ownerView) return true;

    const user = await requireSellerSession(window.location.href);

    return Boolean(user);
}

function initAuthPage() {
    const form = document.getElementById("authForm");
    const emailInput = document.getElementById("authEmail");
    const passwordInput = document.getElementById("authPassword");
    const passwordConfirmInput = document.getElementById("authPasswordConfirm");
    const loginButton = document.getElementById("loginBtn");
    const registerButton = document.getElementById("registerBtn");
    const message = document.getElementById("authMessage");

    if (!form || !supabaseClient) return;

    const setBusy = isBusy => {
        loginButton.disabled = isBusy;
        registerButton.disabled = isBusy;
    };

    const getCredentials = () => ({
        email: emailInput.value.trim(),
        password: passwordInput.value
    });

    loginButton.addEventListener("click", async () => {
        const credentials = getCredentials();

        if (!credentials.email || credentials.password.length < 6) {
            message.textContent = "Введите почту и пароль не короче 6 символов.";
            return;
        }

        setBusy(true);
        message.textContent = "Входим...";

        const { error } = await supabaseClient.auth.signInWithPassword(credentials);

        setBusy(false);

        if (error) {
            message.textContent = "Не удалось войти. Проверьте почту и пароль.";
            return;
        }

        window.location.href = getSafeReturnUrl();
    });

    registerButton.addEventListener("click", async () => {
        const credentials = getCredentials();
        const repeatedPassword = passwordConfirmInput?.value || "";

        if (!credentials.email || credentials.password.length < 6) {
            message.textContent = "Введите почту и пароль не короче 6 символов.";
            return;
        }

        if (credentials.password !== repeatedPassword) {
            message.textContent = "Пароли не совпадают. Повторите пароль ещё раз.";
            passwordConfirmInput?.focus();
            return;
        }

        setBusy(true);
        message.textContent = "Создаём аккаунт...";

        const { data, error } = await supabaseClient.auth.signUp(credentials);

        setBusy(false);

        if (error) {
            message.textContent = error.message;
            return;
        }

        if (data.session) {
            window.location.href = getSafeReturnUrl();
            return;
        }

        message.textContent = "Проверьте почту и подтвердите регистрацию.";
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        loginButton.click();
    });
}
