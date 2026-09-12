const API_URL =
    "https://itachi-mart.onrender.com/api/products";

let product = null;
let selectedQuantity = 1;

const productImage =
    document.getElementById("productImage");

const productCategory =
    document.getElementById("productCategory");

const productName =
    document.getElementById("productName");

const productDescription =
    document.getElementById("productDescription");

const productPrice =
    document.getElementById("productPrice");

const productStock =
    document.getElementById("productStock");

const productQuantity =
    document.getElementById("productQuantity");

const decreaseQuantity =
    document.getElementById("decreaseQuantity");

const increaseQuantity =
    document.getElementById("increaseQuantity");

const addToCartButton =
    document.getElementById("addToCartButton");

const loadingMessage =
    document.getElementById("loadingMessage");


// Get product ID from the URL
const urlParams =
    new URLSearchParams(window.location.search);

const productId =
    urlParams.get("id");


// Format price in Indian Rupees
function formatPrice(price) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);

}


// Show error message
function showError(message) {

    loadingMessage.textContent = message;
    loadingMessage.className = "error-message";

}


// Display product details
function displayProduct(productData) {

    product = productData;

    productImage.src = product.image;

    productImage.alt = product.name;

    productCategory.textContent =
        product.category;

    productName.textContent =
        product.name;

    productDescription.textContent =
        product.description;

    productPrice.textContent =
        formatPrice(product.price);

    if (product.stock > 0) {

        productStock.innerHTML = `
            <span class="stock-available">
                In Stock: ${product.stock} available
            </span>
        `;

        addToCartButton.disabled = false;

        decreaseQuantity.disabled = false;

        increaseQuantity.disabled = false;

    } else {

        productStock.innerHTML = `
            <span class="stock-unavailable">
                Out of Stock
            </span>
        `;

        addToCartButton.disabled = true;

        decreaseQuantity.disabled = true;

        increaseQuantity.disabled = true;

    }

    selectedQuantity = 1;

    productQuantity.textContent =
        selectedQuantity;

    loadingMessage.style.display = "none";

}


// Load all products and find selected product
async function loadProduct() {

    if (!productId) {

        showError(
            "Product ID is missing from the URL."
        );

        return;
    }

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                "Failed to fetch products."
            );

        }

        const data =
            await response.json();

        if (!data.success || !Array.isArray(data.products)) {

            throw new Error(
                "Invalid product response."
            );

        }

        const foundProduct =
            data.products.find(
                item => item._id === productId
            );

        if (!foundProduct) {

            showError(
                "Product not found."
            );

            return;
        }

        displayProduct(foundProduct);

    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        showError(
            "Unable to load product details. Please try again."
        );

    }

}


// Decrease selected quantity
decreaseQuantity.onclick = function () {

    if (selectedQuantity > 1) {

        selectedQuantity--;

        productQuantity.textContent =
            selectedQuantity;

    }

};


// Increase selected quantity
increaseQuantity.onclick = function () {

    if (!product) {
        return;
    }

    if (selectedQuantity < product.stock) {

        selectedQuantity++;

        productQuantity.textContent =
            selectedQuantity;

    } else {

        alert(
            "You cannot add more than available stock."
        );

    }

};


// Add selected product quantity to cart
addToCartButton.onclick = function () {

    if (!product) {

        alert(
            "Product details are not available."
        );

        return;
    }

    if (product.stock <= 0) {

        alert(
            "This product is out of stock."
        );

        return;
    }

    let cart =
        JSON.parse(
            localStorage.getItem("itachiMartCart")
        ) || [];

    const existingItem =
        cart.find(
            item => item.productId === product._id
        );

    if (existingItem) {

        if (
            existingItem.quantity + selectedQuantity >
            product.stock
        ) {

            alert(
                "Maximum available stock reached."
            );

            return;
        }

        existingItem.quantity +=
            selectedQuantity;

    } else {

        cart.push({

            productId: product._id,

            name: product.name,

            price: product.price,

            image: product.image,

            quantity: selectedQuantity

        });

    }

    localStorage.setItem(
        "itachiMartCart",
        JSON.stringify(cart)
    );

    alert(
        `${product.name} added to cart!`
    );

    window.location.href =
        "index.html";

};


// Start loading
loadProduct();