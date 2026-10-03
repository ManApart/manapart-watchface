import Poco from "commodetto/Poco";

export const testing = false

export const state = {
    lastDate: new Date(),
    wasSleeping: false,
    messageWriteable: false,
    isConnected: true
}

export const render = new Poco(screen);

export const settings = loadSettings()

export const config = {
    black: render.makeColor(0, 0, 0),
    white: render.makeColor(255, 255, 255),
    timeText: render.makeColor(0, 0, 0),
    timeBackground: render.makeColor(255, 255, 255),
    nameBackground: render.makeColor(0, 0, 0),
    nameText: render.makeColor(255, 255, 255),
    normalWeather: render.makeColor(170, 170, 170),
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

function loadSettings() {
    const DEFAULT_SETTINGS = {
        sleepModeEnabled: true,
        useFahrenheit: true,
        hotThresh: 90,
        warmThresh: 80,
        normalThresh: 30,
        timeBackground: (255 << 16) | (255 << 8) | 255,
        timeText: (0 << 16) | (0 << 8) | 0,
        nameBackground: (85 << 16) | (170 << 8) | 255,
        nameText: (255 << 16) | (255 << 8) | 255,
        normalWeather: (170 << 16) | (170 << 8) | 170,
    };
    const stored = localStorage.getItem("settings");
    if (stored) {
        try {
            return {...DEFAULT_SETTINGS, ...JSON.parse(stored)};
        } catch (e) {
            console.log("Failed to parse settings");
        }
    }
    return DEFAULT_SETTINGS;
}

function updateConfigFromSettings() {
    config.timeBackground = makeColor(settings.timeBackground)
    config.timeText = makeColor(settings.timeText)
    config.nameBackground = makeColor(settings.nameBackground)
    config.nameText = makeColor(settings.nameText)
    config.normalWeather = makeColor(settings.normalWeather)
}

function makeColor(rgb) {
    const r = (rgb >> 16) & 0xFF;
    const g = (rgb >> 8) & 0xFF;
    const b = rgb & 0xFF;
    return render.makeColor(r, g, b);
}

export function updateSettings(values) {
    settings.timeBackground = ifValue(values, "timeBackground", settings.timeBackground);
    settings.timeText = ifValue(values, "timeText", settings.timeText);
    settings.nameBackground = ifValue(values, "nameBackground", settings.nameBackground);
    settings.nameText = ifValue(values, "nameText", settings.nameText);
    settings.normalWeather = ifValue(values, "normalWeather", settings.normalWeather);
    settings.sleepModeEnabled = ifValue(values, "sleepModeEnabled", settings.sleepModeEnabled);
    settings.useFahrenheit = ifValue(values, "useFahrenheit", settings.useFahrenheit);
    settings.hotThresh = ifValue(values, "hotThresh", settings.hotThresh);
    settings.warmThresh = ifValue(values, "warmThresh", settings.warmThresh);
    settings.normalThresh = ifValue(values, "normalThresh", settings.normalThresh);
    saveSettings()
    updateConfigFromSettings()
}

function ifValue(values, key, defaultVal) {
    if (values.has(key)) {
        return values.get(key);
    }
    return defaultVal
}

function saveSettings() {
    localStorage.setItem("settings", JSON.stringify(settings));
}

export function isSleeping() {
    return settings.sleepModeEnabled && !state.isConnected && Boolean(Natives.isQuietTimeActive())
}

export function getUnit() {
    if (settings.useFahrenheit) return "F"
    return "C"
}

export function log(message) {
    if (testing) console.log(message)
}

export function withEndRender(x, y, width, height, ownRender, block) {
    try {
        if (ownRender) render.begin(x, y, width, height)
        block()
    } catch (e) {
    } finally {
        if (ownRender) render.end()
    }
}

export function renderFull(ownRender, block) {
    try {
        if (ownRender) render.begin()
        block()
    } catch (e) {
    } finally {
        if (ownRender) render.end()
    }
}

updateConfigFromSettings()
