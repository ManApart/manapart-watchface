import Battery from "embedded:sensor/Battery";

let batteryPercent = 100;
let isConnected = true;
let drawCallback;

export function setDrawCallback(callback) {
    drawCallback = callback
}

const battery = new Battery({
    onSample() {
        batteryPercent = this.sample().percent;
        console.log(`Battery Percent is ${batteryPercent}`)
        if (drawCallback) {
            drawCallback()
        }
    }
});
batteryPercent = battery.sample().percent;

function checkConnection() {
    isConnected = watch.connected.app;
    console.log(`Bluetooth is connected: ${isConnected}`)
    if (drawCallback) {
        drawCallback()
    }
}

export function drawHeader(render, now, config) {
    let barColor;
    if (batteryPercent <= 20) {
        barColor = config.red;
    } else if (batteryPercent <= 40) {
        barColor = config.orange;
    } else if (batteryPercent <= 85) {
        barColor = config.gray;
    } else {
        barColor = config.green;
    }

    render.fillRectangle(barColor, 0, 0, render.width, config.heightHeader);
    if (isConnected) {
        render.drawText("B", config.fontSmall, config.white, 5, 0);
    }
    const batString = `${batteryPercent}%`
    let width = render.getTextWidth(batString, config.fontSmall);
    render.drawText(batString, config.fontSmall, config.white, render.unobstructed.width - width - 5, 0);

    const date = now.getDate()
    const month = now.getMonth()
    const year = now.getFullYear().toString().slice(-2)
    const dateStr = `${month}/${date}/${year}`;
    width = render.getTextWidth(dateStr, config.fontSmall);
    render.drawText(dateStr, config.fontSmall, config.white, (render.unobstructed.width - width) / 2, 0);
}

watch.addEventListener("connected", checkConnection);
