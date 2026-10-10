import {
    drawHeaderBattery,
    drawHeaderBluetooth,
    drawHeaderDate, drawHeaderSleeping,
    getHeaderBarColor,
} from "./header-bar"
import {
    drawAsOf,
    drawCurrentWeather,
    drawHourlyForecast,
    drawTomorrowWeather,
    getWeatherHourIndex,
    requestWeather, sendWeatherRequestIfPending, updateWeather,
} from "./weather";
import {config, render, state, withEndRender, isSleeping, updateSettings, renderFull, log} from "./config";
import Message from "pebble/message";

const settings = ["timeText", "timeBackground", "nameText", "nameBackground", "normalWeather", "sleepModeEnabled", "useFahrenheit", "hotThresh", "warmThresh", "normalThresh"]

const message = new Message({
    input: 256,
    output: 16,
    keys: ["ready", "weather", "weatherRequest"].concat(settings),

    onWritable() {
        state.messageWriteable = true;
        sendWeatherRequestIfPending();
    },
    onSuspend() {
        state.messageWriteable = false;
    },

    onReadable() {
        const values = this.read();
        for (const [key, value] of values) {
            log("key=" + key + ", value=" + value);
        }

        if (values.has("weather")) {
            updateWeather(values.get("weather"));
        }
        if (settings.some(x => values.has(x))) {
            updateSettings(values)
            if (values.has("useFahrenheit")) requestWeather()
            drawAll()
        }
    },
});

export function checkConnection() {
    const oldConnect = state.isConnected
    state.isConnected = watch.connected.app;
    if (oldConnect === state.isConnected) {
        return
    }
    drawHeaderBluetooth(true)
    if (state.isConnected && state.wasSleeping) {
        state.wasSleeping = false
        state.lastDate = new Date()
        drawAll()
        const weatherIndex = getWeatherHourIndex(state.lastDate)
        if (weatherIndex >= 5 || weatherIndex < 0) {
            requestWeather()
        }
    }
}

export function drawAll() {
    const now = state.lastDate
    const weatherIndex = getWeatherHourIndex(now)
    render.begin()
    drawInitial(false)
    drawDateNames(now, false)
    drawHeaderDate(now, false)
    drawTomorrowWeather(false)
    drawHours(now, false)
    drawAsOf(false)
    drawCurrentWeather(weatherIndex, false)
    drawHourlyForecast(weatherIndex, now, false)
    drawMinutes(now, false)
    render.end()
}

function drawInitial(ownRender) {
    renderFull(ownRender, () => {
        render.fillRectangle(config.gray, 0, 0, render.width, render.height);
        render.fillRectangle(getHeaderBarColor(), 0, 0, render.width, config.heightHeader);
        const boxHeight = render.height - config.heightHeader - (2 * config.heightRow) - 8
        render.drawRoundRect(2, config.heightRow + config.heightHeader + 4, render.width - 4, boxHeight, config.timeBackground, 5);

        const timeY = (render.height + config.heightHeader - config.fontLarge.height) / 2;
        let width = render.getTextWidth(":", config.fontLarge);
        render.drawText(":", config.fontLarge, config.timeText, (render.width - width) / 2, timeY);
    })

    drawHeaderBattery(ownRender)
    drawHeaderBluetooth(ownRender)
}

function drawDaily(event) {
    const now = event?.date ?? state.lastDate;
    state.lastDate = now;
    if (isSleeping()) {
        drawHeaderSleeping(true)
        state.wasSleeping = true
        return
    }
    drawDateNames(now, true)
    drawHeaderDate(now, true)
    drawTomorrowWeather(true)
}

function drawHourly(event) {
    const now = event?.date ?? state.lastDate;
    state.lastDate = now;
    if (isSleeping()) {
        drawHeaderSleeping(true)
        state.wasSleeping = true
        return
    }
    drawHours(now, true)
    const weatherIndex = getWeatherHourIndex(now)
    if (weatherIndex >= 5 || weatherIndex < 0) {
        requestWeather()
    }
    drawAsOf(true)
    drawCurrentWeather(weatherIndex, true)
    drawHourlyForecast(weatherIndex, now, true)
}

function drawMinutely(event) {
    const now = event?.date ?? state.lastDate;
    state.lastDate = now;
    if (isSleeping()) {
        drawHeaderSleeping(true)
        state.wasSleeping = true
        return
    }
    const weatherIndex = getWeatherHourIndex(now)
    if (weatherIndex >= 5 || weatherIndex < 0) {
        requestWeather()
    }
    drawMinutes(now, true)
}

function drawHours(now, ownRender) {
    const {timeY, hoursStr, timeStr} = getTimeStrings(now)
    let fullWidth = render.getTextWidth(timeStr, config.fontLarge);
    let width = render.getTextWidth(hoursStr, config.fontLarge)
    let startX = (render.width - fullWidth) / 2
    withEndRender(startX, timeY, width, config.fontLarge.height, ownRender, () => {
        render.fillRectangle(config.timeBackground, startX, timeY, width, config.fontLarge.height)
        render.drawText(timeStr, config.fontLarge, config.timeText, startX, timeY);
    })
}

function drawMinutes(now, ownRender) {
    const {timeY, hoursStr, minutes, timeStr} = getTimeStrings(now)
    let fullWidth = render.getTextWidth(timeStr, config.fontLarge);
    let width = render.getTextWidth(minutes, config.fontLarge)
    let startX = ((render.width - fullWidth) / 2) + render.getTextWidth(`${hoursStr}:`, config.fontLarge)
    withEndRender(startX, timeY, width, config.fontLarge.height, ownRender, () => {
        render.fillRectangle(config.timeBackground, startX, timeY, width, config.fontLarge.height)
        render.drawText(minutes, config.fontLarge, config.timeText, startX, timeY);
    })
}

function getTimeStrings(now) {
    const timeY = (render.height + config.heightHeader - config.fontLarge.height) / 2;
    let hours = now.getHours();
    if (watch.hour12) {
        hours = hours % 12 || 12;
    }
    const hoursStr = String(hours).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeStr = `${hoursStr}:${minutes}`;
    return {timeY, hoursStr, minutes, timeStr}
}

function drawDateNames(now, ownRender) {
    const colWidth = 65
    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayName = DAYS[now.getDay()];
    const monthName = MONTHS[now.getMonth()];
    let width = render.getTextWidth(dayName, config.fontMedium);
    let height = config.fontMedium.height;
    withEndRender(colWidth + 3, config.heightHeader + 2, colWidth - 1, config.heightRow, ownRender, () => {
        render.drawRoundRect(colWidth + 3, config.heightHeader + 2, colWidth - 1, config.heightRow, config.nameBackground, 5)
        render.drawText(dayName, config.fontMedium, config.nameText, (render.width - width) / 2, config.heightHeader + 2);
        width = render.getTextWidth(monthName, config.fontMedium);
        render.drawText(monthName, config.fontMedium, config.nameText, (render.width - width) / 2, config.heightHeader + 2 + height);
    })
}

function resumeFocus(inFocus) {
    if (inFocus) drawAll()
}

drawInitial(true)
checkConnection()

watch.addEventListener("minutechange", drawMinutely);
watch.addEventListener("hourchange", drawHourly);
watch.addEventListener("daychange", drawDaily);
watch.addEventListener("connected", checkConnection);
watch.addEventListener("didFocus", resumeFocus);
