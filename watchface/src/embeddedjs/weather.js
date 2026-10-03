import Poco from "commodetto/Poco";
import {message} from "./main";
import {render, config, state, log, withEndRender, getUnit} from "./config";

const iconWidth = 50 * 0.7
let weather = null;
let weatherRequestPending = false;

export function requestWeather() {
    weatherRequestPending = true
    sendWeatherRequestIfPending()
}

export function sendWeatherRequestIfPending() {
    // log(`Pending: ${weatherRequestPending}, writable: ${messageWriteable}, connected: ${watch.connected.pebblekit}, decision: ${weatherRequestPending && messageWriteable && watch.connected.pebblekit}`)
    if (!weatherRequestPending || !state.messageWriteable || !watch.connected.pebblekit) {
        return;
    }
    try {
        log("Sending weather request")
        message.write(new Map([
            ["weatherRequest", 1]
        ]));
        weatherRequestPending = false;
    } catch (e) {
        state.messageWriteable = false;
        log("Unable to request weather: " + String(e));
    }
}

export function getWeatherHourIndex(now) {
    if (weather?.asOf !== undefined) {
        const start = new Date(weather.asOf)
        if (isNaN(start.getTime())) return -1;
        start.setMinutes(0,0,0)

        const ageHours = (now.getTime() - start.getTime()) / (60 * 60 * 1000);
        return Math.floor(ageHours);
    } else {
        return -1;
    }
}

export function drawAsOf(ownRender) {
    let asOf = "No Data"
    if (weather?.asOf !== undefined) {
        const d = new Date(weather.asOf)
        let hours = d.getHours()
        let am = ""
        if (watch.hour12) {
            am = " am"
            if (hours > 12){
                am = " pm"
            }
            hours = hours % 12 || 12;
        }
        asOf = `As of ${hours}:${String(d.getMinutes()).padStart(2, "0")}${am}`;
    }
    const width = render.getTextWidth(asOf, config.fontTiny)
    const startX = (render.width - width) / 2
    const startY = render.height - config.heightRow - 4 - config.fontTiny.height;
    withEndRender(startX, startY, width, config.heightRow, ownRender, () => {
        render.fillRectangle(config.timeBackground, startX, startY, width, config.fontTiny.height)
        render.drawText(asOf, config.fontTiny, config.timeText, startX, startY);
    })
}

export function drawCurrentWeather(hourIndex, ownRender) {
    const startY = config.heightHeader + 2
    const startX = 2
    const colWidth = 65
    withEndRender(startX, startY, colWidth, config.heightRow, ownRender, () => {
        if (weather) {
            let temp = weather.current.temp
            let code = weather.current.code
            if (hourIndex > 0) {
                temp = weather.hourlyTemps[hourIndex] ?? weather.hourlyTemps.slice(-1)[0]
                code = weather.hourlyCodes[hourIndex] ?? weather.hourlyCodes.slice(-1)[0]
            }
            const color = getWeatherColor(temp, config)
            render.drawRoundRect(startX, startY, colWidth, config.heightRow, color, 5);
            let y = startY + config.fontTiny.height
            render.drawDCI(getWeatherIcon(code), (colWidth - iconWidth) / 2, y);
            y += 28
            const weatherStr = `${temp}°${getUnit()}`;
            let width = render.getTextWidth(weatherStr, config.fontSmall);
            render.drawText(weatherStr, config.fontSmall, config.black, (colWidth - width) / 2, y);
        } else {
            render.drawRoundRect(startX, startY, colWidth, config.heightRow, config.lightGray, 5);
            render.drawText("No Data", config.fontSmall, config.black, 10, startY + config.fontTiny.height);
        }
        let width = render.getTextWidth("Now", config.fontTiny);
        render.drawText("Now", config.fontTiny, config.black, (colWidth - width) / 2, startY);
    })
}

export function drawTomorrowWeather(ownRender) {
    const startY = config.heightHeader + 2
    const colWidth = 65
    const startX = render.width - colWidth - 2
    const w = weather?.tomorrow
    if (w) {
        withEndRender(startX, startY, colWidth, config.heightRow, ownRender, () => {
            const color = getWeatherColor(w.high, config)
            render.drawRoundRect(startX, startY, colWidth, config.heightRow, color, 5);

            let width = render.getTextWidth("Tomorrow", config.fontTiny);
            render.drawText("Tomorrow", config.fontTiny, config.black, startX + (colWidth - width) / 2, startY);

            let y = startY + config.fontTiny.height
            render.drawDCI(getWeatherIcon(w.code), startX + (colWidth - iconWidth) / 2, y);

            y += 28
            const weatherStr = `${w.low}°/${w.high}°`;
            width = render.getTextWidth(weatherStr, config.fontSmall);
            render.drawText(weatherStr, config.fontSmall, config.black, startX + (colWidth - width) / 2, y);
        })
    }
}

export function drawHourlyForecast(hourIndex, now, ownRender) {
    if (weather) {
        withEndRender(1, render.height - config.heightRow - 2, render.width, config.heightRow, ownRender, () => {
            const currentHour = now.getHours() + 1
            for (let i = 0; i < 4; i++) {
                const hour = hourIndex + i + 1
                const temp = weather.hourlyTemps[hour]
                const code = weather.hourlyCodes[hour]
                const forecastHour = currentHour + i
                drawForecastSlot(render, config, i, forecastHour, temp, code)
            }
        })
    }
}

function drawForecastSlot(render, config, i, forecastHour, temp, code) {
    const colWidth = 48
    const startY = render.height - config.heightRow - 2;
    const startX = 1 + (colWidth + 2) * i

    const color = getWeatherColor(temp, config)
    render.drawRoundRect(startX, startY, colWidth, config.heightRow, color, 5);

    let pm = "pm"
    if (forecastHour < 12) {
        pm = "am"
    }
    const hourDisplay = `${forecastHour % 12 || 12}${pm}`;
    let width = render.getTextWidth(hourDisplay, config.fontTiny);
    render.drawText(hourDisplay, config.fontTiny, config.black, startX + (colWidth - width) / 2, startY);

    if (temp !== undefined && code !== undefined) {
        let y = startY + config.fontTiny.height
        render.drawDCI(getWeatherIcon(code), startX + (colWidth - iconWidth) / 2, y);
        y += 28
        const weatherStr = `${temp}°`;
        width = render.getTextWidth(weatherStr, config.fontSmall);
        render.drawText(weatherStr, config.fontSmall, config.black, startX + (colWidth - width) / 2, y);
    }
}

function getWeatherColor(temp, config) {
    let color;
    if (temp >= config.hotThresh) {
        color = config.red;
    } else if (temp >= config.warmThresh) {
        color = config.orange;
    } else if (temp >= config.normalThresh) {
        color = config.normalWeather;
    } else {
        color = config.blue;
    }
    return color;
}

export function updateWeather(data) {
    log("Got weather")
    weather = JSON.parse(data)
    if (weather) {
        saveWeather(data);
        const now = state.lastDate
        const weatherIndex = getWeatherHourIndex(now)
        drawCurrentWeather(weatherIndex, true)
        drawHourlyForecast(weatherIndex, now, true)
        drawTomorrowWeather(true)
        drawAsOf(true)
    }
}

function loadCachedWeather() {
    const cached = localStorage.getItem("weather");
    if (cached) {
        try {
            weather = JSON.parse(cached);
            console.log("Using cached weather");
            return true;
        } catch (e) {
            console.log("Failed to parse cached weather");
            return false;
        }
    }
    console.log('no weather cached')
    return false;
}

function saveWeather(data) {
    localStorage.setItem("weather", data);
    log('Saved Weather')
}

const weatherIcons = {
    partlyCloudy: getIcon(1),
    heavyRain: getIcon(2),
    heavySnow: getIcon(3),
    lightRain: getIcon(4),
    lightSnow: getIcon(5),
    cloudy: getIcon(6),
    sunny: getIcon(7),
}

function getWeatherIcon(code) {
    if (code === 0) return weatherIcons.sunny;
    if (code <= 3) return weatherIcons.cloudy;
    if (code <= 48) return weatherIcons.lightRain;
    if (code <= 55) return weatherIcons.lightRain;
    if (code <= 57) return weatherIcons.lightSnow;
    if (code <= 65) return weatherIcons.lightRain;
    if (code <= 67) return weatherIcons.lightSnow;
    if (code <= 75) return weatherIcons.lightSnow;
    if (code <= 77) return weatherIcons.lightSnow;
    if (code <= 82) return weatherIcons.heavyRain;
    if (code <= 86) return weatherIcons.heavySnow;
    if (code === 95) return weatherIcons.heavyRain;
    if (code <= 99) return weatherIcons.heavyRain;
    return weatherIcons.partlyCloudy;
}

function getIcon(i) {
    return new Poco.PebbleDrawCommandImage(i);
}

loadCachedWeather();
