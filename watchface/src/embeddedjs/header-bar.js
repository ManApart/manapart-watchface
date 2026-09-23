import Battery from "embedded:sensor/Battery";
import {config, render} from "./main";

let batteryPercent = 100;
let isConnected = true;

const battery = new Battery({
    onSample() {
        const oldBat = batteryPercent
        batteryPercent = this.sample().percent;
        if (batteryPercent === oldBat) {
            return
        }
        const batColor = getBarColor(batteryPercent)
        if (getBarColor(oldBat) !== batColor) {
            console.log(`Battery Percent is ${batteryPercent}`)
            drawHeaderFull(new Date())
        } else {
            drawHeaderBattery()
        }
    }
});
batteryPercent = battery.sample().percent;

function checkConnection() {
    const oldConnect = isConnected
    isConnected = watch.connected.app;
    if (oldConnect === isConnected) {
        return
    }
    console.log(`Bluetooth is connected: ${isConnected}`)
    drawHeaderBluetooth(isConnected)
}

export function drawHeaderBluetooth(isConnected) {
    let barColor = getBarColor(batteryPercent);
    render.begin(0, 0, 20, config.heightHeader)
    render.fillRectangle(barColor, 0, 0, render.width, config.heightHeader);
    if (isConnected) {
        render.drawText("B", config.fontSmall, config.black, 5, 0);
    }
    render.end()
}

export function drawHeaderDate(now) {
    let barColor = getBarColor(batteryPercent);
    const date = now.getDate()
    const month = now.getMonth()
    const year = now.getFullYear().toString().slice(-2)
    const dateStr = `${month}/${date}/${year}`;
    let width = render.getTextWidth(dateStr, config.fontSmall);
    const start = render.width / 2 - 50
    render.begin(start, 0, 100, config.heightHeader)
    render.fillRectangle(barColor, start, 0, 100, config.heightHeader);
    render.drawText(dateStr, config.fontSmall, config.black, (render.width - width) / 2, 0);
    render.end()
}

export function drawHeaderBattery() {
    let barColor = getBarColor(batteryPercent);
    const barWidth = 40
    render.begin(render.width - barWidth, 0, barWidth, config.heightHeader)
    render.fillRectangle(barColor, render.width - barWidth, 0, barWidth, config.heightHeader);
    const batString = `${batteryPercent}%`
    let width = render.getTextWidth(batString, config.fontSmall);
    render.drawText(batString, config.fontSmall, config.black, render.width - width - 5, 0);
    render.end()
}

function drawHeaderFull(now) {
    render.begin(0, 0, render.width, config.heightHeader)
    render.fillRectangle(barColor, 0, 0, render.width, config.heightHeader);
    render.end()
    drawHeaderBluetooth(isConnected)
    drawHeaderBattery()
    drawHeaderDate(now)
}

export function getHeaderBarColor() {
    return getBarColor(batteryPercent)
}

function getBarColor(batteryPercent) {
    if (batteryPercent <= 20) {
        return config.red;
    } else if (batteryPercent <= 40) {
        return config.orange;
    } else if (batteryPercent <= 85) {
        return config.lightGray;
    } else {
        return config.green;
    }
}


watch.addEventListener("connected", checkConnection);
