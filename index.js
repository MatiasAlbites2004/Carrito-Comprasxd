function date() {
	const date = document.getElementById("date");
	const year = new Date().getFullYear();
	if (date) date.innerHTML = year;
}

async function loadJson(filePath) {
	try {
		const response = await fetch(filePath);
		if (!response.ok) throw new Error("Network response was not ok");
		return await response.json();
	} catch (error) {
		throw new Error(`Error loading JSON: ${error.message}`);
	}
}

function toggleButton() {
	const gridWrap = document.querySelector(".grid-wrap");
	gridWrap.addEventListener("click", (e) => {
		const cartButton = e.target.closest(".cart-button");
		if (cartButton) {
			const cartPlusMinus = cartButton.nextElementSibling;
			if (cartPlusMinus && cartButton.classList.contains("active")) {
				cartButton.classList.remove("active");
				cartPlusMinus.classList.add("active");
				const gridItem = cartButton.closest(".grid-item");
				addToCart(gridItem);
			}
		}
	});
}

function addToCart(gridItem) {
	const itemPhoto = gridItem.querySelector(".image-container img").src;
	const itemName = gridItem.querySelector(".tertiary-header").innerText;
	const itemPrice = parseFloat(gridItem.querySelector(".item-price").innerText.replace("$", ""));
	let currentQuantity = 1;

	const cartItem = document.createElement("article");
	cartItem.classList.add("cart-item");
	cartItem.setAttribute("data-label", itemName);
	cartItem.innerHTML = `
		<div class="cart-quantity">
			<p class="cart-heading">${itemName}</p>
			<div class="quantity-wrap">
				<span class="quantity">${currentQuantity}x</span>
				<span class="each-item">@$${itemPrice.toFixed(2)}</span>
				<span class="item-total">$${itemPrice.toFixed(2)}</span>
			</div>
		</div>
		<button class="remove-item">
			<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
				<path d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z" />
			</svg>
		</button>
	`;

	const cartItemPopover = document.createElement("article");
	cartItemPopover.classList.add("cart-item-popover");
	cartItemPopover.setAttribute("data-label", itemName);
	cartItemPopover.innerHTML = `
		<figure class="image-container"><img src="${itemPhoto}" alt="${itemName}" /></figure>
		<div class="cart-quantity">
			<p class="cart-heading">${itemName}</p>
			<div class="quantity-wrap">
				<span class="quantity">${currentQuantity}x</span>
				<span class="each-item">@ $${itemPrice.toFixed(2)}</span>
			</div>
		</div>
		<div class="item-total">$${itemPrice.toFixed(2)}</div>
	`;

	const cartSidebar = document.querySelector(".cart-container");
	const cartPopover = document.querySelector(".cart-popover");

	cartSidebar.appendChild(cartItem);
	cartPopover.appendChild(cartItemPopover);

	const cartButton = gridItem.querySelector(".cart-button");
	const cartPlusMinus = gridItem.querySelector(".cart-plus-minus");
	const gridItemQuantity = gridItem.querySelector(".item-quantity");

	updateCartItemCount();

	const removeButton = cartItem.querySelector(".remove-item");
	const itemQuantitySpan = cartItem.querySelector(".quantity");
	const itemTotalSpan = cartItem.querySelector(".item-total");
	const itemQuantitySpanPopover = cartItemPopover.querySelector(".quantity");
	const itemTotalSpanPopover = cartItemPopover.querySelector(".item-total");

	removeButton.addEventListener("click", () => {
		cartSidebar.removeChild(cartItem);
		cartPopover.removeChild(cartItemPopover);
		updateCartItemCount();

		cartPlusMinus.classList.remove("active");
		cartButton.classList.add("active");
		gridItemQuantity.innerHTML = 1;
	});

	const incrementButton = gridItem.querySelector(".increment");
	const decrementButton = gridItem.querySelector(".decrement");

	incrementButton.addEventListener("click", () => {
		currentQuantity++;
		updateQuantityDisplays();
	});

	decrementButton.addEventListener("click", () => {
		if (currentQuantity > 1) {
			currentQuantity--;
			updateQuantityDisplays();
		}
	});

	function updateQuantityDisplays() {
		itemQuantitySpan.innerText = `${currentQuantity}x`;
		itemTotalSpan.innerText = `$${(itemPrice * currentQuantity).toFixed(2)}`;
		itemQuantitySpanPopover.innerText = `${currentQuantity}x`;
		itemTotalSpanPopover.innerText = `$${(itemPrice * currentQuantity).toFixed(2)}`;
		updateCartItemCount();
	}
}

function setupCartPlusMinus() {
	const gridWrap = document.querySelector(".grid-wrap");
	if (!gridWrap) return console.error("gridWrap not found");

	gridWrap.addEventListener("click", (e) => {
		const decrement = e.target.closest(".decrement");
		const increment = e.target.closest(".increment");

		if (decrement || increment) {
			const itemQuantitySpan = decrement
				? decrement.nextElementSibling
				: increment.previousElementSibling;

			if (itemQuantitySpan?.classList.contains("item-quantity")) {
				let quantity = parseInt(itemQuantitySpan.innerText);
				quantity += increment ? 1 : quantity > 1 ? -1 : 0;
				itemQuantitySpan.innerText = quantity;
			}
		}
	});
}

function updateCartItemCount() {
	const cartItems = document.querySelectorAll(".cart-item");
	const cartCountElement = document.querySelector(".cart-count");
	const totalAmountElement = document.querySelector(".total-amount");
	const totalAmountPopover = document.querySelector(".total-amount-popover");

	let totalQuantity = 0;
	let totalAmount = 0;

	cartItems.forEach((item) => {
		const quantity = parseInt(item.querySelector(".quantity").innerText);
		const total = parseFloat(item.querySelector(".item-total").innerText.replace("$", ""));
		totalQuantity += quantity;
		totalAmount += total;
	});

	if (cartCountElement) cartCountElement.innerText = `Tu orden (${totalQuantity})`;
	if (totalAmountElement) totalAmountElement.innerText = `$${totalAmount.toFixed(2)}`;
	if (totalAmountPopover) totalAmountPopover.innerText = `$${totalAmount.toFixed(2)}`;
}

function clearCart() {
	const clearCartButton = document.getElementById("clear-cart");
	clearCartButton.addEventListener("click", () => {
		document.querySelectorAll(".cart-item, .cart-item-popover").forEach(item => item.remove());

		document.querySelectorAll(".grid-item").forEach(gridItem => {
			gridItem.querySelector(".cart-button").classList.add("active");
			gridItem.querySelector(".cart-plus-minus").classList.remove("active");
			gridItem.querySelector(".item-quantity").innerHTML = 1;
		});

		updateCartItemCount();
	});
}

document.addEventListener("DOMContentLoaded", () => {
	date();

	loadJson("json/data.json")
		.then((data) => {
			const gridWrap = document.querySelector(".grid-wrap");

            
			data.forEach((item) => {
				const article = document.createElement("article");
				article.classList.add("grid-item");
				article.setAttribute("data-label", item.name);
				article.innerHTML = `
					<div class="button-container">
						<figure class="image-container"><img src="${item.image.desktop}" alt="${item.name}" /></figure>
						<button class="cart-button active">Agregar al carrito</button>
						<div class="cart-plus-minus">
							<span class="access-hidden">Cart Quantity</span>
							<button class="more-less decrement">-</button>
							<span class="item-quantity">1</span>
							<button class="more-less increment">+</button>
						</div>
					</div>
					<div class="item-category">${item.category}</div>
					<h3 class="tertiary-header">${item.name}</h3>
					<div class="item-price">$${item.price.toFixed(2)}</div>
				`;
				gridWrap.appendChild(article);
			});

			toggleButton();
			setupCartPlusMinus();
			updateCartItemCount();
			clearCart();
		})
		.catch((error) => console.error("Error loading JSON data:", error));
});
