export default function drawHeader(render, now, colors) {
    console.log('draw header')
    render.fillRectangle(colors.gray, 0, 0, render.width, 20);
}
