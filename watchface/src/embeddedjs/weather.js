import Message from "pebble/message";
import Poco from "commodetto/Poco";

const disableCache = false
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
    const startY = config.heightHeader + 2
    const colWidth = 65
    const w = weather?.current
    if (w) {
        const color = getWeatherColor(w.temp, config)
        render.drawRoundRect(0, startY, colWidth, config.heighTopRow, color, 5);
        const weatherStr = `${w.temp}°F`;
        let y = startY + config.fontTiny.height
        render.drawDCI(getWeatherIcon(w.code), (colWidth - iconWidth) / 2, y);
        y += 30
        let width = render.getTextWidth(weatherStr, config.fontSmall);
        render.drawText(weatherStr, config.fontSmall, config.black, (colWidth - width) / 2, y);
    } else {
        render.drawRoundRect(0, startY, colWidth, config.heighTopRow, config.gray, 5);
        render.drawText("Loading...", config.fontSmall, config.black, 10, startY + config.fontTiny.height);
    }
    let width = render.getTextWidth("Today", config.fontTiny);
    render.drawText("Today", config.fontTiny, config.black, (colWidth - width) / 2, startY);
}

function drawTomorrowWeather(render, config) {
    const startY = config.heightHeader + 2
    const colWidth = 65
    const startX = render.unobstructed.width - colWidth
    const w = weather?.tomorrow
    if (w) {
        const color = getWeatherColor(w.high, config)
        render.drawRoundRect(startX, startY, colWidth, config.heighTopRow, color, 5);
        const weatherStr = `${w.low}°/${w.high}°`;
        let y = startY + config.fontTiny.height
        render.drawDCI(getWeatherIcon(w.code), startX + (colWidth - iconWidth) / 2, y);
        y += 30
        let width = render.getTextWidth(weatherStr, config.fontSmall);
        render.drawText(weatherStr, config.fontSmall, config.black, startX + (colWidth - width) / 2, y);
    }
    let width = render.getTextWidth("Tomorrow", config.fontTiny);
    render.drawText("Tomorrow", config.fontTiny, config.black, startX + (colWidth - width) / 2, startY);
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
    if (code === 0) return getIcon(7); // Sunny
    if (code <= 48) return getIcon(6); // Cloudy
    if (code <= 57) return getIcon(5); // Light Snow
    if (code <= 67) return getIcon(4); // Light Rain
    if (code <= 75) return getIcon(5); // Light Snow
    if (code <= 77) return getIcon(3); // Heavy Snow
    if (code <= 82) return getIcon(2); // Heavy Rain
    if (code <= 86) return getIcon(3); // Heavy Snow
    if (code <= 99) return getIcon(2); // Heavy Rain
    return getIcon(1); //Generic
}

function getIcon(i){
    return new Poco.PebbleDrawCommandImage(i).clone().scale(0.5);
}

loadCachedWeather();
