/* =========================================================
   ITACHI MART - ADMIN DASHBOARD JAVASCRIPT
========================================================= */

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = "https://itachi-mart.onrender.com";

const API_URL = `${API_BASE_URL}/api/products`;
const ORDER_API_URL = `${API_BASE_URL}/api/orders`;


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let products = [];
let orders = [];
let editingProductId = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    /* -------------------------
       PRODUCT FORM
    ------------------------- */

    const productForm =
        document.getElementById("productForm");

    if (productForm) {
        productForm.addEventListener(
            "submit",
            saveProduct
        );
    }


    /* -------------------------
       PRODUCT SEARCH
    ------------------------- */

    const productSearch =
        document.getElementById("productSearch");

    if (productSearch) {
        productSearch.addEventListener(
            "input",
            renderProducts
        );
    }


    /* -------------------------
       PRODUCT FILTER
    ------------------------- */

    const productFilter =
        document.getElementById("productFilter");

    if (productFilter) {
        productFilter.addEventListener(
            "change",
            renderProducts
        );
    }


    /* -------------------------
       PRODUCT SORT
    ------------------------- */

    const productSort =
        document.getElementById("productSort");

    if (productSort) {
        productSort.addEventListener(
            "change",
            renderProducts
        );
    }


    /* -------------------------
       ORDER SEARCH
    ------------------------- */

    const orderSearch =
        document.getElementById("orderSearch");

    if (orderSearch) {
        orderSearch.addEventListener(
            "input",
            renderOrders
        );
    }


    /* -------------------------
       ORDER STATUS FILTER
    ------------------------- */

    const orderStatusFilter =
        document.getElementById("orderStatusFilter");

    if (orderStatusFilter) {
        orderStatusFilter.addEventListener(
            "change",
            renderOrders
        );
    }


    /* -------------------------
       PRODUCT IMAGE PREVIEW
    ------------------------- */

    const productImage =
        document.getElementById("productImage");

    if (productImage) {
        productImage.addEventListener(
            "input",
            previewImage
        );
    }


    /* -------------------------
       CANCEL EDIT
    ------------------------- */

    const cancelEdit =
        document.getElementById("cancelEdit");

    if (cancelEdit) {
        cancelEdit.addEventListener(
            "click",
            () => resetProductForm()
        );
    }


    /* -------------------------
       REFRESH ANALYTICS
    ------------------------- */

    const refreshAnalytics =
        document.getElementById("refreshAnalytics");

    if (refreshAnalytics) {
        refreshAnalytics.addEventListener(
            "click",
            refreshAll
        );
    }


    /* -------------------------
       NAVIGATION
    ------------------------- */

    setupNavigation();


    /* -------------------------
       LOAD DASHBOARD
    ------------------------- */

    refreshAll();

});


/* =========================================================
   REFRESH EVERYTHING
========================================================= */

async function refreshAll() {

    await Promise.all([
        loadProducts(),
        loadOrders()
    ]);

    updateDashboard();

    renderAnalytics();
}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    setLoading(
        "productsLoading",
        true
    );

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                "Failed to load products."
            );
        }

        const data =
            await response.json();


        if (Array.isArray(data)) {

            products = data;

        } else if (
            Array.isArray(data.products)
        ) {

            products = data.products;

        } else {

            products = [];

        }


        updateCategoryFilter();

        renderProducts();

    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        showToast(
            "Product API is unavailable."
        );

    } finally {

        setLoading(
            "productsLoading",
            false
        );

    }
}


/* =========================================================
   LOAD ORDERS
========================================================= */

async function loadOrders() {

    setLoading(
        "ordersLoading",
        true
    );

    try {

        const response =
            await fetch(ORDER_API_URL);

        if (!response.ok) {
            throw new Error(
                "Failed to load orders."
            );
        }

        const data =
            await response.json();


        if (Array.isArray(data)) {

            orders = data;

        } else if (
            Array.isArray(data.orders)
        ) {

            orders = data.orders;

        } else {

            orders = [];

        }


        renderOrders();

    } catch (error) {

        console.error(
            "Order loading error:",
            error
        );

        showToast(
            "Order API is unavailable."
        );

    } finally {

        setLoading(
            "ordersLoading",
            false
        );

    }
}


/* =========================================================
   UPDATE CATEGORY FILTER
========================================================= */

function updateCategoryFilter() {

    const filter =
        document.getElementById(
            "productFilter"
        );

    if (!filter) {
        return;
    }


    const currentValue =
        filter.value;


    const categories =
        [...new Set(
            products
                .map(product =>
                    product.category
                )
                .filter(Boolean)
        )]
        .sort();


    filter.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );

        option.value = category;

        option.textContent = category;

        filter.appendChild(option);

    });


    if (
        categories.includes(
            currentValue
        )
    ) {

        filter.value =
            currentValue;

    }

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const body =
        document.getElementById(
            "productsTableBody"
        );

    if (!body) {
        return;
    }


    const searchInput =
        document.getElementById(
            "productSearch"
        );

    const filterInput =
        document.getElementById(
            "productFilter"
        );

    const sortInput =
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
        filterInput
            ? filterInput.value
            : "all";


    const sort =
        sortInput
            ? sortInput.value
            : "newest";


    let list =
        products.filter(product => {

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


            const matchesSearch =
                name.includes(search) ||
                description.includes(search);


            const matchesCategory =
                category === "all" ||
                product.category === category;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    /* -------------------------
       SORT
    ------------------------- */

    list.sort((a, b) => {

        if (sort === "name") {

            return String(a.name || "")
                .localeCompare(
                    String(b.name || "")
                );

        }


        if (sort === "priceLow") {

            return (
                Number(a.price || 0) -
                Number(b.price || 0)
            );

        }


        if (sort === "priceHigh") {

            return (
                Number(b.price || 0) -
                Number(a.price || 0)
            );

        }


        if (sort === "stockLow") {

            return (
                Number(a.stock || 0) -
                Number(b.stock || 0)
            );

        }


        return (
            new Date(
                b.createdAt || 0
            ) -
            new Date(
                a.createdAt || 0
            )
        );

    });


    /* -------------------------
       EMPTY
    ------------------------- */

    if (list.length === 0) {

        body.innerHTML = "";

    } else {

        body.innerHTML =
            list.map(product => {

                const stock =
                    Number(
                        product.stock || 0
                    );


                let stockClass = "";

                if (stock === 0) {
                    stockClass = "stock-out";
                } else if (stock < 5) {
                    stockClass = "stock-low";
                }


                return `
                    <tr>

                        <td>

                            <div class="product-cell">

                                <img
                                    src="${escapeHTML(
                                        product.image
                                    )}"
                                    alt="${escapeHTML(
                                        product.name
                                    )}"
                                    onerror="
                                        this.style.visibility='hidden'
                                    "
                                >

                                <strong>
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </strong>

                            </div>

                        </td>


                        <td>

                            <span class="badge">

                                ${escapeHTML(
                                    product.category
                                )}

                            </span>

                        </td>


                        <td>

                            ${formatPrice(
                                product.price
                            )}

                        </td>


                        <td
                            class="${stockClass}"
                        >

                            ${stock}

                        </td>


                        <td>

                            <div class="action-buttons">

                                <button
                                    class="action-btn edit"
                                    onclick="
                                        editProduct(
                                            '${product._id}'
                                        )
                                    "
                                >
                                    Edit
                                </button>


                                <button
                                    class="action-btn delete"
                                    onclick="
                                        deleteProduct(
                                            '${product._id}'
                                        )
                                    "
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }).join("");

    }


    const empty =
        document.getElementById(
            "productsEmpty"
        );

    if (empty) {

        empty.hidden =
            list.length > 0;

    }


    updateProductCount(
        list.length
    );

}


/* =========================================================
   SAVE PRODUCT
========================================================= */

async function saveProduct(event) {

    event.preventDefault();


    const productName =
        document.getElementById(
            "productName"
        );

    const productCategory =
        document.getElementById(
            "productCategory"
        );

    const productPrice =
        document.getElementById(
            "productPrice"
        );

    const productStock =
        document.getElementById(
            "productStock"
        );

    const productImage =
        document.getElementById(
            "productImage"
        );

    const productDescription =
        document.getElementById(
            "productDescription"
        );


    const product = {

        name:
            productName
                ? productName.value.trim()
                : "",

        category:
            productCategory
                ? productCategory.value
                : "",

        price:
            productPrice
                ? Number(
                    productPrice.value
                )
                : 0,

        stock:
            productStock
                ? Number(
                    productStock.value
                )
                : 0,

        image:
            productImage
                ? productImage.value.trim()
                : "",

        description:
            productDescription
                ? productDescription.value.trim()
                : ""

    };


    clearMessages();


    if (

        !product.name ||

        !product.category ||

        !product.image ||

        !product.description ||

        Number.isNaN(
            product.price
        ) ||

        Number.isNaN(
            product.stock
        ) ||

        product.price < 0 ||

        product.stock < 0

    ) {

        showError(
            "Please fill all fields correctly."
        );

        return;

    }


    const isEditing =
        Boolean(
            editingProductId
        );


    try {

        const url =
            isEditing

                ? `${API_URL}/${editingProductId}`

                : API_URL;


        const response =
            await fetch(
                url,
                {

                    method:
                        isEditing
                            ? "PUT"
                            : "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            product
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
                "Request failed."
            );

        }


        showSuccess(
            isEditing
                ? "Product updated successfully."
                : "Product added successfully."
        );


        showToast(
            isEditing
                ? "Product updated."
                : "Product added."
        );


        resetProductForm(false);


        await loadProducts();


        updateDashboard();

        renderAnalytics();


    } catch (error) {

        console.error(
            "Save product error:",
            error
        );

        showError(
            error.message ||
            "Could not save product."
        );

    }

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {

    const product =
        products.find(
            item =>
                item._id === id
        );


    if (!product) {
        return;
    }


    editingProductId =
        id;


    const productName =
        document.getElementById(
            "productName"
        );

    const productCategory =
        document.getElementById(
            "productCategory"
        );

    const productPrice =
        document.getElementById(
            "productPrice"
        );

    const productStock =
        document.getElementById(
            "productStock"
        );

    const productImage =
        document.getElementById(
            "productImage"
        );

    const productDescription =
        document.getElementById(
            "productDescription"
        );


    if (productName) {
        productName.value =
            product.name || "";
    }


    if (productCategory) {
        productCategory.value =
            product.category || "";
    }


    if (productPrice) {
        productPrice.value =
            product.price ?? "";
    }


    if (productStock) {
        productStock.value =
            product.stock ?? "";
    }


    if (productImage) {
        productImage.value =
            product.image || "";
    }


    if (productDescription) {
        productDescription.value =
            product.description || "";
    }


    const addButton =
        document.getElementById(
            "addProductButton"
        ) ||
        document.getElementById(
            "addProduct"
        );


    if (addButton) {

        addButton.textContent =
            "✓ Update Product";

    }


    const cancelEdit =
        document.getElementById(
            "cancelEdit"
        );


    if (cancelEdit) {
        cancelEdit.hidden = false;
    }


    previewImage();


    const section =
        document.getElementById(
            "add-product"
        );


    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }


    showToast(
        "Editing " +
        product.name
    );

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(id) {

    const product =
        products.find(
            item =>
                item._id === id
        );


    if (!product) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${product.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
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
                "Delete failed."
            );

        }


        showToast(
            "Product deleted."
        );


        await loadProducts();


        updateDashboard();

        renderAnalytics();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showToast(
            error.message ||
            "Could not delete product."
        );

    }

}


/* =========================================================
   RESET PRODUCT FORM
========================================================= */

function resetProductForm(
    clear = true
) {

    editingProductId =
        null;


    const form =
        document.getElementById(
            "productForm"
        );


    if (form) {
        form.reset();
    }


    const addButton =
        document.getElementById(
            "addProductButton"
        ) ||
        document.getElementById(
            "addProduct"
        );


    if (addButton) {

        addButton.textContent =
            "＋ Add Product";

    }


    const cancelEdit =
        document.getElementById(
            "cancelEdit"
        );


    if (cancelEdit) {
        cancelEdit.hidden = true;
    }


    const imagePreview =
        document.getElementById(
            "imagePreview"
        );


    if (imagePreview) {

        imagePreview.innerHTML =
            "IMAGE PREVIEW";

    }


    if (clear) {
        clearMessages();
    }

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function previewImage() {

    const input =
        document.getElementById(
            "productImage"
        );


    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (!input || !preview) {
        return;
    }


    const url =
        input.value.trim();


    if (!url) {

        preview.innerHTML =
            "IMAGE PREVIEW";

        return;

    }


    preview.innerHTML = `
        <img
            src="${escapeHTML(url)}"
            alt="Preview"
            onerror="
                this.parentElement.innerHTML =
                'IMAGE COULD NOT LOAD'
            "
        >
    `;

}


/* =========================================================
   RENDER ORDERS
========================================================= */

function renderOrders() {

    const grid =
        document.getElementById(
            "ordersGrid"
        );


    if (!grid) {
        return;
    }


    const searchInput =
        document.getElementById(
            "orderSearch"
        );


    const statusInput =
        document.getElementById(
            "orderStatusFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const status =
        statusInput
            ? statusInput.value
            : "all";


    const list =
        orders.filter(order => {

            const customerName =
                String(
                    order.customerName || ""
                )
                .toLowerCase();


            const email =
                String(
                    order.email || ""
                )
                .toLowerCase();


            const phone =
                String(
                    order.phone || ""
                )
                .toLowerCase();


            const id =
                String(
                    order._id || ""
                )
                .toLowerCase();


            const matchesSearch =
                customerName.includes(search) ||
                email.includes(search) ||
                phone.includes(search) ||
                id.includes(search);


            const matchesStatus =
                status === "all" ||
                String(
                    order.status || "Pending"
                ).toLowerCase() ===
                status.toLowerCase();


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    grid.innerHTML =
        list.map(order => {

            const items =
                Array.isArray(
                    order.items
                )
                    ? order.items
                    : [];


            const orderStatus =
                order.status ||
                "Pending";


            const statusClass =
                String(
                    orderStatus
                )
                .toLowerCase()
                .replace(
                    /\s+/g,
                    "-"
                );


            return `

                <article
                    class="order-card"
                >

                    <!-- ORDER HEADER -->

                    <div
                        class="order-head"
                    >

                        <div>

                            <div
                                class="order-id"
                            >
                                ORDER #

                                ${escapeHTML(
                                    String(
                                        order._id || ""
                                    )
                                    .slice(-8)
                                    .toUpperCase()
                                )}

                            </div>


                            <div
                                class="order-customer"
                            >
                                ${escapeHTML(
                                    order.customerName ||
                                    "Customer"
                                )}
                            </div>


                            <div
                                class="order-email"
                            >
                                ${escapeHTML(
                                    order.email || ""
                                )}
                            </div>

                        </div>


                        <span
                            class="badge status-${statusClass}"
                        >

                            ${escapeHTML(
                                orderStatus
                            )}

                        </span>

                    </div>


                    <!-- CUSTOMER DETAILS -->

                    <div
                        class="order-customer-details"
                    >

                        <div
                            class="detail-row"
                        >

                            <span>
                                Phone
                            </span>

                            <strong>
                                ${escapeHTML(
                                    order.phone ||
                                    "Not provided"
                                )}
                            </strong>

                        </div>


                        <div
                            class="detail-row address-row"
                        >

                            <span>
                                Address
                            </span>

                            <strong>
                                ${escapeHTML(
                                    order.address ||
                                    "Not provided"
                                )}
                            </strong>

                        </div>

                    </div>


                    <!-- ORDER META -->

                    <div
                        class="order-meta"
                    >

                        <span
                            class="order-total"
                        >

                            ${formatPrice(
                                order.totalAmount
                            )}

                        </span>


                        <span
                            class="order-date"
                        >

                            ${formatDate(
                                order.createdAt
                            )}

                        </span>

                    </div>


                    <!-- ORDER ITEMS -->

                    <div
                        class="order-items-section"
                    >

                        <h4>
                            Ordered Products
                        </h4>


                        <div
                            class="order-items"
                        >

                            ${
                                items.length

                                ? items.map(item => {

                                    const quantity =
                                        Number(
                                            item.quantity || 0
                                        );


                                    const price =
                                        Number(
                                            item.price || 0
                                        );


                                    const lineTotal =
                                        price *
                                        quantity;


                                    return `

                                        <div
                                            class="order-item"
                                        >

                                            <div>

                                                <strong>
                                                    ${escapeHTML(
                                                        item.name ||
                                                        "Product"
                                                    )}
                                                </strong>

                                                <small>
                                                    Qty:
                                                    ${quantity}
                                                </small>

                                            </div>


                                            <strong>
                                                ${formatPrice(
                                                    lineTotal
                                                )}
                                            </strong>

                                        </div>

                                    `;

                                }).join("")

                                : `
                                    <div
                                        class="empty-state"
                                    >
                                        No item details
                                    </div>
                                `
                            }

                        </div>

                    </div>


                    <!-- ORDER FOOTER -->

                    <div
                        class="order-card-footer"
                    >

                        <strong>
                            Total:
                            ${formatPrice(
                                order.totalAmount
                            )}
                        </strong>


                        <select
                            class="status-select"
                            onchange="
                                updateOrderStatus(
                                    '${order._id}',
                                    this.value
                                )
                            "
                        >

                            ${getStatusOptions(
                                orderStatus
                            )}

                        </select>

                    </div>

                </article>

            `;

        }).join("");


    const empty =
        document.getElementById(
            "ordersEmpty"
        );


    if (empty) {

        empty.hidden =
            list.length > 0;

    }

}


/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

async function updateOrderStatus(
    id,
    status
) {

    try {

        const response =
            await fetch(
                `${ORDER_API_URL}/${id}/status`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status
                        })

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
                "Status update failed."
            );

        }


        const order =
            orders.find(
                item =>
                    item._id === id
            );


        if (order) {

            order.status =
                status;

        }


        showToast(
            "Order status updated."
        );


        renderOrders();

        updateDashboard();

        renderAnalytics();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        showToast(
            error.message ||
            "Could not update order."
        );

    }

}


/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

function updateDashboard() {

    const totalProducts =
        document.getElementById(
            "totalProducts"
        );


    const totalOrders =
        document.getElementById(
            "totalOrders"
        );


    const pendingOrders =
        document.getElementById(
            "pendingOrders"
        );


    const totalRevenue =
        document.getElementById(
            "totalRevenue"
        );


    if (totalProducts) {

        totalProducts.textContent =
            products.length;

    }


    if (totalOrders) {

        totalOrders.textContent =
            orders.length;

    }


    const pending =
        orders.filter(
            order =>
                String(
                    order.status ||
                    "Pending"
                )
                .toLowerCase() ===
                "pending"
        ).length;


    if (pendingOrders) {

        pendingOrders.textContent =
            pending;

    }


    const revenue =
        orders.reduce(
            (sum, order) => {

                if (
                    String(
                        order.status || ""
                    )
                    .toLowerCase() ===
                    "cancelled"
                ) {

                    return sum;

                }


                return (
                    sum +
                    Number(
                        order.totalAmount ||
                        0
                    )
                );

            },
            0
        );


    if (totalRevenue) {

        totalRevenue.textContent =
            formatPrice(revenue);

    }

}


/* =========================================================
   ANALYTICS
========================================================= */

function renderAnalytics() {

    renderRevenueChart();

    renderStatusChart();

    renderTopProducts();

}


/* =========================================================
   GET LAST 7 DAYS
========================================================= */

function getDays() {

    const days = [];

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date(today);


        date.setDate(
            today.getDate() - i
        );


        days.push(date);

    }


    return days;

}


/* =========================================================
   REVENUE CHART - FIXED
========================================================= */

function renderRevenueChart() {

    const chart =
        document.getElementById(
            "revenueChart"
        );


    const sevenDayRevenue =
        document.getElementById(
            "sevenDayRevenue"
        );


    if (!chart) {

        console.warn(
            "Revenue chart element not found."
        );

        return;

    }


    const days =
        getDays();


    /* -------------------------
       CALCULATE REVENUE
    ------------------------- */

    const values =
        days.map(day => {

            return orders.reduce(
                (
                    total,
                    order
                ) => {

                    if (
                        !order.createdAt
                    ) {

                        return total;

                    }


                    if (
                        String(
                            order.status || ""
                        )
                        .toLowerCase() ===
                        "cancelled"
                    ) {

                        return total;

                    }


                    const orderDate =
                        new Date(
                            order.createdAt
                        );


                    if (
                        Number.isNaN(
                            orderDate.getTime()
                        )
                    ) {

                        return total;

                    }


                    if (
                        orderDate.toDateString() ===
                        day.toDateString()
                    ) {

                        return (
                            total +
                            Number(
                                order.totalAmount ||
                                0
                            )
                        );

                    }


                    return total;

                },
                0
            );

        });


    /* -------------------------
       TOTAL LAST 7 DAYS
    ------------------------- */

    const totalRevenue =
        values.reduce(
            (
                total,
                value
            ) =>
                total + value,
            0
        );


    if (sevenDayRevenue) {

        sevenDayRevenue.textContent =
            formatPrice(
                totalRevenue
            );

    }


    /* -------------------------
       FIND MAX VALUE
    ------------------------- */

    const maxValue =
        Math.max(
            ...values,
            1
        );


    /* -------------------------
       DRAW CHART
    ------------------------- */

    chart.innerHTML =
        values.map(
            (
                value,
                index
            ) => {

                let height;


                if (value > 0) {

                    height =
                        (
                            value /
                            maxValue
                        ) *
                        100;


                    height =
                        Math.max(
                            height,
                            8
                        );

                } else {

                    height = 2;

                }


                return `

                    <div
                        class="bar-item"
                    >

                        <em>
                            ${formatCompact(
                                value
                            )}
                        </em>


                        <div
                            class="bar"
                            style="
                                height:${height}%;
                            "
                        ></div>


                        <small>

                            ${days[
                                index
                            ].toLocaleDateString(
                                "en-IN",
                                {
                                    weekday:
                                        "short"
                                }
                            )}

                        </small>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   STATUS CHART
========================================================= */

function renderStatusChart() {

    const chart =
        document.getElementById(
            "statusChart"
        );


    if (!chart) {
        return;
    }


    const statuses = [

        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"

    ];


    const counts =
        statuses.map(
            status =>
                orders.filter(
                    order =>
                        String(
                            order.status ||
                            "Pending"
                        )
                        .toLowerCase() ===
                        status.toLowerCase()
                ).length
        );


    const max =
        Math.max(
            ...counts,
            1
        );


    chart.innerHTML =
        statuses.map(
            (
                status,
                index
            ) => {

                const width =
                    (
                        counts[index] /
                        max
                    ) *
                    100;


                return `

                    <div
                        class="status-row"
                    >

                        <span>
                            ${status}
                        </span>


                        <div
                            class="status-track"
                        >

                            <div
                                class="status-fill"
                                style="
                                    width:${width}%;
                                "
                            ></div>

                        </div>


                        <strong>
                            ${counts[index]}
                        </strong>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   TOP PRODUCTS
========================================================= */

function renderTopProducts() {

    const container =
        document.getElementById(
            "topProducts"
        );


    if (!container) {
        return;
    }


    const totals = {};


    orders.forEach(order => {

        if (
            String(
                order.status || ""
            )
            .toLowerCase() ===
            "cancelled"
        ) {

            return;

        }


        const items =
            Array.isArray(
                order.items
            )
                ? order.items
                : [];


        items.forEach(item => {

            const name =
                item.name ||
                "Product";


            totals[name] =
                (
                    totals[name] ||
                    0
                ) +
                Number(
                    item.quantity ||
                    0
                );

        });

    });


    const top =
        Object.entries(
            totals
        )
        .sort(
            (
                a,
                b
            ) =>
                b[1] -
                a[1]
        )
        .slice(
            0,
            5
        );


    if (!top.length) {

        container.innerHTML = `
            <div class="empty-state">
                No sales data yet.
            </div>
        `;

        return;

    }


    container.innerHTML =
        top.map(
            (
                [name, quantity],
                index
            ) => {

                const rank =
                    String(
                        index + 1
                    ).padStart(
                        2,
                        "0"
                    );


                return `

                    <div
                        class="top-row"
                    >

                        <span
                            class="rank"
                        >
                            ${rank}
                        </span>


                        <span
                            class="top-name"
                        >
                            ${escapeHTML(
                                name
                            )}
                        </span>


                        <span
                            class="top-qty"
                        >
                            ${quantity}
                            sold
                        </span>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   PRODUCT COUNT
========================================================= */

function updateProductCount(
    count = products.length
) {

    const element =
        document.getElementById(
            "productCount"
        );


    if (!element) {
        return;
    }


    element.textContent =
        `${count} product${
            count === 1
                ? ""
                : "s"
        }`;

}


/* =========================================================
   STATUS OPTIONS
========================================================= */

function getStatusOptions(
    currentStatus
) {

    const statuses = [

        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"

    ];


    return statuses.map(
        status => {

            return `
                <option
                    value="${status}"
                    ${
                        status ===
                        currentStatus
                            ? "selected"
                            : ""
                    }
                >
                    ${status}
                </option>
            `;

        }
    ).join("");

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
            maximumFractionDigits: 2
        }
    ).format(
        Number(value || 0)
    );

}


/* =========================================================
   FORMAT COMPACT PRICE
========================================================= */

function formatCompact(
    value
) {

    value =
        Number(value || 0);


    if (
        value >= 100000
    ) {

        return (
            "₹" +
            (
                value /
                100000
            ).toFixed(1) +
            "L"
        );

    }


    if (
        value >= 1000
    ) {

        return (
            "₹" +
            (
                value /
                1000
            ).toFixed(1) +
            "K"
        );

    }


    return (
        "₹" +
        Math.round(
            value
        )
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    if (!value) {

        return "Unknown date";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown date";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
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
   LOADING
========================================================= */

function setLoading(
    id,
    isLoading
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return;
    }


    element.hidden =
        !isLoading;

}


/* =========================================================
   CLEAR MESSAGES
========================================================= */

function clearMessages() {

    const success =
        document.getElementById(
            "successMessage"
        );


    const error =
        document.getElementById(
            "errorMessage"
        );


    if (success) {
        success.textContent = "";
    }


    if (error) {
        error.textContent = "";
    }

}


/* =========================================================
   SUCCESS MESSAGE
========================================================= */

function showSuccess(
    message
) {

    const element =
        document.getElementById(
            "successMessage"
        );


    if (element) {

        element.textContent =
            message;

    }

}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function showError(
    message
) {

    const element =
        document.getElementById(
            "errorMessage"
        );


    if (element) {

        element.textContent =
            message;

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "adminToast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (!toast) {
        return;
    }


    if (toastMessage) {

        toastMessage.textContent =
            message;

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.__toast
    );


    window.__toast =
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
            ".side-link"
        );


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    links.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    link.classList.add(
                        "active"
                    );

                }
            );

        }
    );

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.editProduct =
    editProduct;

window.deleteProduct =
    deleteProduct;

window.updateOrderStatus =
    updateOrderStatus;
    window.editProduct = editProduct;

window.deleteProduct = deleteProduct;

window.updateOrderStatus = updateOrderStatus;