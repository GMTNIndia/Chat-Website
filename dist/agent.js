document.addEventListener("DOMContentLoaded", function () {
    const userRole = localStorage.getItem("role");
    if (userRole) {
        if (userRole === "undefined") {
            document.getElementById("adminSection")?.classList.remove("hidden");
            document.getElementById("roomSection")?.classList.remove("hidden");
        } else if (userRole === "agent") {
            document.getElementById("roomSection")?.classList.remove("hidden");
        }
    } else {
        document.getElementById("roomSection")?.classList.remove("hidden");
    }

    function displayMessage(message, type) {
        const messageContainer = document.getElementById("messageContainer");
        if (messageContainer) {
            messageContainer.textContent = message;
            messageContainer.className = type === "error" ? "message error" : "message success";
            messageContainer.style.display = "block";
        }
    }

    const form = document.getElementById('addAgentForm');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const formData = new FormData(form);
            const data = {
                email: formData.get('email'),
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                password: formData.get('password'),
                role: formData.get('role'),
            };

            const token = localStorage.getItem('token');

            try {
                const response = await fetch('http://127.0.0.1:8000/api/add/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });
                const successMessage = document.createElement("p");
                successMessage.textContent = "Agent added successfully!";
                successMessage.style.color = "green";
                form.appendChild(successMessage);
          
                // Redirect to admin page after a short delay
                setTimeout(() => {
                  window.location.href = "admin.html";
                }, 2000);
            } catch (error) {
                console.error('Error:', error);
                displayMessage('An error occurred. Please try again.', 'error');
            }
        });

        document.getElementById('cancelAddAgentBtn').addEventListener('click', function() {
            form.reset();
        });
    }
});
