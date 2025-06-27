class OMGeocode {
    constructor() {
        this.limit = 1;
        this.json = null;
        this.location = null; // To store the location string for error messages
    }

    request(locationString) {
        this.location = locationString;
        return new Promise((resolve, reject) => {
            var xhttp = new XMLHttpRequest();
            let self = this;

            xhttp.onreadystatechange = function() {
                if (this.readyState != 4) return;

                if (this.status != 200) {
                    console.error(`Geocoding API error: ${this.status} - ${this.statusText}\nResponse: ${this.responseText}`);
                    return reject(new Error(`Geocoding API error: ${this.status} - ${this.statusText}`));
                }

                try {
                    let response = JSON.parse(this.responseText);
                    if (!response.results || response.results.length === 0) {
                        return reject(new Error(`Location "${self.location}" not found.`));
                    }
                    self.json = response;
                    resolve(response);
                } catch (error) {
                    console.error('Error parsing geocoding response:', error);
                    reject(new Error('Error processing location data.'));
                }
            }

            let searchQuery = encodeURIComponent(this.location.trim());
            let URL = `https://geocoding-api.open-meteo.com/v1/search?name=${searchQuery}&count=${this.limit}&language=en&format=json`;

            xhttp.open("GET", URL, true);
            xhttp.send();
        });
    }
}