document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const room_Id = urlParams.get("room_id");
  const messageInput = document.getElementById("messageInput");
  const chatMessages = document.getElementById("chatMessages");
  const sendButton = document.getElementById("sendButton");
  const leaveButton = document.getElementById("leaveButton");
  let ws;
  const messageIds = new Set();

  function addMessage(message, role, sender, id) {
    const messageContainer = document.createElement("div");
    messageContainer.dataset.messageId = id;

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
      avatarElement.classList.add("hidden");
    } else if (role === "agent") {
      messageContainer.classList.add("flex", "items-center", "flex-row-reverse");
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

    messageContainer.style.marginBottom = "20px";
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

  function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
      const userRole = localStorage.getItem("role") || "user";
      const sender = "Agent";
      const messageId = generateMessageId();
      const messageData = { message, role: userRole, sender, id: messageId };

      try {
        ws.send(JSON.stringify(messageData));
        messageIds.add(messageId);
      } catch (error) {
        console.error("WebSocket send error:", error);
      }

      addMessage(message, userRole, sender, messageId);
      storeMessage(messageData);
      messageInput.value = "";
    }
  }

  function generateMessageId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }

  function setupWebSocket() {
    ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${room_Id}/`);

    ws.addEventListener("open", () => {
      console.log("WebSocket connected");
      updateRoomStatus("active");
      sendSystemMessage("Agent has joined the chat");
    });

    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.role === "system" && data.message.includes("Agent left the chat")) {
        // Agent left the chat, update room status
        updateRoomStatus("closed");
      } else {
        if (!messageIds.has(data.id)) {
          addMessage(data.message, data.role, data.sender, data.id);
        }
      }
    });

    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.addEventListener("close", () => {
      console.error("WebSocket closed unexpectedly. Reconnecting...");
      updateRoomStatus("closed");
      setTimeout(setupWebSocket, 1000);
    });
  }

  function sendSystemMessage(message) {
    const messageId = generateMessageId();
    const systemMessage = {
      message: message,
      role: "system",
      sender: null,
      id: messageId,
    };
    try {
      ws.send(JSON.stringify(systemMessage));
    } catch (error) {
      console.error("WebSocket send error:", error);
    }
    if (message.includes("Agent left the chat")) {
      updateRoomStatus("closed");
    }
    addMessage(message, "system", null, messageId);
  }

  function updateRoomStatus(status) {
    fetch(`http://127.0.0.1:8000/api/rooms/${room_Id}/status/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ status: status }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          document.getElementById("roomStatus").textContent = status.charAt(0).toUpperCase() + status.slice(1);
        } else {
          console.error("Error updating room status:", data.error);
        }
      })
      .catch(error => {
        console.error("Error updating room status:", error);
      });
  }

  function fetchRoomData() {
    fetch(`http://127.0.0.1:8000/api/rooms/${room_Id}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch room data");
        }
        return response.json();
      })
      .then((data) => {
        document.getElementById("roomInfo").innerHTML = `
          <div class='border-b-4'>
            <p><strong>Room_Id:</strong> <span>${data.room_id}</span></p>
            <p><strong>Name:</strong> <span>${data.user_name}</span></p>
            <p><strong>Started:</strong> <span>${data.started}</span></p>
            <p><strong>Status:</strong> <span id="roomStatus">${data.room_status}</span></p>
            <p><strong>Page:</strong> <a href="${data.page_url}">${data.page_url}</a></p>
          </div>
        `;
      })
      .catch((error) => {
        console.error("Error fetching room data:", error);
        document.getElementById("roomInfo").innerHTML = `
          <div class='border-b-4 text-red-500'>
            <p>Error fetching room data. Please try again later.</p>
          </div>
        `;
      });
  }

  function fetchMessages() {
    fetch(`http://127.0.0.1:8000/api/messages/${room_Id}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        return response.json();
      })
      .then((messages) => {
        messages.forEach((messageData) => {
          addMessage(messageData.message, messageData.role, messageData.sender, messageData.id);
        });
      })
      .catch((error) => console.error("Error fetching messages:", error));
  }

  messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  sendButton.addEventListener("click", sendMessage);

  leaveButton.addEventListener("click", function() {
    sendSystemMessage("Agent has left the chat");
    updateRoomStatus("closed");
    setTimeout(function() {
      window.location.href = './admin.html';
    }, 1000); // Adjust the delay as needed
  });

  fetchRoomData();
  fetchMessages();
  setupWebSocket();
});
