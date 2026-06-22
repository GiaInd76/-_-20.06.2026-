/* Кабинет продавца: профиль лавки, фотографии и добавление товаров. */

function initSellerPanel() {
    const saveProfileBtn = document.getElementById("saveSellerProfileBtn");
    const addProductBtn = document.getElementById("addProductBtn");

    if (!saveProfileBtn && !addProductBtn) return;

    const nameInput = document.getElementById("profileSellerName");
    const descriptionInput = document.getElementById("profileSellerDescription");
    const findInfoInput = document.getElementById("profileFindInfo");
    const phoneInput = document.getElementById("profilePhone");
    const telegramInput = document.getElementById("profileTelegram");
    const instagramInput = document.getElementById("profileInstagram");
    const viberInput = document.getElementById("profileViber");
    const categorySelect = document.getElementById("profileSellerCategory");
    const openInput = document.getElementById("profileOpenTime");
    const closeInput = document.getElementById("profileCloseTime");
    const productCategorySelect = document.getElementById("category");
    const productNameInput = document.getElementById("productName");
    const productDepartmentInput = document.getElementById("productDepartment");
    const productPriceInput = document.getElementById("price");
    const productUnitSelect = document.getElementById("unit");
    const productDescriptionInput = document.getElementById("productDescription");
    const liveProductPreview = document.getElementById("liveProductPreview");
    const productFormTitle = document.getElementById("productFormTitle");
    const cancelEditProductBtn = document.getElementById("cancelEditProductBtn");
    const productImageInput = document.getElementById("productImage");
    const productImagePreview = document.getElementById("productImagePreview");
    const productImageLabel = document.getElementById("productImageLabel");
    const productImageStatus = document.getElementById("productImageStatus");
    const removeProductImageBtn = document.getElementById("removeProductImageBtn");
    const sellerCoverInput = document.getElementById("sellerCoverImage");
    const sellerCoverPreview = document.getElementById("sellerCoverPreview");
    const removeSellerCoverBtn = document.getElementById("removeSellerCoverBtn");
    const profileMessage = document.getElementById("profileMessage");
    const productMessage = document.getElementById("productMessage");
    const toggleProfileBtn = document.getElementById("toggleProfileBtn");
    const sellerProfilePanel = document.getElementById("sellerProfilePanel");
    const featuredProductsPicker = document.getElementById("featuredProductsPicker");
    const seller = getSellerById(currentSeller);

    selectedSellerCover = seller?.coverImage || "";

    fillCategorySelect(categorySelect, seller?.category);
    fillCategorySelect(productCategorySelect);

    if (seller) {
        nameInput.value = seller.name || "";
        descriptionInput.value = seller.description || "";
        findInfoInput.value = seller.findInfo || "";
        phoneInput.value = seller.phone || "";
        telegramInput.value = seller.telegram || "";
        instagramInput.value = seller.instagram || "";
        viberInput.value = seller.viber || "";
        openInput.value = seller.open || "";
        closeInput.value = seller.close || "";
    }

    const renderFeaturedProductsPicker = () => {
        if (!featuredProductsPicker) return;

        const sellerProducts = readStorage("products")
            .filter(product => product.seller === currentSeller);
        const selectedIds = new Set(seller?.featuredProductIds || []);

        if (!sellerProducts.length) {
            featuredProductsPicker.innerHTML = `
                <p class="field-note">Сначала добавьте товары, затем выберите лучшие.</p>
            `;
            return;
        }

        featuredProductsPicker.innerHTML = sellerProducts.map(product => `
            <label class="featured-product-option">
                <input
                    type="checkbox"
                    value="${escapeHtml(product.id)}"
                    ${selectedIds.has(product.id) ? "checked" : ""}
                >
                <span>${escapeHtml(product.name)}</span>
            </label>
        `).join("");

        featuredProductsPicker.addEventListener("change", event => {
            const checked = [...featuredProductsPicker.querySelectorAll("input:checked")];

            if (checked.length > 3) {
                event.target.checked = false;
                showMessage(profileMessage, "Можно выбрать не больше трёх товаров.");
            }
        });
    };

    renderFeaturedProductsPicker();

    const updateSellerCoverPreview = () => {
        if (!sellerCoverPreview || !removeSellerCoverBtn) return;

        if (!selectedSellerCover) {
            sellerCoverPreview.classList.add("hidden");
            sellerCoverPreview.style.backgroundImage = "";
            removeSellerCoverBtn.classList.add("hidden");
            return;
        }

        sellerCoverPreview.classList.remove("hidden");
        sellerCoverPreview.style.backgroundImage = `url("${selectedSellerCover}")`;
        removeSellerCoverBtn.classList.remove("hidden");
    };

    const renderLiveProductPreview = () => {
        if (!liveProductPreview) return;

        const previewProduct = {
            name: productNameInput?.value.trim() || "Название товара",
            department: productDepartmentInput?.value.trim() || "Отдел",
            price: productPriceInput?.value.trim() || "0",
            unit: productUnitSelect?.value || "kg",
            description: productDescriptionInput?.value.trim() || "Описание появится здесь.",
            image: selectedProductImages[0] || ""
        };

        liveProductPreview.innerHTML = `
            <div class="live-preview-image ${previewProduct.image ? "has-image" : ""}"></div>
            <span class="product-department-label">${escapeHtml(previewProduct.department)}</span>
            <h3>${escapeHtml(previewProduct.name)}</h3>
            <p>${escapeHtml(previewProduct.description)}</p>
            <strong>${escapeHtml(getProductPriceText(previewProduct))}</strong>
        `;

        const previewImage = liveProductPreview.querySelector(".live-preview-image");

        if (previewImage && previewProduct.image) {
            previewImage.style.backgroundImage = `url("${previewProduct.image}")`;
        }
    };

    refreshLiveProductPreview = renderLiveProductPreview;

    [
        productNameInput,
        productDepartmentInput,
        productPriceInput,
        productUnitSelect,
        productDescriptionInput,
        productCategorySelect
    ].forEach(field => {
        field?.addEventListener("input", renderLiveProductPreview);
        field?.addEventListener("change", renderLiveProductPreview);
    });

    const updateProductImagePreview = () => {
        if (!productImagePreview || !removeProductImageBtn) return;

        if (!selectedProductImages.length) {
            productImagePreview.classList.add("hidden");
            productImagePreview.innerHTML = "";
            removeProductImageBtn.classList.add("hidden");
            productImageStatus?.classList.add("hidden");
            if (productImageLabel) {
                productImageLabel.textContent = "Добавить до 2 фото";
            }
            renderLiveProductPreview();
            return;
        }

        productImagePreview.classList.remove("hidden");
        productImagePreview.innerHTML = selectedProductImages
            .map(() => `<div class="photo-preview-item"></div>`)
            .join("");

        productImagePreview
            .querySelectorAll(".photo-preview-item")
            .forEach((preview, index) => {
                preview.style.backgroundImage = `url("${selectedProductImages[index]}")`;
            });
        removeProductImageBtn.classList.remove("hidden");

        if (productImageLabel) {
            productImageLabel.textContent = "Заменить фото";
        }

        if (productImageStatus) {
            productImageStatus.textContent = `✓ Выбрано фото: ${selectedProductImages.length} из 2`;
            productImageStatus.classList.remove("hidden");
        }

        renderLiveProductPreview();
    };

    refreshProductImagePreview = updateProductImagePreview;

    updateSellerCoverPreview();

    const setProfilePanelOpen = isOpen => {
        if (!toggleProfileBtn || !sellerProfilePanel) return;

        sellerProfilePanel.classList.toggle("is-collapsed", !isOpen);
        toggleProfileBtn.setAttribute("aria-expanded", String(isOpen));
        toggleProfileBtn.textContent = isOpen
            ? "Закрыть профиль"
            : "Редактировать лавку";
    };

    toggleProfileBtn?.addEventListener("click", () => {
        const isOpen = sellerProfilePanel?.classList.contains("is-collapsed");
        setProfilePanelOpen(Boolean(isOpen));
    });

    sellerCoverInput?.addEventListener("change", () => {
        const file = sellerCoverInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showMessage(profileMessage, "Выберите изображение для фона.");
            sellerCoverInput.value = "";
            return;
        }

        resizeImageFile(file)
            .then(imageData => {
                selectedSellerCover = imageData;
                updateSellerCoverPreview();
                showMessage(profileMessage, "Фон лавки выбран. Сохраните профиль.");
            })
            .catch(() => {
                selectedSellerCover = "";
                sellerCoverInput.value = "";
                updateSellerCoverPreview();
                showMessage(profileMessage, "Не удалось загрузить фон лавки.");
            });
    });

    removeSellerCoverBtn?.addEventListener("click", () => {
        selectedSellerCover = "";
        if (sellerCoverInput) {
            sellerCoverInput.value = "";
        }
        updateSellerCoverPreview();
        showMessage(profileMessage, "Фон убран. Сохраните профиль.");
    });

    const resetProductForm = () => {
        editingProductIndex = null;
        selectedProductImages = [];
        productFormTitle.textContent = "Добавить товар";
        addProductBtn.textContent = "Добавить товар";
        cancelEditProductBtn.classList.add("hidden");
        document.getElementById("productName").value = "";
        productDepartmentInput.value = "";
        document.getElementById("price").value = "";
        document.getElementById("productDescription").value = "";
        if (productImageInput) {
            productImageInput.value = "";
        }
        updateProductImagePreview();
        renderLiveProductPreview();
    };

    productImageInput?.addEventListener("change", () => {
        const files = [...(productImageInput.files || [])].slice(0, 2);

        if (!files.length) return;

        if (files.some(file => !file.type.startsWith("image/"))) {
            showMessage(productMessage, "Выберите только изображения.");
            productImageInput.value = "";
            return;
        }

        Promise.all(files.map(file => resizeImageFile(file)))
            .then(images => {
                selectedProductImages = images;
                updateProductImagePreview();
                showMessage(productMessage, `Подготовлено фото: ${images.length}.`);
            })
            .catch(() => {
                showMessage(productMessage, "Не удалось загрузить фотографии.");
                selectedProductImages = [];
                productImageInput.value = "";
                updateProductImagePreview();
            });
    });

    removeProductImageBtn?.addEventListener("click", () => {
        selectedProductImages = [];
        if (productImageInput) {
            productImageInput.value = "";
        }
        updateProductImagePreview();
        showMessage(productMessage, "Фото убрано.");
    });

    cancelEditProductBtn?.addEventListener("click", () => {
        resetProductForm();
        showMessage(productMessage, "Редактирование отменено.");
    });

    saveProfileBtn?.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const findInfo = findInfoInput.value.trim();
        const phone = phoneInput.value.trim();
        const telegram = telegramInput.value.trim();
        const instagram = instagramInput.value.trim();
        const viber = viberInput.value.trim();
        const category = categorySelect.value;
        const open = openInput.value;
        const close = closeInput.value;
        const featuredProductIds = featuredProductsPicker
            ? [...featuredProductsPicker.querySelectorAll("input:checked")]
                .slice(0, 3)
                .map(input => input.value)
            : (seller?.featuredProductIds || []);

        if (!name) {
            showMessage(profileMessage, "Введите название лавки.");
            return;
        }

        const sellers = readStorage("sellers");
        let sellerIndex = sellers.findIndex(item => item.id === currentSeller);

        if (sellerIndex === -1) {
            currentSeller = makeId(name) || `seller_${Date.now()}`;
            sellerIndex = sellers.length;
        }

        const existingSeller = sellers[sellerIndex] || {};

        sellers[sellerIndex] = {
            ...existingSeller,
            id: currentSeller,
            name,
            description,
            category,
            open,
            close,
            findInfo,
            phone,
            telegram,
            instagram,
            viber,
            coverImage: selectedSellerCover,
            featuredProductIds
        };

        writeStorage("sellers", sellers);
        window.history.replaceState(null, "", `seller_panel.html?seller=${encodeURIComponent(currentSeller)}`);
        showMessage(profileMessage, "Профиль лавки сохранён.");
        renderPanelProducts();
        setProfilePanelOpen(false);
    });

    addProductBtn?.addEventListener("click", () => {
        if (!currentSeller) {
            showMessage(productMessage, "Сначала сохраните профиль лавки.");
            return;
        }

        const name = document.getElementById("productName").value.trim();
        const department = productDepartmentInput.value.trim();
        const category = document.getElementById("category").value;
        const price = document.getElementById("price").value.trim();
        const unit = document.getElementById("unit").value;
        const description = document.getElementById("productDescription").value.trim();

        if (!name || !price) {
            showMessage(productMessage, "Введите название товара и цену.");
            return;
        }

        const products = readStorage("products");
        let savedProductId = "";

        if (editingProductIndex !== null) {
            const oldProduct = products[editingProductIndex];

            if (!oldProduct || oldProduct.seller !== currentSeller) {
                showMessage(productMessage, "Не удалось найти товар для редактирования.");
                resetProductForm();
                return;
            }

            products[editingProductIndex] = {
                ...oldProduct,
                name,
                department,
                category,
                price,
                unit,
                description,
                images: [...selectedProductImages],
                image: selectedProductImages[0] || ""
            };
            savedProductId = oldProduct.id;
        } else {
            savedProductId = `product_${Date.now()}`;
            products.push({
                id: savedProductId,
                seller: currentSeller,
                name,
                department,
                category,
                price,
                unit,
                description,
                images: [...selectedProductImages],
                image: selectedProductImages[0] || ""
            });
        }

        writeStorage("products", products);
        sessionProductIds.add(savedProductId);
        showMessage(
            productMessage,
            editingProductIndex !== null ? "Товар сохранён." : "Товар добавлен."
        );
        resetProductForm();
        renderPanelProducts();
        renderLiveSessionProducts();
        renderDepartmentSuggestions();
        renderFeaturedProductsPicker();
    });

    renderLiveProductPreview();
    renderLiveSessionProducts();
    renderDepartmentSuggestions();
    renderPanelProducts();
}

function renderLiveSessionProducts() {
    const container = document.getElementById("liveSessionProducts");

    if (!container) return;

    const products = readStorage("products")
        .filter(product => product.seller === currentSeller && sessionProductIds.has(product.id));

    if (!products.length) {
        container.innerHTML = `<p class="session-empty">Добавленные товары появятся здесь.</p>`;
        return;
    }

    container.innerHTML = products
        .map(product => `
            <article class="session-product-card">
                <span>${escapeHtml(getProductDepartment(product))}</span>
                <strong>${escapeHtml(product.name)}</strong>
                <small>${escapeHtml(getProductPriceText(product))}</small>
            </article>
        `)
        .join("");
}

function renderPanelProducts() {
    const productList = document.getElementById("productList");

    if (!productList) return;

    const products = readStorage("products");
    const sellerProducts = products
        .map((product, index) => ({ ...product, storageIndex: index }))
        .filter(product => product.seller === currentSeller);

    productList.classList.remove("product-list");
    productList.classList.add("department-catalog");
    productList.innerHTML = "";

    if (!sellerProducts.length) {
        productList.innerHTML = `
            <div class="empty-card">
                Пока товаров нет. Добавьте первый товар выше.
            </div>
        `;
        return;
    }

    const departments = new Map();

    sellerProducts.forEach(product => {
        const department = getProductDepartment(product);

        if (!departments.has(department)) {
            departments.set(department, []);
        }

        departments.get(department).push(product);
    });

    departments.forEach((departmentProducts, department) => {
        const group = document.createElement("section");
        group.className = "department-group";
        group.innerHTML = `
            <h3 class="department-title">${escapeHtml(department)}</h3>
            <div class="product-list department-products-grid"></div>
        `;

        const groupGrid = group.querySelector(".department-products-grid");

        departmentProducts.forEach(product => {
            const div = document.createElement("div");
            div.className = "product-card";

            div.innerHTML = `
                <span class="product-department-label">${escapeHtml(getProductDepartment(product))}</span>
                <h3>${escapeHtml(product.name)}</h3>
                <p class="product-description">
                    ${escapeHtml(product.description || "Описание пока не заполнено.")}
                </p>
                <div class="product-info">
                    <span>${escapeHtml(getProductPriceText(product))}</span>
                </div>
                ${
                    getProductImages(product).length
                        ? `<span class="photo-chip">${getProductImages(product).length} фото</span>`
                        : ""
                }
                <div class="product-actions">
                    <button class="edit-btn" data-index="${product.storageIndex}">
                        Редактировать
                    </button>

                    <button class="delete-btn" data-index="${product.storageIndex}">
                        Удалить
                    </button>
                </div>
            `;

            groupGrid.appendChild(div);
        });

        productList.appendChild(group);
    });

    productList
        .querySelectorAll(".edit-btn")
        .forEach(button => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.index);
                const products = readStorage("products");
                const product = products[index];

                if (!product || product.seller !== currentSeller) return;

                editingProductIndex = index;
                document.getElementById("productName").value = product.name || "";
                document.getElementById("productDepartment").value = product.department || "";
                document.getElementById("category").value = product.category || "other";
                document.getElementById("price").value = product.price || "";
                document.getElementById("unit").value = product.unit || "kg";
                document.getElementById("productDescription").value = product.description || "";
                selectedProductImages = getProductImages(product);
                refreshProductImagePreview();
                refreshLiveProductPreview();
                document.getElementById("productFormTitle").textContent = "Редактировать товар";
                document.getElementById("addProductBtn").textContent = "Сохранить товар";
                document.getElementById("cancelEditProductBtn").classList.remove("hidden");
                showMessage(document.getElementById("productMessage"), "Редактируете товар.");
                document.getElementById("productName").focus();
            });
        });

    productList
        .querySelectorAll(".delete-btn")
        .forEach(button => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.index);
                const products = readStorage("products");

                sessionProductIds.delete(products[index]?.id);

                products.splice(index, 1);
                writeStorage("products", products);
                editingProductIndex = null;
                renderPanelProducts();
                renderLiveSessionProducts();
                renderDepartmentSuggestions();
            });
        });
}
