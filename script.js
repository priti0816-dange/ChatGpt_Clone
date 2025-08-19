 document.addEventListener('DOMContentLoaded', () => {
  // Get references to the HTML elements
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');

  // Store the conversation history
  const messageHistory = [
    {
      role: "assistant",
      content: "Hey! I'm your new best friend. What's up? How can I make your day better? ✨"
    }
  ];

  // Helper function to create a new chat message element
  function createMessageElement(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = `p-4 rounded-xl max-w-[85%] shadow-sm ${isUser ? 'bg-emerald-100 text-gray-900' : 'bg-gray-100 text-gray-800'}`;
    bubbleDiv.textContent = text;
    messageDiv.appendChild(bubbleDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Function to handle sending a message
  async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Add the user's message to the history and display it
    messageHistory.push({ role: "user", content: userMessage });
    createMessageElement(userMessage, true);

    // Clear the input field and disable the button
    userInput.value = '';
    sendButton.disabled = true;

    // Display a "typing" indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.className = 'flex justify-start';
    typingIndicator.innerHTML = `
      <div class="p-4 rounded-xl max-w-[85%] bg-gray-100 text-gray-800 shadow-sm animate-pulse">
        <span class="inline-block w-2 h-2 bg-gray-400 rounded-full mx-0.5"></span>
        <span class="inline-block w-2 h-2 bg-gray-400 rounded-full mx-0.5"></span>
        <span class="inline-block w-2 h-2 bg-gray-400 rounded-full mx-0.5"></span>
      </div>
    `;
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      // Make an asynchronous API call to the FastAPI backend
      const response = await fetch('/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: messageHistory }),
});

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.response;

      // Add the bot's response to the history and display it
      messageHistory.push({ role: "assistant", content: botResponse });
      chatBox.removeChild(typingIndicator);
      createMessageElement(botResponse, false);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      chatBox.removeChild(typingIndicator);
      createMessageElement("Oops! I'm having trouble connecting right now. Please try again later.", false);
    } finally {
      sendButton.disabled = false;
      userInput.focus();
    }
  }

  // Event listener for the send button
  sendButton.addEventListener('click', sendMessage);

  // Event listener for the Enter key on the input field
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Focus on the input field when the page loads
  userInput.focus();
});