document.addEventListener("DOMContentLoaded", function () {
  const chatBubble = document.getElementById("chat-bubble");
  const popup = document.getElementById("popup");
  const chatWindow = document.getElementById("chat-window");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  const messagesDiv = document.getElementById("messages");
  const chatForm = document.getElementById("chat-form");
  let ws;
  let room_id; 
  let user_name; 

  chatBubble.addEventListener("click", () => {
    popup.classList.remove("hidden");
  });

  // Function to create a new chat room for the user
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

  // Handle the submission of the chat form
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
    messageContainer.classList.add("mb-6"); // Increase margin-bottom for more space
   
    const messageContent = document.createElement("div");
    messageContent.textContent = message;

    const avatarElement = document.createElement("div");
    avatarElement.textContent = sender.charAt(0).toUpperCase();

    if (sender === "system") {
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
    } else if (sender === user_name) {
      messageContainer.classList.add(
          "flex",
          "items-center",
          "flex-row-reverse"
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
    
    messagesDiv.appendChild(messageContainer);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
});
