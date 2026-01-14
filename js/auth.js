document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const toast = document.getElementById('toast');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password) {
            // Mock Login Success
            showToast(`Welcome, ${username}! Redirecting...`);
            
            // Artificial delay for UX
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        }
    });

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
