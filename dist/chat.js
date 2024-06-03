document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const room_Id = urlParams.get("room_id");
  const messageInput = document.getElementById("messageInput");
  const chatMessages = document.getElementById("chatMessages");
  let ws;
  const messageIds = new Set();

  function setupWebSocket() {
    ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${room_Id}/`);

    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (!messageIds.has(data.id)) {
        addMessage(data.message, data.role, data.sender, data.id);
      }
    });

    ws.addEventListener("error", (error) =>
      console.error("WebSocket error:", error)
    );
    ws.addEventListener("close", () =>
      console.error("WebSocket closed unexpectedly.")
    );

    messageInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });

    document
      .getElementById("sendButton")
      .addEventListener("click", sendMessage);
  }

  function fetchRoomData() {
    fetch(`http://127.0.0.1:8000/api/rooms/${room_Id}/`)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("roomInfo").innerHTML = `
          <div class='border-b-4'>
            <p><strong>Room_Id:</strong> <span>${data.room_id}</span></p>
            <p><strong>Name:</strong> <span>${data.user_name}</span></p>
            <p><strong>Started:</strong> <span>${data.started}</span></p>
            <p><strong>Status:</strong>
              <select id="status">
                <option value="waiting">Waiting</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </p>
            <p><strong>Page:</strong> <a href="${data.page_url}">${data.page_url}</a></p>
          </div>
        `;

        document
          .getElementById("status")
          .addEventListener("change", handleStatusChange);
      })
      .catch((error) => console.error("Error fetching room data:", error));
  }

  function handleStatusChange() {
    const status = document.getElementById("status").value;
    if (status === "active") {
      const agentName = "Akash"; // Replace this with the actual agent's name
      const statusMessage = {
        message: "Agent has joined the chat",
        role: "system",
      };
      ws.send(JSON.stringify(statusMessage));
      addMessage("Agent has joined the chat");
      document.querySelector("#roomInfo p:nth-child(5) span").textContent =
        agentName;
    }
  }

  function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
      const userRole = localStorage.getItem("role") || "user";
      const sender = "Akash"; // Replace this with the actual sender's name or ID
      const messageId = generateMessageId();
      const messageData = { message, role: userRole, sender, id: messageId };

      try {
        ws.send(JSON.stringify(messageData));
        messageIds.add(messageId); // Track the message by its unique ID
      } catch (error) {
        console.error("WebSocket send error:", error);
      }

      addMessage(message, userRole, sender, messageId);
      storeMessage(messageData);
      messageInput.value = "";
    }
  }

  function addMessage(message, role, sender, id) {
    const messageContainer = document.createElement("div");
    messageContainer.dataset.messageId = id; // Set a data attribute for the message ID
  
    const messageContent = document.createElement("div");
    messageContent.textContent = message;
  
    const avatarElement = document.createElement("div");
    avatarElement.textContent = sender ? sender.charAt(0).toUpperCase() : "";
  
    if (role === "system") {
        messageContainer.classList.add("flex", "justify-center", "items-center");
        messageContent.classList.add(
            "max-w-md",
            "bg-gray-200",
            "py-2",
            "px-4",
            "rounded-lg",
            "shadow-md",
            "m-auto"
        );
        messageContainer.classList.add("text-green-600");
        avatarElement.classList.add("hidden"); // Hide the avatar element for system messages
    } else if (role === "agent") {
        messageContainer.classList.add(
            "flex",
            "items-center",
            "flex-row-reverse"
        ); // Reverse the order for agent messages
        messageContent.classList.add(
            "max-w-md",
            "bg-gray-300",
            "py-1",
            "px-4",
            "rounded-lg",
            "shadow-md",
            "text-black",
            "mr-2"
        );
        avatarElement.classList.add(
            "bg-gray-300",
            "h-8",
            "w-8",
            "flex",
            "items-center",
            "justify-center",
            "rounded-full",
            "text-sm",
            "font-semibold",
            "mr-2"
        );
        messageContainer.appendChild(avatarElement);
        messageContainer.appendChild(messageContent);
    } else {
        messageContainer.classList.add("flex", "items-center");
        avatarElement.classList.add(
            "bg-gray-300",
            "h-8",
            "w-8",
            "flex",
            "items-center",
            "justify-center",
            "rounded-full",
            "text-sm",
            "font-semibold",
            "mr-2"
        );
        messageContent.classList.add(
            "max-w-md",
            "bg-gray-300",
            "py-1",
            "px-4",
            "rounded-lg",
            "shadow-md",
            "text-black",
            "mr-2"
        );
        messageContainer.appendChild(avatarElement);
        messageContainer.appendChild(messageContent);
    }
    
    // Add margin-bottom to create a gap between messages
    messageContainer.style.marginBottom = "10px";
  
    const chatMessages = document.getElementById("chatMessages"); // Ensure this matches your actual container ID
    chatMessages.appendChild(messageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

  
  

  function storeMessage(messageData) {
    if (messageData.role !== "system") {
      fetch(`http://127.0.0.1:8000/api/message/${room_Id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      }).catch((error) => console.error("Error storing message:", error));
    }
  }

  function fetchMessages() {
    fetch(`http://127.0.0.1:8000/api/messages/${room_Id}/`)
      .then((response) => response.json())
      .then((messages) => {
        messages.forEach((messageData) => {
          addMessage(
            messageData.message,
            messageData.role,
            messageData.sender,
            messageData.id
          );
          messageIds.add(messageData.id); // Track the fetched messages by their unique IDs
        });
      })
      .catch((error) => console.error("Error fetching messages:", error));
  }

  function generateMessageId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }

  fetchRoomData();
  fetchMessages();
  setupWebSocket();
});
