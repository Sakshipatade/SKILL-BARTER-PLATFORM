document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorBox = document.getElementById('loginError');

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save user in sessionStorage
            sessionStorage.setItem('loggedInUser', JSON.stringify(data.user));
            window.location.href = 'profile.html';
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (err) {
        console.error('Login error:', err);
        showError('Something went wrong. Please try again.');
    }

    function showError(msg) {
        errorBox.style.display = 'block';
        errorBox.textContent = msg;
    }
});
