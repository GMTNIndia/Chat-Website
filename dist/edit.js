document.addEventListener("DOMContentLoaded", function () {
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
        tbody.innerHTML = "";
        let serialNumber = 1;
        agents.forEach((agent) => {
          const row = document.createElement("tr");
          row.classList.add("odd:bg-white", "even:bg-gray-200",);
          row.innerHTML = `
              <td class="px-6">${serialNumber}</td>
              <td class="px-6">${agent.first_name} ${agent.last_name}</td>
              <td class="px-6">${agent.email}</td>
              <td class="px-6">${agent.role}</td>
              <td class="px-6 ${
                agent.status === "active" ? "text-green-500" : "text-red-500"
              }">${agent.status}</td>
              <td class="px-6">${agent.is_engaged}</td>
              <td class="px-6 flex flex-col md:flex-row md:items-center">
                <button class="editAgentBtn mb-2 md:mb-0 md:mr-1.5 flex p-1.5 transition-all duration-300" data-id="${agent.id}">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500 hover:fill-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                <button class="deleteAgentBtn py-2 px-1.5 rounded group" data-id="${agent.id}">
                  <svg viewBox="0 0 15 17.5" height="17.5" width="15" xmlns="http://www.w3.org/2000/svg" class="icon fill-red-500 hover:fill-red-800">
                  <path transform="translate(-2.5 -1.25)" d="M15,18.75H5A1.251,1.251,0,0,1,3.75,17.5V5H2.5V3.75h15V5H16.25V17.5A1.251,1.251,0,0,1,15,18.75ZM5,5V17.5H15V5Zm7.5,10H11.25V7.5H12.5V15ZM8.75,15H7.5V7.5H8.75V15ZM12.5,2.5h-5V1.25h5V2.5Z" id="Fill"></path>
                  </svg>
                </button>

                </td>`;
          tbody.appendChild(row);
          serialNumber++;
        });

        adminTable.classList.remove("hidden");

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

        // Add event listeners to all delete buttons
        document.querySelectorAll(".deleteAgentBtn").forEach((button) => {
          button.addEventListener("click", function (event) {
            event.preventDefault();
            const agentId = this.dataset.id;
            showDeleteModal(agentId);
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
        `http://127.0.0.1:8000/api/agent/${agentId}/`,
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
          `http://127.0.0.1:8000/api/agent/${agentId}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
            body: JSON.stringify(data),
          }
        );

        if (response.ok) {
          displayMessage("Agent updated successfully!", "success");

          console.log("Redirecting to admin.html...");
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

  // Function to show delete confirmation modal
  function showDeleteModal(agentId) {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75";
    modal.innerHTML = `
      <div class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-384 p-6">
        <div class="text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Agent</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">Are you sure you want to delete this agent?</p>
          </div>
        </div>
        <div class="mt-5 sm:mt-6 flex justify-end">
          <button id="cancelBtn" class="mr-2 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancel
          </button>
          <button id="confirmDeleteBtn" class="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          Delete
        </button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);

    document.getElementById("cancelBtn").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    document
      .getElementById("confirmDeleteBtn")
      .addEventListener("click", async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `http://127.0.0.1:8000/api/agents/delete/${agentId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          document.body.removeChild(modal);
          if (response.ok) {
            fetchAgents();
            displayMessage("Agent deleted successfully!", "success");
          } else {
            const result = await response.json();
            displayMessage(
              result.error ||
                "An error occurred while deleting the agent. Please try again.",
              "error"
            );
          }
        } catch (error) {
          console.error("Error deleting agent:", error);
          displayMessage(
            "An error occurred while deleting the agent. Please try again.",
            "error"
          );
        }
      });
  }
});