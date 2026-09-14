import Poco from "commodetto/Poco";
import Message from "pebble/message";
import {drawHeader, setDrawCallback as headerCallback} from "./header-bar"
import {drawWeather, requestLocation, setDrawCallback as weatherCallback} from "./weather"

let render = new Poco(screen);

const config = {
    black: render.makeColor(0, 0, 0),
    white: render.makeColor(255, 255, 255),
    gray: render.makeColor(161, 161, 161),
    green: render.makeColor(0, 170, 0),
    orange: render.makeColor(255, 170, 0),
    red: render.makeColor(255, 0, 0),
    blue: render.makeColor(0, 0, 255),
    fontLarge: new render.Font("Leco-Bold", 38),
    fontMedium: new render.Font("Gothic-Regular", 28),
    fontSmall: new render.Font("Gothic-Regular", 18),
    fontTiny: new render.Font("Gothic-Regular", 14),
    heightHeader: 20,
    heighTopRow: 65,
}
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let lastDate = new Date();

function draw(event) {
    const now = event?.date ?? lastDate;
    if (event?.date) lastDate = event.date;

    render.begin();
    render.fillRectangle(config.white, 0, 0, render.width, render.height);

    drawHeader(render, now, config)
    drawDateNames(render, now)
    drawTime(render, now)
    drawWeather(render, config)

    render.end();
}

function drawTime(render, now) {
    const blockHeight = config.fontLarge.height;
    const timeY = (render.unobstructed.height - blockHeight) / 2;

    let hours = now.getHours() % 12 || 12;
    const hoursStr = String(hours).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeStr = `${hoursStr}:${minutes}`;

    let width = render.getTextWidth(timeStr, config.fontLarge);
    render.drawText(timeStr, config.fontLarge, config.black,
        (render.unobstructed.width - width) / 2, timeY);
}

function drawDateNames(render, now) {
    const dayName = DAYS[now.getDay()];
    const monthName = MONTHS[now.getMonth()];
    let width = render.getTextWidth(dayName, config.fontMedium);
    let height = config.fontMedium.height;
    render.drawText(dayName, config.fontMedium, config.black, (render.unobstructed.width - width) / 2, config.heightHeader + 2);
    width = render.getTextWidth(monthName, config.fontMedium);
    render.drawText(monthName, config.fontMedium, config.black, (render.unobstructed.width - width) / 2, config.heightHeader + 2 + height);
}


watch.addEventListener("minutechange", draw);
watch.addEventListener("hourchange", requestLocation);
watch.addEventListener("resize", draw);

headerCallback(draw)
weatherCallback(draw)
