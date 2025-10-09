const showStatusMessage = (elementId, message, isError = false) => {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.textContent = message;
    container.hidden = false;
    container.className = isError ? 'error' : 'success';
};

const handleAuthSubmit = (formId, endpoint, messageId) => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || 'Operacion no disponible');
            }

            showStatusMessage(messageId, data?.message || 'Operacion exitosa');
            setTimeout(() => {
                window.location.href = '/';
            }, 800);
        } catch (error) {
            console.error(error);
            showStatusMessage(messageId, error.message, true);
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    handleAuthSubmit('loginForm', '/api/auth/login', 'loginMessage');
    handleAuthSubmit('registerForm', '/api/auth/register', 'registerMessage');
});
