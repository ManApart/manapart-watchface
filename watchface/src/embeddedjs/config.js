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

export const config = {
    black: render.makeColor(0, 0, 0),
    white: render.makeColor(255, 255, 255),
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


//Eventually have enabled and given hours be configurable
export function isSleeping(now) {
    const hour = now.getHours()
    return sleepModeEnabled && hour >= 22 || hour < 6 && !state.isConnected
}

export function log(message) {
    if (testing) console.log(message)
}

export function withEndRender(block) {
    try {
        block()
    } catch (e) {
    } finally {
        render.end()
    }
}
