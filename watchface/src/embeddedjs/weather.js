import Poco from "commodetto/Poco";
import Location from "embedded:sensor/Location";

const weatherIcon = new Poco.PebbleDrawCommandImage(1);

let weather = null;
let location = null;
let drawCallback;

export function setDrawCallback(callback) {
    drawCallback = callback
}

export function requestLocation() {
    location = new Location({
        onSample() {
            const sample = this.sample();
            console.log("Got location: " + sample.latitude + ", " + sample.longitude);
            this.close();
            fetchWeather(sample.latitude, sample.longitude);
        }
    });
}

export function drawWeather(render, config) {
    console.log('draw weather')
    // const weatherY = render.unobstructed.height - smallFont.height -
    //     (render.unobstructed.height < 180 ? 6 : 20);
    // if (weather) {
    //     const unit = settings.useFahrenheit ? "F" : "C";
    //     const weatherStr = `${weather.temp}°${unit} ${weather.conditions}`;
    //     const width = render.getTextWidth(weatherStr, smallFont);
    //     render.drawText(weatherStr, smallFont, textColor,
    //         (render.unobstructed.width - width) / 2, weatherY);
    //     render.drawDCI(weatherIcon, (render.unobstructed.width - width) / 2 + width + 5, weatherY - smallFont.height/2);
    // } else {
    //     const msg = "Loading...";
    //     const width = render.getTextWidth(msg, smallFont);
    //     render.drawText(msg, smallFont, textColor,
    //         (render.unobstructed.width - width) / 2, weatherY);
    // }
}

function drawCurrentWeather(render, config) {

}

function drawTomorrowWeather(render, config) {

}

function drawForecast(render, config) {

}

async function fetchWeather(latitude, longitude) {
    try {
        const params = {
            latitude,
            longitude,
            current: "temperature_2m,weather_code"
        };

        params.temperature_unit = "fahrenheit";

        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.search = new URLSearchParams(params);

        console.log("Fetching weather...");
        const response = await fetch(url);
        const data = await response.json();

        weather = {
            temp: Math.round(data.current.temperature_2m),
            conditions: getWeatherDescription(data.current.weather_code)
        };

        console.log("Weather: " + weather.temp + "C, " + weather.conditions);
        saveWeather();
        if (drawCallback) {
            drawCallback()
        }

    } catch (e) {
        console.log("Weather fetch error: " + e);
    }
}

function loadCachedWeather() {
    const cached = localStorage.getItem("weather");
    const cachedTime = localStorage.getItem("weatherTime");

    if (cached && cachedTime) {
        const age = Date.now() - Number(cachedTime);
        if (age < 60 * 60 * 1000) {
            try {
                weather = JSON.parse(cached);
                console.log("Using cached weather");
                return true;
            } catch (e) {
                console.log("Failed to parse cached weather");
            }
        }
    }
    return false;
}

function saveWeather() {
    if (weather) {
        localStorage.setItem("weather", JSON.stringify(weather));
        localStorage.setItem("weatherTime", String(Date.now()));
        console.log('Saved Weather')
    }
}

function getWeatherDescription(code) {
    if (code === 0) return "Clear";
    if (code <= 3) return "Cloudy";
    if (code <= 48) return "Fog";
    if (code <= 55) return "Drizzle";
    if (code <= 57) return "Fz. Drizzle";
    if (code <= 65) return "Rain";
    if (code <= 67) return "Fz. Rain";
    if (code <= 75) return "Snow";
    if (code <= 77) return "Snow Grains";
    if (code <= 82) return "Showers";
    if (code <= 86) return "Snow Shwrs";
    if (code === 95) return "T-Storm";
    if (code <= 99) return "T-Storm";
    return "Unknown";
}

loadCachedWeather();
