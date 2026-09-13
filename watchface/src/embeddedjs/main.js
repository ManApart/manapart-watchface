import Poco from "commodetto/Poco";
import Battery from "embedded:sensor/Battery";
import Location from "embedded:sensor/Location";
import Message from "pebble/message";
import drawHeader from "./header-bar"

console.log('starting')

let render = new Poco(screen);

const colors = {
    black: render.makeColor(0, 0, 0),
    white: render.makeColor(255, 255, 255),
    gray: render.makeColor(100, 100, 100),
    green: render.makeColor(0, 170, 0),
    yellow: render.makeColor(255, 170, 0),
    red: render.makeColor(255, 0, 0),
    blue: render.makeColor(0, 0, 255),
}


export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const timeFont = new render.Font("Bitham-Black", 30);

let batteryPercent = 100;
let isConnected = true;
let lastDate = new Date();

const battery = new Battery({
    onSample() {
        batteryPercent = this.sample().percent;
        console.log(`Battery Percent is ${batteryPercent}`)
        draw();
    }
});
batteryPercent = battery.sample().percent;


function draw(event) {
    const now = event?.date ?? lastDate;
    if (event?.date) lastDate = event.date;

    render.begin();
    render.fillRectangle(colors.white, 0, 0, render.width, render.height);

    // drawBatteryBar(render)
    // drawBluetooth(render)
    drawHeader(render, now, colors)
    drawTime(render, now)
    // drawWeather(render)

    render.end();
}

function drawTime(render, now) {
    const blockHeight = timeFont.height;
    const timeY = (render.unobstructed.height - blockHeight) / 2;

    let hours = now.getHours() % 12 || 12;
    const hoursStr = String(hours).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeStr = `${hoursStr}:${minutes}`;

    let width = render.getTextWidth(timeStr, timeFont);
    render.drawText(timeStr, timeFont, colors.black,
        (render.unobstructed.width - width) / 2, timeY);
}


// watch.addEventListener("connected", checkConnection);
watch.addEventListener("minutechange", draw);
// watch.addEventListener("hourchange", requestLocation);
watch.addEventListener("resize", draw);
