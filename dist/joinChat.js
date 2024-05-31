document.addEventListener("DOMContentLoaded", function () {
  // Get references to the HTML elements
  const chatBubble = document.getElementById("chat-bubble");
  const popup = document.getElementById("popup");
  const chatForm = document.getElementById("chat-form");
  const chatWindow = document.getElementById("chat-window");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  const messagesDiv = document.getElementById("messages");
  let ws; // WebSocket variable

  // Show the popup when the chat bubble is clicked
  chatBubble.addEventListener("click", () => {
    popup.classList.remove("hidden");
  });

  // Function to create a new chat room for the user
  function createRoom(user) {
    const userDetails = { user: user };

    fetch("http://127.0.0.1:8000/api/newuser/", {
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
        setupWebSocket(data.room_id);
        popup.classList.add("hidden");
        chatWindow.classList.remove("hidden");
        addMessage(
          `Welcome to the chat, ${user}! Wait for an agent to join...`,
          "System"
        );
      })
      .catch((error) => console.error("Error creating room:", error));
  }

  // Handle the submission of the chat form
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const user = document.getElementById("user").value;
    createRoom(user);
  });

  // Function to set up the WebSocket connection
  function setupWebSocket(room_id) {
    ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${room_id}/`);

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
        ws.send(JSON.stringify({ message: message, sender: "You" }));
        messageInput.value = "";
        addMessage(`You: ${message}`, "user");
      }
    });
  }

  // Function to add messages to the chat window
  function addMessage(message, sender = "user") {
    const messageElement = document.createElement("div");
    if (sender === "agent") {
      messageElement.classList.add(
        "p-2",
        "mb-2",
        "rounded",
        "bg-[#DA314D]",
        "text-[#FFFFFF]",
        "self-start",
        "max-w-xs"
      );
    } else if (sender === "user") {
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
        "bg-[#F3F5F7]",
        "text-[#2D2D2D]",
        "self-center",
        "max-w-xs",
        "text-center"
      );
    }
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
});
