import Poco from "commodetto/Poco";
import {checkConnection, drawHeaderBattery, drawHeaderBluetooth, drawHeaderDate, getHeaderBarColor} from "./header-bar"
import {
    drawCurrentWeather,
    drawHourlyForecast,
    drawTomorrowWeather,
    getWeatherHourIndex,
    requestWeather,
} from "./weather";

const testing = false
export const render = new Poco(screen);
export const config = {
    black: render.makeColor(0, 0, 0),
    white: render.makeColor(255, 255, 255),
    lightGray: render.makeColor(170, 170, 170),
    gray: render.makeColor(85, 85, 85),
    green: render.makeColor(85, 255, 170),
    orange: render.makeColor(255, 170, 85),
    red: render.makeColor(255, 170, 170),
    blue: render.makeColor(85, 170, 255),
    fontLarge: new render.Font("Roboto-Bold", 49),
    fontMedium: new render.Font("Gothic-Regular", 28),
    fontSmall: new render.Font("Gothic-Regular", 18),
    fontTiny: new render.Font("Gothic-Regular", 14),
    heightHeader: 20,
    heightRow: 60,
}
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


export let lastDate = new Date();

//TODO - can we being in the sub things and just end in the finally? Can we end twice?
//TODO - do a render.end in catch but let the pieces do the begin and end naturally
function drawInitial() {
    try {
        render.begin();
        render.fillRectangle(config.gray, 0, 0, render.width, render.height);
        render.fillRectangle(getHeaderBarColor(), 0, 0, render.width, config.heightHeader);
        const boxHeight = render.height - config.heightHeader - (2 * config.heightRow) - 8
        render.drawRoundRect(2, config.heightRow + config.heightHeader + 4, render.width - 4, boxHeight, config.white, 5);
        render.end()
        drawHeaderBattery()
        drawHeaderBluetooth()
    } catch (e) {
        log("Draw initial failed: " + e)
        render.end();
    }
}

function drawDaily(event) {
    try {
        const now = event?.date ?? lastDate;
        lastDate = now;
        drawDateNames(now)
        drawHeaderDate(now)
        drawTomorrowWeather()
    } catch (e) {
        log("Draw daily failed: " + e)
        render.end();
    }
}

function drawHourly(event) {
    try {
        const now = event?.date ?? lastDate;
        lastDate = now;
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
    } catch (e) {
        log("Draw hourly failed: " + e)
        render.end();
    }
}

function drawMinutely(event) {
    try {
        const now = event?.date ?? lastDate;
        lastDate = now;
        drawTime(now)
    } catch (e) {
        log("Draw minutely failed: " + e)
    } finally {
    }
}

function drawTime(now) {
    const timeY = (render.height + config.heightHeader - config.fontLarge.height) / 2;
    let hours = now.getHours();
    if (watch.hour12) {
        hours = hours % 12 || 12;
    }
    const hoursStr = String(hours).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeStr = `${hoursStr}:${minutes}`;

    let width = render.getTextWidth(timeStr, config.fontLarge);
    render.begin((render.width - width) / 2, timeY, width, config.fontLarge.height)
    render.fillRectangle(config.white, (render.width - width) / 2, timeY, width, config.fontLarge.height)
    render.drawText(timeStr, config.fontLarge, config.black,
        (render.width - width) / 2, timeY);
    render.end()
}

function drawDateNames(now) {
    const colWidth = 65
    render.begin(colWidth + 1, config.heightHeader + 1, colWidth, config.heightRow)
    render.fillRectangle(config.gray, colWidth + 1, config.heightHeader + 1, colWidth, config.heightRow)
    const dayName = DAYS[now.getDay()];
    const monthName = MONTHS[now.getMonth()];
    let width = render.getTextWidth(dayName, config.fontMedium);
    let height = config.fontMedium.height;
    render.drawText(dayName, config.fontMedium, config.white, (render.width - width) / 2, config.heightHeader + 2);
    width = render.getTextWidth(monthName, config.fontMedium);
    render.drawText(monthName, config.fontMedium, config.white, (render.width - width) / 2, config.heightHeader + 2 + height);
    render.end()
}

export function log(message) {
    if (testing) console.log(message)
}

drawInitial()
checkConnection()

watch.addEventListener("minutechange", drawMinutely);
watch.addEventListener("hourchange", drawHourly);
watch.addEventListener("daychange", drawDaily);
