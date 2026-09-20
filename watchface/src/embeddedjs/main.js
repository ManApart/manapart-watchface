import Poco from "commodetto/Poco";
import {drawHeaderFull} from "./header-bar"
import {drawWeather} from "./weather"

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
let lastDate = new Date();

function drawFull(event) {
    try {
        const now = event?.date ?? lastDate;
        if (event?.date) lastDate = event.date;

        render.begin();
        render.fillRectangle(config.gray, 0, 0, render.width, render.height);

        drawHeaderFull(render, now, config)
        drawDateNames(render, now)
        drawTime(render, now)
        drawWeather(render, config, now)

    } catch (e) {
        console.log("Full Draw failed: " + e)
    } finally {
        render.end();
    }
}

function drawDaily(event){
    try {
        const now = event?.date ?? lastDate;
        if (event?.date) lastDate = event.date;
        //TODO - only render this area
        render.begin();
        drawDateNames(render, now)
        //TODO - header date
        //TODO - forecast
    } catch (e) {
        console.log("Draw Time failed: " + e)
    } finally {
        render.end();
    }
}

function drawHourly(event){
    try {
        const now = event?.date ?? lastDate;
        if (event?.date) lastDate = event.date;
        //TODO - only render this area
        render.begin();
        //TODO - current, forecast
    } catch (e) {
        console.log("Draw Time failed: " + e)
    } finally {
        render.end();
    }
}

function drawMinutely(event) {
    try {
        const now = event?.date ?? lastDate;
        if (event?.date) lastDate = event.date;
        //TODO - only render this area
        render.begin();
        drawTime(render, now)
    } catch (e) {
        console.log("Draw Time failed: " + e)
    } finally {
        render.end();
    }
}

function drawTime(render, now) {
    const startY = config.heightRow + config.heightHeader + 4
    const timeY = (render.height + config.heightHeader - config.fontLarge.height) / 2;
    const boxHeight = render.height - config.heightHeader - (2 * config.heightRow) - 8

    render.drawRoundRect(2, startY, render.width - 4, boxHeight, config.white, 5);

    let hours = now.getHours() % 12 || 12;
    const hoursStr = String(hours).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeStr = `${hoursStr}:${minutes}`;

    let width = render.getTextWidth(timeStr, config.fontLarge);
    render.drawText(timeStr, config.fontLarge, config.black,
        (render.width - width) / 2, timeY);
}

function drawDateNames(render, now) {
    const dayName = DAYS[now.getDay()];
    const monthName = MONTHS[now.getMonth()];
    let width = render.getTextWidth(dayName, config.fontMedium);
    let height = config.fontMedium.height;
    render.drawText(dayName, config.fontMedium, config.white, (render.width - width) / 2, config.heightHeader + 2);
    width = render.getTextWidth(monthName, config.fontMedium);
    render.drawText(monthName, config.fontMedium, config.white, (render.width - width) / 2, config.heightHeader + 2 + height);
}


watch.addEventListener("minutechange", drawMinutely);
//TODO - think about caching / drawing if no request etc, requesting weather if it's been four hours etc
watch.addEventListener("hourchange", drawHourly);
watch.addEventListener("daychange", drawDaily);

