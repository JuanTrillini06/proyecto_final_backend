const productMessage = () => document.getElementById('productMessage');

const showProductFeedback = (message, isError = false) => {
    const container = productMessage();
    if (!container) return;
    container.hidden = false;
    container.textContent = message;
    container.className = isError ? 'error' : 'success';
};

const handleAddToCart = async (productId, quantity = 1) => {
    try {
        const response = await fetch(`/api/carts/products/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: Math.max(1, parseInt(quantity, 10) || 1) }),
            credentials: 'include'
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.message || 'No se pudo agregar el producto');
        }

        showProductFeedback('Producto agregado al carrito.');
    } catch (error) {
        console.error(error);
        showProductFeedback(error.message, true);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Add to cart with quantity from input
    document.querySelectorAll('.add-to-cart').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const productId = btn.dataset.productId;
            const card = btn.closest('.product-card');
            const qtyInput = card?.querySelector('.p-qty-input');
            const qty = qtyInput ? qtyInput.value : 1;
            if (productId) {
                handleAddToCart(productId, qty);
            }
        });
    });

    // Quantity controls on product cards
    document.querySelectorAll('.product-card').forEach((card) => {
        const dec = card.querySelector('.p-qty-decrease');
        const inc = card.querySelector('.p-qty-increase');
        const input = card.querySelector('.p-qty-input');
        if (!input) return;

        const normalize = () => {
            const val = parseInt(input.value, 10) || 1;
            input.value = Math.max(1, val);
        };

        dec?.addEventListener('click', (e) => {
            e.preventDefault();
            normalize();
            input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
        });
        inc?.addEventListener('click', (e) => {
            e.preventDefault();
            normalize();
            input.value = (parseInt(input.value, 10) || 1) + 1;
        });
        input?.addEventListener('change', normalize);
    });
});
