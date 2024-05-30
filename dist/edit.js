document.addEventListener("DOMContentLoaded", function () {
  // Show appropriate sections based on user role
  const userRole = localStorage.getItem("role");
  if (userRole === "undefined") {
    document.getElementById("adminSection")?.classList.remove("hidden");
    document.getElementById("roomSection")?.classList.remove("hidden");
  } else if (userRole === "agent") {
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
              <td class="p-2 hover:underline"><button class="editAgentBtn hover:underline" data-id="${agent.id}">Edit</button></td>
            `;
          tbody.appendChild(row);
        });

        adminTable.classList.remove("hidden"); // Show the table

        // Add event listeners to all edit buttons
        document.querySelectorAll(".editAgentBtn").forEach((button) => {
          button.addEventListener("click", async function (event) {
            event.preventDefault();
            const agentId = this.dataset.id;
            console.log(agentId);
            window.location.href = `edit.html?agentId=${agentId}`;
            await fetchAgentData(agentId);
          });
        });
      } else {
        displayMessage(
          agents.error || "An error occurred while fetching agents.",
          "error"
        );
      }
    } catch (error) {
      displayMessage("An error occurred. Please try again.", "error");
    }
  }
  fetchAgents();

  // Function to fetch agent data and populate the edit form
  async function fetchAgentData(agentId) {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/agent/edit/${agentId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const agent = await response.json();
        if (response.ok) {
          // Populate form fields with agent data
          document.getElementById("email").value = agent.email;
          document.getElementById("firstname").value = agent.first_name;
          document.getElementById("lastname").value = agent.last_name;
          document.getElementById("role").value = agent.role;

          // Store agentId in the form for later use
          document.getElementById("editAgentForm").dataset.agentId = agentId;
        } else {
          displayMessage(
            agent.error || "An error occurred while fetching agent data.",
            "error"
          );
        }
      } else {
        displayMessage("An error occurred. Please try again.", "error");
      }
    } catch (error) {
      displayMessage("An error occurred. Please try again.", "error");
    }
  }

  // Function to display messages on the page
  function displayMessage(message, type) {
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.textContent = message;
      messageContainer.className =
        type === "error" ? "message error" : "message success";
      messageContainer.style.display = "block";
    }
  }

  // Parse agentId from query string
  const urlParams = new URLSearchParams(window.location.search);
  const agentId = urlParams.get("agentId");
  if (agentId) {
    fetchAgentData(agentId);
  }

  // Handle form submission for editing an agent
  const editForm = document.getElementById("editAgentForm");
  if (editForm) {
    editForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const formData = new FormData(editForm);
      const agentId = editForm.dataset.agentId;
      const data = {
        email: formData.get("email"),
        first_name: formData.get("firstname"),
        last_name: formData.get("lastname"),
        role: formData.get("role"),
      };

      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/agent/edit/${agentId}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );

        if (response.ok) {
          displayMessage("Agent updated successfully!", "success");

          console.log("Redirecting to admin.html..."); // Debugging info

          // Redirect to admin page after a short delay
          setTimeout(() => {
            window.location.href = "admin.html";
          }, 1000);
        } else {
          const result = await response.json();
          displayMessage(
            result.error ||
              "An error occurred while updating the agent. Please try again.",
            "error"
          );
        }
      } catch (error) {
        console.error("Error updating agent:", error);
        displayMessage(
          "An error occurred while updating the agent. Please try again.",
          "error"
        );
      }
    });
  }
});
