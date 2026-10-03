module.exports = [
    {
        "type": "heading",
        "defaultValue": "Weather Glance Settings"
    },
    {
        "type": "section",
        "items": [
            {
                "type": "heading",
                "defaultValue": "Colors"
            },
            {
                "type": "color",
                "messageKey": "nameBackground",
                "defaultValue": "0x55AAFF",
                "label": "Date Name Background Color"
            },
            {
                "type": "color",
                "messageKey": "nameText",
                "defaultValue": "0xFFFFFF",
                "label": "Date Name Text"
            },
            {
                "type": "color",
                "messageKey": "normalWeather",
                "defaultValue": "0xAAAAAA",
                "label": "Color for normal temp"
            },
            {
                "type": "color",
                "messageKey": "timeBackground",
                "defaultValue": "0xFFFFFF",
                "label": "Time Background Color"
            },
            {
                "type": "color",
                "messageKey": "timeText",
                "defaultValue": "0x000000",
                "label": "Time Text Color"
            }
        ]
    },
    {
        "type": "section",
        "items": [
            {
                "type": "heading",
                "defaultValue": "Preferences"
            },
            {
                "type": "toggle",
                "messageKey": "sleepModeEnabled",
                "defaultValue": true,
                "label": "Pause all updates during quiet hours if disconnected."
            },
            {
                "type": "toggle",
                "messageKey": "useFahrenheit",
                "defaultValue": true,
                "label": "Use Fahrenheit"
            },
        ]
    },
    {
        "type": "submit",
        "defaultValue": "Save Settings"
    }
];
