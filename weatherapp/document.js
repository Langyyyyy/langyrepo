document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const apiKeyInput = document.getElementById('api-key-input');
    const toggleApiKeyBtn = document.getElementById('toggle-api-key');
    const connectBtn = document.getElementById('connect-btn');
    const apiKeySection = document.getElementById('api-key-section');
    
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');

    let weatherChatbot = null;

    // --- Event Listeners ---

    // Toggle API key visibility
    toggleApiKeyBtn.addEventListener('click', () => {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';
        toggleApiKeyBtn.textContent = isPassword ? '🙈' : '👁️';
    });

    // Connect to chatbot with API key
    connectBtn.addEventListener('click', initializeChat);
    apiKeyInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            initializeChat();
        }
    });

    // Send chat message
    sendBtn.addEventListener('click', handleUserMessage);
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !sendBtn.disabled) {
            handleUserMessage();
        }
    });

    // --- Core Functions ---

    /**
     * Initializes the chatbot, sets up the UI, and displays a welcome message.
     */
    function initializeChat() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Please enter a valid Gemini API key.');
            return;
        }

        try {
            weatherChatbot = new WeatherChatbot(apiKey);
            
            // Update UI
            apiKeySection.classList.add('hidden');
            chatContainer.classList.remove('hidden');
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();

            // Display welcome message
            appendMessage('bot', 'Hello! I am your smart weather assistant. How can I help you today?');
        } catch (error) {
            console.error('Failed to initialize chatbot:', error);
            alert(`Error initializing chatbot: ${error.message}`);
            // Show the API key section again if initialization fails
            apiKeySection.classList.remove('hidden');
            chatContainer.classList.add('hidden');
        }
    }

    /**
     * Handles the user sending a message.
     */
    async function handleUserMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage || !weatherChatbot) return;

        appendMessage('user', userMessage);
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        showTypingIndicator();

        try {
            // The chatbot now handles parsing and fetching data
            await weatherChatbot.processQuery(userMessage);
        } catch (error) {
            console.error('Error processing query:', error);
            appendMessage('bot', `Sorry, I encountered an error: ${error.message}`);
        } finally {
            removeTypingIndicator();
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    /**
     * Appends a message to the chat window.
     * @param {string} sender - 'user' or 'bot'
     * @param {string} text - The message content (can be HTML)
     */
    function appendMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        messageElement.innerHTML = text; // Use innerHTML to allow for formatted bot responses
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
    }
    
    // Expose appendMessage to be used by other modules like WeatherChatbot
    window.displayBotMessage = (htmlContent) => appendMessage('bot', htmlContent);

    function showTypingIndicator() {
        appendMessage('bot', '<div id="typing-indicator"><span>.</span><span>.</span><span>.</span></div>');
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.parentElement.remove();
        }
    }
});