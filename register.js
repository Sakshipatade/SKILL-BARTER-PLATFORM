document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const profileImage = document.getElementById("profileImage").files[0];

        // Simple validation
        if (!username || !email || !password || !profileImage) {
            showToast("Please fill in all fields and upload a photo!", true);
            return;
        }

        const formData = new FormData();
        formData.append("username", username);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("profileImage", profileImage);

        try {
            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                showToast("🎉 Registered successfully!");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            } else {
                showToast(result.error || "❌ Registration failed", true);
            }
        } catch (err) {
            console.error(err);
            showToast("❌ Something went wrong", true);
        }
    });

    // Toast notification handler
    function showToast(message, isError = false) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.style.backgroundColor = isError ? "#ef4444" : "#10b981";
        toast.style.display = "block";

        setTimeout(() => {
            toast.style.display = "none";
        }, 3000);
    }
});
