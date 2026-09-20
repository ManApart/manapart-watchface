import Message from "pebble/message";
import Poco from "commodetto/Poco";

const disableCache = false
const iconWidth = 50 * 0.7
let weather = null;
let drawCallback;

const message = new Message({
    input: 256,
    output: 256,
    keys: ["weather", "weather_request"],

    onReadable() {
        const values = this.read();
        if (values.has("weather")) {
            updateWeather(values.get("weather"));
        }
    },
});

export function requestWeather() {
    try {
        message.write(new Map([
            ["weather_request", 1]
        ]));
    } catch (e) {
        console.log("Unable to request weather: " + String(e));
    }
}

//TODO -update current and possibly future based on stale time
export function drawWeather(render, config, now) {
    let hourIndex = 0
    if (weather?.current) {
        let hour = now.getHours()
        if (hour < weather?.current?.asOf) {
            hour += 12
        }
        hourIndex = hour - (weather?.current?.asOf ?? hour)
        console.log('asof ' + weather?.current?.asOf)
        console.log('hour ' + hour)
        console.log('hourIndex' + hourIndex)
    }
    drawCurrentWeather(render, config, hourIndex)
    drawTomorrowWeather(render, config, hourIndex)
    drawForecast(render, config, hourIndex, now)
}

function drawCurrentWeather(render, config, hourIndex) {
    const startY = config.heightHeader + 2
    const startX = 2
    const colWidth = 65
    if (weather) {
        let temp = weather.current.temp
        let code = weather.current.code
        if (hourIndex !== 0) {
            temp = weather.hourlyTemps[hourIndex] ?? weather.hourlyTemps.slice(-1)[0]
            code = weather.hourlyCodes[hourIndex] ?? weather.hourlyCodes.slice(-1)[0]
        }
        const color = getWeatherColor(temp, config)
        render.drawRoundRect(startX, startY, colWidth, config.heightRow, color, 5);
        let y = startY + config.fontTiny.height
        render.drawDCI(getWeatherIcon(code), (colWidth - iconWidth) / 2, y);
        y += 28
        const weatherStr = `${temp}°F`;
        let width = render.getTextWidth(weatherStr, config.fontSmall);
        render.drawText(weatherStr, config.fontSmall, config.black, (colWidth - width) / 2, y);
    } else {
        render.drawRoundRect(startX, startY, colWidth, config.heightRow, config.lightGray, 5);
        render.drawText("No Data", config.fontSmall, config.black, 10, startY + config.fontTiny.height);
    }
    let width = render.getTextWidth("Today", config.fontTiny);
    render.drawText("Today", config.fontTiny, config.black, (colWidth - width) / 2, startY);
}

function drawTomorrowWeather(render, config, hourIndex) {
    const startY = config.heightHeader + 2
    const colWidth = 65
    const startX = render.width - colWidth - 2
    const w = weather?.tomorrow
    if (w) {
        const color = getWeatherColor(w.high, config)
        render.drawRoundRect(startX, startY, colWidth, config.heightRow, color, 5);

        let width = render.getTextWidth("Tomorrow", config.fontTiny);
        render.drawText("Tomorrow", config.fontTiny, config.black, startX + (colWidth - width) / 2, startY);

        let y = startY + config.fontTiny.height
        render.drawDCI(getWeatherIcon(w.code), startX + (colWidth - iconWidth) / 2, y);

        y += 28
        const weatherStr = `${w.low}°/${w.high}°`;
        width = render.getTextWidth(weatherStr, config.fontSmall);
        render.drawText(weatherStr, config.fontSmall, config.black, startX + (colWidth - width) / 2, y);
    }
}

function drawForecast(render, config, hourIndex, now) {
    if (weather) {
        const currentHour = now.getHours() + 1
        for (let i = 0; i < 4; i++) {
            const hour = hourIndex + i + 1
            const temp = weather.hourlyTemps[hour]
            const code = weather.hourlyCodes[hour]
            if (temp === undefined || code === undefined) {
                console.log(`Failed hour ${i} with ${temp} and ${code}`)
                return;
            }
            const forecastHour = currentHour + i
            drawForecastSlot(render, config, i, forecastHour, temp, code)
        }
    }
}

function drawForecastSlot(render, config, i, forecastHour, temp, code) {
    const colWidth = 48
    const startY = render.height - config.heightRow - 2;
    const startX = 1 + (colWidth + 2) * i

    const color = getWeatherColor(temp, config)
    render.drawRoundRect(startX, startY, colWidth, config.heightRow, color, 5);

    let pm = "pm"
    if (forecastHour < 12) {
        pm = "am"
    }
    const hourDisplay = `${forecastHour % 12 || 12}${pm}`;
    let width = render.getTextWidth(hourDisplay, config.fontTiny);
    render.drawText(hourDisplay, config.fontTiny, config.black, startX + (colWidth - width) / 2, startY);

    let y = startY + config.fontTiny.height
    render.drawDCI(getWeatherIcon(code), startX + (colWidth - iconWidth) / 2, y);
    y += 28
    const weatherStr = `${temp}°`;
    width = render.getTextWidth(weatherStr, config.fontSmall);
    render.drawText(weatherStr, config.fontSmall, config.black, startX + (colWidth - width) / 2, y);

}

function getWeatherColor(temp, config) {
    let color;
    if (temp >= 90) {
        color = config.red;
    } else if (temp >= 80) {
        color = config.orange;
    } else if (temp >= 30) {
        color = config.lightGray;
    } else {
        color = config.blue;
    }
    return color;
}

async function updateWeather(data) {
    weather = JSON.parse(data)
    if (weather) {
        saveWeather();
    }
    if (drawCallback) {
        drawCallback()
    }
}

function loadCachedWeather() {
    const cached = localStorage.getItem("weather");
    const cachedTime = localStorage.getItem("weatherTime");

    if (!disableCache && cached && cachedTime) {
        const age = Date.now() - Number(cachedTime);
        if (age < 60 * 60 * 1000) {
            try {
                weather = JSON.parse(cached);
                console.log("Using cached weather");
                return true;
            } catch (e) {
                console.log("Failed to parse cached weather");
            }
        }
    }
    return false;
}

function saveWeather() {
    if (weather) {
        localStorage.setItem("weather", JSON.stringify(weather));
        localStorage.setItem("weatherTime", String(Date.now()));
        console.log('Saved Weather')
    }
}

function getWeatherIcon(code) {
    if (code === 0) return getIcon(7); // Sunny
    if (code <= 48) return getIcon(6); // Cloudy
    if (code <= 57) return getIcon(5); // Light Snow
    if (code <= 67) return getIcon(4); // Light Rain
    if (code <= 75) return getIcon(5); // Light Snow
    if (code <= 77) return getIcon(3); // Heavy Snow
    if (code <= 82) return getIcon(2); // Heavy Rain
    if (code <= 86) return getIcon(3); // Heavy Snow
    if (code <= 99) return getIcon(2); // Heavy Rain
    return getIcon(3); //Generic
}

function getIcon(i) {
    return new Poco.PebbleDrawCommandImage(i);
}

loadCachedWeather();
