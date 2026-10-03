const Clay = require('@rebble/clay');
const clayConfig = require('./config');
const clay = new Clay(clayConfig);

function getLocation() {
    navigator.geolocation.getCurrentPosition(
        function (pos) {
            // testWeather()
            fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },

        function (err) {
            console.log("Location error: " + err.message);
        },
        {
            enableHighAccuracy: false,
            maximumAge:
                24 * 60 * 60 * 1000,
            timeout:
                10000
        }
    )
    ;
}

function fetchWeather(latitude, longitude) {
    const request = new XMLHttpRequest();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m,weather_code&forecast_days=2&temperature_unit=fahrenheit&timezone=auto`

    request.open("GET", url);
    request.onload = function () {
        if (request.status !== 200) {
            console.log("Weather HTTP error: " + request.status);
            return;
        }

        try {
            const data = JSON.parse(request.responseText);
            const start = parseInt(data.current.time.slice(11, 13));
            const weather = {
                asOf: data.current.time,
                current: {
                    temp: Math.round(data.current.temperature_2m),
                    code: data.current.weather_code,
                },
                hourlyTemps: data.hourly.temperature_2m.map(temp => Math.round(temp)).slice(start, start + 10),
                hourlyCodes: data.hourly.weather_code.slice(start, start + 10),
                tomorrow: {
                    high: Math.round(data.daily.temperature_2m_max[1]),
                    low: Math.round(data.daily.temperature_2m_min[1]),
                    code: data.daily.weather_code[1],
                },
            }
            console.log(JSON.stringify(weather))

            Pebble.sendAppMessage(
                {weather: JSON.stringify(weather)},
                () => console.log("Weather message sent"),
                error => console.log("Weather message failed: " + JSON.stringify(error))
            );
        } catch (error) {
            console.log("Weather parse error: " + error);
        }
    };

    request.onerror = function () {
        console.log("Weather request failed");
    };

    request.send();
}

function testWeather() {
    const weather = {
        asOf: new Date().getTime(),
        current: {
            temp: 70,
            code: 0,
        },
        hourlyTemps: [20, 30, 50, 80, 20, 30, 50, 80, 20, 30, 50, 80, 20, 30, 50, 80],
        hourlyCodes: [57, 67, 77, 99, 57, 67, 77, 99, 57, 67, 77, 99, 57, 67, 77, 99],
        tomorrow: {
            high: 90,
            low: 70,
            code: 48,
        },
    }

    Pebble.sendAppMessage(
        {weather: JSON.stringify(weather)},
        () => console.log("Weather message sent"),
        error => console.log("Weather message failed: " + JSON.stringify(error))
    );
}

Pebble.addEventListener("appmessage", function (event) {
    if (event.payload.weatherRequest) {
        getLocation()
    }
});

Pebble.addEventListener("ready", function () {
    setTimeout(() => {
        Pebble.sendAppMessage({ready: 1});
    }, 100)
});
