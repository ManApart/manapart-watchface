npx live-server concept/


| Alloy font name    | Valid sizes           |
| ------------------ | --------------------- |
| `Bitham-Black`     | 30                    |
| `Bitham-Bold`      | 42                    |
| `Bitham-Light`     | 18, 34, 42            |
| `Bitham-Medium`    | 34, 42                |
| `Droid-Serif`      | 28                    |
| `Gothic-Bold`      | 14, 18, 24, 28, 36    |
| `Gothic-Regular`   | 9, 14, 18, 24, 28, 36 |
| `Leco-Bold`        | 20, 26, 32, 36, 38    |
| `Leco-Light`       | 28                    |
| `Leco-Regular`     | 42                    |
| `Roboto-Bold`      | 49                    |
| `Roboto-Condensed` | 21                    |


Tools from git@github.com:pebble-examples/cards-example.git
```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python tools/svg2pdc.py watchface/resources/cloudy.svg
```

## Commands

```
pebble emu-battery --percent 80
pebble emu-bt-connection --connected no
pebble emu-set-timeline-quick-view on
BROWSER='firefox --new-tab %s' pebble emu-app-config
```
