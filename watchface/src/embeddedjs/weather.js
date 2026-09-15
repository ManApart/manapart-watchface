import Message from "pebble/message";
import Poco from "commodetto/Poco";

const disableCache = true
const iconWidth = 50 * 0.7
let weather = null;
let drawCallback;

const message = new Message({
    input: 256,
    output: 256,
    keys: ["weather", "weather_request"],

    onReadable() {
        const values = this.read();
        if (values.has("weather")) {
            updateWeather(values.get("weather"));
        }
    },
});

export function setDrawCallback(callback) {
    drawCallback = callback
}

export function requestLocation() {
    try {
        message.write(new Map([
            ["weather_request", 1]
        ]));
    } catch (e) {
        console.log("Unable to request weather: " + String(e));
    }
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
        const weatherStr = `${weather.current.temp}°F`;
        startY += config.fontTiny.height
        render.drawDCI(getWeatherIcon(weather.current.code), (colWidth - iconWidth) / 2, startY);
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

async function updateWeather(data) {
    weather = JSON.parse(data)
    if (weather) {
        saveWeather();
    }
    if (drawCallback) {
        drawCallback()
    }
}

function loadCachedWeather() {
    const cached = localStorage.getItem("weather");
    const cachedTime = localStorage.getItem("weatherTime");

    if (!disableCache && cached && cachedTime) {
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

function getWeatherIcon(code) {
    if (code === 0) return new Poco.PebbleDrawCommandImage(7).clone().scale(0.7); // Sunny
    if (code <= 48) return new Poco.PebbleDrawCommandImage(6).clone().scale(0.7); // Cloudy
    if (code <= 57) return new Poco.PebbleDrawCommandImage(5).clone().scale(0.7); // Light Snow
    if (code <= 67) return new Poco.PebbleDrawCommandImage(4).clone().scale(0.7); // Light Rain
    if (code <= 75) return new Poco.PebbleDrawCommandImage(5).clone().scale(0.7); // Light Snow
    if (code <= 77) return new Poco.PebbleDrawCommandImage(3).clone().scale(0.7); // Heavy Snow
    if (code <= 82) return new Poco.PebbleDrawCommandImage(2).clone().scale(0.7); // Heavy Rain
    if (code <= 86) return new Poco.PebbleDrawCommandImage(3).clone().scale(0.7); // Heavy Snow
    if (code <= 99) return new Poco.PebbleDrawCommandImage(2).clone().scale(0.7); // Heavy Rain
    return new Poco.PebbleDrawCommandImage(1).clone().scale(0.7); //Generic
}

loadCachedWeather();
