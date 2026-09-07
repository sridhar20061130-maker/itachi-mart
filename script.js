// ==========================================
// ITACHI MART - CUSTOMER JAVASCRIPT
// ==========================================

const PRODUCT_API = "/api/products";
const ORDER_API = "/api/orders";

let products = [];
let cart = [];


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCart();

        setupControls();

        setupCart();

        setupProductModal();

        setupCheckout();

        loadProducts();

    }
);


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    const loading =
        document.getElementById(
            "loading"
        );

    const error =
        document.getElementById(
            "errorMessage"
        );


    try {

        if (loading) {

            loading.style.display =
                "block";

        }


        const response =
            await fetch(
                PRODUCT_API
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load products"
            );

        }


        const data =
            await response.json();

        products =
            Array.isArray(data)
                ? data
                : (Array.isArray(data.products) ? data.products : []);


        populateCategories();

        applyFilters();


    } catch (err) {

        console.error(err);


        if (error) {

            error.textContent =
                "Unable to load products.";

            error.style.display =
                "block";

        }


    } finally {

        if (loading) {

            loading.style.display =
                "none";

        }

    }

}


// ==========================================
// CATEGORIES
// ==========================================

function populateCategories() {

    const filter =
        document.getElementById(
            "categoryFilter"
        );


    if (!filter) return;


    const current =
        filter.value;


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


    filter.innerHTML = `

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


            filter.appendChild(
                option
            );

        }
    );


    if (
        categories.includes(
            current
        )
    ) {

        filter.value =
            current;

    }

}


// ==========================================
// CONTROLS
// ==========================================

function setupControls() {

    const search =
        document.getElementById(
            "searchInput"
        );


    const category =
        document.getElementById(
            "categoryFilter"
        );


    const sort =
        document.getElementById(
            "sortFilter"
        );


    const reset =
        document.getElementById(
            "resetFilters"
        );


    if (search) {

        search.addEventListener(
            "input",
            applyFilters
        );

    }


    if (category) {

        category.addEventListener(
            "change",
            applyFilters
        );

    }


    if (sort) {

        sort.addEventListener(
            "change",
            applyFilters
        );

    }


    if (reset) {

        reset.addEventListener(
            "click",
            () => {

                search.value =
                    "";

                category.value =
                    "all";

                sort.value =
                    "default";

                applyFilters();

            }
        );

    }

}


// ==========================================
// FILTER PRODUCTS
// ==========================================

function applyFilters() {

    const searchElement =
        document.getElementById(
            "searchInput"
        );


    const categoryElement =
        document.getElementById(
            "categoryFilter"
        );


    const sortElement =
        document.getElementById(
            "sortFilter"
        );


    const search =
        searchElement
            ? searchElement.value
                .toLowerCase()
                .trim()
            : "";


    const category =
        categoryElement
            ? categoryElement.value
            : "all";


    const sort =
        sortElement
            ? sortElement.value
            : "default";


    let filtered =
        products.filter(
            product => {

                const name =
                    String(
                        product.name ||
                        ""
                    )
                    .toLowerCase();


                const productCategory =
                    String(
                        product.category ||
                        ""
                    )
                    .toLowerCase();


                const description =
                    String(
                        product.description ||
                        ""
                    )
                    .toLowerCase();


                const searchMatch =

                    name.includes(
                        search
                    )

                    ||

                    productCategory.includes(
                        search
                    )

                    ||

                    description.includes(
                        search
                    );


                const categoryMatch =

                    category === "all"

                    ||

                    product.category ===
                    category;


                return (
                    searchMatch &&
                    categoryMatch
                );

            }
        );


    filtered.sort(
        (a, b) => {

            switch (sort) {

                case "price-low":

                    return (
                        Number(a.price) -
                        Number(b.price)
                    );


                case "price-high":

                    return (
                        Number(b.price) -
                        Number(a.price)
                    );


                case "name":

                    return String(
                        a.name
                    )
                    .localeCompare(
                        String(
                            b.name
                        )
                    );


                case "stock":

                    return (
                        Number(b.stock) -
                        Number(a.stock)
                    );


                default:

                    return 0;

            }

        }
    );


    renderProducts(
        filtered
    );

}


// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts(
    list
) {

    const grid =
        document.getElementById(
            "productsGrid"
        );


    const empty =
        document.getElementById(
            "emptyProducts"
        );


    if (!grid) return;


    grid.innerHTML =
        "";


    if (!list.length) {

        if (empty) {

            empty.style.display =
                "block";

        }

        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    list.forEach(
        (product, index) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "product-card";


            card.style.animationDelay =
                `${index * 0.05}s`;


            const stock =
                Number(
                    product.stock
                );


            let stockClass =
                "stock-available";


            let stockText =
                `${stock} available`;


            if (stock === 0) {

                stockClass =
                    "stock-out";

                stockText =
                    "Out of stock";

            } else if (
                stock <= 5
            ) {

                stockClass =
                    "stock-low";

                stockText =
                    `Only ${stock} left`;

            }


            card.innerHTML = `

                <div class="product-image-wrapper">

                    <img
                        src="${escapeHTML(
                            product.image
                        )}"
                        alt="${escapeHTML(
                            product.name
                        )}"
                        loading="lazy"
                        onerror="
                            this.style.opacity='0.3'
                        "
                    >

                </div>


                <div class="product-info">

                    <div class="product-category">

                        ${escapeHTML(
                            product.category
                        )}

                    </div>


                    <h3>

                        ${escapeHTML(
                            product.name
                        )}

                    </h3>


                    <p class="product-description">

                        ${escapeHTML(
                            product.description
                        )}

                    </p>


                    <div class="product-bottom">

                        <strong class="product-price">

                            ${formatPrice(
                                product.price
                            )}

                        </strong>


                        <span
                            class="product-stock ${stockClass}"
                        >

                            ${stockText}

                        </span>

                    </div>


                    <div class="product-actions">

                        <button
                            class="view-button"
                            onclick="
                                showProductDetails(
                                    '${product._id}'
                                )
                            "
                        >
                            Details
                        </button>


                        <button
                            class="add-button"
                            ${
                                stock === 0
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
                                stock === 0
                                    ? "Out of Stock"
                                    : "Add to Cart"
                            }

                        </button>

                    </div>

                </div>

            `;


            grid.appendChild(
                card
            );

        }
    );

}


// ==========================================
// PRODUCT DETAILS
// ==========================================

function setupProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    const close =
        document.getElementById(
            "productModalClose"
        );


    if (close) {

        close.addEventListener(
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


function showProductDetails(
    id
) {

    const product =
        products.find(
            item =>
                item._id === id
        );


    if (!product) return;


    const modal =
        document.getElementById(
            "productModal"
        );


    const details =
        document.getElementById(
            "productDetails"
        );


    if (!modal || !details) {
        return;
    }


    const stock =
        Number(
            product.stock
        );


    details.innerHTML = `

        <img
            class="detail-image"
            src="${escapeHTML(
                product.image
            )}"
            alt="${escapeHTML(
                product.name
            )}"
        >


        <div class="detail-category">

            ${escapeHTML(
                product.category
            )}

        </div>


        <h2 class="detail-title">

            ${escapeHTML(
                product.name
            )}

        </h2>


        <p class="detail-description">

            ${escapeHTML(
                product.description
            )}

        </p>


        <div class="detail-price">

            ${formatPrice(
                product.price
            )}

        </div>


        <p>

            ${
                stock > 0
                    ? `${stock} items available`
                    : "Currently out of stock"
            }

        </p>


        <button
            class="checkout-button"
            ${
                stock === 0
                    ? "disabled"
                    : ""
            }
            onclick="
                addToCart('${product._id}');
                document
                    .getElementById('productModal')
                    .classList.remove('show');
            "
        >

            ${
                stock === 0
                    ? "Out of Stock"
                    : "Add To Cart"
            }

        </button>

    `;


    modal.classList.add(
        "show"
    );

}


// ==========================================
// CART
// ==========================================

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                "itachiMartCart"
            );


        cart =
            saved
                ? JSON.parse(saved)
                : [];


        if (!Array.isArray(cart)) {

            cart = [];

        }

    } catch {

        cart = [];

    }


    updateCartUI();

}


function saveCart() {

    localStorage.setItem(
        "itachiMartCart",
        JSON.stringify(cart)
    );


    updateCartUI();

}


function addToCart(
    id
) {

    const product =
        products.find(
            item =>
                item._id === id
        );


    if (!product) return;


    if (
        Number(product.stock) <= 0
    ) {

        showToast(
            "Product is out of stock."
        );

        return;

    }


    const existing =
        cart.find(
            item =>
                item.productId === id
        );


    if (existing) {

        if (
            existing.quantity >=
            Number(product.stock)
        ) {

            showToast(
                "Maximum available stock reached."
            );

            return;

        }


        existing.quantity++;

    } else {

        cart.push({

            productId:
                product._id,

            name:
                product.name,

            price:
                Number(
                    product.price
                ),

            image:
                product.image,

            quantity:
                1

        });

    }


    saveCart();


    showToast(
        `${product.name} added to cart.`
    );

}


function updateCartQuantity(
    id,
    change
) {

    const item =
        cart.find(
            product =>
                product.productId === id
        );


    const product =
        products.find(
            product =>
                product._id === id
        );


    if (!item) return;


    item.quantity +=
        change;


    if (
        product &&
        item.quantity >
        Number(product.stock)
    ) {

        item.quantity =
            Number(product.stock);

    }


    if (
        item.quantity <= 0
    ) {

        cart =
            cart.filter(
                product =>
                    product.productId !==
                    id
            );

    }


    saveCart();

}


function removeFromCart(
    id
) {

    cart =
        cart.filter(
            item =>
                item.productId !== id
        );


    saveCart();


    showToast(
        "Item removed from cart."
    );

}


// ==========================================
// CART UI
// ==========================================

function updateCartUI() {

    const count =
        document.getElementById(
            "cartCount"
        );


    const itemsContainer =
        document.getElementById(
            "cartItems"
        );


    const totalElement =
        document.getElementById(
            "cartTotal"
        );


    const totalQuantity =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity
                ),
            0
        );


    if (count) {

        count.textContent =
            totalQuantity;

    }


    if (!itemsContainer) {
        return;
    }


    itemsContainer.innerHTML =
        "";


    if (!cart.length) {

        itemsContainer.innerHTML = `

            <div class="empty-products">

                Your cart is empty.

            </div>

        `;


        if (totalElement) {

            totalElement.textContent =
                "₹0";

        }

        return;

    }


    let total = 0;


    cart.forEach(
        item => {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);


            total +=
                itemTotal;


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "cart-item";


            element.innerHTML = `

                <img
                    src="${escapeHTML(
                        item.image
                    )}"
                    alt="${escapeHTML(
                        item.name
                    )}"
                >


                <div class="cart-item-info">

                    <h4>

                        ${escapeHTML(
                            item.name
                        )}

                    </h4>


                    <span>

                        ${formatPrice(
                            item.price
                        )}

                    </span>

                </div>


                <div class="cart-controls">

                    <button
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

            `;


            itemsContainer.appendChild(
                element
            );

        }
    );


    if (totalElement) {

        totalElement.textContent =
            formatPrice(
                total
            );

    }

}


// ==========================================
// CART MODAL
// ==========================================

function setupCart() {

    const button =
        document.getElementById(
            "cartButton"
        );


    const modal =
        document.getElementById(
            "cartModal"
        );


    const close =
        document.getElementById(
            "cartClose"
        );


    if (button) {

        button.addEventListener(
            "click",
            () => {

                updateCartUI();

                modal.classList.add(
                    "show"
                );

            }
        );

    }


    if (close) {

        close.addEventListener(
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


// ==========================================
// CHECKOUT
// ==========================================

function setupCheckout() {

    const checkoutButton =
        document.getElementById(
            "checkoutButton"
        );


    const cartModal =
        document.getElementById(
            "cartModal"
        );


    const checkoutModal =
        document.getElementById(
            "checkoutModal"
        );


    const close =
        document.getElementById(
            "checkoutClose"
        );


    const form =
        document.getElementById(
            "checkoutForm"
        );


    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            () => {

                if (!cart.length) {

                    showToast(
                        "Your cart is empty."
                    );

                    return;

                }


                cartModal.classList.remove(
                    "show"
                );


                checkoutModal.classList.add(
                    "show"
                );

            }
        );

    }


    if (close) {

        close.addEventListener(
            "click",
            () => {

                checkoutModal.classList.remove(
                    "show"
                );

            }
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            placeOrder
        );

    }

}


async function placeOrder(
    event
) {

    event.preventDefault();


    if (!cart.length) {

        return;

    }


    const name =
        document.getElementById(
            "customerName"
        ).value.trim();


    const email =
        document.getElementById(
            "customerEmail"
        ).value.trim();


    const message =
        document.getElementById(
            "checkoutMessage"
        );


    const total =
        cart.reduce(
            (
                sum,
                item
            ) =>
                sum +
                (
                    Number(
                        item.price
                    ) *
                    Number(
                        item.quantity
                    )
                ),
            0
        );


    const orderData = {

        customerName:
            name,

        email:
            email,

        items:
            cart.map(
                item => ({

                    productId:
                        item.productId,

                    name:
                        item.name,

                    price:
                        item.price,

                    quantity:
                        item.quantity

                })
            ),

        totalAmount:
            total

    };


    try {

        const response =
            await fetch(
                ORDER_API,
                {

                    method:
                        "POST",

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


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Order failed"
            );

        }


        cart = [];


        saveCart();


        document.getElementById(
            "checkoutForm"
        ).reset();


        if (message) {

            message.textContent =
                "Order placed successfully!";

            message.style.color =
                "#00ffae";

        }


        showToast(
            "Order placed successfully!"
        );


    } catch (error) {

        console.error(error);


        if (message) {

            message.textContent =
                error.message ||
                "Unable to place order.";

            message.style.color =
                "#ff7185";

        }

    }

}


// ==========================================
// TOAST
// ==========================================

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) return;


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


// ==========================================
// FORMAT PRICE
// ==========================================

function formatPrice(
    value
) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style:
                "currency",

            currency:
                "INR",

            maximumFractionDigits:
                0
        }
    )
    .format(
        Number(value) || 0
    );

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}
