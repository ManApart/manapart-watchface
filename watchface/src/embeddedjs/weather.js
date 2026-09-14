import Poco from "commodetto/Poco";
import Location from "embedded:sensor/Location";

const weatherGeneric = new Poco.PebbleDrawCommandImage(1).clone().scale(0.7);
const weatherHeavyRain = new Poco.PebbleDrawCommandImage(2).clone().scale(0.7);
const weatherHeavySnow = new Poco.PebbleDrawCommandImage(3).clone().scale(0.7);
const weatherLightRain = new Poco.PebbleDrawCommandImage(4).clone().scale(0.7);
const weatherLightSnow = new Poco.PebbleDrawCommandImage(5).clone().scale(0.7);
const weatherPartlyCloudy = new Poco.PebbleDrawCommandImage(6).clone().scale(0.7);
const weatherSunnyDay = new Poco.PebbleDrawCommandImage(7).clone().scale(0.7);
const iconWidth = 50 * 0.7

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
    drawCurrentWeather(render, config)
    drawTomorrowWeather(render, config)
    drawForecast(render, config)
}

function drawCurrentWeather(render, config) {
    let startY = config.heightHeader + 2
    const colWidth = 65
    const color = getWeatherColor(50, config)
    render.drawRoundRect(0, startY, colWidth, config.heighTopRow, color, 5);
    let width = render.getTextWidth("Today", config.fontTiny);
    render.drawText("Today", config.fontTiny, config.black, (colWidth - width) / 2, startY);
    if (weather) {
        const weatherStr = `${weather.temp}°F`;
        startY += config.fontTiny.height
        render.drawDCI(weather.icon, (colWidth - iconWidth) / 2, startY);
        startY += 30
        width = render.getTextWidth(weatherStr, config.fontSmall);
        render.drawText(weatherStr, config.fontSmall, config.black, (colWidth - width) / 2, startY);
    } else {
        render.drawText("Loading...", config.fontSmall, config.black, 10, startY + config.fontTiny.height);
    }
}

function drawTomorrowWeather(render, config) {

}

function drawForecast(render, config) {

}

function getWeatherColor(temp, config) {
    let color;
    if (temp >= 90) {
        color = config.red;
    } else if (temp >= 80) {
        color = config.orange;
    } else if (temp >= 30) {
        color = config.gray;
    } else {
        color = config.blue;
    }
    return color;
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
        const response = await fetch(url.toString());

        console.log("HTTP status: " + response.status);
        console.log("Content-Type: " + response.headers.get("content-type"));

        const body = await response.text();
        console.log("Response body: " + body);

        const data = JSON.parse(body);

        weather = {
            temp: Math.round(data.current.temperature_2m),
            conditions: getWeatherDescription(data.current.weather_code),
            icon: getWeatherIcon(data.current.weather_code),
        };

        console.log("Weather: " + weather.temp + "C, " + weather.conditions);
        saveWeather();
        if (drawCallback) {
            drawCallback()
        }

    } catch (e) {
        console.log("Weather fetch error: " + String(e));
        if (e.stack) console.log(e.stack);
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

function getWeatherIcon(code) {
    if (code === 0) return weatherSunnyDay;
    if (code <= 3) return weatherPartlyCloudy;
    if (code <= 48) return weatherPartlyCloudy;
    if (code <= 55) return weatherLightSnow;
    if (code <= 57) return weatherLightSnow;
    if (code <= 65) return weatherLightRain;
    if (code <= 67) return weatherLightRain;
    if (code <= 75) return weatherLightSnow;
    if (code <= 77) return weatherHeavySnow;
    if (code <= 82) return weatherHeavyRain;
    if (code <= 86) return weatherHeavySnow;
    if (code === 95) return weatherHeavyRain;
    if (code <= 99) return weatherHeavyRain;
    return weatherGeneric;
}

loadCachedWeather();
