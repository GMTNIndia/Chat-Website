document.addEventListener("DOMContentLoaded", function () {
  const chatBubble = document.getElementById("chat-bubble");
  const popup = document.getElementById("popup");
  const chatWindow = document.getElementById("chat-window");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  const messagesDiv = document.getElementById("messages");
  const chatForm = document.getElementById("chat-form");
  const typingBar = document.getElementById("typing-bar");
  let ws;
  let room_id; 
  let user_name; 

  chatBubble.addEventListener("click", () => {
    popup.classList.remove("hidden");
  });

  function createRoom(username) {
    user_name = username;
    const userDetails = { user_name: username };

    fetch("http://127.0.0.1:8000/api/create-room/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDetails),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to create room");
        return response.json();
      })
      .then((data) => {
        room_id = data.room_id;
        setupWebSocket(room_id);
        addMessage(
          `Welcome to the chat, ${username}! Wait for an agent to join...`,
          "System"
        );
        popup.classList.add("hidden");
        chatWindow.classList.remove("hidden");
      })
      .catch((error) => console.error("Error creating room:", error));
  }

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("user").value;
    createRoom(username);
  });

  function setupWebSocket(room_id) {
    ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${room_id}/`);

    ws.onopen = function () {
      console.log("WebSocket connected");
    };

    ws.onmessage = function (event) {
      const data = JSON.parse(event.data);
      addMessage(data.message, data.sender);
      if (data.message.includes("Agent has left the chat")) {
        handleAgentLeft();
      }
    };

    ws.onerror = function (error) {
      console.error("WebSocket error:", error);
    };

    ws.onclose = function () {
      console.error("WebSocket closed unexpectedly. Reconnecting...");
      setTimeout(function () {
        setupWebSocket(room_id);
      }, 1000);
    };
  }

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = messageInput.value;
    if (message.trim() !== "") {
      const messageData = { message: message, sender: user_name };
      ws.send(JSON.stringify(messageData));
      storeMessage(room_id, messageData);
      messageInput.value = "";
    }
  });

  function storeMessage(roomId, messageData) {
    fetch(`http://127.0.0.1:8000/api/message/${roomId}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageData),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to store message");
        return response.json();
      })
      .then((data) => {
        console.log("Message stored successfully:", data);
      })
      .catch((error) => console.error("Error storing message:", error));
  }

  function addMessage(message, sender) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("mb-4");

    const messageContent = document.createElement("div");
    messageContent.textContent = message;

    if (sender === "System" || message.includes("Agent has joined the chat") || message.includes("Agent has left the chat")) {
      messageContainer.classList.add("flex", "justify-center", "items-center");
      
      if (message.includes("Agent has joined the chat")) {
        messageContent.classList.add(
          "max-w-md",
          "bg-green-400",
          "py-2",
          "px-4",
          "rounded-lg",
          "shadow-md",
          "text-center",
          "text-white"
        );
      } else if (message.includes("Agent has left the chat")) {
        messageContent.classList.add(
          "max-w-md",
          "bg-red-400",
          "py-2",
          "px-4",
          "rounded-lg",
          "shadow-md",
          "text-center",
          "text-white"
        );
      } else {
        messageContent.classList.add(
          "max-w-md",
          "bg-gray-200",
          "py-2",
          "px-4",
          "rounded-lg",
          "shadow-md",
          "text-center"
        );
      }

      messageContainer.appendChild(messageContent);
    } else {
      const avatarElement = document.createElement("div");
      avatarElement.textContent = sender.charAt(0).toUpperCase();
      avatarElement.classList.add(
        "bg-gray-300",
        "h-8",
        "w-8",
        "flex",
        "items-center",
        "justify-center",
        "rounded-full",
        "text-sm",
        "mr-2"
      );

      if (sender === user_name) {
        messageContainer.classList.add("flex", "justify-end", "items-center");
        messageContent.classList.add(
          "max-w-md",
          "bg-gray-300",
          "py-1",
          "px-4",
          "rounded-lg",
          "shadow-md"
        );
        avatarElement.classList.add("order-last", "ml-2");
      } else {
        messageContainer.classList.add("flex", "items-center");
        messageContent.classList.add(
          "max-w-md",
          "bg-gray-300",
          "py-1",
          "px-4",
          "rounded-lg",
          "shadow-md"
        );
      }

      messageContainer.appendChild(avatarElement);
      messageContainer.appendChild(messageContent);
    }

    messagesDiv.appendChild(messageContainer);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function handleAgentLeft() {
    typingBar.classList.add("hidden");
    addMessage("Session closed. The agent has left the chat.", "System");
  }
});
