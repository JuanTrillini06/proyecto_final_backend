const handleLogout = async () => {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('No se pudo cerrar sesion');
        }
        window.location.href = '/login';
    } catch (error) {
        console.error(error);
        alert('Error cerrando sesion. Intentalo nuevamente.');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});
