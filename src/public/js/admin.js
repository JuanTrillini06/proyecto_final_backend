const adminMessage = document.getElementById('adminMessage');
const productForm = document.getElementById('productForm');
const resetFormBtn = document.getElementById('resetFormBtn');
const productList = document.getElementById('adminProductList');

const showAdminMessage = (message, isError = false) => {
    if (!adminMessage) return;
    adminMessage.hidden = false;
    adminMessage.textContent = message;
    adminMessage.className = isError ? 'error' : 'success';
};

const resetForm = () => {
    if (!productForm) return;
    productForm.reset();
    productForm.querySelector('[name="_id"]').value = '';
    showAdminMessage('Formulario listo para crear un nuevo producto.');
};

const fillFormWithProduct = (dataset) => {
    if (!productForm) return;
    productForm.querySelector('[name="_id"]').value = dataset.productId || '';
    productForm.querySelector('[name="title"]').value = dataset.title || '';
    productForm.querySelector('[name="description"]').value = dataset.description || '';
    productForm.querySelector('[name="price"]').value = dataset.price || '';
    productForm.querySelector('[name="stock"]').value = dataset.stock || '';
    productForm.querySelector('[name="category"]').value = dataset.category || '';
    productForm.querySelector('[name="code"]').value = dataset.code || '';
    productForm.querySelector('[name="status"]').value = dataset.status === 'false' ? 'false' : 'true';
    showAdminMessage('Editando producto seleccionado.');
};

const buildProductPayload = () => {
    const formData = new FormData(productForm);
    const raw = Object.fromEntries(formData.entries());
    return {
        title: raw.title,
        description: raw.description,
        price: Number(raw.price),
        stock: Number(raw.stock),
        category: raw.category,
        code: raw.code,
        status: raw.status === 'true'
    };
};

const submitProduct = async (event) => {
    event.preventDefault();
    if (!productForm) return;

    const currentId = productForm.querySelector('[name="_id"]').value;
    const payload = buildProductPayload();

    const endpoint = currentId ? `/api/products/${currentId}` : '/api/products';
    const method = currentId ? 'PUT' : 'POST';

    try {
        const response = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.message || 'Operacion no disponible');
        }
        showAdminMessage('Producto guardado correctamente.');
        setTimeout(() => window.location.reload(), 600);
    } catch (error) {
        console.error(error);
        showAdminMessage(error.message, true);
    }
};

const deleteProduct = async (productId) => {
    if (!productId) return;
    const confirmed = window.confirm('Estas seguro de eliminar este producto?');
    if (!confirmed) return;

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.message || 'No se pudo eliminar el producto');
        }
        showAdminMessage('Producto eliminado.');
        setTimeout(() => window.location.reload(), 600);
    } catch (error) {
        console.error(error);
        showAdminMessage(error.message, true);
    }
};

if (productForm) {
    productForm.addEventListener('submit', submitProduct);
}

if (resetFormBtn) {
    resetFormBtn.addEventListener('click', resetForm);
}

if (productList) {
    productList.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        if (target.classList.contains('edit-product')) {
            event.preventDefault();
            fillFormWithProduct(target.dataset);
        }

        if (target.classList.contains('delete-product')) {
            event.preventDefault();
            deleteProduct(target.dataset.productId);
        }
    });
}
