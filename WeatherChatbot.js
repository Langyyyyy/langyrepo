class WeatherChatbot {
    constructor(apiKey) {
        if (!window.google || !window.google.generativeai) {
             throw new Error("Google AI SDK not loaded. Please ensure the script is included in your HTML.");
        }
        const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = window.google.generativeai;
        this.genAI = new GoogleGenerativeAI(apiKey);

        // Expand safety settings to cover all categories and be very permissive.
        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ];

        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", safetySettings });

        this.omGeocode = new OMGeocode();
        this.omWeather = new OMWeather("metric"); // Using metric units for consistency
        this.omForecast = new OMForecast("metric");
        this.omPollution = new OMPollution();
        console.log("WeatherChatbot initialized.");
    }

    /**
     * Parses the user's query to determine intent and location using the Gemini API.
     * @param {string} query - The user's natural language query.
     * @returns {Promise<object>} A promise that resolves to an object like { intent: "...", location: "..." }
     */
    async parseQueryWithAI(query) {
        const prompt = `
            Analyze the following user query about weather and extract the core intent and location.
            The possible intents are: "current_weather", "forecast", "air_pollution", "humidity", "temperature", "general_query".
            If the user is just asking a general question or greeting, use "general_query".
            If a specific metric like humidity or temperature is asked for, use that as the intent.
            If the user asks for a forecast, use "forecast".  Assume the user wants the forecast for the next few days, not some historical forecast.
            For general weather conditions, use "current_weather".
            For air quality or pollution, use "air_pollution".
            If the location in the query is not clearly spelled, use your best judgment to infer the most likely location.
            If the query is unrelated to weather, respond with  {"intent": "unrelated", "location": null}.
            
            Respond ONLY with a valid JSON object in the format: {"intent": "...", "location": "..."}.
            If no location is found, the location should be null.
            Do not respond to questions that are hateful, dangerous or ask for illegal activities.


            User Query: "${query}"
        `;

        // This block now directly attempts the API call and JSON parsing.
        // Any error will be caught by the processQuery function.
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/); // Find the first JSON object in the response
        if (!jsonMatch) throw new Error("AI response did not contain valid JSON.");
        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Main processing function. It takes a user query, gets it parsed by the AI,
     * fetches the required data, and returns a formatted response.
     * @param {string} userQuery
     * @returns {Promise<string|object>} A promise that resolves to a formatted HTML string or an object for forecast.
     */
    async processQuery(userQuery) {
        try {
            const { intent, location } = await this.parseQueryWithAI(userQuery);

            if (intent === "general_query") {
                return "I'm here to help with weather! Try asking me for the weather or forecast in a specific city.";
            }

            if (!location) {
                return "I'm sorry, I couldn't identify a location in your request. Please specify a city, like 'weather in London'.";
            }

            // 1. Get coordinates for the location
            let geoData;
            try {
                geoData = await this.omGeocode.request(location);
            } catch (geoError) {
                console.error("Geocoding error:", geoError);
                return `Sorry, I couldn't find the location: <strong>${location}</strong>. Please try a more specific name (e.g., "Acton, MA, USA").`;
            }

            const { latitude, longitude, name, admin1, country } = geoData.results[0];
            const locationName = `${name}, ${admin1 ? admin1 + ', ' : ''}${country}`;

            // Set lat/lon for subsequent API calls
            this.omWeather.lat = latitude;
            this.omWeather.lon = longitude;
            this.omForecast.lat = latitude;
            this.omForecast.lon = longitude;
            this.omPollution.lat = latitude;
            this.omPollution.lon = longitude;

            // 2. Fetch data based on intent and display it
            switch (intent) {
                case 'current_weather':
                case 'temperature':
                case 'humidity':
                    const weatherData = await this.omWeather.request();
                    return formatWeatherResponse(weatherData, locationName, intent);
                case 'forecast':
                    const forecastData = await this.omForecast.request();
                    return {
                        message: formatForecastResponse(forecastData, locationName),
                        forecast: forecastData, // Return raw data for graph
                        locationName: locationName
                    };
                case 'air_pollution':
                    const pollutionData = await this.omPollution.request();
                    return formatPollutionResponse(pollutionData, locationName);
                default:
                    return "I understood the location, but not what you want to know. You can ask for 'weather', 'forecast', or 'air pollution'.";
            }
        } catch (error) {
            // This is the new centralized error handler.
            // It will catch errors from the AI call, geocoding, or weather fetching.
            console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.error("--- AN ERROR OCCURRED ---");
            console.error(error);
            console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            // Return a user-friendly message that includes the *actual* error.
            return `An error occurred: <strong>${error.message}</strong>. Please check the console for details. This could be an invalid API key, a network issue, or the AI safety filters.`;
        }
    }
}
