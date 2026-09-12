"use strict";


/* =========================================================
   API
========================================================= */

const API_BASE_URL =
    "https://itachi-mart.onrender.com";

const PRODUCT_API =
    `${API_BASE_URL}/api/products`;

const ORDER_API =
    `${API_BASE_URL}/api/orders`;


let products = [];
let orders = [];

let editingProductId = null;


/* =========================================================
   HELPERS
========================================================= */

function byId(id) {
    return document.getElementById(id);
}


function money(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(Number(value) || 0);

}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function showToast(message) {

    const toast = byId("adminToast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    try {

        const response =
            await fetch(PRODUCT_API);

        if (!response.ok) {

            throw new Error(
                `Products API error: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            products = data;

        } else if (Array.isArray(data.products)) {

            products = data.products;

        } else {

            products = [];

        }


        renderProducts();

        updateDashboard();


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        products = [];

        renderProducts();

        showToast(
            "Failed to load products"
        );

    }

}


/* =========================================================
   LOAD ORDERS
========================================================= */

async function loadOrders() {

    const loading =
        byId("ordersLoading");

    const empty =
        byId("ordersEmpty");


    if (loading) {

        loading.hidden = false;

    }


    if (empty) {

        empty.hidden = true;

    }


    try {

        console.log(
            "Loading orders from:",
            ORDER_API
        );


        const response =
            await fetch(ORDER_API);


        console.log(
            "Orders response:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Orders API error: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Orders data:",
            data
        );


        if (Array.isArray(data)) {

            orders = data;

        }

        else if (
            data &&
            Array.isArray(data.orders)
        ) {

            orders = data.orders;

        }

        else {

            orders = [];

        }


        console.log(
            "Orders loaded:",
            orders.length
        );


        renderOrders();

        updateDashboard();

        updateAnalytics();


    } catch (error) {

        console.error(
            "Order loading error:",
            error
        );

        orders = [];

        renderOrders();

        showToast(
            "Failed to load orders"
        );

    }

    finally {

        if (loading) {

            loading.hidden = true;

        }

    }

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const tbody =
        byId("productsTableBody");

    if (!tbody) return;


    const search =
        (
            byId("productSearch")?.value || ""
        )
        .trim()
        .toLowerCase();


    const category =
        byId("productCategoryFilter")?.value ||
        "all";


    const sort =
        byId("productSort")?.value ||
        "newest";


    let filtered =
        [...products];


    if (search) {

        filtered =
            filtered.filter(product =>

                String(product.name || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(product.category || "")
                    .toLowerCase()
                    .includes(search)

            );

    }


    if (category !== "all") {

        filtered =
            filtered.filter(product =>

                product.category === category

            );

    }


    if (sort === "price-low") {

        filtered.sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );

    }


    if (sort === "price-high") {

        filtered.sort(
            (a, b) =>
                Number(b.price) -
                Number(a.price)
        );

    }


    if (sort === "stock-low") {

        filtered.sort(
            (a, b) =>
                Number(a.stock) -
                Number(b.stock)
        );

    }


    if (sort === "newest") {

        filtered.sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        );

    }


    tbody.innerHTML = "";


    filtered.forEach(product => {

        const stock =
            Number(product.stock) || 0;


        let stockClass =
            "stock-good";


        if (stock === 0) {

            stockClass =
                "stock-out";

        }

        else if (stock <= 5) {

            stockClass =
                "stock-low";

        }


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <img
                    class="product-table-image"
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}"
                    onerror="this.style.display='none'"
                >

            </td>


            <td>

                <strong>
                    ${escapeHTML(product.name)}
                </strong>

            </td>


            <td>
                ${escapeHTML(product.category)}
            </td>


            <td>
                ${money(product.price)}
            </td>


            <td>

                <span class="${stockClass}">
                    ${stock}
                </span>

            </td>


            <td>

                <div class="action-buttons">

                    <button
                        class="edit-btn"
                        onclick="editProduct('${product._id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteProduct('${product._id}')"
                    >
                        Delete
                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(row);

    });


    const count =
        byId("productCount");


    if (count) {

        count.textContent =
            `${filtered.length} products`;

    }


    updateCategoryFilter();

}


/* =========================================================
   CATEGORY FILTER
========================================================= */

function updateCategoryFilter() {

    const select =
        byId("productCategoryFilter");

    if (!select) return;


    const current =
        select.value;


    const categories =
        [
            ...new Set(
                products
                    .map(product => product.category)
                    .filter(Boolean)
            )
        ]
        .sort();


    select.innerHTML = `

        <option value="all">
            All Categories
        </option>

    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        select.appendChild(option);

    });


    if (
        categories.includes(current)
    ) {

        select.value = current;

    }

}


/* =========================================================
   PRODUCT FORM
========================================================= */

async function saveProduct(event) {

    event.preventDefault();


    const product = {

        name:
            byId("productName").value.trim(),

        category:
            byId("productCategory").value.trim(),

        price:
            Number(
                byId("productPrice").value
            ),

        stock:
            Number(
                byId("productStock").value
            ),

        image:
            byId("productImage").value.trim(),

        description:
            byId("productDescription").value.trim()

    };


    try {

        let response;


        if (editingProductId) {

            response =
                await fetch(
                    `${PRODUCT_API}/${editingProductId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(product)
                    }
                );

        }

        else {

            response =
                await fetch(
                    PRODUCT_API,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(product)
                    }
                );

        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save product"
            );

        }


        showToast(
            editingProductId
                ? "Product updated"
                : "Product added"
        );


        resetProductForm();

        await loadProducts();


    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Failed to save product"
        );

    }

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {

    const product =
        products.find(
            item => item._id === id
        );


    if (!product) return;


    editingProductId =
        id;


    byId("productName").value =
        product.name || "";


    byId("productCategory").value =
        product.category || "";


    byId("productPrice").value =
        product.price ?? "";


    byId("productStock").value =
        product.stock ?? "";


    byId("productImage").value =
        product.image || "";


    byId("productDescription").value =
        product.description || "";


    byId("productFormTitle").textContent =
        "Edit Product";


    byId("saveProductButton").textContent =
        "Update Product";


    byId("cancelEditButton").hidden =
        false;


    document
        .getElementById("products")
        ?.scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(id) {

    const product =
        products.find(
            item => item._id === id
        );


    if (!product) return;


    const confirmed =
        confirm(
            `Delete "${product.name}"?`
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `${PRODUCT_API}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete product"
            );

        }


        showToast(
            "Product deleted"
        );


        await loadProducts();


    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Failed to delete product"
        );

    }

}


/* =========================================================
   RESET PRODUCT FORM
========================================================= */

function resetProductForm() {

    editingProductId =
        null;


    const form =
        byId("productForm");


    if (form) {

        form.reset();

    }


    byId("productFormTitle")
        .textContent =
        "Add Product";


    byId("saveProductButton")
        .textContent =
        "Add Product";


    byId("cancelEditButton")
        .hidden =
        true;

}


/* =========================================================
   RENDER ORDERS
========================================================= */

function renderOrders() {

    const grid =
        byId("ordersGrid");

    const empty =
        byId("ordersEmpty");


    if (!grid) {

        console.error(
            "ordersGrid element not found"
        );

        return;

    }


    const search =
        (
            byId("orderSearch")?.value || ""
        )
        .trim()
        .toLowerCase();


    const statusFilter =
        byId("orderStatusFilter")?.value ||
        "all";


    let filtered =
        [...orders];


    if (search) {

        filtered =
            filtered.filter(order => {

                const customer =
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


                return (
                    customer.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search) ||
                    id.includes(search)
                );

            });

    }


    if (statusFilter !== "all") {

        filtered =
            filtered.filter(order =>

                String(
                    order.status || "Pending"
                )
                .toLowerCase()
                ===
                statusFilter.toLowerCase()

            );

    }


    grid.innerHTML = "";


    if (filtered.length === 0) {

        if (empty) {

            empty.hidden = false;

        }

        return;

    }


    if (empty) {

        empty.hidden = true;

    }


    filtered.forEach(order => {

        const card =
            document.createElement("article");


        card.className =
            "order-card";


        const status =
            order.status ||
            "Pending";


        const statusClass =
            status
                .toLowerCase()
                .replace(/\s+/g, "-");


        const date =
            order.createdAt
                ? new Date(
                    order.createdAt
                ).toLocaleString("en-IN")
                : "Unknown";


        const items =
            Array.isArray(order.items)
                ? order.items
                : [];


        const itemHTML =
            items.length

                ? items.map(item => `

                    <div class="order-item">

                        <span>
                            ${escapeHTML(
                                item.name ||
                                "Product"
                            )}

                            ×
                            ${Number(
                                item.quantity || 0
                            )}
                        </span>

                        <strong>
                            ${money(
                                Number(item.price || 0) *
                                Number(item.quantity || 0)
                            )}
                        </strong>

                    </div>

                `).join("")

                : `

                    <div class="order-item">
                        No items
                    </div>

                `;


        card.innerHTML = `

            <div class="order-card-header">

                <div>

                    <h3>
                        Order #${escapeHTML(
                            String(order._id || "")
                                .slice(-8)
                        )}
                    </h3>

                    <small>
                        ${escapeHTML(date)}
                    </small>

                </div>


                <span class="status-badge status-${statusClass}">
                    ${escapeHTML(status)}
                </span>

            </div>


            <div class="order-customer-details">

                <div class="detail-row">

                    <span>
                        Customer
                    </span>

                    <strong>
                        ${escapeHTML(
                            order.customerName ||
                            "N/A"
                        )}
                    </strong>

                </div>


                <div class="detail-row">

                    <span>
                        Email
                    </span>

                    <span>
                        ${escapeHTML(
                            order.email ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div class="detail-row">

                    <span>
                        Phone
                    </span>

                    <span>
                        ${escapeHTML(
                            order.phone ||
                            "Not available"
                        )}
                    </span>

                </div>


                <div class="detail-row address-row">

                    <span>
                        Address
                    </span>

                    <span>
                        ${escapeHTML(
                            order.address ||
                            "Not available"
                        )}
                    </span>

                </div>

            </div>


            <div class="order-items-section">

                <div class="order-items-title">
                    ORDER ITEMS
                </div>

                <div class="order-items">

                    ${itemHTML}

                </div>

            </div>


            <div class="order-card-footer">

                <strong class="order-total">
                    ${money(order.totalAmount)}
                </strong>


                <select
                    class="status-select"
                    onchange="updateOrderStatus('${order._id}', this.value)"
                >

                    <option
                        value="Pending"
                        ${status === "Pending" ? "selected" : ""}
                    >
                        Pending
                    </option>

                    <option
                        value="Processing"
                        ${status === "Processing" ? "selected" : ""}
                    >
                        Processing
                    </option>

                    <option
                        value="Shipped"
                        ${status === "Shipped" ? "selected" : ""}
                    >
                        Shipped
                    </option>

                    <option
                        value="Delivered"
                        ${status === "Delivered" ? "selected" : ""}
                    >
                        Delivered
                    </option>

                    <option
                        value="Cancelled"
                        ${status === "Cancelled" ? "selected" : ""}
                    >
                        Cancelled
                    </option>

                </select>

            </div>

        `;


        grid.appendChild(card);

    });

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
                `${ORDER_API}/${id}/status`,
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
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update order"
            );

        }


        showToast(
            "Order status updated"
        );


        await loadOrders();


    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Failed to update order"
        );

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const totalProducts =
        byId("totalProducts");


    const totalOrders =
        byId("totalOrders");


    const totalRevenue =
        byId("totalRevenue");


    const lowStock =
        byId("lowStock");


    if (totalProducts) {

        totalProducts.textContent =
            products.length;

    }


    if (totalOrders) {

        totalOrders.textContent =
            orders.length;

    }


    const revenue =
        orders
            .filter(
                order =>
                    String(order.status)
                        .toLowerCase()
                    !==
                    "cancelled"
            )
            .reduce(
                (sum, order) =>
                    sum +
                    Number(
                        order.totalAmount || 0
                    ),
                0
            );


    if (totalRevenue) {

        totalRevenue.textContent =
            money(revenue);

    }


    const low =
        products.filter(
            product =>
                Number(product.stock || 0) <= 5
        ).length;


    if (lowStock) {

        lowStock.textContent =
            low;

    }

}


/* =========================================================
   ANALYTICS
========================================================= */

function updateAnalytics() {

    const activeOrders =
        orders.filter(
            order =>
                String(order.status)
                    .toLowerCase()
                !==
                "cancelled"
        );


    const revenue =
        activeOrders.reduce(
            (sum, order) =>
                sum +
                Number(
                    order.totalAmount || 0
                ),
            0
        );


    const pending =
        orders.filter(
            order =>
                String(order.status)
                    .toLowerCase()
                ===
                "pending"
        ).length;


    const completed =
        orders.filter(
            order =>
                String(order.status)
                    .toLowerCase()
                ===
                "delivered"
        ).length;


    const cancelled =
        orders.filter(
            order =>
                String(order.status)
                    .toLowerCase()
                ===
                "cancelled"
        ).length;


    if (byId("analyticsRevenue")) {

        byId("analyticsRevenue")
            .textContent =
            money(revenue);

    }


    if (byId("analyticsPending")) {

        byId("analyticsPending")
            .textContent =
            pending;

    }


    if (byId("analyticsCompleted")) {

        byId("analyticsCompleted")
            .textContent =
            completed;

    }


    if (byId("analyticsCancelled")) {

        byId("analyticsCancelled")
            .textContent =
            cancelled;

    }


    renderStatusSummary();

}


/* =========================================================
   STATUS SUMMARY
========================================================= */

function renderStatusSummary() {

    const container =
        byId("statusSummary");

    if (!container) return;


    const statuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];


    container.innerHTML = "";


    statuses.forEach(status => {

        const count =
            orders.filter(
                order =>
                    String(order.status || "Pending")
                        .toLowerCase()
                    ===
                    status.toLowerCase()
            ).length;


        const box =
            document.createElement("div");


        box.className =
            "summary-box";


        box.innerHTML = `

            <span>
                ${status}
            </span>

            <strong>
                ${count}
            </strong>

        `;


        container.appendChild(box);

    });

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "ADMIN JS STARTED"
        );


        const productForm =
            byId("productForm");


        if (productForm) {

            productForm.addEventListener(
                "submit",
                saveProduct
            );

        }


        byId("cancelEditButton")
            ?.addEventListener(
                "click",
                resetProductForm
            );


        byId("productSearch")
            ?.addEventListener(
                "input",
                renderProducts
            );


        byId("productCategoryFilter")
            ?.addEventListener(
                "change",
                renderProducts
            );


        byId("productSort")
            ?.addEventListener(
                "change",
                renderProducts
            );


        byId("refreshProducts")
            ?.addEventListener(
                "click",
                loadProducts
            );


        byId("orderSearch")
            ?.addEventListener(
                "input",
                renderOrders
            );


        byId("orderStatusFilter")
            ?.addEventListener(
                "change",
                renderOrders
            );


        await loadProducts();

        await loadOrders();

        updateDashboard();

        updateAnalytics();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.editProduct =
    editProduct;


window.deleteProduct =
    deleteProduct;


window.updateOrderStatus =
    updateOrderStatus;