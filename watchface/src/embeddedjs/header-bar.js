import Battery from "embedded:sensor/Battery";

let batteryPercent = 100;
let isConnected = true;
let drawCallback;

export function setDrawCallback(callback){
    drawCallback = callback
}

const battery = new Battery({
    onSample() {
        batteryPercent = this.sample().percent;
        console.log(`Battery Percent is ${batteryPercent}`)
        if (drawCallback){
            drawCallback()
        }
    }
});
batteryPercent = battery.sample().percent;

function checkConnection() {
    isConnected = watch.connected.app;
    console.log(`Bluetooth is connected: ${isConnected}`)
    if (drawCallback){
        drawCallback()
    }
}

export function drawHeader(render, now, colors) {
    let barColor;
    if (batteryPercent <= 20) {
        barColor = colors.red;
    } else if (batteryPercent <= 40) {
        barColor = colors.yellow;
    } else if (batteryPercent <= 90) {
        barColor = colors.gray;
    } else {
        barColor = colors.green;
    }

    render.fillRectangle(barColor, 0, 0, render.width, 20);
}

watch.addEventListener("connected", checkConnection);
