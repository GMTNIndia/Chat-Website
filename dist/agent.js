document.addEventListener("DOMContentLoaded", function () {
    // Show appropriate sections based on user role
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

    // Function to fetch and display the list of agents
    async function fetchAgents() {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://127.0.0.1:8000/api/agents/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const agents = await response.json();
            if (response.ok) {
                const adminTable = document.getElementById("agentsTable");
                const tbody = adminTable.querySelector("tbody");
                tbody.innerHTML = ""; // Clear existing rows

                agents.forEach((agent) => {
                    const row = document.createElement("tr");
                    row.classList.add("odd:bg-white", "even:bg-gray-200");
                    row.innerHTML = `
                        <td class="p-2">${agent.first_name} ${agent.last_name}</td>
                        <td class="p-2">${agent.email}</td>
                        <td class="p-2">${agent.role}</td>
                        <td class="p-2 hover:underline"><a href="./edit.html">Edit</a></td>
                    `;
                    tbody.appendChild(row);
                });

                adminTable.classList.remove("hidden"); // Show the table
            } else {
                displayMessage(agents.error || "An error occurred while fetching agents.", "error");
            }
        } catch (error) {
            console.error("Error fetching agents:", error);
            displayMessage("An error occurred. Please try again.", "error");
        }
    }

    // Function to display messages on the page
    function displayMessage(message, type) {
        const messageContainer = document.getElementById("messageContainer");
        messageContainer.textContent = message;
        messageContainer.className = type === "error" ? "message error" : "message success";
        messageContainer.style.display = "block";
    }

    // Initial fetch of agents
    fetchAgents();

    // Form submission for adding an agent
    const form = document.getElementById("addAgentForm");
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const formData = new FormData(form);
            const data = {
                email: formData.get("email"),
                first_name: formData.get("first_name"),
                last_name: formData.get("last_name"),
                password: formData.get("password"),
                role: formData.get("role"),
            };

            const token = localStorage.getItem("token");

            try {
                const response = await fetch("http://127.0.0.1:8000/api/add/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
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
                console.error("Error adding agent:", error);
                displayMessage("An error occurred while adding the agent. Please try again.", "error");
            }
        });
    }
});
