module.exports = [
    {
        "type": "heading",
        "defaultValue": "Watchface Settings"
    },
    {
        "type": "text",
        "defaultValue": "Customize your watchface appearance and preferences."
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
        "type": "submit",
        "defaultValue": "Save Settings"
    }
];
