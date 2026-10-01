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
                "messageKey": "timeBackground",
                "defaultValue": "0x000000",
                "label": "Background Color"
            },
            {
                "type": "color",
                "messageKey": "timeText",
                "defaultValue": "0xFFFFFF",
                "label": "Text Color"
            }
        ]
    },
    {
        "type": "submit",
        "defaultValue": "Save Settings"
    }
];
