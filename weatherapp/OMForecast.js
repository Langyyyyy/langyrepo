class OMForecast {
    constructor(units) {
        this.units = units;
        this.lat = null;
        this.lon = null;
        this.json = null;
    }

    request() {
        return new Promise((resolve, reject) => {
            var xhttp = new XMLHttpRequest();
            let self = this;

            xhttp.onreadystatechange = function() {
                if (this.readyState != 4) return;
                if (this.status != 200) {
                    console.error(`Forecast API error: ${this.status} - ${this.statusText}\nResponse: ${this.responseText}`);
                    return reject(new Error(`Forecast API error: ${this.status} - ${this.statusText}`));
                }
                try {
                    let data = JSON.parse(this.responseText);
                    self.json = self.convertToOWMFormat(data);
                    resolve(self.json);
                } catch (error) {
                    console.error('Error parsing forecast response:', error);
                    reject(new Error('Error processing forecast data.'));
                }
            }

            let tempUnit = this.units === "imperial" ? "fahrenheit" : "celsius";
            let URL = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=${tempUnit}&forecast_days=7`;

            xhttp.open("GET", URL, true);
            xhttp.send();
        });
    }

    convertToOWMFormat(omData) {
        const weatherCodeMap = {
            0: { main: "Clear", description: "clear sky", icon: "01d" },
            1: { main: "Clear", description: "mainly clear", icon: "01d" },
            2: { main: "Clouds", description: "partly cloudy", icon: "02d" },
            3: { main: "Clouds", description: "overcast", icon: "03d" },
            45: { main: "Mist", description: "fog", icon: "50d" },
            48: { main: "Mist", description: "depositing rime fog", icon: "50d" },
            51: { main: "Drizzle", description: "light drizzle", icon: "09d" },
            53: { main: "Drizzle", description: "moderate drizzle", icon: "09d" },
            55: { main: "Drizzle", description: "dense drizzle", icon: "09d" },
            61: { main: "Rain", description: "slight rain", icon: "10d" },
            63: { main: "Rain", description: "moderate rain", icon: "10d" },
            65: { main: "Rain", description: "heavy rain", icon: "10d" },
            80: { main: "Rain", description: "slight rain showers", icon: "09d" },
            81: { main: "Rain", description: "moderate rain showers", icon: "09d" },
            82: { main: "Rain", description: "violent rain showers", icon: "09d" },
            95: { main: "Thunderstorm", description: "thunderstorm", icon: "11d" }
        };

        const daily = omData.daily;
        const list = [];

        for (let i = 0; i < daily.time.length; i++) {
            const weatherCode = daily.weather_code[i] || 0;
            const weather = weatherCodeMap[weatherCode] || weatherCodeMap[0];

            list.push({
                dt: Math.floor(new Date(daily.time[i]).getTime() / 1000),
                main: {
                    temp_max: daily.temperature_2m_max[i],
                    temp_min: daily.temperature_2m_min[i]
                },
                weather: [{
                    id: weatherCode,
                    main: weather.main,
                    description: weather.description,
                    icon: weather.icon // Daily forecast uses day icon by default
                }]
            });
        }

        return {
            cod: "200",
            list: list,
            city: {
                name: "Forecast Location",
                coord: { lat: this.lat, lon: this.lon }
            }
        };
    }
}