/* Спільне модальне вікно фотографій товару. */

function openProductModal(product) {
    const modal = document.getElementById("productModal");
    const image = document.getElementById("productModalImage");
    const title = document.getElementById("productModalTitle");
    const price = document.getElementById("productModalPrice");

    if (!modal || !image || !title || !price) return;

    categories.forEach(category => {
        modal.classList.remove(getCategoryClass(category.id));
    });
    modal.classList.add(getCategoryClass(product.category));
    modalProductImages = getProductImages(product);
    modalProductImageIndex = 0;
    updateProductModalImage();
    title.textContent = getLocalizedProductName(product);
    price.textContent = getProductPriceText(product);
    modal.style.display = "flex";
}

function updateProductModalImage() {
    const image = document.getElementById("productModalImage");

    if (!image) return;

    const currentImage = modalProductImages[modalProductImageIndex] || "";

    image.classList.toggle("has-image", Boolean(currentImage));
    image.style.backgroundImage = currentImage ? `url("${currentImage}")` : "";
    image.textContent = currentImage ? "" : translateInterfaceValue("viewProductPhoto");
}

function getPublicSellerPageUrl() {
    const url = new URL("seller.html", window.location.href);

    url.search = "";
    url.searchParams.set("seller", currentSeller);
    url.hash = "";

    return url.href;
}

function openSellerQrModal() {
    const modal = document.getElementById("sellerQrModal");
    const qrContainer = document.getElementById("sellerQrCode");
    const closeButton = document.getElementById("sellerQrCloseBtn");

    if (!modal || !qrContainer || !currentSeller) return;

    qrContainer.innerHTML = "";

    if (typeof QRCode === "function") {
        new QRCode(qrContainer, {
            text: getPublicSellerPageUrl(),
            width: 220,
            height: 220,
            colorDark: "#171717",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
        });
    } else {
        qrContainer.textContent = translateInterfaceValue("pageQrUnavailable");
    }

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    closeButton?.focus();
}

function closeSellerQrModal() {
    const modal = document.getElementById("sellerQrModal");

    if (!modal) return;

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.getElementById("sellerQrBtn")?.focus();
}

function initModal() {
    const productModal = document.getElementById("productModal");
    const infoModal = document.getElementById("modal");
    const contactModal = document.getElementById("contactModal");

    if (!productModal && !infoModal && !contactModal) return;

    document.addEventListener("click", event => {
        if (
            productModal?.style.display === "flex" &&
            event.target.id === "productModalImage" &&
            modalProductImages.length > 1
        ) {
            modalProductImageIndex = (modalProductImageIndex + 1) % modalProductImages.length;
            updateProductModalImage();
            return;
        }

        if (productModal?.style.display === "flex") {
            productModal.style.display = "none";
            return;
        }

        if (event.target.id === "findBtn" && infoModal) {
            infoModal.style.display = "flex";
            return;
        }

        if (event.target.id === "contactBtn" && contactModal) {
            contactModal.style.display = "flex";
            return;
        }

        if (event.target.id === "sellerQrBtn") {
            openSellerQrModal();
            return;
        }

        if (event.target.id === "sellerQrCloseBtn") {
            closeSellerQrModal();
            return;
        }

        if (event.target.id === "sellerQrModal") {
            closeSellerQrModal();
            return;
        }

        if (event.target.closest("#sellerQrModal .qr-modal-content")) return;

        const openInfoModal = event.target.closest(".info-modal");

        if (openInfoModal?.style.display === "flex") {
            openInfoModal.style.display = "none";
        }
    });

    document.addEventListener("keydown", event => {
        const sellerQrModal = document.getElementById("sellerQrModal");

        if (event.key === "Escape" && sellerQrModal?.style.display === "flex") {
            closeSellerQrModal();
        }
    });
}
