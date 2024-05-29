document.addEventListener("DOMContentLoaded", function () {
  // Get elements
  const chatBubble = document.getElementById("chat-bubble");
  const popup = document.getElementById("popup");
  const chatForm = document.getElementById("chat-form");
  const chatWindow = document.getElementById("chat-window");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  const messagesDiv = document.getElementById("messages");

  // Show popup when chat bubble is clicked
  chatBubble.addEventListener("click", () => {
    popup.classList.remove("hidden");
  });

  // Show chat window when form is submitted
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    // Process the form data
    const name = document.getElementById("name").value;
    // Hide the popup and show the chat window
    popup.classList.add("hidden");
    chatWindow.classList.remove("hidden");
    // Display welcome message
    addMessage(
      `Welcome to the chat, ${name}! Please type your message below and wait for an agent to join...`,
      "System"
    );
  });

  // Handle message form submission
  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    // Capture and display the message
    const message = messageInput.value;
    if (message.trim() !== "") {
      addMessage(`You: ${message}`, "user");
      messageInput.value = "";
      // Show typing indicator and simulate agent response for demonstration
      showTypingIndicator();
      setTimeout(() => {
        addMessage("This is a response from the agent.", "agent");
        hideTypingIndicator();
      }, 2000);
    }
  });

  // Function to add a message to the messages div
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

  // Function to show typing indicator
  function showTypingIndicator() {
    const typingIndicator = document.createElement("div");
    typingIndicator.id = "typing-indicator";
    typingIndicator.classList.add(
      "p-2",
      "mb-2",
      "rounded",
      "bg-[#F3F5F7]",
      "text-[#909090]",
      "self-start",
      "max-w-xs",
      "italic"
    );
    typingIndicator.textContent = "Agent is typing...";
    messagesDiv.appendChild(typingIndicator);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Function to hide typing indicator
  function hideTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Hide popup and chat window when clicking outside of them
  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.classList.add("hidden");
    }
  });

  chatWindow.addEventListener("click", (event) => {
    if (event.target === chatWindow) {
      chatWindow.classList.add("hidden");
    }
  });
});
