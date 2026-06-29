/* Подключение к Supabase, авторизация и синхронизация данных. */

const SUPABASE_URL = "https://sdsmnahyobzmrafkexud.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TG6YRcuVzOUsQLOGbwj2Ew_305uGI-P";

const supabaseClient = window.supabase?.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
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

async function signOutSeller() {
    cachedSupabaseUser = null;

    if (!supabaseClient) return;

    const { error } = await supabaseClient.auth.signOut();

    if (error) throw error;
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

    const missingColumn = getMissingColumnName(error);

    if (error.message === "auth-required") {
        return "Сначала войдите в аккаунт продавца.";
    }

    if (error.message === "shop-not-synced") {
        return "Сначала сохраните профиль лавки в базе.";
    }

    if (error.message === "admin-required") {
        return "У этого аккаунта нет прав администратора.";
    }

    if (error.message.endsWith("-timeout")) {
        return "Supabase долго не отвечает. Проверьте интернет и попробуйте ещё раз.";
    }

    if (error.message === "Email not confirmed") {
        return "Почта ещё не подтверждена. Проверьте письмо или временно отключите подтверждение email в Supabase.";
    }

    if (error.code === "23505") {
        return "У этого аккаунта уже есть лавка.";
    }

    if (missingColumn) {
        return `В базе нет колонки ${missingColumn}. Запустите SQL-файл 006_repair_marketplace_schema.sql в Supabase.`;
    }

    if (error.code === "PGRST204") {
        return "Схема Supabase отстаёт от сайта. Запустите SQL-файл 006_repair_marketplace_schema.sql в Supabase.";
    }

    return error.message || "Неизвестная ошибка Supabase.";
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

    let shopsResult;
    let productsResult;

    try {
        [shopsResult, productsResult] = await withTimeout(
            Promise.all([
                supabaseClient
                    .from("shops")
                    .select("*")
                    .order("created_at", { ascending: true }),
                supabaseClient
                    .from("products")
                    .select("*")
                    .order("created_at", { ascending: true })
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
    const { data, error } = await withTimeout(request, 12000, "save-seller");

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
    const { data, error } = await withTimeout(request, 12000, "save-product");

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
    if (!supabaseClient) {
        return {
            shops: readStorage("sellers"),
            products: readStorage("products")
        };
    }

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

    return {
        shops: (shopsResult.data || []).map(toLocalSeller),
        products: (productsResult.data || []).map(toLocalProduct)
    };
}

async function adminDeleteProduct(productId) {
    if (!supabaseClient || !isUuid(productId)) return;

    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) throw new Error("admin-required");

    const { error } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", productId);

    if (error) throw error;
}

async function adminDeleteShop(shopId) {
    if (!supabaseClient || !isUuid(shopId)) return;

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

    const signIn = async () => {
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
            message.textContent = getSupabaseErrorMessage(error);
            return;
        }

        window.location.href = getSafeReturnUrl();
    };

    form.addEventListener("submit", event => {
        event.preventDefault();
        signIn();
    });

    registerButton.addEventListener("click", async event => {
        event.preventDefault();

        const credentials = getCredentials();
        const isConfirmVisible = !passwordConfirmInput?.classList.contains("hidden");
        const repeatedPassword = passwordConfirmInput?.value || "";

        if (!credentials.email || credentials.password.length < 6) {
            message.textContent = "Введите почту и пароль не короче 6 символов.";
            return;
        }

        if (!isConfirmVisible) {
            passwordConfirmInput?.classList.remove("hidden");
            passwordInput.setAttribute("autocomplete", "new-password");
            passwordConfirmInput?.focus();
            message.textContent = "Повторите пароль и нажмите регистрацию ещё раз.";
            return;
        }

        if (credentials.password !== repeatedPassword) {
            message.textContent = "Пароли не совпадают. Повторите пароль ещё раз.";
            passwordConfirmInput?.focus();
            return;
        }

        setBusy(true);
        message.textContent = "Создаём аккаунт...";

        const redirectUrl = new URL(getSafeReturnUrl(), window.location.href).href;
        const { data, error } = await supabaseClient.auth.signUp({
            ...credentials,
            options: {
                emailRedirectTo: redirectUrl
            }
        });

        if (error) {
            const alreadyRegistered = /already|registered|exists/i.test(error.message || "");

            if (alreadyRegistered) {
                message.textContent = "Аккаунт уже есть, пробуем войти...";
                const signInResult = await supabaseClient.auth.signInWithPassword(credentials);

                setBusy(false);

                if (!signInResult.error) {
                    window.location.href = getSafeReturnUrl();
                    return;
                }
            }

            setBusy(false);
            message.textContent = getSupabaseErrorMessage(error);
            return;
        }

        if (data.session) {
            window.location.href = getSafeReturnUrl();
            return;
        }

        const signInResult = await supabaseClient.auth.signInWithPassword(credentials);

        setBusy(false);

        if (!signInResult.error) {
            window.location.href = getSafeReturnUrl();
            return;
        }

        message.textContent = "Аккаунт создан, но Supabase всё ещё ждёт подтверждение почты. Для тестов отключите Confirm email или подтвердите пользователя в Supabase.";
    });
}
