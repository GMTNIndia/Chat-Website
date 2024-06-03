document.addEventListener("DOMContentLoaded", function () {
  // Get references to the HTML elements
  const chatBubble = document.getElementById("chat-bubble");
  const popup = document.getElementById("popup");
  const chatWindow = document.getElementById("chat-window");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  const messagesDiv = document.getElementById("messages");
  const chatForm = document.getElementById("chat-form");
  let ws; // WebSocket variable
  let room_id; // Room ID variable
  let user_name; // User's name variable

  // Show the popup when the chat bubble is clicked
  chatBubble.addEventListener("click", () => {
    popup.classList.remove("hidden");
  });

  // Function to create a new chat room for the user
  function createRoom(username) {
    user_name = username; // Store the username globally
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
        // Set up the WebSocket connection
        room_id = data.room_id;
        setupWebSocket(room_id);
        addMessage(
          `Welcome to the chat, ${username}! Wait for an agent to join...`,
          "System"
        );
        // Hide the popup after joining the chat
        popup.classList.add("hidden");
        chatWindow.classList.remove("hidden"); // Show chat window after joining
      })
      .catch((error) => console.error("Error creating room:", error));
  }

  // Handle the submission of the chat form
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("user").value;
    createRoom(username);
  });

  // Function to set up the WebSocket connection
  function setupWebSocket(room_id) {
    ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${room_id}/`);

    ws.onopen = function () {
      console.log("WebSocket connected");
    };

    ws.onmessage = function (event) {
      const data = JSON.parse(event.data);
      addMessage(`${data.sender}: ${data.message}`, data.sender);
    };

    ws.onclose = function () {
      console.error("WebSocket closed unexpectedly");
    };

    // Handle the submission of messages
    messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = messageInput.value;
      if (message.trim() !== "") {
        // Send message along with the username
        const messageData = { message: message, sender: user_name };
        ws.send(JSON.stringify(messageData));
        storeMessage(room_id, messageData); // Store the message
        messageInput.value = "";
      }
    });
  }

  // Function to store messages to the backend
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

  // Function to add messages to the chat window
  function addMessage(message, sender = "user") {
    const messageElement = document.createElement("div");
    const avatarElement = document.createElement("div");
    avatarElement.textContent = sender ? sender.charAt(0).toUpperCase() : "";
    if (sender === "System") {
      messageElement.classList.add(
        "p-2",
        "mb-2",
        "rounded",
        "bg-[#F3F5F7]",
        "text-[#2D2D2D]",
        "self-center",
        "max-w-xs",
        "text-center"
      );
    } else if (sender === user_name) {
      messageElement.classList.add(
        "p-2",
        "mb-2",
        "rounded",
        "bg-[#E2E8F0]",
        "text-[#2D2D2D]",
        "self-end",
        "max-w-xs"
      );
    } else {
      messageElement.classList.add(
        "p-2",
        "mb-2",
        "rounded",
        "bg-gray-300",
        "text-[#000000]",
        "self-start",
        "max-w-xs"
      );
    }
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
});
