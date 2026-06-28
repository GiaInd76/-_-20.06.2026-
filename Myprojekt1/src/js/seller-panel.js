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
    const sellerCoverInput = document.getElementById("sellerCoverImage");
    const sellerCoverPreview = document.getElementById("sellerCoverPreview");
    const removeSellerCoverBtn = document.getElementById("removeSellerCoverBtn");
    const profileMessage = document.getElementById("profileMessage");
    const productMessage = document.getElementById("productMessage");
    const toggleProfileBtn = document.getElementById("toggleProfileBtn");
    const sellerProfilePanel = document.getElementById("sellerProfilePanel");
    const featuredProductsPicker = document.getElementById("featuredProductsPicker");
    const sellerLogoutBtn = document.getElementById("sellerLogoutBtn");
    const deleteSellerBtn = document.getElementById("deleteSellerBtn");
    const deleteSellerModal = document.getElementById("deleteSellerModal");
    const deleteSellerText = document.getElementById("deleteSellerText");
    const cancelDeleteSellerBtn = document.getElementById("cancelDeleteSellerBtn");
    const confirmDeleteSellerBtn = document.getElementById("confirmDeleteSellerBtn");
    const seller = getSellerById(currentSeller);

    if (!isSellerOwnedByCurrentUser(seller)) {
        const ownSeller = getSellerForUser();

        if (ownSeller) {
            openPage(`seller_panel.html?seller=${encodeURIComponent(ownSeller.id)}`);
        } else {
            openPage("create_seller.html");
        }

        return;
    }

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

    deleteSellerBtn?.classList.toggle("hidden", !seller);

    sellerLogoutBtn?.addEventListener("click", async () => {
        sellerLogoutBtn.disabled = true;
        showMessage(profileMessage, "Выходим из аккаунта...");

        try {
            await signOutSeller();
            openPage("index.html");
        } catch (error) {
            console.warn("Seller logout failed", error);
            sellerLogoutBtn.disabled = false;
            showMessage(profileMessage, `Не удалось выйти: ${getSupabaseErrorMessage(error)}`);
        }
    });

    const closeDeleteSellerModal = () => {
        if (deleteSellerModal) deleteSellerModal.style.display = "none";
    };

    deleteSellerBtn?.addEventListener("click", () => {
        if (!seller || !deleteSellerModal) return;

        if (deleteSellerText) {
            deleteSellerText.textContent = `Лавка «${seller.name}» и все её товары будут удалены.`;
        }

        deleteSellerModal.style.display = "flex";
    });

    cancelDeleteSellerBtn?.addEventListener("click", closeDeleteSellerModal);

    deleteSellerModal?.addEventListener("click", event => {
        if (event.target === deleteSellerModal) closeDeleteSellerModal();
    });

    confirmDeleteSellerBtn?.addEventListener("click", async () => {
        if (!seller || seller.id !== currentSeller) return;

        confirmDeleteSellerBtn.disabled = true;

        try {
            await deleteSellerFromSupabase(seller.id);
        } catch (error) {
            console.warn("Seller deletion failed", error);
            confirmDeleteSellerBtn.disabled = false;
            showMessage(profileMessage, "Не удалось удалить лавку из базы.");
            closeDeleteSellerModal();
            return;
        }

        const products = readStorage("products");
        const deletedProductIds = new Set(
            products
                .filter(product => product.seller === currentSeller)
                .map(product => product.id)
        );

        writeStorage(
            "products",
            products.filter(product => product.seller !== currentSeller)
        );
        writeStorage(
            "sellers",
            readStorage("sellers").filter(item => item.id !== currentSeller)
        );
        writeStorage(
            "favoriteProducts",
            getFavoriteProducts().filter(productId => !deletedProductIds.has(productId))
        );

        closeDeleteSellerModal();
        openPage("create_seller.html");
    });

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
        if (!productImagePreview) return;

        if (!selectedProductImages.length) {
            productImagePreview.classList.add("hidden");
            productImagePreview.innerHTML = "";
            productImageStatus?.classList.add("hidden");
            if (productImageLabel) {
                productImageLabel.classList.remove("hidden");
                productImageLabel.textContent = "Добавить фото";
            }
            renderLiveProductPreview();
            return;
        }

        productImagePreview.classList.remove("hidden");
        productImagePreview.innerHTML = selectedProductImages
            .map((image, index) => `
                <div class="photo-preview-item" data-photo-index="${index}">
                    <button
                        class="remove-photo-btn"
                        type="button"
                        aria-label="Удалить фотографию ${index + 1}"
                    >×</button>
                </div>
            `)
            .join("");

        productImagePreview
            .querySelectorAll(".photo-preview-item")
            .forEach((preview, index) => {
                preview.style.backgroundImage = `url("${selectedProductImages[index]}")`;
            });
        productImagePreview
            .querySelectorAll(".remove-photo-btn")
            .forEach(button => {
                button.addEventListener("click", event => {
                    const preview = event.currentTarget.closest(".photo-preview-item");
                    const photoIndex = Number(preview?.dataset.photoIndex);

                    if (!Number.isInteger(photoIndex)) return;

                    selectedProductImages.splice(photoIndex, 1);
                    if (productImageInput) productImageInput.value = "";
                    updateProductImagePreview();
                    showMessage(productMessage, "Фотография удалена.");
                });
            });

        if (productImageLabel) {
            productImageLabel.textContent = "Добавить фото";
            productImageLabel.classList.toggle("hidden", selectedProductImages.length >= 2);
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

        resizeImageFile(file, imageLimits.cover)
            .then(result => {
                selectedSellerCover = result.dataUrl;
                updateSellerCoverPreview();
                showMessage(
                    profileMessage,
                    `Фон сжат: ${getReadableFileSize(result.originalBytes)} → ${getReadableFileSize(result.compressedBytes)}. Сохраните профиль.`
                );
            })
            .catch(error => {
                selectedSellerCover = "";
                sellerCoverInput.value = "";
                updateSellerCoverPreview();

                showMessage(
                    profileMessage,
                    error.message === "too-large"
                        ? `Фон слишком тяжёлый. Максимум: ${getReadableFileSize(imageLimits.cover.maxOriginalBytes)}.`
                        : "Не удалось загрузить фон лавки. Попробуйте JPG или PNG."
                );
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
        const availableSlots = Math.max(0, 2 - selectedProductImages.length);
        const files = [...(productImageInput.files || [])].slice(0, availableSlots);

        if (!files.length) {
            productImageInput.value = "";
            return;
        }

        if (files.some(file => !file.type.startsWith("image/"))) {
            showMessage(productMessage, "Выберите только изображения.");
            productImageInput.value = "";
            return;
        }

        if (files.some(file => file.size > imageLimits.product.maxOriginalBytes)) {
            showMessage(
                productMessage,
                `Фото слишком тяжёлое. Максимум: ${getReadableFileSize(imageLimits.product.maxOriginalBytes)}.`
            );
            productImageInput.value = "";
            return;
        }

        Promise.all(files.map(file => resizeImageFile(file, imageLimits.product)))
            .then(results => {
                selectedProductImages = [
                    ...selectedProductImages,
                    ...results.map(result => result.dataUrl)
                ].slice(0, 2);
                updateProductImagePreview();

                const originalBytes = results.reduce((sum, result) => sum + result.originalBytes, 0);
                const compressedBytes = results.reduce((sum, result) => sum + result.compressedBytes, 0);

                showMessage(
                    productMessage,
                    `Фото сжато: ${getReadableFileSize(originalBytes)} → ${getReadableFileSize(compressedBytes)}. Выбрано: ${selectedProductImages.length} из 2.`
                );
            })
            .catch(() => {
                showMessage(productMessage, "Не удалось загрузить фотографии. Попробуйте JPG или PNG.");
                productImageInput.value = "";
                updateProductImagePreview();
            });
    });

    cancelEditProductBtn?.addEventListener("click", () => {
        resetProductForm();
        showMessage(productMessage, "Редактирование отменено.");
    });

    saveProfileBtn?.addEventListener("click", async () => {
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
        const draftSeller = {
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

        saveProfileBtn.disabled = true;
        showMessage(profileMessage, "Сохраняем профиль...");

        try {
            const savedSeller = isSupabaseReady()
                ? await saveSellerToSupabase(draftSeller)
                : draftSeller;

            if (savedSeller.id !== currentSeller) {
                currentSeller = savedSeller.id;
                sellerIndex = sellers.findIndex(item => item.id === existingSeller.id);
            }

            sellers[sellerIndex === -1 ? sellers.length : sellerIndex] = savedSeller;
            selectedSellerCover = savedSeller.coverImage || "";
            writeStorage("sellers", sellers);
            window.history.replaceState(null, "", `seller_panel.html?seller=${encodeURIComponent(currentSeller)}`);
            showMessage(profileMessage, "Профиль лавки сохранён.");
            renderPanelProducts();
            setProfilePanelOpen(false);
        } catch (error) {
            console.warn("Seller save failed", error);
            showMessage(profileMessage, `Не удалось сохранить профиль: ${getSupabaseErrorMessage(error)}`);
        } finally {
            saveProfileBtn.disabled = false;
        }
    });

    addProductBtn?.addEventListener("click", async () => {
        if (!currentSeller) {
            showMessage(productMessage, "Сначала сохраните профиль лавки.");
            return;
        }

        const name = document.getElementById("productName").value.trim();
        const department = productDepartmentInput.value.trim();
        const category = document.getElementById("category").value;
        const price = normalizeProductPrice(document.getElementById("price").value);
        const unit = document.getElementById("unit").value;
        const description = document.getElementById("productDescription").value.trim();

        if (!name || !price) {
            showMessage(productMessage, "Введите название товара и цену.");
            return;
        }

        if (!isValidProductPrice(price)) {
            showMessage(productMessage, "Цена может быть числом или диапазоном, например 630/650.");
            return;
        }

        const products = readStorage("products");
        let savedProductId = "";
        let nextProduct = null;

        if (editingProductIndex !== null) {
            const oldProduct = products[editingProductIndex];

            if (!oldProduct || oldProduct.seller !== currentSeller) {
                showMessage(productMessage, "Не удалось найти товар для редактирования.");
                resetProductForm();
                return;
            }

            const now = new Date().toISOString();
            const oldPrice = oldProduct.priceLabel || oldProduct.price;

            nextProduct = {
                ...oldProduct,
                name,
                department,
                category,
                price,
                priceLabel: price,
                unit,
                description,
                images: [...selectedProductImages],
                image: selectedProductImages[0] || "",
                updatedAt: now,
                priceChangedAt: oldPrice !== price
                    ? now
                    : (oldProduct.priceChangedAt || null)
            };
            savedProductId = oldProduct.id;
        } else {
            savedProductId = `product_${Date.now()}`;
            const now = new Date().toISOString();

            nextProduct = {
                id: savedProductId,
                seller: currentSeller,
                name,
                department,
                category,
                price,
                priceLabel: price,
                unit,
                description,
                images: [...selectedProductImages],
                image: selectedProductImages[0] || "",
                createdAt: now,
                updatedAt: now,
                priceChangedAt: null
            };
        }

        addProductBtn.disabled = true;
        showMessage(productMessage, editingProductIndex !== null ? "Сохраняем товар..." : "Добавляем товар...");

        try {
            const savedProduct = isSupabaseReady()
                ? await saveProductToSupabase(nextProduct)
                : nextProduct;

            if (editingProductIndex !== null) {
                products[editingProductIndex] = savedProduct;
            } else {
                products.push(savedProduct);
            }

            savedProductId = savedProduct.id;
        } catch (error) {
            console.warn("Product save failed", error);
            showMessage(productMessage, `Не удалось сохранить товар: ${getSupabaseErrorMessage(error)}`);
            addProductBtn.disabled = false;
            return;
        }

        writeStorage("products", products);
        showMessage(
            productMessage,
            editingProductIndex !== null ? "Товар сохранён." : "Товар добавлен."
        );
        resetProductForm();
        renderPanelProducts();
        renderDepartmentSuggestions();
        renderFeaturedProductsPicker();
        addProductBtn.disabled = false;
    });

    renderLiveProductPreview();
    renderDepartmentSuggestions();
    renderPanelProducts();
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
            button.addEventListener("click", async () => {
                const index = Number(button.dataset.index);
                const products = readStorage("products");

                button.disabled = true;

                try {
                    await deleteProductFromSupabase(products[index]?.id);
                } catch (error) {
                    console.warn("Product deletion failed", error);
                    button.disabled = false;
                    return;
                }

                products.splice(index, 1);
                writeStorage("products", products);
                editingProductIndex = null;
                renderPanelProducts();
                renderDepartmentSuggestions();
            });
        });
}
