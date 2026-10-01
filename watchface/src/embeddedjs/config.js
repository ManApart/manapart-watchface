import Poco from "commodetto/Poco";

export const testing = false
export const sleepModeEnabled = true

export const state = {
    lastDate: new Date(),
    wasSleeping: false,
    messageWriteable: false,
    isConnected: true
}

export const render = new Poco(screen);

const settings = loadSettings()

export const config = {
    black: render.makeColor(0, 0, 0),
    white: render.makeColor(255, 255, 255),
    timeText: render.makeColor(0, 0, 0),
    timeBackground: render.makeColor(255, 255, 255),
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
        timeBackground: (255 << 16) | (255 << 8) | 255,
        timeText: (0 << 16) | (0 << 8) | 0,
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
}

function makeColor(rgb) {
    const r = (rgb >> 16) & 0xFF;
    const g = (rgb >> 8) & 0xFF;
    const b = rgb & 0xFF;
    return render.makeColor(r, g, b);
}

export function updateSettings(values) {
    if (values.has("timeBackground")) {
        settings.timeBackground = values.get("timeBackground");
    }
    if (values.has("timeText")) {
        settings.timeText = values.get("timeText");
    }
    saveSettings()
    updateConfigFromSettings()
}

function saveSettings() {
    localStorage.setItem("settings", JSON.stringify(settings));
}


//Eventually have enabled and given hours be configurable
export function isSleeping(now) {
    const hour = now.getHours()
    return sleepModeEnabled && hour >= 22 || hour < 6 && !state.isConnected
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
