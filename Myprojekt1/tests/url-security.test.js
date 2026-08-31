const assert = require("node:assert/strict");
const { sanitizeReturnUrl } = require("../src/js/url-security.js");

const uuid = "4fdaf0de-2d53-4d23-9feb-1fb6b6b23cb1";

assert.equal(sanitizeReturnUrl("create_seller.html"), "create_seller.html");
assert.equal(sanitizeReturnUrl(`seller_panel.html?seller=${uuid}`), `seller_panel.html?seller=${uuid}`);
assert.equal(sanitizeReturnUrl("category.html?favorites=1"), "category.html?favorites=1");

[
    "https://evil.example/",
    "//evil.example/",
    "javascript:alert(1)",
    "data:text/html,test",
    "../admin.html",
    "seller_panel.html?seller=not-a-uuid",
    "admin.html?next=https://evil.example",
    "index.html#javascript:alert(1)",
    "unknown.html"
].forEach(value => assert.equal(sanitizeReturnUrl(value), "index.html", value));

console.log("URL security tests passed");
