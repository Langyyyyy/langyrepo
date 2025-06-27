class OMPollution {
    constructor() {
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
                    console.error(`Pollution API error: ${this.status} - ${this.statusText}\nResponse: ${this.responseText}`);
                    return reject(new Error(`Pollution API error: ${this.status} - ${this.statusText}`));
                }
                try {
                    let data = JSON.parse(this.responseText);
                    self.json = self.convertToOWMFormat(data);
                    resolve(self.json);
                } catch (error) {
                    console.error('Error parsing pollution response:', error);
                    reject(new Error('Error processing pollution data.'));
                }
            }

            let URL = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${this.lat}&longitude=${this.lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

            xhttp.open("GET", URL, true);
            xhttp.send();
        });
    }

    convertToOWMFormat(omData) {
        const current = omData.current;
        
        let aqi = 1; // Default to Good
        if (current.us_aqi) {
            if (current.us_aqi <= 50) aqi = 1; else if (current.us_aqi <= 100) aqi = 2; else if (current.us_aqi <= 150) aqi = 3; else if (current.us_aqi <= 200) aqi = 4; else aqi = 5;
        }

        return {
            list: [{
                main: { aqi: aqi },
                components: {
                    co: current.carbon_monoxide || 0,
                    no2: current.nitrogen_dioxide || 0,
                    o3: current.ozone || 0,
                    so2: current.sulphur_dioxide || 0,
                    pm2_5: current.pm2_5 || 0,
                    pm10: current.pm10 || 0
                }
            }]
        };
    }
}