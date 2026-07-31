/* Переклади інтерфейсу сайту. Контент продавців показуємо без змін. */

const interfaceTranslations = {
    back: { ru: "Назад", uk: "Назад", en: "Back" },
    brandShort: { ru: "Ринок", uk: "Ринок", en: "Market" },
    platformName: { ru: "Ринок Онлайн", uk: "Ринок Онлайн", en: "Market Online" },
    tradingPoint: { ru: "Торгова точка", uk: "Торгова точка", en: "Trading point" },
    siteNavigation: { ru: "Навигация по сайту", uk: "Навігація сайтом", en: "Site navigation" },
    authPageTitle: { ru: "Вход продавца — Ринок Онлайн", uk: "Вхід продавця — Ринок Онлайн", en: "Seller sign-in — Market Online" },
    categoryPageTitle: { ru: "Категория — Ринок Онлайн", uk: "Категорія — Ринок Онлайн", en: "Category — Market Online" },
    sellerPageTitle: { ru: "Продавец — Ринок Онлайн", uk: "Продавець — Ринок Онлайн", en: "Seller — Market Online" },
    sellerPanelTitle: { ru: "Панель продавца — Ринок Онлайн", uk: "Панель продавця — Ринок Онлайн", en: "Seller panel — Market Online" },
    chooseCityMarketPoint: { ru: "Выберите рынок Одессы и создайте торговую точку", uk: "Оберіть ринок Одеси та створіть торгову точку", en: "Choose an Odesa market and create a trading point" },
    fixedCityOdesa: { ru: "Город: Одесса", uk: "Місто: Одеса", en: "City: Odesa" },
    marketListUnavailable: { ru: "Список рынков пока недоступен. Обновите страницу или проверьте базу данных.", uk: "Список ринків поки недоступний. Оновіть сторінку або перевірте базу даних.", en: "The market list is currently unavailable. Refresh the page or check the database." },
    chooseMarketRequired: { ru: "Выберите рынок для торговой точки.", uk: "Оберіть ринок для торгової точки.", en: "Choose a market for the trading point." },
    chooseMarket: { ru: "Выберите рынок", uk: "Оберіть ринок", en: "Choose a market" },
    marketContentHint: { ru: "Поиск и каталог будут работать внутри выбранного рынка.", uk: "Пошук і каталог працюватимуть у межах обраного ринку.", en: "Search and catalog will use the selected market." },
    loadingMarkets: { ru: "Загружаем рынки…", uk: "Завантажуємо ринки…", en: "Loading markets…" },
    close: { ru: "Закрыть", uk: "Закрити", en: "Close" },
    favorites: { ru: "Избранное", uk: "Обране", en: "Favorites" },
    starFavorites: { ru: "☆ Избранное", uk: "☆ Обране", en: "☆ Favorites" },
    categories: { ru: "Категории", uk: "Категорії", en: "Categories" },
    shop: { ru: "Торговая точка", uk: "Торгова точка", en: "Trading point" },
    newShop: { ru: "+ Новая точка", uk: "+ Нова точка", en: "+ New point" },
    homeKicker: { ru: "Одеса • Ринок Привоз", uk: "Одеса • Ринок Привоз", en: "Odesa • Pryvoz Market" },
    homeSubtitle: { ru: "Выбирайте дома. Покупайте у своих.", uk: "Обирайте вдома. Купуйте у своїх.", en: "Choose at home. Buy local." },
    searchPlaceholder: { ru: "Найти продукты...", uk: "Знайти продукти...", en: "Find products..." },
    search: { ru: "Поиск", uk: "Пошук", en: "Search" },
    offers: { ru: "Предложения", uk: "Пропозиції", en: "Offers" },
    freshOffers: { ru: "Новинки и свежие цены", uk: "Новинки та свіжі ціни", en: "New items and fresh prices" },
    emptyOffers: { ru: "Здесь появятся новые товары и обновлённые цены.", uk: "Тут з'являться нові товари та оновлені ціни.", en: "New products and updated prices will appear here." },
    noFreshOffersInSelectedCategories: { ru: "В выбранных категориях пока нет свежих предложений.", uk: "В обраних категоріях поки немає свіжих пропозицій.", en: "There are no fresh offers in the selected categories yet." },
    newBadge: { ru: "Новинка", uk: "Новинка", en: "New" },
    priceUpdated: { ru: "Цена обновлена", uk: "Ціну оновлено", en: "Price updated" },
    goShop: { ru: "К точке", uk: "До точки", en: "Visit point" },
    myShop: { ru: "Моя торговая точка", uk: "Моя торгова точка", en: "My trading point" },
    openShop: { ru: "Открыть точку", uk: "Відкрити точку", en: "Open point" },
    editShop: { ru: "Редактировать точку", uk: "Редагувати точку", en: "Edit point" },
    editProfile: { ru: "Редактировать профиль", uk: "Редагувати профіль", en: "Edit profile" },
    sellerCabinet: { ru: "Кабинет продавца", uk: "Кабінет продавця", en: "Seller account" },
    login: { ru: "Вход", uk: "Вхід", en: "Sign in" },
    authSubtitle: { ru: "Войдите или создайте аккаунт продавца.", uk: "Увійдіть або створіть обліковий запис продавця.", en: "Sign in or create a seller account." },
    email: { ru: "Электронная почта", uk: "Електронна пошта", en: "Email" },
    password: { ru: "Пароль, минимум 6 символов", uk: "Пароль, щонайменше 6 символів", en: "Password, at least 6 characters" },
    signIn: { ru: "Войти", uk: "Увійти", en: "Sign in" },
    register: { ru: "Создать аккаунт", uk: "Створити обліковий запис", en: "Create account" },
    repeatPassword: { ru: "Повторите пароль для регистрации", uk: "Повторіть пароль для реєстрації", en: "Repeat password to register" },
    enterEmailAndPassword: { ru: "Введите почту и пароль не короче 6 символов.", uk: "Введіть пошту і пароль не коротше 6 символів.", en: "Enter email and a password of at least 6 characters." },
    signingIn: { ru: "Входим...", uk: "Входимо...", en: "Signing in..." },
    signInNotPersisted: { ru: "Вход не закрепился в браузере. Обновите страницу входа и попробуйте ещё раз.", uk: "Вхід не закріпився в браузері. Оновіть сторінку входу і спробуйте ще раз.", en: "Sign-in did not persist in the browser. Refresh the sign-in page and try again." },
    repeatPasswordAgain: { ru: "Повторите пароль и нажмите регистрацию ещё раз.", uk: "Повторіть пароль і натисніть реєстрацію ще раз.", en: "Repeat the password and press register again." },
    passwordsDoNotMatch: { ru: "Пароли не совпадают. Повторите пароль ещё раз.", uk: "Паролі не збігаються. Повторіть пароль ще раз.", en: "Passwords do not match. Repeat the password again." },
    creatingAccount: { ru: "Создаём аккаунт...", uk: "Створюємо акаунт...", en: "Creating account..." },
    accountExistsTryingSignIn: { ru: "Аккаунт уже есть, пробуем войти...", uk: "Акаунт уже є, пробуємо увійти...", en: "Account already exists, trying to sign in..." },
    accountFoundSignInManual: { ru: "Аккаунт найден, но браузер не сохранил вход. Попробуйте войти вручную.", uk: "Акаунт знайдено, але браузер не зберіг вхід. Спробуйте увійти вручну.", en: "Account found, but the browser did not save sign-in. Try signing in manually." },
    accountCreatedSignInManual: { ru: "Аккаунт создан, но браузер не сохранил вход. Попробуйте войти вручную.", uk: "Акаунт створено, але браузер не зберіг вхід. Спробуйте увійти вручну.", en: "Account created, but the browser did not save sign-in. Try signing in manually." },
    accountCreatedConfirmEmail: { ru: "Аккаунт создан. Подтвердите почту по ссылке в письме, затем войдите.", uk: "Акаунт створено. Підтвердьте пошту за посиланням у листі, потім увійдіть.", en: "Account created. Confirm your email from the message, then sign in." },
    forgotPassword: { ru: "Забыли пароль?", uk: "Забули пароль?", en: "Forgot password?" },
    newPassword: { ru: "Новый пароль", uk: "Новий пароль", en: "New password" },
    repeatNewPassword: { ru: "Повторите новый пароль", uk: "Повторіть новий пароль", en: "Repeat new password" },
    saveNewPassword: { ru: "Сохранить новый пароль", uk: "Зберегти новий пароль", en: "Save new password" },
    passwordResetHint: { ru: "Введите новый пароль после перехода из письма восстановления.", uk: "Введіть новий пароль після переходу з листа відновлення.", en: "Enter a new password after opening the recovery email link." },
    enterEmailForPasswordReset: { ru: "Введите почту, чтобы отправить письмо восстановления.", uk: "Введіть пошту, щоб надіслати лист відновлення.", en: "Enter email to send a recovery message." },
    sendingPasswordReset: { ru: "Отправляем письмо восстановления...", uk: "Надсилаємо лист відновлення...", en: "Sending recovery email..." },
    passwordResetEmailSent: { ru: "Письмо восстановления отправлено. Проверьте почту.", uk: "Лист відновлення надіслано. Перевірте пошту.", en: "Recovery email sent. Check your inbox." },
    enterNewPassword: { ru: "Введите новый пароль не короче 6 символов.", uk: "Введіть новий пароль не коротше 6 символів.", en: "Enter a new password of at least 6 characters." },
    savingNewPassword: { ru: "Сохраняем новый пароль...", uk: "Зберігаємо новий пароль...", en: "Saving new password..." },
    passwordChanged: { ru: "Пароль изменён.", uk: "Пароль змінено.", en: "Password changed." },
    accountSecurity: { ru: "Безопасность аккаунта", uk: "Безпека акаунта", en: "Account security" },
    accountSecurityHint: { ru: "Здесь можно поменять пароль для текущего аккаунта.", uk: "Тут можна змінити пароль для поточного акаунта.", en: "Change the password for the current account here." },
    changePassword: { ru: "Изменить пароль", uk: "Змінити пароль", en: "Change password" },
    createShop: { ru: "Создать торговую точку", uk: "Створити торгову точку", en: "Create a trading point" },
    chooseShop: { ru: "Выберите торговую точку для редактирования", uk: "Оберіть торгову точку для редагування", en: "Choose a trading point to edit" },
    noAccess: { ru: "Нет доступа", uk: "Немає доступу", en: "No access" },
    adminProjectManagement: { ru: "Управление проектом", uk: "Керування проєктом", en: "Project management" },
    adminDashboard: { ru: "Админ-кабинет", uk: "Адмін-кабінет", en: "Admin dashboard" },
    checkingAccess: { ru: "Проверяем доступ...", uk: "Перевіряємо доступ...", en: "Checking access..." },
    adminLoginRequired: { ru: "Нужно войти в аккаунт администратора.", uk: "Потрібно увійти в акаунт адміністратора.", en: "You need to sign in to an admin account." },
    adminNotAllowed: { ru: "не добавлен в админы.", uk: "не додано в адміністратори.", en: "is not added as an admin." },
    adminAccount: { ru: "Админ", uk: "Адмін", en: "Admin" },
    supabaseAccount: { ru: "аккаунт Supabase", uk: "акаунт Supabase", en: "Supabase account" },
    signInAsAdminText: { ru: "Войдите под админским аккаунтом и добавьте этот аккаунт в таблицу", uk: "Увійдіть під адмінським акаунтом і додайте цей акаунт у таблицю", en: "Sign in with an admin account and add this account to the table" },
    viaSqlFileText: { ru: "через SQL-файл 007_admin_access.sql.", uk: "через SQL-файл 007_admin_access.sql.", en: "through SQL file 007_admin_access.sql." },
    shops: { ru: "Торговые точки", uk: "Торгові точки", en: "Trading points" },
    products: { ru: "Товары", uk: "Товари", en: "Products" },
    withoutProducts: { ru: "Без товаров", uk: "Без товарів", en: "Without products" },
    notifications: { ru: "Уведомления", uk: "Повідомлення", en: "Notifications" },
    quickActions: { ru: "Быстрые действия", uk: "Швидкі дії", en: "Quick actions" },
    quickActionsText: { ru: "Основные переходы для контроля теста с телефона или ноутбука.", uk: "Основні переходи для контролю тесту з телефона або ноутбука.", en: "Main links for checking the test from phone or laptop." },
    launchChecklist: { ru: "Проверка перед запуском", uk: "Перевірка перед запуском", en: "Pre-launch check" },
    launchChecklistText: { ru: "30-дневный ориентир: тут видны самые грубые проблемы.", uk: "30-денний орієнтир: тут видно найгрубіші проблеми.", en: "30-day benchmark: the roughest problems are visible here." },
    refresh: { ru: "Обновить", uk: "Оновити", en: "Refresh" },
    problemAreas: { ru: "Проблемные места", uk: "Проблемні місця", en: "Problem areas" },
    problemAreasText: { ru: "То, что нужно быстро увидеть во время закрытого теста.", uk: "Те, що потрібно швидко побачити під час закритого тесту.", en: "What needs to be seen quickly during the closed test." },
    adminCategoriesText: { ru: "На кнопках видно количество торговых точек. Нажмите категорию, чтобы посмотреть торговые точки внутри админки.", uk: "На кнопках видно кількість торгових точок. Натисніть категорію, щоб переглянути торгові точки в адмінці.", en: "The buttons show trading point counts. Press a category to view trading points inside the admin panel." },
    categoryTitle: { ru: "Категория", uk: "Категорія", en: "Category" },
    categoryMetaPlaceholder: { ru: "Торговые точки и товары выбранной категории.", uk: "Торгові точки та товари вибраної категорії.", en: "Trading points and products in the selected category." },
    openPage: { ru: "Открыть страницу", uk: "Відкрити сторінку", en: "Open page" },
    testNotes: { ru: "Заметки теста", uk: "Нотатки тесту", en: "Test notes" },
    testNotesText: { ru: "Локальный список наблюдений. Хранится в этом браузере.", uk: "Локальний список спостережень. Зберігається в цьому браузері.", en: "Local observation list. Stored in this browser." },
    clear: { ru: "Очистить", uk: "Очистити", en: "Clear" },
    testNotesPlaceholder: { ru: "Например: 1. На iPhone не видно кнопку сохранения. 2. Продавец не понял поле отдел...", uk: "Наприклад: 1. На iPhone не видно кнопку збереження. 2. Продавець не зрозумів поле відділ...", en: "For example: 1. Save button is not visible on iPhone. 2. Seller did not understand the section field..." },
    clearTestNotesQuestion: { ru: "Очистить заметки теста?", uk: "Очистити нотатки тесту?", en: "Clear test notes?" },
    loadingData: { ru: "Обновляем данные...", uk: "Оновлюємо дані...", en: "Refreshing data..." },
    dataUpdated: { ru: "Данные обновлены", uk: "Дані оновлено", en: "Data updated" },
    shopName: { ru: "Название торговой точки", uk: "Назва торгової точки", en: "Trading point name" },
    shortDescription: { ru: "Краткое описание", uk: "Короткий опис", en: "Short description" },
    createShopButton: { ru: "Создать торговую точку", uk: "Створити торгову точку", en: "Create trading point" },
    createShopFailed: { ru: "Не удалось создать торговую точку", uk: "Не вдалося створити торгову точку", en: "Could not create trading point" },
    shopCreated: { ru: "Торговая точка создана.", uk: "Торгову точку створено.", en: "Trading point created." },
    enterShopName: { ru: "Введите название торговой точки.", uk: "Введіть назву торгової точки.", en: "Enter trading point name." },
    saving: { ru: "Сохраняем...", uk: "Зберігаємо...", en: "Saving..." },
    checkingAuthAndSavingShop: { ru: "Проверяем вход и сохраняем торговую точку...", uk: "Перевіряємо вхід і зберігаємо торгову точку...", en: "Checking sign-in and saving trading point..." },
    sellerLoginRequired: { ru: "Нужно войти в аккаунт продавца.", uk: "Потрібно увійти в акаунт продавця.", en: "You need to sign in to a seller account." },
    accountAlreadyHasShop: { ru: "У этого аккаунта уже есть торговая точка. Откройте её для управления.", uk: "У цього акаунта вже є торгова точка. Відкрийте її для керування.", en: "This account already has a trading point. Open it to manage it." },
    accountAlreadyHasShopOpening: { ru: "У этого аккаунта уже есть торговая точка. Открываю редактирование.", uk: "У цього акаунта вже є торгова точка. Відкриваю редагування.", en: "This account already has a trading point. Opening editing." },
    newShopUnavailable: { ru: "Новая точка недоступна: один аккаунт управляет одной торговой точкой.", uk: "Нова точка недоступна: один акаунт керує однією торговою точкою.", en: "New point is unavailable: one account manages one trading point." },
    noActiveShopCreateAbove: { ru: "У этого аккаунта нет активной торговой точки. Можно создать новую выше.", uk: "У цього акаунта немає активної торгової точки. Можна створити нову вище.", en: "This account has no active trading point. You can create a new one above." },
    shopNotFoundCreateHint: { ru: "Торговая точка для этого аккаунта пока не найдена. Нажмите «+ Новая точка», если хотите создать её.", uk: "Торгову точку для цього акаунта поки не знайдено. Натисніть «+ Нова точка», якщо хочете її створити.", en: "No trading point was found for this account yet. Press '+ New point' if you want to create it." },
    databaseUnavailableTitle: { ru: "База не подключилась. Создание торговой точки временно недоступно.", uk: "База не підключилася. Створення торгової точки тимчасово недоступне.", en: "Database did not connect. Trading point creation is temporarily unavailable." },
    databaseUnavailableMessage: { ru: "Обновите страницу или проверьте интернет. Без Supabase торговая точка не создаётся.", uk: "Оновіть сторінку або перевірте інтернет. Без Supabase торгова точка не створюється.", en: "Refresh the page or check the internet. A trading point cannot be created without Supabase." },
    databaseUnavailableCabinet: { ru: "Обновите страницу или проверьте интернет. Кабинет продавца без Supabase недоступен.", uk: "Оновіть сторінку або перевірте інтернет. Кабінет продавця без Supabase недоступний.", en: "Refresh the page or check the internet. Seller account is unavailable without Supabase." },
    databaseNotConnectedTitle: { ru: "База не подключилась", uk: "База не підключилася", en: "Database did not connect" },
    openStorefront: { ru: "Открыть витрину", uk: "Відкрити вітрину", en: "Open storefront" },
    shopManagement: { ru: "Управление торговой точкой", uk: "Керування торговою точкою", en: "Trading point management" },
    sellerPanelSubtitle: { ru: "Заполните профиль продавца и добавляйте товары", uk: "Заповніть профіль продавця та додавайте товари", en: "Complete the seller profile and add products" },
    accountMenu: { ru: "Меню кабинета", uk: "Меню кабінету", en: "Account menu" },
    profileShop: { ru: "Профиль торговой точки", uk: "Профіль торгової точки", en: "Trading point profile" },
    shopDescription: { ru: "Описание торговой точки", uk: "Опис торгової точки", en: "Trading point description" },
    findDescription: { ru: "Описание для кнопки Как найти", uk: "Опис для кнопки Як знайти", en: "Directions for the How to find button" },
    phone: { ru: "Номер телефона", uk: "Номер телефону", en: "Phone number" },
    telegramPlaceholder: { ru: "Ссылка или имя Telegram", uk: "Посилання або ім'я Telegram", en: "Telegram link or username" },
    instagramPlaceholder: { ru: "Ссылка или имя Instagram", uk: "Посилання або ім'я Instagram", en: "Instagram link or username" },
    viberPlaceholder: { ru: "Ссылка или номер Viber", uk: "Посилання або номер Viber", en: "Viber link or number" },
    addCover: { ru: "Добавить фон торговой точки", uk: "Додати фон торгової точки", en: "Add trading point cover" },
    removeCover: { ru: "Убрать фон торговой точки", uk: "Прибрати фон торгової точки", en: "Remove trading point cover" },
    coverPlacementHint: { ru: "Фон появится за названием, временем работы и кнопками торговой точки.", uk: "Фон з'явиться за назвою, часом роботи та кнопками торгової точки.", en: "The cover will appear behind the trading point name, hours and buttons." },
    featuredProductsTitle: { ru: "Товары на карточке торговой точки", uk: "Товари на картці торгової точки", en: "Products on the trading point card" },
    saveProfile: { ru: "Сохранить профиль", uk: "Зберегти профіль", en: "Save profile" },
    closeProfile: { ru: "Закрыть профиль", uk: "Закрити профіль", en: "Close profile" },
    profileSaved: { ru: "Профиль торговой точки сохранён.", uk: "Профіль торгової точки збережено.", en: "Trading point profile saved." },
    saveProfileFailed: { ru: "Не удалось сохранить профиль", uk: "Не вдалося зберегти профіль", en: "Could not save profile" },
    savingProfile: { ru: "Сохраняем профиль...", uk: "Зберігаємо профіль...", en: "Saving profile..." },
    saveProfileAfterCover: { ru: "Сохраните профиль.", uk: "Збережіть профіль.", en: "Save profile." },
    deleteShop: { ru: "Удалить торговую точку", uk: "Видалити торгову точку", en: "Delete trading point" },
    deleteShopQuestion: { ru: "Удалить торговую точку?", uk: "Видалити торгову точку?", en: "Delete trading point?" },
    deletingShop: { ru: "Удаляем торговую точку, товары и фотографии...", uk: "Видаляємо торгову точку, товари та фотографії...", en: "Deleting trading point, products and photos..." },
    deleteShopFailed: { ru: "Не удалось полностью удалить торговую точку", uk: "Не вдалося повністю видалити торгову точку", en: "Could not fully delete trading point" },
    deleteShopBody: { ru: "Торговая точка и все её товары будут удалены.", uk: "Торгову точку і всі її товари буде видалено.", en: "The trading point and all its products will be deleted." },
    cancel: { ru: "Отмена", uk: "Скасувати", en: "Cancel" },
    cancelEditing: { ru: "Отменить редактирование", uk: "Скасувати редагування", en: "Cancel editing" },
    editingCancelled: { ru: "Редактирование отменено.", uk: "Редагування скасовано.", en: "Editing cancelled." },
    delete: { ru: "Удалить", uk: "Видалити", en: "Delete" },
    addProduct: { ru: "Добавить товар", uk: "Додати товар", en: "Add product" },
    editProduct: { ru: "Редактировать товар", uk: "Редагувати товар", en: "Edit product" },
    productName: { ru: "Название товара", uk: "Назва товару", en: "Product name" },
    departmentExample: { ru: "Отдел, например Сыры", uk: "Відділ, наприклад Сири", en: "Section, for example Cheese" },
    department: { ru: "Отдел", uk: "Відділ", en: "Section" },
    priceExample: { ru: "Цена, например 630 или 630/650", uk: "Ціна, наприклад 630 або 630/650", en: "Price, for example 630 or 630/650" },
    productDescription: { ru: "Описание товара", uk: "Опис товару", en: "Product description" },
    addPhoto: { ru: "Добавить фото", uk: "Додати фото", en: "Add photo" },
    selectedPhotoCount: { ru: "✓ Выбрано фото", uk: "✓ Вибрано фото", en: "✓ Selected photos" },
    fromTwo: { ru: "из 2", uk: "з 2", en: "of 2" },
    removePhoto: { ru: "Удалить фотографию", uk: "Видалити фотографію", en: "Remove photo" },
    photoRemoved: { ru: "Фотография удалена.", uk: "Фотографію видалено.", en: "Photo removed." },
    chooseOnlyImages: { ru: "Выберите только изображения.", uk: "Виберіть тільки зображення.", en: "Choose images only." },
    chooseCoverImage: { ru: "Выберите изображение для фона.", uk: "Виберіть зображення для фону.", en: "Choose an image for the cover." },
    coverRemoved: { ru: "Фон убран. Сохраните профиль.", uk: "Фон прибрано. Збережіть профіль.", en: "Cover removed. Save profile." },
    coverTooLarge: { ru: "Фон слишком тяжёлый. Максимум", uk: "Фон занадто важкий. Максимум", en: "Cover is too large. Maximum" },
    photoTooLarge: { ru: "Фото слишком тяжёлое. Максимум", uk: "Фото занадто важке. Максимум", en: "Photo is too large. Maximum" },
    coverUploadFailed: { ru: "Не удалось загрузить фон торговой точки. Попробуйте JPG или PNG.", uk: "Не вдалося завантажити фон торгової точки. Спробуйте JPG або PNG.", en: "Could not upload the trading point cover. Try JPG or PNG." },
    photoUploadFailed: { ru: "Не удалось загрузить фотографии. Попробуйте JPG или PNG.", uk: "Не вдалося завантажити фотографії. Спробуйте JPG або PNG.", en: "Could not upload photos. Try JPG or PNG." },
    save: { ru: "Сохранить", uk: "Зберегти", en: "Save" },
    howToFind: { ru: "Как найти", uk: "Як знайти", en: "How to find" },
    contact: { ru: "Связаться", uk: "Зв'язатися", en: "Contact" },
    telephone: { ru: "Телефон", uk: "Телефон", en: "Phone" },
    all: { ru: "Все", uk: "Усі", en: "All" },
    allCategories: { ru: "Все категории", uk: "Усі категорії", en: "All categories" },
    favoriteProducts: { ru: "Избранные товары", uk: "Обрані товари", en: "Favorite products" },
    noProductsFound: { ru: "Товары пока не найдены.", uk: "Товари поки не знайдені.", en: "No products found yet." },
    noCategorySellers: { ru: "В этой категории пока нет продавцов.", uk: "У цій категорії поки немає продавців.", en: "There are no sellers in this category yet." },
    noCategoryShops: { ru: "В этой категории пока никого нет.", uk: "У цій категорії поки нікого немає.", en: "There is nobody in this category yet." },
    noProductsInPanel: { ru: "Пока товаров нет. Добавьте первый товар выше.", uk: "Товарів поки немає. Додайте перший товар вище.", en: "No products yet. Add the first product above." },
    sellerFallback: { ru: "Продавец", uk: "Продавець", en: "Seller" },
    productFallback: { ru: "Товар", uk: "Товар", en: "Product" },
    noDescription: { ru: "Описание пока не заполнено.", uk: "Опис поки не заповнено.", en: "Description is not filled in yet." },
    noFindInfo: { ru: "Информация о месте пока не заполнена.", uk: "Інформація про місце поки не заповнена.", en: "Location information is not filled in yet." },
    noPhone: { ru: "Номер пока не указан", uk: "Номер поки не вказано", en: "Phone number is not specified yet" },
    shopNotFound: { ru: "Торговая точка не найдена", uk: "Торгову точку не знайдено", en: "Trading point not found" },
    backHomeChooseShop: { ru: "Вернитесь на главную и выберите торговую точку заново.", uk: "Поверніться на головну і виберіть торгову точку знову.", en: "Return to the homepage and choose the trading point again." },
    viewProductPhoto: { ru: "Фото товара", uk: "Фото товару", en: "Product photo" },
    addFavorite: { ru: "Добавить в избранное", uk: "Додати в обране", en: "Add to favorites" },
    addProductFavorite: { ru: "Добавить товар в избранное", uk: "Додати товар в обране", en: "Add product to favorites" },
    shopPrefix: { ru: "Торговая точка", uk: "Торгова точка", en: "Trading point" },
    edit: { ru: "Редактировать", uk: "Редагувати", en: "Edit" },
    editProductActive: { ru: "Редактируете товар.", uk: "Редагуєте товар.", en: "Editing product." },
    saveProduct: { ru: "Сохранить товар", uk: "Зберегти товар", en: "Save product" },
    saveProductFailed: { ru: "Не удалось сохранить товар", uk: "Не вдалося зберегти товар", en: "Could not save product" },
    productNotFoundForEdit: { ru: "Не удалось найти товар для редактирования.", uk: "Не вдалося знайти товар для редагування.", en: "Could not find product for editing." },
    saveProfileFirst: { ru: "Сначала сохраните профиль торговой точки.", uk: "Спочатку збережіть профіль торгової точки.", en: "Save the trading point profile first." },
    addFirstProductAbove: { ru: "Сначала добавьте товары, затем выберите лучшие.", uk: "Спочатку додайте товари, потім виберіть найкращі.", en: "Add products first, then choose the best ones." },
    maxThreeProducts: { ru: "Можно выбрать не больше трёх товаров.", uk: "Можна вибрати не більше трьох товарів.", en: "You can choose no more than three products." },
    productNamePlaceholder: { ru: "Название товара", uk: "Назва товару", en: "Product name" },
    departmentPlaceholder: { ru: "Отдел", uk: "Відділ", en: "Section" },
    previewDescription: { ru: "Описание появится здесь.", uk: "Опис з'явиться тут.", en: "Description will appear here." },
    logoutProgress: { ru: "Выходим из аккаунта...", uk: "Виходимо з акаунта...", en: "Signing out..." },
    logoutFailed: { ru: "Не удалось выйти", uk: "Не вдалося вийти", en: "Could not sign out" },
    logout: { ru: "Выйти", uk: "Вийти", en: "Sign out" },
    sellerDepartmentsLabel: { ru: "Отделы торговой точки", uk: "Відділи торгової точки", en: "Trading point sections" },
    sellerLinksLabel: { ru: "Ссылки продавца", uk: "Посилання продавця", en: "Seller links" },
    shopNotFoundPanelTitle: { ru: "Торговая точка не найдена", uk: "Торгову точку не знайдено", en: "Trading point not found" },
    shopNotLinkedToAccount: { ru: "Аккаунт вошёл, но эта страница не связана с твоей торговой точкой.", uk: "Акаунт увійшов, але ця сторінка не пов'язана з твоєю торговою точкою.", en: "The account is signed in, but this page is not linked to your trading point." },
    openMyShop: { ru: "Открыть мою торговую точку", uk: "Відкрити мою торгову точку", en: "Open my trading point" },
    home: { ru: "На главную", uk: "На головну", en: "Home" },
    productSaved: { ru: "Товар сохранён.", uk: "Товар збережено.", en: "Product saved." },
    productAdded: { ru: "Товар добавлен.", uk: "Товар додано.", en: "Product added." },
    savingProduct: { ru: "Сохраняем товар...", uk: "Зберігаємо товар...", en: "Saving product..." },
    addingProduct: { ru: "Добавляем товар...", uk: "Додаємо товар...", en: "Adding product..." },
    enterProductNameAndPrice: { ru: "Введите название товара и цену.", uk: "Введіть назву товару та ціну.", en: "Enter product name and price." },
    enterNameAndPrice: { ru: "Введите название и цену.", uk: "Введіть назву та ціну.", en: "Enter name and price." },
    invalidPrice: { ru: "Цена может быть числом или диапазоном, например 630/650.", uk: "Ціна може бути числом або діапазоном, наприклад 630/650.", en: "Price can be a number or range, for example 630/650." },
    updatedPricePrefix: { ru: "Найденные товары", uk: "Знайдені товари", en: "Found products" },
    searchPrefix: { ru: "Поиск", uk: "Пошук", en: "Search" },
    currency: { ru: "грн", uk: "грн", en: "UAH" },
    photoSingular: { ru: "фото", uk: "фото", en: "photo" },
    photoPlural: { ru: "фото", uk: "фото", en: "photos" },
    supabaseWorks: { ru: "Supabase отвечает", uk: "Supabase відповідає", en: "Supabase responds" },
    loadedFromDatabase: { ru: "Торговые точки и товары загружены из базы.", uk: "Торгові точки та товари завантажені з бази.", en: "Trading points and products loaded from the database." },
    shopsWithContacts: { ru: "Торговые точки с контактами", uk: "Торгові точки з контактами", en: "Trading points with contacts" },
    noContacts: { ru: "Без контактов", uk: "Без контактів", en: "No contacts" },
    noContactsProblem: { ru: "Продавца нельзя быстро найти.", uk: "Продавця не можна швидко знайти.", en: "The seller cannot be reached quickly." },
    allShopsHaveContact: { ru: "У всех торговых точек есть хотя бы один контакт.", uk: "У всіх торгових точок є хоча б один контакт.", en: "All trading points have at least one contact." },
    shopsWithProducts: { ru: "Торговые точки с товарами", uk: "Торгові точки з товарами", en: "Trading points with products" },
    emptyShops: { ru: "Пустых торговых точек", uk: "Порожніх торгових точок", en: "Empty trading points" },
    emptyShopsProblem: { ru: "Для теста допустимо, для запуска плохо.", uk: "Для тесту допустимо, для запуску погано.", en: "Acceptable for testing, bad for launch." },
    allShopsHaveProducts: { ru: "Все торговые точки уже имеют товары.", uk: "Усі торгові точки вже мають товари.", en: "All trading points already have products." },
    productPhotos: { ru: "Фото товаров", uk: "Фото товарів", en: "Product photos" },
    productsWithoutPhoto: { ru: "Товаров без фото", uk: "Товарів без фото", en: "Products without photo" },
    photoRequired: { ru: "На рынке фото почти обязательны.", uk: "На ринку фото майже обов'язкові.", en: "Photos are almost mandatory for the market." },
    allProductsHavePhotos: { ru: "У всех товаров есть фото.", uk: "У всіх товарів є фото.", en: "All products have photos." },
    productPrices: { ru: "Цены товаров", uk: "Ціни товарів", en: "Product prices" },
    productsWithoutPrice: { ru: "Товаров без цены", uk: "Товарів без ціни", en: "Products without price" },
    mustFix: { ru: "Это нужно исправить.", uk: "Це потрібно виправити.", en: "This needs to be fixed." },
    allProductsHavePrices: { ru: "У всех товаров есть цена.", uk: "У всіх товарів є ціна.", en: "All products have prices." },
    noneSuchShops: { ru: "Таких торговых точек нет.", uk: "Таких торгових точок немає.", en: "No such trading points." },
    noEmptyShops: { ru: "Пустых торговых точек нет.", uk: "Порожніх торгових точок немає.", en: "No empty trading points." },
    allProductsWithPhotos: { ru: "Все товары с фото.", uk: "Усі товари з фото.", en: "All products have photos." },
    allProductsWithPrices: { ru: "Все товары с ценой.", uk: "Усі товари з ціною.", en: "All products have prices." },
    shopsCountShort: { ru: "торговых точек", uk: "торгових точок", en: "trading points" },
    productsCountShort: { ru: "товаров", uk: "товарів", en: "products" },
    contactsCountShort: { ru: "контактов", uk: "контактів", en: "contacts" },
    noShopsInCategory: { ru: "В этой категории пока нет торговых точек.", uk: "У цій категорії поки немає торгових точок.", en: "There are no trading points in this category yet." },
    shopWithoutName: { ru: "Торговая точка без названия", uk: "Торгова точка без назви", en: "Unnamed trading point" },
    productWithoutName: { ru: "Товар без названия", uk: "Товар без назви", en: "Unnamed product" },
    noProductsYet: { ru: "Товаров пока нет.", uk: "Товарів поки немає.", en: "No products yet." },
    noPrice: { ru: "без цены", uk: "без ціни", en: "no price" },
    open: { ru: "Открыть", uk: "Відкрити", en: "Open" },
    deleteShopConfirmPrefix: { ru: "Удалить торговую точку", uk: "Видалити торгову точку", en: "Delete trading point" },
    deleteShopConfirmSuffix: { ru: "и ее товары?", uk: "і її товари?", en: "and its products?" },
    deleteProductConfirmPrefix: { ru: "Удалить товар", uk: "Видалити товар", en: "Delete product" },
    chooseUpToThreeProducts: { ru: "Выберите до трёх товаров.", uk: "Виберіть до трьох товарів.", en: "Choose up to three products." },
    irreversibleAction: { ru: "Необратимое действие", uk: "Незворотна дія", en: "Irreversible action" },
    unknownError: { ru: "Неизвестная ошибка.", uk: "Невідома помилка.", en: "Unknown error." },
    sellerSignInFirst: { ru: "Сначала войдите в аккаунт продавца.", uk: "Спочатку увійдіть в акаунт продавця.", en: "Sign in to a seller account first." },
    databaseNotConnectedShort: { ru: "База не подключилась. Обновите страницу или проверьте интернет.", uk: "База не підключилася. Оновіть сторінку або перевірте інтернет.", en: "Database did not connect. Refresh the page or check the internet." },
    saveShopProfileFirst: { ru: "Сначала сохраните профиль торговой точки в базе.", uk: "Спочатку збережіть профіль торгової точки в базі.", en: "Save the trading point profile in the database first." },
    shopBelongsToAnotherAccount: { ru: "Эта торговая точка принадлежит другому аккаунту. Изменение заблокировано.", uk: "Ця торгова точка належить іншому акаунту. Зміну заблоковано.", en: "This trading point belongs to another account. Changes are blocked." },
    noAdminRights: { ru: "У этого аккаунта нет прав администратора.", uk: "У цього акаунта немає прав адміністратора.", en: "This account has no admin rights." },
    supabaseTimeout: { ru: "Supabase долго не отвечает. Проверьте интернет и попробуйте ещё раз.", uk: "Supabase довго не відповідає. Перевірте інтернет і спробуйте ще раз.", en: "Supabase is taking too long to respond. Check the internet and try again." },
    emailNotConfirmed: { ru: "Почта ещё не подтверждена. Откройте письмо от Supabase и подтвердите аккаунт.", uk: "Пошту ще не підтверджено. Відкрийте лист від Supabase і підтвердьте акаунт.", en: "Email is not confirmed yet. Open the Supabase email and confirm the account." },
    schemaOutdated: { ru: "Схема Supabase отстаёт от сайта. Запустите SQL-файл 006_repair_marketplace_schema.sql в Supabase.", uk: "Схема Supabase відстає від сайту. Запустіть SQL-файл 006_repair_marketplace_schema.sql у Supabase.", en: "Supabase schema is behind the site. Run SQL file 006_repair_marketplace_schema.sql in Supabase." },
    missingColumnPrefix: { ru: "В базе нет колонки", uk: "У базі немає колонки", en: "Database is missing column" },
    runRepairSql: { ru: "Запустите SQL-файл 006_repair_marketplace_schema.sql в Supabase.", uk: "Запустіть SQL-файл 006_repair_marketplace_schema.sql у Supabase.", en: "Run SQL file 006_repair_marketplace_schema.sql in Supabase." },
    supabaseUnknownError: { ru: "Неизвестная ошибка Supabase.", uk: "Невідома помилка Supabase.", en: "Unknown Supabase error." },
    meat: { ru: "Мясо", uk: "М'ясо", en: "Meat" },
    fish: { ru: "Рыба", uk: "Риба", en: "Fish" },
    seafood: { ru: "Рыба и морепродукты", uk: "Риба та морепродукти", en: "Fish and seafood" },
    vegetables: { ru: "Овощи", uk: "Овочі", en: "Vegetables" },
    fruits: { ru: "Фрукты", uk: "Фрукти", en: "Fruit" },
    dairyShort: { ru: "Молочка", uk: "Молочне", en: "Dairy" },
    dairy: { ru: "Молочная продукция", uk: "Молочна продукція", en: "Dairy products" },
    bakery: { ru: "Выпечка", uk: "Випічка", en: "Bakery" },
    spices: { ru: "Специи", uk: "Спеції", en: "Spices" },
    sweets: { ru: "Сладости", uk: "Солодощі", en: "Sweets" },
    clothing: { ru: "Одежда", uk: "Одяг", en: "Clothing" },
    shoes: { ru: "Обувь", uk: "Взуття", en: "Shoes" },
    electronics: { ru: "Техника", uk: "Техніка", en: "Electronics" },
    discount: { ru: "Всё по 3", uk: "Усе по 3", en: "Everything for 3" },
    pets: { ru: "Зоотовары", uk: "Зоотовари", en: "Pet supplies" },
    other: { ru: "Другое", uk: "Інше", en: "Other" },
    kilograms: { ru: "кг", uk: "кг", en: "kg" },
    grams: { ru: "г", uk: "г", en: "g" },
    liters: { ru: "л", uk: "л", en: "l" },
    pieces: { ru: "шт", uk: "шт", en: "pc" },
    package: { ru: "упаковка", uk: "упаковка", en: "pack" }
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
