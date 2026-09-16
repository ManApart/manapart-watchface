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

export function drawWeather(render, config, now) {
    drawCurrentWeather(render, config)
    drawTomorrowWeather(render, config)
    drawForecast(render, config, now)
}

function drawCurrentWeather(render, config) {
    const startY = config.heightHeader + 2
    const startX = 2
    const colWidth = 65
    const w = weather?.current
    const color = getWeatherColor(w.temp, config)
    const fontColor = getWeatherFontColor(w.temp, config)
    if (w) {
        render.drawRoundRect(startX, startY, colWidth, config.heightRow, color, 5);
        let y = startY + config.fontTiny.height
        render.drawDCI(getWeatherIcon(w.code), (colWidth - iconWidth) / 2, y);
        y += 28
        const weatherStr = `${w.temp}°F`;
        let width = render.getTextWidth(weatherStr, config.fontSmall);
        render.drawText(weatherStr, config.fontSmall, fontColor, (colWidth - width) / 2, y);
    } else {
        render.drawRoundRect(startX, startY, colWidth, config.heightRow, config.gray, 5);
        render.drawText("Loading...", config.fontSmall, fontColor, 10, startY + config.fontTiny.height);
    }
    let width = render.getTextWidth("Today", config.fontTiny);
    render.drawText("Today", config.fontTiny, fontColor, (colWidth - width) / 2, startY);
}

function drawTomorrowWeather(render, config) {
    const startY = config.heightHeader + 2
    const colWidth = 65
    const startX = render.width - colWidth - 2
    const w = weather?.tomorrow
    const color = getWeatherColor(w.high, config)
    const fontColor = getWeatherFontColor(w.high, config)
    if (w) {
        render.drawRoundRect(startX, startY, colWidth, config.heightRow, color, 5);

        let width = render.getTextWidth("Tomorrow", config.fontTiny);
        render.drawText("Tomorrow", config.fontTiny, fontColor, startX + (colWidth - width) / 2, startY);

        let y = startY + config.fontTiny.height
        render.drawDCI(getWeatherIcon(w.code), startX + (colWidth - iconWidth) / 2, y);

        y += 28
        const weatherStr = `${w.low}°/${w.high}°`;
        width = render.getTextWidth(weatherStr, config.fontSmall);
        render.drawText(weatherStr, config.fontSmall, fontColor, startX + (colWidth - width) / 2, y);
    }
}

function drawForecast(render, config, now) {
    if (weather) {
        const currentHour = now.getHours()
        for (let i = 0; i < 4; i++) {
            const hour = currentHour + i + 1
            const temp = weather.hourlyTemps[hour]
            const code = weather.hourlyCodes[hour]
            if (temp === undefined || code === undefined) {
                return;
            }
            drawForecastSlot(render, config, i, currentHour, hour, temp, code)
        }
    }
}

function drawForecastSlot(render, config, i, currentHour, hour, temp, code) {
    const colWidth = 48
    const startY = render.height - config.heightRow - 2;
    const startX = 1 + (colWidth + 2) * i

    const color = getWeatherColor(temp, config)
    const fontColor = getWeatherFontColor(temp, config)
    render.drawRoundRect(startX, startY, colWidth, config.heightRow, color, 5);

    let pm = "pm"
    if (hour < 12) {
        pm = "am"
    }
    const hourDisplay = `${hour % 12 || 12}${pm}`;
    let width = render.getTextWidth(hourDisplay, config.fontTiny);
    render.drawText(hourDisplay, config.fontTiny, fontColor, startX + (colWidth - width) / 2, startY);

    let y = startY + config.fontTiny.height
    render.drawDCI(getWeatherIcon(code), startX + (colWidth - iconWidth) / 2, y);
    y += 28
    const weatherStr = `${temp}°`;
    width = render.getTextWidth(weatherStr, config.fontSmall);
    render.drawText(weatherStr, config.fontSmall, fontColor, startX + (colWidth - width) / 2, y);

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

function getWeatherFontColor(temp, config) {
    let color;
    if (temp >= 90) {
        color = config.black;
    } else if (temp >= 80) {
        color = config.black;
    } else if (temp >= 30) {
        color = config.white;
    } else {
        color = config.black;
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

function getWeatherIcon(code, scale = 0.5) {
    if (code === 0) return getIcon(7, scale); // Sunny
    if (code <= 48) return getIcon(6, scale); // Cloudy
    if (code <= 57) return getIcon(5, scale); // Light Snow
    if (code <= 67) return getIcon(4, scale); // Light Rain
    if (code <= 75) return getIcon(5, scale); // Light Snow
    if (code <= 77) return getIcon(3, scale); // Heavy Snow
    if (code <= 82) return getIcon(2, scale); // Heavy Rain
    if (code <= 86) return getIcon(3, scale); // Heavy Snow
    if (code <= 99) return getIcon(2, scale); // Heavy Rain
    return getIcon(1); //Generic
}

function getIcon(i, scale) {
    return new Poco.PebbleDrawCommandImage(i).clone().scale(scale);
}

loadCachedWeather();
