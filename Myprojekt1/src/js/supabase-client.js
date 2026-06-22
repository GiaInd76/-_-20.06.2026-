/* Подключение к Supabase и авторизация продавцов. */

const SUPABASE_URL = "https://sdsmnahyobzmrafkexud.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TG6YRcuVzOUsQLOGbwj2Ew_305uGI-P";

const supabaseClient = window.supabase?.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

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
    return data.user || null;
}

async function requireSellerSession(returnUrl = window.location.href) {
    const user = await getCurrentSupabaseUser();

    if (user) return user;

    const localReturnUrl = new URL(returnUrl, window.location.href);
    const returnPath = `${localReturnUrl.pathname.split("/").pop()}${localReturnUrl.search}`;

    window.location.href = `auth.html?return=${encodeURIComponent(returnPath)}`;
    return null;
}

async function initProtectedSellerPage() {
    const requiresAuth = document.body.dataset.sellerAuth === "required";
    const ownerView = new URLSearchParams(window.location.search).get("owner") === "1";

    if (!requiresAuth && !ownerView) return;

    await requireSellerSession(window.location.href);
}

function initAuthPage() {
    const form = document.getElementById("authForm");
    const emailInput = document.getElementById("authEmail");
    const passwordInput = document.getElementById("authPassword");
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

        if (!credentials.email || credentials.password.length < 6) {
            message.textContent = "Введите почту и пароль не короче 6 символов.";
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
