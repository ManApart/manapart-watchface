function fetchWeather() {
    const weather = JSON.stringify({
        current: {
            temp: 80,
            conditions: 'clear',
            weatherCode: 0,
        }
    })
    Pebble.sendAppMessage({weather});
}

Pebble.addEventListener("ready", fetchWeather);


Pebble.addEventListener("appmessage", function (event) {
    if (event.payload.weather_request) {
        fetchWeather();
    }
});
