(function exposeReturnUrlSecurity(globalScope) {
    const safeRoutes = {
        "index.html": new Set(["favorites"]),
        "category.html": new Set(["type", "search", "favorites"]),
        "create_seller.html": new Set(),
        "seller.html": new Set(["seller", "owner"]),
        "seller_panel.html": new Set(["seller"]),
        "admin.html": new Set()
    };

    const isUuidValue = value => (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            .test(String(value || ""))
    );

    function sanitizeReturnUrl(value) {
        const requested = String(value || "").trim();
        const requestedPath = requested.split(/[?#]/, 1)[0];

        if (!requested || /[\\\u0000-\u001f]/.test(requested)) return "index.html";
        if (requested.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(requested)) return "index.html";
        if (requestedPath.includes("/") || requestedPath.startsWith(".")) return "index.html";

        let parsed;

        try {
            parsed = new URL(requested, "https://local.invalid/");
        } catch {
            return "index.html";
        }

        if (parsed.origin !== "https://local.invalid" || parsed.hash) return "index.html";

        const pageName = parsed.pathname.replace(/^\/+/, "");
        const allowedParams = safeRoutes[pageName];

        if (!allowedParams || pageName.includes("/")) return "index.html";

        for (const [key, parameterValue] of parsed.searchParams) {
            if (!allowedParams.has(key)) return "index.html";
            if (key === "seller" && !isUuidValue(parameterValue)) return "index.html";
            if (["owner", "favorites"].includes(key) && parameterValue !== "1") return "index.html";
            if (["type", "search"].includes(key) && (!parameterValue || parameterValue.length > 100)) {
                return "index.html";
            }
        }

        return `${pageName}${parsed.search}`;
    }

    const api = { sanitizeReturnUrl };
    globalScope.ReturnUrlSecurity = api;

    if (typeof module !== "undefined" && module.exports) module.exports = api;
}(typeof window !== "undefined" ? window : globalThis));
