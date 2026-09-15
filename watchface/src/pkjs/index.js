function getLocation() {
    navigator.geolocation.getCurrentPosition(
        function (pos) {
            fetchWeather(
                pos.coords.latitude,
                pos.coords.longitude
            );
        },
        function (err) {
            console.log("Location error: " + err.message);
        },
        {
            enableHighAccuracy: false,
            maximumAge: 15 * 60 * 1000,
            timeout: 10000
        }
    );
}

function fetchWeather(latitude, longitude) {
    const request = new XMLHttpRequest();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m,weather_code&forecast_days=1&temperature_unit=fahrenheit`
    console.log('url: ' + url)
    request.open("GET", url);

    request.onload = function () {
        if (request.status !== 200) {
            console.log("Weather HTTP error: " + request.status);
            return;
        }

        try {
            const data = JSON.parse(request.responseText);
            console.log(data.current.temperature_2m)
            Pebble.sendAppMessage({
                weather: JSON.stringify({
                    current: {
                        temp: Math.round(data.current.temperature_2m),
                        code: data.current.weather_code,
                    },
                    hourly: [],
                    // tomorrow: {
                    //     high: Math.round(data.daily.temperature_2m_max[0]),
                    //     low: Math.round(data.daily.temperature_2m_min[0]),
                    //     conditions: getWeatherDescription(data.daily.weather_code[0]),
                    //     icon: getWeatherIcon(data.current.weather_code[0]),
                    // },
                })
            });
        } catch (error) {
            console.log("Weather parse error: " + error);
        }
    };

    request.onerror = function () {
        console.log("Weather request failed");
    };

    request.send();
}

Pebble.addEventListener("ready", getLocation);
Pebble.addEventListener("appmessage", function (event) {
    if (event.payload.weather_request) {
        getLocation()
    }
});
