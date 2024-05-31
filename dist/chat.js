document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const userName = urlParams.get("userName") || "user";
  const roomId = urlParams.get("room_id");
  const chatMessages = document.getElementById("chatMessages");
  const messageInput = document.getElementById("messageInput");
  const statusSelect = document.getElementById("status");
  let ws;

  function setupWebSocket() {
    ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomId}/`);

    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      addMessage(`${data.sender}: ${data.message}`, data.sender);
      if (data.sender !== "system") {
        storeMessage(data);
      }
    });

    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.addEventListener("close", () => {
      console.error("WebSocket closed unexpectedly. Reconnecting...");
    //  setTimeout(setupWebSocket, 1000); // Attempt to reconnect after 1 second
    });

    messageInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });

    messageInput.addEventListener("submit", (event) => {
      event.preventDefault();
      sendMessage();
    });

    statusSelect.addEventListener("change", () => {
      const status = statusSelect.value;
      if (status === "active") {
        const statusMessage = {
          message: "An agent has joined the chat",
          sender: "system",
        };
        ws.send(JSON.stringify(statusMessage));
        addMessage(`An agent has joined the chat`, "system");
      }
    });
  }

  function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
      const messageData = { message: message, sender: userName };
      ws.send(JSON.stringify(messageData));
      addMessage(message, "user");
      storeMessage(messageData);
      messageInput.value = "";
    }
  }

  function addMessage(message, sender = "user") {
    const messageElement = document.createElement("div");
    messageElement.classList.add(
      "flex",
      "items-end",
      "space-x-2",
      sender === "user" ? "justify-end" : "justify-start"
    );

    const avatarElement = document.createElement("div");
    avatarElement.classList.add(
      "flex-shrink-0",
      "bg-[#D9D9D9]",
      "rounded-full",
      "h-8",
      "w-8",
      "flex",
      "items-center",
      "justify-center"
    );
    avatarElement.innerHTML = `<span class="text-[#000000] font-semibold">${sender
      .charAt(0)
      .toUpperCase()}</span>`;

    if (sender !== "user" && sender !== "system") {
      messageElement.appendChild(avatarElement);
    }

    const messageContent = document.createElement("div");
    messageContent.classList.add(
      "p-2",
      "rounded-t-none",
      sender === "user" ? "rounded-l-lg" : "rounded-r-lg",
      "rounded-b-lg",
      "bg-[#D4D7D8]"
    );
    messageContent.innerHTML = `<p class="font-semibold">${message}</p>`;

    messageElement.appendChild(messageContent);

    if (sender === "user") {
      messageElement.appendChild(avatarElement);
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function storeMessage(messageData) {
    if (messageData.sender !== "system") {
      fetch(`http://127.0.0.1:8000/messages/${roomId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      }).catch((error) => {
        console.error("Error storing message:", error);
      });
    }
  }

  function fetchUserInfo() {
    fetch(`http://127.0.0.1:8000/rooms/${roomId}/`)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("userNameDisplay").innerText =
          data.name || userName;
        document.getElementById("startedTime").innerText =
          data.started || "N/A";
        document.getElementById("status").value = data.status || "waiting";
        document.getElementById("pageUrl").innerText = data.page || "N/A";
        document.getElementById("pageUrl").href = data.page || "#";
        document.getElementById("agentName").innerText = data.agent || "N/A";
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
      });
  }

  function fetchMessages() {
    fetch(`http://127.0.0.1:8000/messages/${roomId}/`)
      .then((response) => response.json())
      .then((messages) => {
        messages.forEach((messageData) => {
          addMessage(
            `${messageData.sender}: ${messageData.message}`,
            messageData.sender
          );
        });
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  }

  fetchUserInfo();
  fetchMessages();
  setupWebSocket();
});
