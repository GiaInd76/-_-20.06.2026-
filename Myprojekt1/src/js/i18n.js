/* Переклади інтерфейсу сайту. Контент продавців показуємо без змін. */

const interfaceTranslations = {
    back: { uk: "Назад", en: "Back" },
    brandShort: { uk: "Ринок", en: "Market" },
    platformName: { uk: "Ринок Онлайн", en: "Market Online" },
    tradingPoint: { uk: "Торгова точка", en: "Trading point" },
    siteNavigation: { uk: "Навігація сайтом", en: "Site navigation" },
    authPageTitle: { uk: "Вхід продавця — Ринок Онлайн", en: "Seller sign-in — Market Online" },
    categoryPageTitle: { uk: "Категорія — Ринок Онлайн", en: "Category — Market Online" },
    sellerPageTitle: { uk: "Продавець — Ринок Онлайн", en: "Seller — Market Online" },
    sellerPanelTitle: { uk: "Панель продавця — Ринок Онлайн", en: "Seller panel — Market Online" },
    chooseCityMarketPoint: { uk: "Оберіть ринок Одеси та створіть торгову точку", en: "Choose an Odesa market and create a trading point" },
    fixedCityOdesa: { uk: "Місто: Одеса", en: "City: Odesa" },
    marketListUnavailable: { uk: "Список ринків поки недоступний. Оновіть сторінку або перевірте базу даних.", en: "The market list is currently unavailable. Refresh the page or check the database." },
    chooseMarketRequired: { uk: "Оберіть ринок для торгової точки.", en: "Choose a market for the trading point." },
    chooseMarket: { uk: "Оберіть ринок", en: "Choose a market" },
    marketContentHint: { uk: "Пошук і каталог працюватимуть у межах обраного ринку.", en: "Search and catalog will use the selected market." },
    loadingMarkets: { uk: "Завантажуємо ринки…", en: "Loading markets…" },
    close: { uk: "Закрити", en: "Close" },
    favorites: { uk: "Обране", en: "Favorites" },
    starFavorites: { uk: "☆ Обране", en: "☆ Favorites" },
    categories: { uk: "Категорії", en: "Categories" },
    shop: { uk: "Торгова точка", en: "Trading point" },
    newShop: { uk: "+ Нова точка", en: "+ New point" },
    homeKicker: { uk: "Одеса • Ринок Привоз", en: "Odesa • Pryvoz Market" },
    homeSubtitle: { uk: "Обирайте вдома. Купуйте у своїх.", en: "Choose at home. Buy local." },
    searchPlaceholder: { uk: "Знайти продукти...", en: "Find products..." },
    search: { uk: "Пошук", en: "Search" },
    offers: { uk: "Пропозиції", en: "Offers" },
    freshOffers: { uk: "Новинки та свіжі ціни", en: "New items and fresh prices" },
    emptyOffers: { uk: "Тут з'являться нові товари та оновлені ціни.", en: "New products and updated prices will appear here." },
    noFreshOffersInSelectedCategories: { uk: "В обраних категоріях поки немає свіжих пропозицій.", en: "There are no fresh offers in the selected categories yet." },
    newBadge: { uk: "Новинка", en: "New" },
    priceUpdated: { uk: "Ціну оновлено", en: "Price updated" },
    goShop: { uk: "До точки", en: "Visit point" },
    myShop: { uk: "Моя торгова точка", en: "My trading point" },
    openShop: { uk: "Відкрити точку", en: "Open point" },
    editShop: { uk: "Редагувати точку", en: "Edit point" },
    editProfile: { uk: "Редагувати профіль", en: "Edit profile" },
    sellerCabinet: { uk: "Кабінет продавця", en: "Seller account" },
    login: { uk: "Вхід", en: "Sign in" },
    authSubtitle: { uk: "Увійдіть або створіть обліковий запис продавця.", en: "Sign in or create a seller account." },
    email: { uk: "Електронна пошта", en: "Email" },
    password: { uk: "Пароль, щонайменше 8 символів", en: "Password, at least 8 characters" },
    signIn: { uk: "Увійти", en: "Sign in" },
    register: { uk: "Створити обліковий запис", en: "Create account" },
    registerAction: { uk: "Зареєструватися", en: "Register" },
    repeatPassword: { uk: "Повторіть пароль для реєстрації", en: "Repeat password to register" },
    showPassword: { uk: "Показати пароль", en: "Show password" },
    hidePassword: { uk: "Сховати пароль", en: "Hide password" },
    enterEmailAndPassword: { uk: "Введіть пошту і пароль не коротше 8 символів.", en: "Enter email and a password of at least 8 characters." },
    signingIn: { uk: "Входимо...", en: "Signing in..." },
    signInNotPersisted: { uk: "Вхід не закріпився в браузері. Оновіть сторінку входу і спробуйте ще раз.", en: "Sign-in did not persist in the browser. Refresh the sign-in page and try again." },
    repeatPasswordAgain: { uk: "Повторіть пароль і натисніть реєстрацію ще раз.", en: "Repeat the password and press register again." },
    passwordsDoNotMatch: { uk: "Паролі не збігаються. Повторіть пароль ще раз.", en: "Passwords do not match. Repeat the password again." },
    creatingAccount: { uk: "Створюємо акаунт...", en: "Creating account..." },
    accountExistsTryingSignIn: { uk: "Акаунт уже є, пробуємо увійти...", en: "Account already exists, trying to sign in..." },
    accountFoundSignInManual: { uk: "Акаунт знайдено, але браузер не зберіг вхід. Спробуйте увійти вручну.", en: "Account found, but the browser did not save sign-in. Try signing in manually." },
    accountCreatedSignInManual: { uk: "Акаунт створено, але браузер не зберіг вхід. Спробуйте увійти вручну.", en: "Account created, but the browser did not save sign-in. Try signing in manually." },
    accountCreatedConfirmEmail: { uk: "Акаунт створено. Підтвердьте пошту за посиланням у листі, потім увійдіть.", en: "Account created. Confirm your email from the message, then sign in." },
    registration: { uk: "Реєстрація", en: "Registration" },
    confirmingEmail: { uk: "Підтверджуємо пошту...", en: "Confirming email..." },
    emailConfirmed: { uk: "Пошту підтверджено. Переходимо далі...", en: "Email confirmed. Continuing..." },
    emailConfirmationFailed: { uk: "Не вдалося підтвердити пошту. Запросіть новий лист або увійдіть.", en: "Could not confirm email. Request another message or sign in." },
    completeCaptcha: { uk: "Підтвердьте, що ви не робот.", en: "Confirm that you are not a robot." },
    forgotPassword: { uk: "Забули пароль?", en: "Forgot password?" },
    newPassword: { uk: "Новий пароль", en: "New password" },
    repeatNewPassword: { uk: "Повторіть новий пароль", en: "Repeat new password" },
    saveNewPassword: { uk: "Зберегти новий пароль", en: "Save new password" },
    passwordResetHint: { uk: "Введіть новий пароль після переходу з листа відновлення.", en: "Enter a new password after opening the recovery email link." },
    enterEmailForPasswordReset: { uk: "Введіть пошту, щоб надіслати лист відновлення.", en: "Enter email to send a recovery message." },
    sendingPasswordReset: { uk: "Надсилаємо лист відновлення...", en: "Sending recovery email..." },
    passwordResetEmailSent: { uk: "Лист відновлення надіслано. Перевірте пошту.", en: "Recovery email sent. Check your inbox." },
    enterNewPassword: { uk: "Введіть новий пароль не коротше 8 символів.", en: "Enter a new password of at least 8 characters." },
    chooseCity: { uk: "Оберіть місто", en: "Choose a city" },
    chooseCityRequired: { uk: "Оберіть місто.", en: "Choose a city." },
    shopPendingModeration: { uk: "Торгову точку створено й надіслано на перевірку.", en: "Trading point created and submitted for review." },
    moderationStatus: { uk: "Статус перевірки", en: "Review status" },
    moderation_pending: { uk: "На перевірці", en: "Pending review" },
    moderation_active: { uk: "Активна", en: "Active" },
    moderation_blocked: { uk: "Заблокована", en: "Blocked" },
    inputTooLong: { uk: "Одне з полів перевищує дозволену довжину.", en: "One of the fields exceeds the allowed length." },
    permissionDeniedBySecurityRules: { uk: "Не вдалося зберегти дані через правила безпеки. Оновіть сторінку, увійдіть знову та повторіть дію.", en: "Security rules blocked saving. Refresh the page, sign in again, and retry." },
    invalidLoginCredentials: { uk: "Неправильна електронна пошта або пароль.", en: "Incorrect email or password." },
    accountAlreadyRegistered: { uk: "Обліковий запис із цією поштою вже існує. Скористайтеся входом.", en: "An account with this email already exists. Sign in instead." },
    emailRateLimitExceeded: { uk: "Надіслано забагато листів. Зачекайте кілька хвилин і повторіть спробу.", en: "Too many emails were sent. Wait a few minutes and retry." },
    captchaFailed: { uk: "Не вдалося пройти перевірку безпеки. Повторіть її ще раз.", en: "Security verification failed. Please try it again." },
    passwordRequirementsError: { uk: "Пароль має містити щонайменше 8 символів.", en: "Password must contain at least 8 characters." },
    networkRequestFailed: { uk: "Немає зв’язку із сервером. Перевірте інтернет і повторіть спробу.", en: "Could not reach the server. Check your connection and retry." },
    unsupportedImageType: { uk: "Цей формат зображення не підтримується. Оберіть JPEG, PNG або WebP.", en: "This image format is not supported. Choose JPEG, PNG, or WebP." },
    uploadedFileTooLarge: { uk: "Зображення завелике для завантаження.", en: "The image is too large to upload." },
    imageStorageUnavailable: { uk: "Сховище фотографій зараз недоступне.", en: "Image storage is currently unavailable." },
    invalidDataRejected: { uk: "Дані не відповідають правилам платформи. Перевірте заповнені поля.", en: "The data does not meet platform rules. Check the completed fields." },
    savingNewPassword: { uk: "Зберігаємо новий пароль...", en: "Saving new password..." },
    passwordChanged: { uk: "Пароль змінено.", en: "Password changed." },
    accountSecurity: { uk: "Безпека акаунта", en: "Account security" },
    accountSecurityHint: { uk: "Тут можна змінити пароль для поточного акаунта.", en: "Change the password for the current account here." },
    changePassword: { uk: "Змінити пароль", en: "Change password" },
    createShop: { uk: "Створити торгову точку", en: "Create a trading point" },
    chooseShop: { uk: "Оберіть торгову точку для редагування", en: "Choose a trading point to edit" },
    noAccess: { uk: "Немає доступу", en: "No access" },
    adminProjectManagement: { uk: "Керування проєктом", en: "Project management" },
    adminDashboard: { uk: "Адмін-кабінет", en: "Admin dashboard" },
    checkingAccess: { uk: "Перевіряємо доступ...", en: "Checking access..." },
    adminLoginRequired: { uk: "Потрібно увійти в акаунт адміністратора.", en: "You need to sign in to an admin account." },
    adminNotAllowed: { uk: "не додано в адміністратори.", en: "is not added as an admin." },
    adminAccount: { uk: "Адмін", en: "Admin" },
    supabaseAccount: { uk: "акаунт Supabase", en: "Supabase account" },
    signInAsAdminText: { uk: "Увійдіть під адмінським акаунтом і додайте цей акаунт у таблицю", en: "Sign in with an admin account and add this account to the table" },
    viaSqlFileText: { uk: "через SQL-файл 007_admin_access.sql.", en: "through SQL file 007_admin_access.sql." },
    shops: { uk: "Торгові точки", en: "Trading points" },
    products: { uk: "Товари", en: "Products" },
    withoutProducts: { uk: "Без товарів", en: "Without products" },
    notifications: { uk: "Повідомлення", en: "Notifications" },
    quickActions: { uk: "Швидкі дії", en: "Quick actions" },
    quickActionsText: { uk: "Основні переходи для контролю тесту з телефона або ноутбука.", en: "Main links for checking the test from phone or laptop." },
    launchChecklist: { uk: "Перевірка перед запуском", en: "Pre-launch check" },
    launchChecklistText: { uk: "30-денний орієнтир: тут видно найгрубіші проблеми.", en: "30-day benchmark: the roughest problems are visible here." },
    refresh: { uk: "Оновити", en: "Refresh" },
    problemAreas: { uk: "Проблемні місця", en: "Problem areas" },
    problemAreasText: { uk: "Те, що потрібно швидко побачити під час закритого тесту.", en: "What needs to be seen quickly during the closed test." },
    adminCategoriesText: { uk: "На кнопках видно кількість торгових точок. Натисніть категорію, щоб переглянути торгові точки в адмінці.", en: "The buttons show trading point counts. Press a category to view trading points inside the admin panel." },
    categoryTitle: { uk: "Категорія", en: "Category" },
    categoryMetaPlaceholder: { uk: "Торгові точки та товари вибраної категорії.", en: "Trading points and products in the selected category." },
    openPage: { uk: "Відкрити сторінку", en: "Open page" },
    testNotes: { uk: "Нотатки тесту", en: "Test notes" },
    testNotesText: { uk: "Локальний список спостережень. Зберігається в цьому браузері.", en: "Local observation list. Stored in this browser." },
    clear: { uk: "Очистити", en: "Clear" },
    testNotesPlaceholder: { uk: "Наприклад: 1. На iPhone не видно кнопку збереження. 2. Продавець не зрозумів поле відділ...", en: "For example: 1. Save button is not visible on iPhone. 2. Seller did not understand the section field..." },
    clearTestNotesQuestion: { uk: "Очистити нотатки тесту?", en: "Clear test notes?" },
    loadingData: { uk: "Оновлюємо дані...", en: "Refreshing data..." },
    dataUpdated: { uk: "Дані оновлено", en: "Data updated" },
    shopName: { uk: "Назва торгової точки", en: "Trading point name" },
    shortDescription: { uk: "Короткий опис", en: "Short description" },
    createShopButton: { uk: "Створити торгову точку", en: "Create trading point" },
    createShopFailed: { uk: "Не вдалося створити торгову точку", en: "Could not create trading point" },
    shopCreated: { uk: "Торгову точку створено.", en: "Trading point created." },
    enterShopName: { uk: "Введіть назву торгової точки.", en: "Enter trading point name." },
    saving: { uk: "Зберігаємо...", en: "Saving..." },
    checkingAuthAndSavingShop: { uk: "Перевіряємо вхід і зберігаємо торгову точку...", en: "Checking sign-in and saving trading point..." },
    sellerLoginRequired: { uk: "Потрібно увійти в акаунт продавця.", en: "You need to sign in to a seller account." },
    accountAlreadyHasShop: { uk: "У цього акаунта вже є торгова точка. Відкрийте її для керування.", en: "This account already has a trading point. Open it to manage it." },
    accountAlreadyHasShopOpening: { uk: "У цього акаунта вже є торгова точка. Відкриваю редагування.", en: "This account already has a trading point. Opening editing." },
    newShopUnavailable: { uk: "Нова точка недоступна: один акаунт керує однією торговою точкою.", en: "New point is unavailable: one account manages one trading point." },
    noActiveShopCreateAbove: { uk: "У цього акаунта немає активної торгової точки. Можна створити нову вище.", en: "This account has no active trading point. You can create a new one above." },
    shopNotFoundCreateHint: { uk: "Торгову точку для цього акаунта поки не знайдено. Натисніть «+ Нова точка», якщо хочете її створити.", en: "No trading point was found for this account yet. Press '+ New point' if you want to create it." },
    databaseUnavailableTitle: { uk: "База не підключилася. Створення торгової точки тимчасово недоступне.", en: "Database did not connect. Trading point creation is temporarily unavailable." },
    databaseUnavailableMessage: { uk: "Оновіть сторінку або перевірте інтернет. Без Supabase торгова точка не створюється.", en: "Refresh the page or check the internet. A trading point cannot be created without Supabase." },
    databaseUnavailableCabinet: { uk: "Оновіть сторінку або перевірте інтернет. Кабінет продавця без Supabase недоступний.", en: "Refresh the page or check the internet. Seller account is unavailable without Supabase." },
    databaseNotConnectedTitle: { uk: "База не підключилася", en: "Database did not connect" },
    openStorefront: { uk: "Відкрити вітрину", en: "Open storefront" },
    shopManagement: { uk: "Керування торговою точкою", en: "Trading point management" },
    sellerPanelSubtitle: { uk: "Заповніть профіль продавця та додавайте товари", en: "Complete the seller profile and add products" },
    accountMenu: { uk: "Меню кабінету", en: "Account menu" },
    profileShop: { uk: "Профіль торгової точки", en: "Trading point profile" },
    shopDescription: { uk: "Опис торгової точки", en: "Trading point description" },
    findDescription: { uk: "Опис для кнопки Як знайти", en: "Directions for the How to find button" },
    phone: { uk: "Номер телефону", en: "Phone number" },
    telegramPlaceholder: { uk: "Посилання або ім'я Telegram", en: "Telegram link or username" },
    instagramPlaceholder: { uk: "Посилання або ім'я Instagram", en: "Instagram link or username" },
    viberPlaceholder: { uk: "Посилання або номер Viber", en: "Viber link or number" },
    addCover: { uk: "Додати фон торгової точки", en: "Add trading point cover" },
    removeCover: { uk: "Прибрати фон торгової точки", en: "Remove trading point cover" },
    coverPlacementHint: { uk: "Фон з'явиться за назвою, часом роботи та кнопками торгової точки.", en: "The cover will appear behind the trading point name, hours and buttons." },
    featuredProductsTitle: { uk: "Товари на картці торгової точки", en: "Products on the trading point card" },
    saveProfile: { uk: "Зберегти профіль", en: "Save profile" },
    closeProfile: { uk: "Закрити профіль", en: "Close profile" },
    profileSaved: { uk: "Профіль торгової точки збережено.", en: "Trading point profile saved." },
    saveProfileFailed: { uk: "Не вдалося зберегти профіль", en: "Could not save profile" },
    savingProfile: { uk: "Зберігаємо профіль...", en: "Saving profile..." },
    saveProfileAfterCover: { uk: "Збережіть профіль.", en: "Save profile." },
    deleteShop: { uk: "Видалити торгову точку", en: "Delete trading point" },
    deleteShopQuestion: { uk: "Видалити торгову точку?", en: "Delete trading point?" },
    deletingShop: { uk: "Видаляємо торгову точку, товари та фотографії...", en: "Deleting trading point, products and photos..." },
    deleteShopFailed: { uk: "Не вдалося повністю видалити торгову точку", en: "Could not fully delete trading point" },
    deleteShopBody: { uk: "Торгову точку і всі її товари буде видалено.", en: "The trading point and all its products will be deleted." },
    cancel: { uk: "Скасувати", en: "Cancel" },
    cancelEditing: { uk: "Скасувати редагування", en: "Cancel editing" },
    editingCancelled: { uk: "Редагування скасовано.", en: "Editing cancelled." },
    delete: { uk: "Видалити", en: "Delete" },
    addProduct: { uk: "Додати товар", en: "Add product" },
    editProduct: { uk: "Редагувати товар", en: "Edit product" },
    productName: { uk: "Назва товару", en: "Product name" },
    departmentExample: { uk: "Відділ, наприклад Сири", en: "Section, for example Cheese" },
    department: { uk: "Відділ", en: "Section" },
    priceExample: { uk: "Ціна, наприклад 630 або 630/650", en: "Price, for example 630 or 630/650" },
    productDescription: { uk: "Опис товару", en: "Product description" },
    addPhoto: { uk: "Додати фото", en: "Add photo" },
    selectedPhotoCount: { uk: "✓ Вибрано фото", en: "✓ Selected photos" },
    fromTwo: { uk: "з 2", en: "of 2" },
    removePhoto: { uk: "Видалити фотографію", en: "Remove photo" },
    photoRemoved: { uk: "Фотографію видалено.", en: "Photo removed." },
    chooseOnlyImages: { uk: "Виберіть тільки зображення.", en: "Choose images only." },
    chooseCoverImage: { uk: "Виберіть зображення для фону.", en: "Choose an image for the cover." },
    coverRemoved: { uk: "Фон прибрано. Збережіть профіль.", en: "Cover removed. Save profile." },
    coverTooLarge: { uk: "Фон занадто важкий. Максимум", en: "Cover is too large. Maximum" },
    photoTooLarge: { uk: "Фото занадто важке. Максимум", en: "Photo is too large. Maximum" },
    coverUploadFailed: { uk: "Не вдалося завантажити фон торгової точки. Спробуйте JPG або PNG.", en: "Could not upload the trading point cover. Try JPG or PNG." },
    photoUploadFailed: { uk: "Не вдалося завантажити фотографії. Спробуйте JPG або PNG.", en: "Could not upload photos. Try JPG or PNG." },
    save: { uk: "Зберегти", en: "Save" },
    howToFind: { uk: "Як знайти", en: "How to find" },
    pageQrCode: { uk: "QR-код", en: "QR code" },
    pageQrTitle: { uk: "QR-код сторінки", en: "Page QR code" },
    pageQrHint: { uk: "Відскануйте, щоб відкрити сторінку продавця", en: "Scan to open the seller page" },
    pageQrUnavailable: { uk: "Не вдалося створити QR-код. Оновіть сторінку та спробуйте ще раз.", en: "Could not create the QR code. Refresh the page and try again." },
    contact: { uk: "Зв'язатися", en: "Contact" },
    telephone: { uk: "Телефон", en: "Phone" },
    all: { uk: "Усі", en: "All" },
    allCategories: { uk: "Усі категорії", en: "All categories" },
    favoriteProducts: { uk: "Обрані товари", en: "Favorite products" },
    noProductsFound: { uk: "Товари поки не знайдені.", en: "No products found yet." },
    noCategorySellers: { uk: "У цій категорії поки немає продавців.", en: "There are no sellers in this category yet." },
    noCategoryShops: { uk: "У цій категорії поки нікого немає.", en: "There is nobody in this category yet." },
    noProductsInPanel: { uk: "Товарів поки немає. Додайте перший товар вище.", en: "No products yet. Add the first product above." },
    sellerFallback: { uk: "Продавець", en: "Seller" },
    productFallback: { uk: "Товар", en: "Product" },
    noDescription: { uk: "Опис поки не заповнено.", en: "Description is not filled in yet." },
    noFindInfo: { uk: "Інформація про місце поки не заповнена.", en: "Location information is not filled in yet." },
    noPhone: { uk: "Номер поки не вказано", en: "Phone number is not specified yet" },
    shopNotFound: { uk: "Торгову точку не знайдено", en: "Trading point not found" },
    backHomeChooseShop: { uk: "Поверніться на головну і виберіть торгову точку знову.", en: "Return to the homepage and choose the trading point again." },
    viewProductPhoto: { uk: "Фото товару", en: "Product photo" },
    addFavorite: { uk: "Додати в обране", en: "Add to favorites" },
    addProductFavorite: { uk: "Додати товар в обране", en: "Add product to favorites" },
    shopPrefix: { uk: "Торгова точка", en: "Trading point" },
    edit: { uk: "Редагувати", en: "Edit" },
    editProductActive: { uk: "Редагуєте товар.", en: "Editing product." },
    saveProduct: { uk: "Зберегти товар", en: "Save product" },
    saveProductFailed: { uk: "Не вдалося зберегти товар", en: "Could not save product" },
    productNotFoundForEdit: { uk: "Не вдалося знайти товар для редагування.", en: "Could not find product for editing." },
    saveProfileFirst: { uk: "Спочатку збережіть профіль торгової точки.", en: "Save the trading point profile first." },
    addFirstProductAbove: { uk: "Спочатку додайте товари, потім виберіть найкращі.", en: "Add products first, then choose the best ones." },
    maxThreeProducts: { uk: "Можна вибрати не більше трьох товарів.", en: "You can choose no more than three products." },
    productNamePlaceholder: { uk: "Назва товару", en: "Product name" },
    departmentPlaceholder: { uk: "Відділ", en: "Section" },
    previewDescription: { uk: "Опис з'явиться тут.", en: "Description will appear here." },
    logoutProgress: { uk: "Виходимо з акаунта...", en: "Signing out..." },
    logoutFailed: { uk: "Не вдалося вийти", en: "Could not sign out" },
    logout: { uk: "Вийти", en: "Sign out" },
    sellerDepartmentsLabel: { uk: "Відділи торгової точки", en: "Trading point sections" },
    sellerLinksLabel: { uk: "Посилання продавця", en: "Seller links" },
    shopNotFoundPanelTitle: { uk: "Торгову точку не знайдено", en: "Trading point not found" },
    shopNotLinkedToAccount: { uk: "Акаунт увійшов, але ця сторінка не пов'язана з твоєю торговою точкою.", en: "The account is signed in, but this page is not linked to your trading point." },
    openMyShop: { uk: "Відкрити мою торгову точку", en: "Open my trading point" },
    home: { uk: "На головну", en: "Home" },
    productSaved: { uk: "Товар збережено.", en: "Product saved." },
    productAdded: { uk: "Товар додано.", en: "Product added." },
    savingProduct: { uk: "Зберігаємо товар...", en: "Saving product..." },
    addingProduct: { uk: "Додаємо товар...", en: "Adding product..." },
    enterProductNameAndPrice: { uk: "Введіть назву товару та ціну.", en: "Enter product name and price." },
    enterNameAndPrice: { uk: "Введіть назву та ціну.", en: "Enter name and price." },
    invalidPrice: { uk: "Ціна може бути числом або діапазоном, наприклад 630/650.", en: "Price can be a number or range, for example 630/650." },
    updatedPricePrefix: { uk: "Знайдені товари", en: "Found products" },
    searchPrefix: { uk: "Пошук", en: "Search" },
    currency: { uk: "грн", en: "UAH" },
    photoSingular: { uk: "фото", en: "photo" },
    photoPlural: { uk: "фото", en: "photos" },
    supabaseWorks: { uk: "Supabase відповідає", en: "Supabase responds" },
    loadedFromDatabase: { uk: "Торгові точки та товари завантажені з бази.", en: "Trading points and products loaded from the database." },
    shopsWithContacts: { uk: "Торгові точки з контактами", en: "Trading points with contacts" },
    noContacts: { uk: "Без контактів", en: "No contacts" },
    noContactsProblem: { uk: "Продавця не можна швидко знайти.", en: "The seller cannot be reached quickly." },
    allShopsHaveContact: { uk: "У всіх торгових точок є хоча б один контакт.", en: "All trading points have at least one contact." },
    shopsWithProducts: { uk: "Торгові точки з товарами", en: "Trading points with products" },
    emptyShops: { uk: "Порожніх торгових точок", en: "Empty trading points" },
    emptyShopsProblem: { uk: "Для тесту допустимо, для запуску погано.", en: "Acceptable for testing, bad for launch." },
    allShopsHaveProducts: { uk: "Усі торгові точки вже мають товари.", en: "All trading points already have products." },
    productPhotos: { uk: "Фото товарів", en: "Product photos" },
    productsWithoutPhoto: { uk: "Товарів без фото", en: "Products without photo" },
    photoRequired: { uk: "На ринку фото майже обов'язкові.", en: "Photos are almost mandatory for the market." },
    allProductsHavePhotos: { uk: "У всіх товарів є фото.", en: "All products have photos." },
    productPrices: { uk: "Ціни товарів", en: "Product prices" },
    productsWithoutPrice: { uk: "Товарів без ціни", en: "Products without price" },
    mustFix: { uk: "Це потрібно виправити.", en: "This needs to be fixed." },
    allProductsHavePrices: { uk: "У всіх товарів є ціна.", en: "All products have prices." },
    noneSuchShops: { uk: "Таких торгових точок немає.", en: "No such trading points." },
    noEmptyShops: { uk: "Порожніх торгових точок немає.", en: "No empty trading points." },
    allProductsWithPhotos: { uk: "Усі товари з фото.", en: "All products have photos." },
    allProductsWithPrices: { uk: "Усі товари з ціною.", en: "All products have prices." },
    shopsCountShort: { uk: "торгових точок", en: "trading points" },
    productsCountShort: { uk: "товарів", en: "products" },
    contactsCountShort: { uk: "контактів", en: "contacts" },
    noShopsInCategory: { uk: "У цій категорії поки немає торгових точок.", en: "There are no trading points in this category yet." },
    shopWithoutName: { uk: "Торгова точка без назви", en: "Unnamed trading point" },
    productWithoutName: { uk: "Товар без назви", en: "Unnamed product" },
    noProductsYet: { uk: "Товарів поки немає.", en: "No products yet." },
    noPrice: { uk: "без ціни", en: "no price" },
    open: { uk: "Відкрити", en: "Open" },
    deleteShopConfirmPrefix: { uk: "Видалити торгову точку", en: "Delete trading point" },
    deleteShopConfirmSuffix: { uk: "і її товари?", en: "and its products?" },
    deleteProductConfirmPrefix: { uk: "Видалити товар", en: "Delete product" },
    chooseUpToThreeProducts: { uk: "Виберіть до трьох товарів.", en: "Choose up to three products." },
    irreversibleAction: { uk: "Незворотна дія", en: "Irreversible action" },
    unknownError: { uk: "Невідома помилка.", en: "Unknown error." },
    sellerSignInFirst: { uk: "Спочатку увійдіть в акаунт продавця.", en: "Sign in to a seller account first." },
    databaseNotConnectedShort: { uk: "База не підключилася. Оновіть сторінку або перевірте інтернет.", en: "Database did not connect. Refresh the page or check the internet." },
    saveShopProfileFirst: { uk: "Спочатку збережіть профіль торгової точки в базі.", en: "Save the trading point profile in the database first." },
    shopBelongsToAnotherAccount: { uk: "Ця торгова точка належить іншому акаунту. Зміну заблоковано.", en: "This trading point belongs to another account. Changes are blocked." },
    noAdminRights: { uk: "У цього акаунта немає прав адміністратора.", en: "This account has no admin rights." },
    supabaseTimeout: { uk: "Supabase довго не відповідає. Перевірте інтернет і спробуйте ще раз.", en: "Supabase is taking too long to respond. Check the internet and try again." },
    emailNotConfirmed: { uk: "Пошту ще не підтверджено. Відкрийте лист від Supabase і підтвердьте акаунт.", en: "Email is not confirmed yet. Open the Supabase email and confirm the account." },
    schemaOutdated: { uk: "Схема Supabase відстає від сайту. Запустіть SQL-файл 006_repair_marketplace_schema.sql у Supabase.", en: "Supabase schema is behind the site. Run SQL file 006_repair_marketplace_schema.sql in Supabase." },
    missingColumnPrefix: { uk: "У базі немає колонки", en: "Database is missing column" },
    runRepairSql: { uk: "Запустіть SQL-файл 006_repair_marketplace_schema.sql у Supabase.", en: "Run SQL file 006_repair_marketplace_schema.sql in Supabase." },
    supabaseUnknownError: { uk: "Невідома помилка Supabase.", en: "Unknown Supabase error." },
    meat: { uk: "М'ясо", en: "Meat" },
    fish: { uk: "Риба", en: "Fish" },
    seafood: { uk: "Риба та морепродукти", en: "Fish and seafood" },
    vegetables: { uk: "Овочі", en: "Vegetables" },
    fruits: { uk: "Фрукти", en: "Fruit" },
    dairyShort: { uk: "Молочне", en: "Dairy" },
    dairy: { uk: "Молочна продукція", en: "Dairy products" },
    bakery: { uk: "Випічка", en: "Bakery" },
    spices: { uk: "Спеції", en: "Spices" },
    sweets: { uk: "Солодощі", en: "Sweets" },
    clothing: { uk: "Одяг", en: "Clothing" },
    shoes: { uk: "Взуття", en: "Shoes" },
    electronics: { uk: "Техніка", en: "Electronics" },
    discount: { uk: "Усе по 3", en: "Everything for 3" },
    pets: { uk: "Зоотовари", en: "Pet supplies" },
    other: { uk: "Інше", en: "Other" },
    kilograms: { uk: "кг", en: "kg" },
    grams: { uk: "г", en: "g" },
    liters: { uk: "л", en: "l" },
    pieces: { uk: "шт", en: "pc" },
    package: { uk: "упаковка", en: "pack" }
};

const sourceTranslationKeys = new Map(
    Object.entries(interfaceTranslations).flatMap(([key, values]) =>
        [values.uk, values.ru]
            .filter(Boolean)
            .map(value => [value, key])
    )
);
const translatedTextNodes = new WeakMap();
const translatedAttributes = new WeakMap();
let currentLanguage = localStorage.getItem("privozLanguage") || "uk";

if (!["uk", "en"].includes(currentLanguage)) {
    currentLanguage = "uk";
    localStorage.setItem("privozLanguage", currentLanguage);
}

function translateInterfaceValue(key) {
    return interfaceTranslations[key]?.[currentLanguage] || interfaceTranslations[key]?.uk || key;
}

function translateInterfaceText(text) {
    const value = String(text || "").trim();
    const key = sourceTranslationKeys.get(value);

    return key ? translateInterfaceValue(key) : text;
}

function getCurrentLanguage() {
    return currentLanguage;
}

function getLocalizedSellerName(seller) {
    return String(seller?.name || "").trim() || translateInterfaceValue("sellerFallback");
}

function getLocalizedSellerDescription(seller) {
    return String(seller?.description || "").trim() || translateInterfaceValue("noDescription");
}

function getLocalizedSellerFindInfo(seller) {
    return String(seller?.findInfo || "").trim() || translateInterfaceValue("noFindInfo");
}

function getLocalizedProductName(product) {
    return String(product?.name || "").trim() || translateInterfaceValue("productFallback");
}

function getLocalizedProductDescription(product) {
    return String(product?.description || "").trim() || translateInterfaceValue("noDescription");
}

function getLocalizedProductDepartment(product) {
    return String(product?.department || "").trim() || translateInterfaceValue("other");
}

function getLocalizedCategoryLabel(categoryId, fallback = translateInterfaceValue("other")) {
    const keys = {
        meat: "meat",
        fish: "seafood",
        vegetables: "vegetables",
        fruits: "fruits",
        milk: "dairy",
        bakery: "bakery",
        spices: "spices",
        sweets: "sweets",
        clothing: "clothing",
        shoes: "shoes",
        electronics: "electronics",
        discount: "discount",
        pets: "pets",
        other: "other"
    };

    return keys[categoryId]
        ? translateInterfaceValue(keys[categoryId])
        : fallback;
}

function getLocalizedUnitLabel(unitId, fallback = "") {
    const keys = {
        kg: "kilograms",
        gram: "grams",
        liter: "liters",
        piece: "pieces",
        pack: "package"
    };

    return keys[unitId]
        ? translateInterfaceValue(keys[unitId])
        : fallback;
}

function getLocalizedCurrencyLabel() {
    return translateInterfaceValue("currency");
}

function getLocalizedPhotoCount(count) {
    const photoKey = Number(count) === 1 ? "photoSingular" : "photoPlural";

    return `${count} ${translateInterfaceValue(photoKey)}`;
}

function translateTextNode(node) {
    if (node.parentElement?.closest(
        ".product-card h3, .product-description, .shop-title, " +
        "#productModalTitle, #sellerPage .subtitle, .seller-card h3, " +
        ".seller-card > p, .home-offer-card strong"
    )) return;

    const text = node.nodeValue?.trim();
    if (!text) return;

    let key = translatedTextNodes.get(node);
    if (!key) key = sourceTranslationKeys.get(text);
    if (!key) return;

    translatedTextNodes.set(node, key);
    const translated = translateInterfaceValue(key);
    if (text !== translated) node.nodeValue = node.nodeValue.replace(text, translated);
}

function translateElementAttributes(element) {
    const attributes = ["placeholder", "title", "aria-label"];
    let keys = translatedAttributes.get(element) || {};

    attributes.forEach(attribute => {
        const value = element.getAttribute(attribute)?.trim();
        if (!value) return;

        const key = keys[attribute] || sourceTranslationKeys.get(value);
        if (!key) return;

        keys[attribute] = key;
        const translated = translateInterfaceValue(key);
        if (value !== translated) element.setAttribute(attribute, translated);
    });

    translatedAttributes.set(element, keys);
}

function translateInterface(root = document) {
    const elements = root.nodeType === 1
        ? [root, ...root.querySelectorAll("*")]
        : [...document.querySelectorAll("*")];

    elements.forEach(element => {
        translateElementAttributes(element);
        element.childNodes.forEach(node => {
            if (node.nodeType === 3) translateTextNode(node);
        });
    });

    document.documentElement.lang = currentLanguage;
}

function setInterfaceLanguage(language) {
    if (!interfaceTranslations.back?.[language]) return;

    currentLanguage = language;
    localStorage.setItem("privozLanguage", language);
    translateInterface();
    updateLanguageSwitcherLabel();

    document.querySelectorAll(".language-option").forEach(button => {
        button.classList.toggle("is-active", button.dataset.language === language);
    });

    window.dispatchEvent(new CustomEvent("privoz-language-change", {
        detail: { language }
    }));
}

function getLanguageLabel(language = currentLanguage) {
    return language === "uk" ? "UA" : language.toUpperCase();
}

function updateLanguageSwitcherLabel() {
    const currentButton = document.querySelector(".language-current");

    if (currentButton) {
        currentButton.textContent = getLanguageLabel();
        currentButton.setAttribute("aria-label", `Language: ${getLanguageLabel()}`);
    }
}

function initLanguageSwitcher() {
    const switcher = document.createElement("div");
    switcher.className = "language-switcher";
    switcher.setAttribute("aria-label", "Language");
    switcher.innerHTML = `
        <button
            class="language-current"
            type="button"
            aria-expanded="false"
            aria-label="Language: ${getLanguageLabel()}"
        >${getLanguageLabel()}</button>
        <div class="language-menu" aria-hidden="true">
            ${["uk", "en"].map(language => `
                <button
                    class="language-option ${language === currentLanguage ? "is-active" : ""}"
                    data-language="${language}"
                    type="button"
                >${getLanguageLabel(language)}</button>
            `).join("")}
        </div>
    `;

    switcher.addEventListener("click", event => {
        const currentButton = event.target.closest(".language-current");
        const button = event.target.closest(".language-option");

        if (currentButton) {
            const isOpen = switcher.classList.toggle("is-open");
            currentButton.setAttribute("aria-expanded", String(isOpen));
            switcher.querySelector(".language-menu")?.setAttribute("aria-hidden", String(!isOpen));
            return;
        }

        if (button) {
            setInterfaceLanguage(button.dataset.language);
            switcher.classList.remove("is-open");
            switcher.querySelector(".language-current")?.setAttribute("aria-expanded", "false");
            switcher.querySelector(".language-menu")?.setAttribute("aria-hidden", "true");
        }
    });

    document.addEventListener("click", event => {
        if (switcher.contains(event.target)) return;
        switcher.classList.remove("is-open");
        switcher.querySelector(".language-current")?.setAttribute("aria-expanded", "false");
        switcher.querySelector(".language-menu")?.setAttribute("aria-hidden", "true");
    });

    document.body.appendChild(switcher);
    translateInterface();

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === "characterData") {
                translateTextNode(mutation.target);
                return;
            }

            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) translateInterface(node);
                if (node.nodeType === 3) translateTextNode(node);
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

initLanguageSwitcher();
