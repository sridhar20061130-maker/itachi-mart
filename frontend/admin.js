/* ==========================================
   ITACHI MART - ADMIN JAVASCRIPT
========================================== */

const API_BASE_URL = "https://itachi-mart.onrender.com";

const API_URL = `${API_BASE_URL}/api/products`;
const ORDER_API_URL = `${API_BASE_URL}/api/orders`;

let products = [];
let orders = [];
let editingProductId = null;


/* ==========================================
   INITIALIZATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    const productForm = document.getElementById("productForm");

    if (productForm) {
        productForm.addEventListener(
            "submit",
            saveProduct
        );
    }

    const productSearch =
        document.getElementById("productSearch");

    if (productSearch) {
        productSearch.addEventListener(
            "input",
            renderProducts
        );
    }

    const productFilter =
        document.getElementById("productFilter");

    if (productFilter) {
        productFilter.addEventListener(
            "change",
            renderProducts
        );
    }

    const productSort =
        document.getElementById("productSort");

    if (productSort) {
        productSort.addEventListener(
            "change",
            renderProducts
        );
    }

    const orderSearch =
        document.getElementById("orderSearch");

    if (orderSearch) {
        orderSearch.addEventListener(
            "input",
            renderOrders
        );
    }

    const orderStatusFilter =
        document.getElementById("orderStatusFilter");

    if (orderStatusFilter) {
        orderStatusFilter.addEventListener(
            "change",
            renderOrders
        );
    }

    const productImage =
        document.getElementById("productImage");

    if (productImage) {
        productImage.addEventListener(
            "input",
            previewImage
        );
    }

    const cancelEdit =
        document.getElementById("cancelEdit");

    if (cancelEdit) {
        cancelEdit.addEventListener(
            "click",
            () => resetProductForm()
        );
    }

    const refreshAnalytics =
        document.getElementById("refreshAnalytics");

    if (refreshAnalytics) {
        refreshAnalytics.addEventListener(
            "click",
            refreshAll
        );
    }

    setupNavigation();

    refreshAll();
});


/* ==========================================
   REFRESH EVERYTHING
========================================== */

async function refreshAll() {

    await Promise.all([
        loadProducts(),
        loadOrders()
    ]);

    updateDashboard();

    renderAnalytics();
}


/* ==========================================
   LOAD PRODUCTS
========================================== */

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
                "Product API unavailable."
            );
        }

        const data =
            await response.json();

        products =
            Array.isArray(data)
                ? data
                : Array.isArray(data.products)
                    ? data.products
                    : [];

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


/* ==========================================
   LOAD ORDERS
========================================== */

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
                "Order API unavailable."
            );
        }

        const data =
            await response.json();

        orders =
            Array.isArray(data)
                ? data
                : Array.isArray(data.orders)
                    ? data.orders
                    : [];

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


/* ==========================================
   PRODUCT CATEGORY FILTER
========================================== */

function updateCategoryFilter() {

    const filter =
        document.getElementById(
            "productFilter"
        );

    if (!filter) return;

    const currentValue =
        filter.value;

    const categories =
        [
            ...new Set(
                products
                    .map(product => product.category)
                    .filter(Boolean)
            )
        ].sort();

    filter.innerHTML =
        `<option value="all">
            All Categories
        </option>`;

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        filter.appendChild(option);
    });

    if (
        categories.includes(currentValue)
    ) {
        filter.value = currentValue;
    }
}


/* ==========================================
   RENDER PRODUCTS
========================================== */

function renderProducts() {

    const body =
        document.getElementById(
            "productsTableBody"
        );

    if (!body) return;

    const search =
        (
            document.getElementById(
                "productSearch"
            )?.value || ""
        )
            .toLowerCase()
            .trim();

    const category =
        document.getElementById(
            "productFilter"
        )?.value || "all";

    const sort =
        document.getElementById(
            "productSort"
        )?.value || "newest";


    let list =
        products.filter(product => {

            const matchesSearch =
                String(product.name || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(product.description || "")
                    .toLowerCase()
                    .includes(search);

            const matchesCategory =
                category === "all"
                ||
                product.category === category;

            return (
                matchesSearch &&
                matchesCategory
            );
        });


    list.sort((a, b) => {

        if (sort === "name") {
            return String(a.name)
                .localeCompare(
                    String(b.name)
                );
        }

        if (sort === "priceLow") {
            return Number(a.price) -
                   Number(b.price);
        }

        if (sort === "priceHigh") {
            return Number(b.price) -
                   Number(a.price);
        }

        if (sort === "stockLow") {
            return Number(a.stock) -
                   Number(b.stock);
        }

        return (
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        );
    });


    body.innerHTML =
        list.map(product => {

            const stockClass =
                Number(product.stock) === 0
                    ? "stock-out"
                    : Number(product.stock) < 5
                        ? "stock-low"
                        : "";

            return `
                <tr>

                    <td>

                        <div class="product-cell">

                            <img
                                src="${escapeHTML(product.image)}"
                                alt="${escapeHTML(product.name)}"
                                onerror="this.style.visibility='hidden'"
                            >

                            <strong>
                                ${escapeHTML(product.name)}
                            </strong>

                        </div>

                    </td>

                    <td>
                        <span class="badge">
                            ${escapeHTML(product.category)}
                        </span>
                    </td>

                    <td>
                        ${formatPrice(product.price)}
                    </td>

                    <td class="${stockClass}">
                        ${Number(product.stock)}
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                class="action-btn edit"
                                onclick="editProduct('${product._id}')"
                            >
                                Edit
                            </button>

                            <button
                                class="action-btn delete"
                                onclick="deleteProduct('${product._id}')"
                            >
                                Delete
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");


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


/* ==========================================
   SAVE PRODUCT
========================================== */

async function saveProduct(event) {

    event.preventDefault();

    const product = {

        name:
            document.getElementById(
                "productName"
            ).value.trim(),

        category:
            document.getElementById(
                "productCategory"
            ).value,

        price:
            Number(
                document.getElementById(
                    "productPrice"
                ).value
            ),

        stock:
            Number(
                document.getElementById(
                    "productStock"
                ).value
            ),

        image:
            document.getElementById(
                "productImage"
            ).value.trim(),

        description:
            document.getElementById(
                "productDescription"
            ).value.trim()
    };


    clearMessages();


    if (
        !product.name ||
        !product.category ||
        !product.image ||
        !product.description ||
        product.price < 0 ||
        product.stock < 0 ||
        Number.isNaN(product.price) ||
        Number.isNaN(product.stock)
    ) {

        showError(
            "Please fill all fields correctly."
        );

        return;
    }


    const editing =
        Boolean(editingProductId);


    try {

        const response =
            await fetch(
                editing
                    ? `${API_URL}/${editingProductId}`
                    : API_URL,
                {
                    method:
                        editing
                            ? "PUT"
                            : "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(product)
                }
            );


        const data =
            await response
                .json()
                .catch(() => ({}));


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Request failed."
            );
        }


        showSuccess(
            editing
                ? "Product updated successfully."
                : "Product added successfully."
        );


        showToast(
            editing
                ? "Product updated."
                : "Product added."
        );


        resetProductForm(false);

        await loadProducts();

        updateDashboard();

        renderAnalytics();

    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Could not save product."
        );
    }
}


/* ==========================================
   EDIT PRODUCT
========================================== */

function editProduct(id) {

    const product =
        products.find(
            item => item._id === id
        );

    if (!product) return;


    editingProductId = id;


    document.getElementById(
        "productName"
    ).value =
        product.name || "";


    document.getElementById(
        "productCategory"
    ).value =
        product.category || "";


    document.getElementById(
        "productPrice"
    ).value =
        product.price ?? "";


    document.getElementById(
        "productStock"
    ).value =
        product.stock ?? "";


    document.getElementById(
        "productImage"
    ).value =
        product.image || "";


    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";


    const addButton =
        document.getElementById(
            "addProductButton"
        );

    if (addButton) {
        addButton.textContent =
            "✓ Update Product";
    }


    const cancelButton =
        document.getElementById(
            "cancelEdit"
        );

    if (cancelButton) {
        cancelButton.hidden = false;
    }


    previewImage();


    document
        .getElementById("add-product")
        ?.scrollIntoView({
            behavior: "smooth"
        });


    showToast(
        "Editing " +
        product.name
    );
}


/* ==========================================
   DELETE PRODUCT
========================================== */

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
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {
            throw new Error(
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

        console.error(error);

        showToast(
            error.message ||
            "Could not delete product."
        );
    }
}


/* ==========================================
   RESET PRODUCT FORM
========================================== */

function resetProductForm(
    clear = true
) {

    editingProductId = null;


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
        );

    if (addButton) {
        addButton.textContent =
            "＋ Add Product";
    }


    const cancelButton =
        document.getElementById(
            "cancelEdit"
        );

    if (cancelButton) {
        cancelButton.hidden = true;
    }


    const preview =
        document.getElementById(
            "imagePreview"
        );

    if (preview) {
        preview.innerHTML =
            "IMAGE PREVIEW";
    }


    if (clear) {
        clearMessages();
    }
}


/* ==========================================
   IMAGE PREVIEW
========================================== */

function previewImage() {

    const input =
        document.getElementById(
            "productImage"
        );

    const preview =
        document.getElementById(
            "imagePreview"
        );

    if (!input || !preview) return;


    const url =
        input.value.trim();


    preview.innerHTML =
        url
            ? `
                <img
                    src="${escapeHTML(url)}"
                    alt="Preview"
                    onerror="
                        this.parentElement.innerHTML =
                        'IMAGE COULD NOT LOAD'
                    "
                >
            `
            : "IMAGE PREVIEW";
}


/* ==========================================
   RENDER ORDERS
========================================== */

function renderOrders() {

    const grid =
        document.getElementById(
            "ordersGrid"
        );

    if (!grid) return;


    const search =
        (
            document.getElementById(
                "orderSearch"
            )?.value || ""
        )
            .toLowerCase()
            .trim();


    const status =
        document.getElementById(
            "orderStatusFilter"
        )?.value || "all";


    const list =
        orders.filter(order => {

            const customerName =
                String(
                    order.customerName || ""
                ).toLowerCase();

            const email =
                String(
                    order.email || ""
                ).toLowerCase();

            const phone =
                String(
                    order.phone || ""
                ).toLowerCase();

            const orderId =
                String(
                    order._id || ""
                ).toLowerCase();


            const matchesSearch =
                customerName.includes(search) ||
                email.includes(search) ||
                phone.includes(search) ||
                orderId.includes(search);


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
                Array.isArray(order.items)
                    ? order.items
                    : [];


            const currentStatus =
                order.status ||
                "Pending";


            return `
                <article class="order-card">

                    <div class="order-head">

                        <div>

                            <div class="order-id">
                                ORDER #
                                ${escapeHTML(
                                    String(
                                        order._id || ""
                                    )
                                        .slice(-8)
                                        .toUpperCase()
                                )}
                            </div>

                            <div class="order-customer">
                                ${escapeHTML(
                                    order.customerName ||
                                    "Customer"
                                )}
                            </div>

                            <div class="order-email">
                                ${escapeHTML(
                                    order.email || ""
                                )}
                            </div>

                            ${
                                order.phone
                                    ? `
                                        <div class="order-phone">
                                            ${escapeHTML(
                                                order.phone
                                            )}
                                        </div>
                                    `
                                    : ""
                            }

                        </div>


                        <span
                            class="
                                badge
                                status-${String(
                                    currentStatus
                                )
                                    .toLowerCase()
                                    .replace(
                                        /\s+/g,
                                        "-"
                                    )}
                            "
                        >
                            ${escapeHTML(
                                currentStatus
                            )}
                        </span>

                    </div>


                    <!-- CUSTOMER DETAILS -->

                    <div class="order-customer-details">

                        <div class="detail-row">

                            <span>
                                Customer
                            </span>

                            <strong>
                                ${escapeHTML(
                                    order.customerName ||
                                    "Not provided"
                                )}
                            </strong>

                        </div>


                        <div class="detail-row">

                            <span>
                                Email
                            </span>

                            <strong>
                                ${escapeHTML(
                                    order.email ||
                                    "Not provided"
                                )}
                            </strong>

                        </div>


                        <div class="detail-row">

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


                        <div class="detail-row address-row">

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

                    <div class="order-meta">

                        <span class="order-total">
                            ${formatPrice(
                                order.totalAmount
                            )}
                        </span>

                        <span class="order-date">
                            ${formatDate(
                                order.createdAt
                            )}
                        </span>

                    </div>


                    <!-- ORDER ITEMS -->

                    <div class="order-items-section">

                        <h4>
                            Ordered Products
                        </h4>

                        <div class="order-items">

                            ${
                                items.length
                                    ? items
                                        .map(
                                            item => `
                                                <div class="order-item">

                                                    <div>
                                                        <strong>
                                                            ${escapeHTML(
                                                                item.name ||
                                                                "Product"
                                                            )}
                                                        </strong>

                                                        <small>
                                                            Quantity:
                                                            ${Number(
                                                                item.quantity ||
                                                                0
                                                            )}
                                                        </small>
                                                    </div>

                                                    <span>
                                                        ${formatPrice(
                                                            Number(
                                                                item.price ||
                                                                0
                                                            ) *
                                                            Number(
                                                                item.quantity ||
                                                                0
                                                            )
                                                        )}
                                                    </span>

                                                </div>
                                            `
                                        )
                                        .join("")
                                    : `
                                        <div class="empty-state">
                                            No item details available.
                                        </div>
                                    `
                            }

                        </div>

                    </div>


                    <!-- STATUS -->

                    <div class="order-card-footer">

                        <div>

                            <small>
                                Update Status
                            </small>

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
                                    currentStatus
                                )}
                            </select>

                        </div>

                        <strong>
                            ${formatPrice(
                                order.totalAmount
                            )}
                        </strong>

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


/* ==========================================
   UPDATE ORDER STATUS
========================================== */

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
                .catch(() => ({}));


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Status update failed."
            );
        }


        const order =
            orders.find(
                item => item._id === id
            );


        if (order) {
            order.status = status;
        }


        showToast(
            "Order status updated."
        );


        renderOrders();

        updateDashboard();

        renderAnalytics();

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Could not update order."
        );

        await loadOrders();
    }
}


/* ==========================================
   DASHBOARD STATISTICS
========================================== */

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


    if (pendingOrders) {

        pendingOrders.textContent =
            orders.filter(
                order =>
                    String(
                        order.status ||
                        "Pending"
                    ).toLowerCase() ===
                    "pending"
            ).length;
    }


    if (totalRevenue) {

        const revenue =
            orders.reduce(
                (sum, order) => {

                    if (
                        String(
                            order.status || ""
                        ).toLowerCase() ===
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


        totalRevenue.textContent =
            formatPrice(revenue);
    }
}


/* ==========================================
   ANALYTICS
========================================== */

function renderAnalytics() {

    renderRevenueChart();

    renderStatusChart();

    renderTopProducts();
}


/* ==========================================
   LAST 7 DAYS
========================================== */

function getDays() {

    const days = [];

    const now =
        new Date();


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date(now);

        date.setHours(
            0,
            0,
            0,
            0
        );

        date.setDate(
            now.getDate() - i
        );

        days.push(date);
    }


    return days;
}


/* ==========================================
   REVENUE CHART
========================================== */

function renderRevenueChart() {

    const chart =
        document.getElementById(
            "revenueChart"
        );

    if (!chart) return;


    const days =
        getDays();


    const values =
        days.map(day => {

            return orders.reduce(
                (sum, order) => {

                    if (
                        !order.createdAt ||
                        String(
                            order.status || ""
                        ).toLowerCase() ===
                        "cancelled"
                    ) {
                        return sum;
                    }


                    const date =
                        new Date(
                            order.createdAt
                        );


                    return
                        date.toDateString() ===
                        day.toDateString()
                            ? sum +
                              Number(
                                  order.totalAmount ||
                                  0
                              )
                            : sum;

                },
                0
            );
        });


    const max =
        Math.max(
            ...values,
            1
        );


    const sevenDayRevenue =
        document.getElementById(
            "sevenDayRevenue"
        );


    if (sevenDayRevenue) {

        sevenDayRevenue.textContent =
            formatPrice(
                values.reduce(
                    (a, b) => a + b,
                    0
                )
            );
    }


    chart.innerHTML =
        values.map(
            (value, index) => {

                const height =
                    value > 0
                        ? Math.max(
                            value / max * 100,
                            8
                        )
                        : 2;


                return `
                    <div class="bar-item">

                        <em>
                            ${formatCompact(
                                value
                            )}
                        </em>

                        <div
                            class="bar"
                            style="
                                height:${height}%
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


/* ==========================================
   ORDER STATUS CHART
========================================== */

function renderStatusChart() {

    const chart =
        document.getElementById(
            "statusChart"
        );

    if (!chart) return;


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
                        ).toLowerCase() ===
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
            (status, index) => {

                return `
                    <div class="status-row">

                        <span>
                            ${status}
                        </span>

                        <div class="status-track">

                            <div
                                class="status-fill"
                                style="
                                    width:${
                                        counts[index] /
                                        max *
                                        100
                                    }%
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


/* ==========================================
   TOP PRODUCTS
========================================== */

function renderTopProducts() {

    const container =
        document.getElementById(
            "topProducts"
        );

    if (!container) return;


    const totals = {};


    orders.forEach(order => {

        if (
            String(
                order.status || ""
            ).toLowerCase() ===
            "cancelled"
        ) {
            return;
        }


        (
            order.items || []
        ).forEach(item => {

            const name =
                item.name ||
                "Unknown Product";


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
        Object.entries(totals)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(0, 5);


    container.innerHTML =
        top.length

            ? top.map(
                ([name, quantity], index) => {

                    return `
                        <div class="top-row">

                            <span class="rank">
                                ${String(
                                    index + 1
                                ).padStart(
                                    2,
                                    "0"
                                )}
                            </span>

                            <span class="top-name">
                                ${escapeHTML(
                                    name
                                )}
                            </span>

                            <span class="top-qty">
                                ${quantity}
                                sold
                            </span>

                        </div>
                    `;
                }
            ).join("")

            : `
                <div class="empty-state">
                    No sales data yet.
                </div>
            `;
}


/* ==========================================
   PRODUCT COUNT
========================================== */

function updateProductCount(
    count = products.length
) {

    const element =
        document.getElementById(
            "productCount"
        );

    if (!element) return;


    element.textContent =
        `${count} product${
            count === 1
                ? ""
                : "s"
        }`;
}


/* ==========================================
   ORDER STATUS OPTIONS
========================================== */

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
        status =>
            `
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
            `
    ).join("");
}


/* ==========================================
   FORMATTING
========================================== */

function formatPrice(value) {

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


function formatCompact(value) {

    if (value >= 100000) {

        return (
            "₹" +
            (
                value / 100000
            ).toFixed(1) +
            "L"
        );
    }


    if (value >= 1000) {

        return (
            "₹" +
            (
                value / 1000
            ).toFixed(1) +
            "K"
        );
    }


    return (
        "₹" +
        Math.round(value)
    );
}


function formatDate(value) {

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


/* ==========================================
   SECURITY
========================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        character =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            })[
                character
            ]
    );
}


/* ==========================================
   LOADING
========================================== */

function setLoading(
    id,
    loading
) {

    const element =
        document.getElementById(id);

    if (!element) return;


    element.hidden =
        !loading;
}


/* ==========================================
   MESSAGES
========================================== */

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


function showSuccess(message) {

    const element =
        document.getElementById(
            "successMessage"
        );

    if (element) {
        element.textContent =
            message;
    }
}


function showError(message) {

    const element =
        document.getElementById(
            "errorMessage"
        );

    if (element) {
        element.textContent =
            message;
    }
}


/* ==========================================
   TOAST
========================================== */

function showToast(message) {

    const toast =
        document.getElementById(
            "adminToast"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (!toast || !toastMessage) {
        return;
    }


    toastMessage.textContent =
        message;


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


/* ==========================================
   NAVIGATION
========================================== */

function setupNavigation() {

    const links =
        document.querySelectorAll(
            ".side-link"
        );


    links.forEach(link => {

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
    });
}


/* ==========================================
   GLOBAL FUNCTIONS
========================================== */

window.editProduct =
    editProduct;

window.deleteProduct =
    deleteProduct;

window.updateOrderStatus =
    updateOrderStatus;