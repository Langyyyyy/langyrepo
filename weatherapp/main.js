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
    const forecastContainer = document.getElementById('forecast-container');
    const forecastLocationTitle = document.getElementById('forecast-location-title');
    const forecastTable = document.getElementById('forecast-table');
    const forecastChartCanvas = document.getElementById('forecast-chart').getContext('2d');

    let weatherChatbot = null;
    let forecastChartInstance = null;

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

    function initializeChat() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Please enter a valid Gemini API key.');
            return;
        }

        try {
            weatherChatbot = new WeatherChatbot(apiKey);
            
            apiKeySection.classList.add('hidden');
            chatContainer.classList.remove('hidden');
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();

            appendMessage('bot', 'Hello! I am your smart weather assistant. How can I help you today?');
        } catch (error) {
            console.error('Failed to initialize chatbot:', error);
            alert(`Error initializing chatbot: ${error.message}`);
            apiKeySection.classList.remove('hidden');
            chatContainer.classList.add('hidden');
        }
    }

    async function handleUserMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage || !weatherChatbot) return;

        appendMessage('user', userMessage);
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        showTypingIndicator();
        hideForecast();
        try {
            const response = await weatherChatbot.processQuery(userMessage);

            removeTypingIndicator();

            if (typeof response === 'object' && response.forecast) {
                appendMessage('bot', response.message);
                renderForecast(response.forecast, response.locationName);
            } else {
                appendMessage('bot', response);
            }
        } catch (error) {
            console.error('Error processing query:', error);
            removeTypingIndicator();
            appendMessage('bot', `Sorry, I encountered an error: ${error.message}`);
        } finally {
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    function appendMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        messageElement.innerHTML = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showTypingIndicator() {
        appendMessage('bot', '<div id="typing-indicator"><span>.</span><span>.</span><span>.</span></div>');
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.closest('.chat-message').remove();
        }
    }

    function renderForecast(forecastData, locationName) {
        forecastContainer.classList.remove('hidden');
        forecastLocationTitle.textContent = `Forecast for ${locationName}`;
        displayForecastGraph(forecastData);
        displayForecastTable(forecastData);
    }

    function displayForecastGraph(forecastData) {
        const labels = forecastData.list.map(item => new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short' }));
        const highTemps = forecastData.list.map(item => item.main.temp_max);
        const lowTemps = forecastData.list.map(item => item.main.temp_min);

        if (forecastChartInstance) {
            forecastChartInstance.destroy();
        }

        forecastChartInstance = new Chart(forecastChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: highTemps,
                    borderColor: 'rgba(135, 206, 235, 1)',
                    backgroundColor: 'rgba(135, 206, 235, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Low (°C)',
                    data: lowTemps,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderWidth: 1,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: { display: true, text: 'Temperature (°C)', color: 'white' },
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: { 
                        display: true,
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }

    function displayForecastTable(forecastData) {
        forecastTable.innerHTML = `
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Condition</th>
                    <th>High / Low</th>
                </tr>
            </thead>
        `;
        const tbody = document.createElement('tbody');
        forecastData.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${date.toLocaleDateString(undefined, { weekday: 'long' })}</td>
                <td><img src="${iconUrl}" alt="${item.weather[0].description}" title="${item.weather[0].description}"> ${item.weather[0].main}</td>
                <td>${Math.round(item.main.temp_max)}° / ${Math.round(item.main.temp_min)}°</td>
            `;
            tbody.appendChild(row);
        });
        forecastTable.appendChild(tbody);
    }

    function hideForecast() {
        forecastContainer.classList.add('hidden');
        if (forecastChartInstance) {
            forecastChartInstance.destroy();
            forecastChartInstance = null;
        }
    }
});
