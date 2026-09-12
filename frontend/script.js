/* =========================================================
   ITACHI MART - CUSTOMER WEBSITE SCRIPT
========================================================= */


/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL =
    "https://itachi-mart.onrender.com";

const PRODUCT_API =
    `${API_BASE_URL}/api/products`;

const ORDER_API =
    `${API_BASE_URL}/api/orders`;


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let products = [];

let filteredProducts = [];

let cart =
    JSON.parse(
        localStorage.getItem(
            "itachiMartCart"
        )
    ) || [];


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupNavigation();

        setupProductControls();

        setupProductModal();

        setupCart();

        setupCheckout();

        setupMobileMenu();

        loadProducts();

        updateCartUI();

    }
);


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    showProductsLoading(true);


    try {

        const response =
            await fetch(
                PRODUCT_API
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load products."
            );

        }


        const data =
            await response.json();


        /* -------------------------
           SUPPORT BOTH RESPONSE TYPES
        ------------------------- */

        if (
            Array.isArray(data)
        ) {

            products = data;

        } else if (
            Array.isArray(
                data.products
            )
        ) {

            products =
                data.products;

        } else {

            products = [];

        }


        filteredProducts =
            [...products];


        populateCategories();

        applyProductFilters();

        syncCartWithProducts();


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        showProductsError(
            "Unable to load products. Please try again later."
        );

    } finally {

        showProductsLoading(false);

    }

}


/* =========================================================
   POPULATE CATEGORIES
========================================================= */

function populateCategories() {

    const categorySelect =
        document.getElementById(
            "categoryFilter"
        );


    if (!categorySelect) {
        return;
    }


    const currentValue =
        categorySelect.value;


    const categories =
        [
            ...new Set(
                products
                    .map(
                        product =>
                            product.category
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    categorySelect.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            categorySelect.appendChild(
                option
            );

        }
    );


    if (
        categories.includes(
            currentValue
        )
    ) {

        categorySelect.value =
            currentValue;

    }

}


/* =========================================================
   PRODUCT CONTROLS
========================================================= */

function setupProductControls() {

    const searchInput =
        document.getElementById(
            "productSearch"
        );


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const sortSelect =
        document.getElementById(
            "productSort"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyProductFilters
        );

    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            applyProductFilters
        );

    }


    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            applyProductFilters
        );

    }

}


/* =========================================================
   APPLY PRODUCT FILTERS
========================================================= */

function applyProductFilters() {

    const searchInput =
        document.getElementById(
            "productSearch"
        );


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const sortSelect =
        document.getElementById(
            "productSort"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const category =
        categoryFilter
            ? categoryFilter.value
            : "all";


    const sort =
        sortSelect
            ? sortSelect.value
            : "default";


    filteredProducts =
        products.filter(
            product => {

                const name =
                    String(
                        product.name || ""
                    )
                    .toLowerCase();


                const description =
                    String(
                        product.description || ""
                    )
                    .toLowerCase();


                const productCategory =
                    String(
                        product.category || ""
                    );


                const matchesSearch =
                    name.includes(
                        search
                    ) ||
                    description.includes(
                        search
                    );


                const matchesCategory =
                    category === "all" ||
                    productCategory ===
                        category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    /* -------------------------
       SORT PRODUCTS
    ------------------------- */

    filteredProducts.sort(
        (a, b) => {

            if (
                sort === "name"
            ) {

                return String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    )
                );

            }


            if (
                sort === "priceLow"
            ) {

                return (
                    Number(
                        a.price || 0
                    ) -
                    Number(
                        b.price || 0
                    )
                );

            }


            if (
                sort === "priceHigh"
            ) {

                return (
                    Number(
                        b.price || 0
                    ) -
                    Number(
                        a.price || 0
                    )
                );

            }


            if (
                sort === "stock"
            ) {

                return (
                    Number(
                        b.stock || 0
                    ) -
                    Number(
                        a.stock || 0
                    )
                );

            }


            return 0;

        }
    );


    renderProducts();

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const container =
        document.getElementById(
            "productsGrid"
        );


    if (!container) {
        return;
    }


    if (
        filteredProducts.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>
                    No products found
                </h3>

                <p>
                    Try another search or category.
                </p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        filteredProducts.map(
            product => {

                const stock =
                    Number(
                        product.stock || 0
                    );


                const isOutOfStock =
                    stock <= 0;


                return `

                    <article
                        class="product-card"
                    >

                        <div
                            class="product-image-wrapper"
                        >

                            <img
                                class="product-image"
                                src="${escapeHTML(
                                    product.image
                                )}"
                                alt="${escapeHTML(
                                    product.name
                                )}"
                                loading="lazy"
                                onerror="
                                    this.src =
                                    'https://via.placeholder.com/500x500?text=No+Image'
                                "
                            >

                            <span
                                class="product-category"
                            >
                                ${escapeHTML(
                                    product.category ||
                                    "Product"
                                )}
                            </span>

                        </div>


                        <div
                            class="product-content"
                        >

                            <h3
                                class="product-name"
                            >
                                ${escapeHTML(
                                    product.name
                                )}
                            </h3>


                            <p
                                class="product-description"
                            >
                                ${escapeHTML(
                                    product.description
                                )}
                            </p>


                            <div
                                class="product-bottom"
                            >

                                <strong
                                    class="product-price"
                                >
                                    ${formatPrice(
                                        product.price
                                    )}
                                </strong>


                                <span
                                    class="${
                                        isOutOfStock
                                            ? "stock-out"
                                            : stock < 5
                                                ? "stock-low"
                                                : "stock-good"
                                    }"
                                >

                                    ${
                                        isOutOfStock
                                            ? "Out of Stock"
                                            : `${stock} in stock`
                                    }

                                </span>

                            </div>


                            <div
                                class="product-actions"
                            >

                                <button
                                    class="view-button"
                                    onclick="
                                        window.location.href =
                                        'product-details.html?id=${encodeURIComponent(
                                            product._id
                                        )}'
                                    "
                                >
                                    View Details
                                </button>


                                <button
                                    class="add-to-cart-button"
                                    ${
                                        isOutOfStock
                                            ? "disabled"
                                            : ""
                                    }
                                    onclick="
                                        addToCart(
                                            '${product._id}'
                                        )
                                    "
                                >

                                    ${
                                        isOutOfStock
                                            ? "Out of Stock"
                                            : "Add to Cart"
                                    }

                                </button>

                            </div>

                        </div>

                    </article>

                `;

            }
        ).join("");

}


/* =========================================================
   PRODUCT MODAL
========================================================= */

function setupProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    const closeButton =
        document.getElementById(
            "closeProductModal"
        );


    if (
        closeButton &&
        modal
    ) {

        closeButton.addEventListener(
            "click",
            () => {

                modal.classList.remove(
                    "show"
                );

            }
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    modal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }

}


/* =========================================================
   SHOW PRODUCT DETAILS MODAL
========================================================= */

function showProductDetails(
    productId
) {

    const product =
        products.find(
            item =>
                item._id ===
                productId
        );


    if (!product) {
        return;
    }


    const modal =
        document.getElementById(
            "productModal"
        );


    const image =
        document.getElementById(
            "modalProductImage"
        );


    const name =
        document.getElementById(
            "modalProductName"
        );


    const description =
        document.getElementById(
            "modalProductDescription"
        );


    const price =
        document.getElementById(
            "modalProductPrice"
        );


    const category =
        document.getElementById(
            "modalProductCategory"
        );


    const stock =
        document.getElementById(
            "modalProductStock"
        );


    if (!modal) {
        return;
    }


    if (image) {

        image.src =
            product.image;

        image.alt =
            product.name;

    }


    if (name) {

        name.textContent =
            product.name;

    }


    if (description) {

        description.textContent =
            product.description;

    }


    if (price) {

        price.textContent =
            formatPrice(
                product.price
            );

    }


    if (category) {

        category.textContent =
            product.category;

    }


    if (stock) {

        stock.textContent =
            product.stock > 0
                ? `${product.stock} in stock`
                : "Out of stock";

    }


    modal.classList.add(
        "show"
    );

}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(
    productId
) {

    const product =
        products.find(
            item =>
                item._id ===
                productId
        );


    if (!product) {

        showToast(
            "Product not found."
        );

        return;

    }


    const stock =
        Number(
            product.stock || 0
        );


    if (stock <= 0) {

        showToast(
            "This product is out of stock."
        );

        return;

    }


    const existingItem =
        cart.find(
            item =>
                item.productId ===
                productId
        );


    if (existingItem) {

        if (
            existingItem.quantity >=
            stock
        ) {

            showToast(
                "Maximum available stock reached."
            );

            return;

        }


        existingItem.quantity += 1;

    } else {

        cart.push({

            productId:
                product._id,

            name:
                product.name,

            price:
                Number(
                    product.price || 0
                ),

            image:
                product.image,

            quantity: 1

        });

    }


    saveCart();

    updateCartUI();


    showToast(
        `${product.name} added to cart.`
    );

}


/* =========================================================
   UPDATE CART QUANTITY
========================================================= */

function updateCartQuantity(
    productId,
    change
) {

    const item =
        cart.find(
            cartItem =>
                cartItem.productId ===
                productId
        );


    if (!item) {
        return;
    }


    const product =
        products.find(
            productItem =>
                productItem._id ===
                productId
        );


    const stock =
        product
            ? Number(
                product.stock || 0
            )
            : 999999;


    const newQuantity =
        item.quantity +
        Number(change);


    if (
        newQuantity <= 0
    ) {

        removeFromCart(
            productId
        );

        return;

    }


    if (
        newQuantity >
        stock
    ) {

        showToast(
            `Only ${stock} available in stock.`
        );

        return;

    }


    item.quantity =
        newQuantity;


    saveCart();

    updateCartUI();

}


/* =========================================================
   REMOVE FROM CART
========================================================= */

function removeFromCart(
    productId
) {

    cart =
        cart.filter(
            item =>
                item.productId !==
                productId
        );


    saveCart();

    updateCartUI();


    showToast(
        "Product removed from cart."
    );

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart() {

    localStorage.setItem(
        "itachiMartCart",
        JSON.stringify(
            cart
        )
    );

}


/* =========================================================
   SYNC CART WITH PRODUCTS
========================================================= */

function syncCartWithProducts() {

    cart =
        cart.filter(
            item => {

                const product =
                    products.find(
                        productItem =>
                            productItem._id ===
                            item.productId
                    );


                if (!product) {

                    return false;

                }


                const stock =
                    Number(
                        product.stock || 0
                    );


                if (
                    stock <= 0
                ) {

                    return false;

                }


                if (
                    item.quantity >
                    stock
                ) {

                    item.quantity =
                        stock;

                }


                item.name =
                    product.name;

                item.price =
                    Number(
                        product.price || 0
                    );

                item.image =
                    product.image;


                return (
                    item.quantity > 0
                );

            }
        );


    saveCart();

    updateCartUI();

}


/* =========================================================
   CART SETUP
========================================================= */

function setupCart() {

    const cartButton =
        document.getElementById(
            "cartButton"
        );


    const cartModal =
        document.getElementById(
            "cartModal"
        );


    const closeCart =
        document.getElementById(
            "closeCart"
        );


    if (
        cartButton &&
        cartModal
    ) {

        cartButton.addEventListener(
            "click",
            () => {

                cartModal.classList.add(
                    "show"
                );

                updateCartUI();

            }
        );

    }


    if (
        closeCart &&
        cartModal
    ) {

        closeCart.addEventListener(
            "click",
            () => {

                cartModal.classList.remove(
                    "show"
                );

            }
        );

    }


    if (cartModal) {

        cartModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    cartModal
                ) {

                    cartModal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }

}


/* =========================================================
   UPDATE CART UI
========================================================= */

function updateCartUI() {

    const cartContainer =
        document.getElementById(
            "cartItems"
        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    if (!cartContainer) {
        return;
    }


    /* -------------------------
       CART COUNT
    ------------------------- */

    const totalQuantity =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    if (cartCount) {

        cartCount.textContent =
            totalQuantity;

    }


    /* -------------------------
       EMPTY CART
    ------------------------- */

    if (
        cart.length === 0
    ) {

        cartContainer.innerHTML = `

            <div
                class="empty-cart"
            >

                <div
                    class="empty-cart-icon"
                >
                    🛒
                </div>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add some products to get started.
                </p>

            </div>

        `;


        if (cartTotal) {

            cartTotal.textContent =
                formatPrice(0);

        }


        return;

    }


    /* -------------------------
       CART ITEMS
    ------------------------- */

    cartContainer.innerHTML =
        cart.map(
            item => {

                const itemTotal =
                    Number(
                        item.price || 0
                    ) *
                    Number(
                        item.quantity || 0
                    );


                return `

                    <div
                        class="cart-item"
                    >

                        <img
                            src="${escapeHTML(
                                item.image
                            )}"
                            alt="${escapeHTML(
                                item.name
                            )}"
                            onerror="
                                this.src =
                                'https://via.placeholder.com/100x100?text=No+Image'
                            "
                        >


                        <div
                            class="cart-item-info"
                        >

                            <h4>
                                ${escapeHTML(
                                    item.name
                                )}
                            </h4>


                            <p>
                                ${formatPrice(
                                    item.price
                                )}
                            </p>


                            <div
                                class="cart-controls"
                            >

                                <button
                                    type="button"
                                    onclick="
                                        updateCartQuantity(
                                            '${item.productId}',
                                            -1
                                        )
                                    "
                                >
                                    −
                                </button>


                                <span>
                                    ${item.quantity}
                                </span>


                                <button
                                    type="button"
                                    onclick="
                                        updateCartQuantity(
                                            '${item.productId}',
                                            1
                                        )
                                    "
                                >
                                    +
                                </button>


                                <button
                                    type="button"
                                    class="remove-cart"
                                    onclick="
                                        removeFromCart(
                                            '${item.productId}'
                                        )
                                    "
                                >
                                    ×
                                </button>

                            </div>

                        </div>


                        <strong
                            class="cart-item-total"
                        >
                            ${formatPrice(
                                itemTotal
                            )}
                        </strong>

                    </div>

                `;

            }
        ).join("");


    /* -------------------------
       CART TOTAL
    ------------------------- */

    const total =
        cart.reduce(
            (
                sum,
                item
            ) => {

                return (
                    sum +
                    (
                        Number(
                            item.price || 0
                        ) *
                        Number(
                            item.quantity || 0
                        )
                    )
                );

            },
            0
        );


    if (cartTotal) {

        cartTotal.textContent =
            formatPrice(
                total
            );

    }

}


/* =========================================================
   CHECKOUT SETUP
========================================================= */

function setupCheckout() {

    const checkoutButton =
        document.getElementById(
            "checkoutButton"
        );


    const checkoutModal =
        document.getElementById(
            "checkoutModal"
        );


    const closeCheckout =
        document.getElementById(
            "closeCheckout"
        );


    const checkoutForm =
        document.getElementById(
            "checkoutForm"
        );


    if (
        checkoutButton &&
        checkoutModal
    ) {

        checkoutButton.addEventListener(
            "click",
            () => {

                if (
                    cart.length === 0
                ) {

                    showToast(
                        "Your cart is empty."
                    );

                    return;

                }


                checkoutModal.classList.add(
                    "show"
                );

            }
        );

    }


    if (
        closeCheckout &&
        checkoutModal
    ) {

        closeCheckout.addEventListener(
            "click",
            () => {

                checkoutModal.classList.remove(
                    "show"
                );

            }
        );

    }


    if (checkoutModal) {

        checkoutModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    checkoutModal
                ) {

                    checkoutModal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    if (checkoutForm) {

        checkoutForm.addEventListener(
            "submit",
            placeOrder
        );

    }

}


/* =========================================================
   PLACE ORDER
========================================================= */

async function placeOrder(
    event
) {

    event.preventDefault();


    if (
        cart.length === 0
    ) {

        showCheckoutMessage(
            "Your cart is empty.",
            true
        );

        return;

    }


    const customerName =
        getInputValue(
            "customerName"
        );


    const email =
        getInputValue(
            "customerEmail"
        );


    const phone =
        getInputValue(
            "customerPhone"
        );


    const address =
        getInputValue(
            "customerAddress"
        );


    if (
        !customerName ||
        !email ||
        !phone ||
        !address
    ) {

        showCheckoutMessage(
            "Please fill in all checkout details.",
            true
        );

        return;

    }


    const totalAmount =
        cart.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    (
                        Number(
                            item.price || 0
                        ) *
                        Number(
                            item.quantity || 0
                        )
                    )
                );

            },
            0
        );


    const orderItems =
        cart.map(
            item => ({

                productId:
                    item.productId,

                name:
                    item.name,

                price:
                    Number(
                        item.price || 0
                    ),

                quantity:
                    Number(
                        item.quantity || 0
                    ),

                image:
                    item.image

            })
        );


    const orderData = {

        customerName,

        email,

        phone,

        address,

        items:
            orderItems,

        totalAmount

    };


    const submitButton =
        document.querySelector(
            "#checkoutForm button[type='submit']"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Placing Order...";

    }


    showCheckoutMessage(
        "Placing your order...",
        false
    );


    try {

        const response =
            await fetch(
                ORDER_API,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            orderData
                        )

                }
            );


        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to place order."
            );

        }


        /* -------------------------
           CLEAR CART
        ------------------------- */

        cart = [];

        saveCart();

        updateCartUI();


        /* -------------------------
           RESET FORM
        ------------------------- */

        const form =
            document.getElementById(
                "checkoutForm"
            );


        if (form) {

            form.reset();

        }


        showCheckoutMessage(
            "Order placed successfully! Thank you for shopping with Itachi Mart.",
            false
        );


        showToast(
            "Order placed successfully."
        );


        /* -------------------------
           CLOSE CART
        ------------------------- */

        const cartModal =
            document.getElementById(
                "cartModal"
            );


        if (cartModal) {

            cartModal.classList.remove(
                "show"
            );

        }


    } catch (error) {

        console.error(
            "Order error:",
            error
        );


        showCheckoutMessage(
            error.message ||
            "Unable to place order. Please try again.",
            true
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Place Order";

        }

    }

}


/* =========================================================
   GET INPUT VALUE
========================================================= */

function getInputValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return "";
    }


    return element.value
        .trim();

}


/* =========================================================
   CHECKOUT MESSAGE
========================================================= */

function showCheckoutMessage(
    message,
    isError
) {

    const element =
        document.getElementById(
            "checkoutMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        isError
            ? "error-message"
            : "success-message";


    element.style.display =
        "block";

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        ) ||
        document.getElementById(
            "adminToast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (!toast) {

        console.log(
            message
        );

        return;

    }


    if (toastMessage) {

        toastMessage.textContent =
            message;

    } else {

        toast.textContent =
            message;

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.__customerToastTimer
    );


    window.__customerToastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const links =
        document.querySelectorAll(
            "a[href^='#']"
        );


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        }
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const menuButton =
        document.getElementById(
            "menuButton"
        );


    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    if (
        !menuButton ||
        !mobileMenu
    ) {

        return;

    }


    menuButton.addEventListener(
        "click",
        () => {

            mobileMenu.classList.toggle(
                "show"
            );

        }
    );


    const links =
        mobileMenu.querySelectorAll(
            "a"
        );


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    mobileMenu.classList.remove(
                        "show"
                    );

                }
            );

        }
    );

}


/* =========================================================
   PRODUCT LOADING STATE
========================================================= */

function showProductsLoading(
    loading
) {

    const loadingElement =
        document.getElementById(
            "productsLoading"
        );


    if (loadingElement) {

        loadingElement.hidden =
            !loading;

    }

}


/* =========================================================
   PRODUCT ERROR
========================================================= */

function showProductsError(
    message
) {

    const container =
        document.getElementById(
            "productsGrid"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div
            class="error-state"
        >

            <h3>
                Something went wrong
            </h3>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

            <button
                type="button"
                onclick="loadProducts()"
            >
                Try Again
            </button>

        </div>

    `;

}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(
    value
) {

    return new Intl.NumberFormat(
        "en-IN",
        {

            style: "currency",

            currency: "INR",

            maximumFractionDigits: 0

        }
    ).format(
        Number(
            value || 0
        )
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        character => {

            const map = {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"

            };


            return map[
                character
            ];

        }
    );

}


/* =========================================================
   EXPOSE FUNCTIONS
   FOR INLINE HTML BUTTONS
========================================================= */

window.loadProducts =
    loadProducts;

window.addToCart =
    addToCart;

window.updateCartQuantity =
    updateCartQuantity;

window.removeFromCart =
    removeFromCart;

window.showProductDetails =
    showProductDetails;

window.placeOrder =
    placeOrder;

window.applyProductFilters =
    applyProductFilters;