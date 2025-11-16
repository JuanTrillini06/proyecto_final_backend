const showCartMessage = (message, isError = false) => {
    const container = document.getElementById('cartMessage');
    if (!container) return;
    container.hidden = false;
    container.textContent = message;
    container.className = isError ? 'error' : 'success';
    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: message,
            duration: 3500,
            gravity: 'top',
            position: 'right',
            style: { background: isError ? '#d9534f' : '#28a745' }
        }).showToast();
    }
};

const removeProductFromCart = async (cartId, productId) => {
    try {
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.message || 'No se pudo eliminar el producto');
        }
        showCartMessage('Producto eliminado.');
        setTimeout(() => window.location.reload(), 500);
    } catch (error) {
        console.error(error);
        showCartMessage(error.message, true);
    }
};

const purchaseCart = async (cartId) => {
    try {
        const response = await fetch(`/api/carts/${cartId}/purchase`, {
            method: 'POST',
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.message || 'No se pudo completar la compra');
        }
        showCartMessage('Compra realizada con exito. Se envio el ticket por correo.');
        setTimeout(() => window.location.reload(), 800);
    } catch (error) {
        console.error(error);
        showCartMessage(error.message, true);
    }
};

const updateProductQuantity = async (cartId, productId, quantity) => {
    try {
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.message || 'No se pudo actualizar la cantidad');
        }
        showCartMessage('Cantidad actualizada.');
        setTimeout(() => window.location.reload(), 400);
    } catch (error) {
        console.error(error);
        showCartMessage(error.message, true);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const cartTable = document.querySelector('table');
    const purchaseBtn = document.getElementById('purchaseBtn');

    if (cartTable) {
        cartTable.addEventListener('click', (event) => {
            const target = event.target;
            const row = target.closest('tr[data-product-id]');
            const cartId = purchaseBtn?.dataset.cartId;
            if (!row || !cartId) return;

            const productId = row.getAttribute('data-product-id');

            if (target.classList.contains('remove-product')) {
                event.preventDefault();
                removeProductFromCart(cartId, productId);
                return;
            }

            if (target.classList.contains('qty-increase') || target.classList.contains('qty-decrease')) {
                event.preventDefault();
                const qtyEl = row.querySelector('.qty-value');
                const current = parseInt(qtyEl?.textContent || '1', 10) || 1;
                const next = target.classList.contains('qty-increase') ? current + 1 : Math.max(1, current - 1);
                if (next !== current) {
                    updateProductQuantity(cartId, productId, next);
                }
            }
        });
    }

    if (purchaseBtn) {
        purchaseBtn.addEventListener('click', (event) => {
            event.preventDefault();
            const cartId = purchaseBtn.dataset.cartId;
            if (cartId) {
                purchaseCart(cartId);
            }
        });
    }
});
