import Poco from "commodetto/Poco";
import Location from "embedded:sensor/Location";
import Message from "pebble/message";
import {drawHeader, setDrawCallback as headerCallback} from "./header-bar"

console.log('starting')

let render = new Poco(screen);

const config = {
    black: render.makeColor(0, 0, 0),
    white: render.makeColor(255, 255, 255),
    gray: render.makeColor(100, 100, 100),
    green: render.makeColor(0, 170, 0),
    yellow: render.makeColor(255, 170, 0),
    red: render.makeColor(255, 0, 0),
    blue: render.makeColor(0, 0, 255),
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    timeFont: new render.Font("Bitham-Black", 30),
    smallFont: new render.Font("Gothic-Regular", 18),
}


let lastDate = new Date();


function draw(event) {
    const now = event?.date ?? lastDate;
    if (event?.date) lastDate = event.date;

    render.begin();
    render.fillRectangle(config.white, 0, 0, render.width, render.height);

    // drawBluetooth(render)
    drawHeader(render, now, config)
    drawTime(render, now)
    // drawWeather(render)

    render.end();
}

function drawTime(render, now) {
    const blockHeight = config.timeFont.height;
    const timeY = (render.unobstructed.height - blockHeight) / 2;

    let hours = now.getHours() % 12 || 12;
    const hoursStr = String(hours).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeStr = `${hoursStr}:${minutes}`;

    let width = render.getTextWidth(timeStr, config.timeFont);
    render.drawText(timeStr, config.timeFont, config.black,
        (render.unobstructed.width - width) / 2, timeY);
}


watch.addEventListener("minutechange", draw);
// watch.addEventListener("hourchange", requestLocation);
watch.addEventListener("resize", draw);

headerCallback(draw)
