// Helper function to get weather emoji based on condition
function getWeatherEmoji(condition) {
    const emojiMap = {
        "Clear": "☀️",
        "Clouds": "☁️",
        "Rain": "🌧️",
        "Drizzle": " drizzling", // Changed to text for better integration in sentences
        "Thunderstorm": "⛈️",
        "Snow": "❄️",
        "Mist": "🌫️",
        "Fog": "🌫️"
    };
    return emojiMap[condition] || condition; // Return condition if no emoji found
}

/**
 * Formats current weather data into an HTML string for display in the chat.
 * @param {object} data - The weather data object (OWM-like format).
 * @param {string} locationName - The name of the location.
 * @param {string} intent - The specific intent ('temperature', 'humidity', 'current_weather').
 * @returns {string} HTML string.
 */
function formatWeatherResponse(data, locationName, intent) {
    const temp = `${Math.round(data.main.temp)}°C`;
    const feelsLike = `${Math.round(data.main.feels_like)}°C`;
    const humidity = `${data.main.humidity}%`;
    const description = data.weather[0].description;
    const mainCondition = data.weather[0].main;
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    let html = '';

    if (intent === 'temperature') {
        html = `
            <div class="weather-card">
                <h4>Temperature in ${locationName}</h4>
                <p class="temp-main">${temp}</p>
                <p>Feels like: ${feelsLike}</p>
            </div>
        `;
    } else if (intent === 'humidity') {
        html = `
            <div class="weather-card">
                <h4>Humidity in ${locationName}</h4>
                <p class="humidity-main">${humidity}</p>
                <p>Conditions: ${description}</p>
            </div>
        `;
    } else { // 'current_weather'
        html = `
            <div class="weather-card">
                <img src="${iconUrl}" alt="${description}" class="weather-icon">
                <h4>Weather in ${locationName}</h4>
                <p class="temp-main">${temp}</p>
                <p>Feels like: ${feelsLike}</p>
                <p><strong>${description.charAt(0).toUpperCase() + description.slice(1)}</strong></p>
                <p>Humidity: ${humidity}</p>
                <p>Wind: ${data.wind.speed} m/s</p>
            </div>
        `;
    }
    return html;
}

/**
 * Formats forecast data into a textual summary for display in the chat.
 * The actual graph will be handled by main.js.
 * @param {object} data - The forecast data object (OWM-like format).
 * @param {string} locationName - The name of the location.
 * @returns {string} HTML string.
 */
function formatForecastResponse(data, locationName) {
    // Get the next 3 unique days for a brief summary
    const dailySummary = [];
    const seenDates = new Set();
    for (const item of data.list) {
        const date = new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        if (!seenDates.has(date)) {
            dailySummary.push(`${date}: ${Math.round(item.main.temp)}°C, ${item.weather[0].description}`);
            seenDates.add(date);
            if (dailySummary.length >= 3) break; // Limit to 3 days for chat summary
        }
    }

    let html = `
        <div class="weather-card">
            <h4>5-Day Forecast for ${locationName}</h4>
            <p>Here's a quick look at the next few days:</p>
            <ul>
                ${dailySummary.map(s => `<li>${s}</li>`).join('')}
            </ul>
            <p>A detailed graph is shown below.</p>
        </div>
    `;
    return html;
}

/**
 * Formats air pollution data into an HTML string for display in the chat.
 * @param {object} data - The pollution data object (OWM-like format).
 * @param {string} locationName - The name of the location.
 * @returns {string} HTML string.
 */
function formatPollutionResponse(data, locationName) {
    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;
    const aqiText = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqi - 1] || 'N/A';

    let html = `
        <div class="weather-card">
            <h4>Air Quality in ${locationName}</h4>
            <p class="aqi-main">AQI: ${aqi} (${aqiText})</p>
            <ul>
                <li>CO: ${components.co} μg/m³</li>
                <li>NO₂: ${components.no2} μg/m³</li>
                <li>O₃: ${components.o3} μg/m³</li>
                <li>SO₂: ${components.so2} μg/m³</li>
                <li>PM2.5: ${components.pm2_5} μg/m³</li>
            </ul>
        </div>
    `;
    return html;
}