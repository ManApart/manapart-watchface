import {
    checkConnection,
    drawHeaderBattery,
    drawHeaderBluetooth,
    drawHeaderDate,
    getHeaderBarColor,
} from "./header-bar"
import {
    drawCurrentWeather,
    drawHourlyForecast,
    drawTomorrowWeather,
    getWeatherHourIndex,
    requestWeather, sendWeatherRequestIfPending, updateWeather,
} from "./weather";
import {config, render, state, log, withEndRender, isSleeping, updateSettings} from "./config";
import Message from "pebble/message";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const message = new Message({
    input: 256,
    output: 16,
    keys: ["ready", "weather", "weatherRequest", "timeText", "timeBackground"],

    onWritable() {
        state.messageWriteable = true;
        sendWeatherRequestIfPending();
    },
    onSuspend() {
        state.messageWriteable = false;
    },

    onReadable() {
        const values = this.read();
        console.log("received message")
        for (const [key, value] of values) {
            console.log("key=" + key + ", value=" + value);
        }

        if (values.has("weather")) {
            updateWeather(values.get("weather"));
        }
        if (values.has("timeText") || values.has("timeBackground")) {
            updateSettings(values)
            drawFull()
        }

    },
});

//TODO - don't do individual begins
function drawFull() {
    drawInitial()
    drawAll({now: state.lastDate})
}

export function drawAll(event) {
    drawDaily(event)
    drawHourly(event)
    drawMinutely(event)
}

function drawInitial() {
    withEndRender(() => {
        render.begin();
        render.fillRectangle(config.gray, 0, 0, render.width, render.height);
        render.fillRectangle(getHeaderBarColor(), 0, 0, render.width, config.heightHeader);
        const boxHeight = render.height - config.heightHeader - (2 * config.heightRow) - 8
        render.drawRoundRect(2, config.heightRow + config.heightHeader + 4, render.width - 4, boxHeight, config.timeBackground, 5);

        const timeY = (render.height + config.heightHeader - config.fontLarge.height) / 2;
        let width = render.getTextWidth(":", config.fontLarge);
        render.drawText(":", config.fontLarge, config.timeText, (render.width - width) / 2, timeY);
    })

    drawHeaderBattery()
    drawHeaderBluetooth()
}

function drawDaily(event) {
    const now = event?.date ?? state.lastDate;
    state.lastDate = now;
    if (isSleeping(now)) {
        state.wasSleeping = true
        return
    }
    drawDateNames(now)
    drawHeaderDate(now)
    drawTomorrowWeather()
}

function drawHourly(event) {
    const now = event?.date ?? state.lastDate;
    state.lastDate = now;
    if (isSleeping(now)) {
        state.wasSleeping = true
        return
    }
    drawHours(now)
    const weatherIndex = getWeatherHourIndex(now)
    if (weatherIndex >= 5 || weatherIndex < 0) {
        requestWeather()
        if (!watch.connected.app) {
            drawCurrentWeather(weatherIndex)
            drawHourlyForecast(weatherIndex, now)
        }
    } else {
        drawCurrentWeather(weatherIndex)
        drawHourlyForecast(weatherIndex, now)
    }
}

function drawMinutely(event) {
    const now = event?.date ?? state.lastDate;
    state.lastDate = now;
    if (isSleeping(now)) {
        state.wasSleeping = true
        return
    }
    drawMinutes(now)
}

function drawHours(now) {
    const {timeY, hoursStr, timeStr} = getTimeStrings(now)
    let fullWidth = render.getTextWidth(timeStr, config.fontLarge);
    let width = render.getTextWidth(hoursStr, config.fontLarge)
    let startX = (render.width - fullWidth) / 2
    withEndRender(() => {
        render.begin(startX, timeY, width, config.fontLarge.height)
        render.fillRectangle(config.timeBackground, startX, timeY, width, config.fontLarge.height)
        render.drawText(timeStr, config.fontLarge, config.timeText, startX, timeY);
    })
}

function drawMinutes(now) {
    const {timeY, hoursStr, minutes, timeStr} = getTimeStrings(now)
    let fullWidth = render.getTextWidth(timeStr, config.fontLarge);
    let width = render.getTextWidth(minutes, config.fontLarge)
    let startX = ((render.width - fullWidth) / 2) + render.getTextWidth(`${hoursStr}:`, config.fontLarge)
    withEndRender(() => {
        render.begin(startX, timeY, width, config.fontLarge.height)
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

function drawDateNames(now) {
    const colWidth = 65
    const dayName = DAYS[now.getDay()];
    const monthName = MONTHS[now.getMonth()];
    let width = render.getTextWidth(dayName, config.fontMedium);
    let height = config.fontMedium.height;
    withEndRender(() => {
        render.begin(colWidth + 1, config.heightHeader + 1, colWidth, config.heightRow)
        render.fillRectangle(config.gray, colWidth + 1, config.heightHeader + 1, colWidth, config.heightRow)
        render.drawText(dayName, config.fontMedium, config.white, (render.width - width) / 2, config.heightHeader + 2);
        width = render.getTextWidth(monthName, config.fontMedium);
        render.drawText(monthName, config.fontMedium, config.white, (render.width - width) / 2, config.heightHeader + 2 + height);
    })
}

drawInitial()
checkConnection()

watch.addEventListener("minutechange", drawMinutely);
watch.addEventListener("hourchange", drawHourly);
watch.addEventListener("daychange", drawDaily);
