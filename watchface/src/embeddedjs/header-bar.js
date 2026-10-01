import Battery from "embedded:sensor/Battery";
import {drawAll} from "./main";
import {config, render, state, log, withEndRender} from "./config";

let batteryPercent = 100;

const battery = new Battery({
    onSample() {
        const oldBat = batteryPercent
        batteryPercent = this.sample().percent;
        if (batteryPercent === oldBat) {
            return
        }
        const batColor = getBarColor(batteryPercent)
        if (getBarColor(oldBat) !== batColor) {
            log(`Battery Percent is ${batteryPercent}`)
            drawHeaderFull(state.lastDate, batColor, true)
        } else {
            drawHeaderBattery(true)
        }
    }
});
batteryPercent = battery.sample().percent;

export function checkConnection() {
    const oldConnect = state.isConnected
    state.isConnected = watch.connected.app;
    if (oldConnect === state.isConnected) {
        return
    }
    log(`Bluetooth old: ${state.isConnected}, app: ${watch.connected.app}, pebblekit: ${watch.connected.pebblekit}`);
    drawHeaderBluetooth(true)
    if (state.isConnected && state.wasSleeping) {
        state.wasSleeping = false
        drawAll()
    }
}

export function drawHeaderBluetooth(ownRender) {
    let barColor = getBarColor(batteryPercent);
    withEndRender(0, 0, 20, config.heightHeader, ownRender, () => {
        render.fillRectangle(barColor, 0, 0, render.width, config.heightHeader);
        if (state.isConnected) {
            render.drawText("B", config.fontSmall, config.black, 5, 0);
        }
    })
}

export function drawHeaderDate(now, ownRender) {
    let barColor = getBarColor(batteryPercent);
    const date = now.getDate()
    const month = now.getMonth()
    const year = now.getFullYear().toString().slice(-2)
    const dateStr = `${month}/${date}/${year}`;
    let width = render.getTextWidth(dateStr, config.fontSmall);
    const start = render.width / 2 - 50
    withEndRender(start, 0, 100, config.heightHeader, ownRender, () => {
        render.fillRectangle(barColor, start, 0, 100, config.heightHeader);
        render.drawText(dateStr, config.fontSmall, config.black, (render.width - width) / 2, 0);
    })
}

export function drawHeaderBattery(ownRender) {
    let barColor = getBarColor(batteryPercent);
    const barWidth = 40
    withEndRender(render.width - barWidth, 0, barWidth, config.heightHeader, ownRender, () => {
        render.fillRectangle(barColor, render.width - barWidth, 0, barWidth, config.heightHeader);
        const batString = `${batteryPercent}%`
        let width = render.getTextWidth(batString, config.fontSmall);
        render.drawText(batString, config.fontSmall, config.black, render.width - width - 5, 0);
    })
}

function drawHeaderFull(now, batColor, ownRender) {
    withEndRender(0, 0, render.width, config.heightHeader, ownRender, () => {
        render.fillRectangle(batColor, 0, 0, render.width, config.heightHeader);
        drawHeaderBluetooth(false)
        drawHeaderBattery(false)
        drawHeaderDate(now, false)
    })
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
