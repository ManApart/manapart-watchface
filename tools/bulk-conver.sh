#!/usr/bin/env bash
set -euo pipefail

for svg in watchface/resources/*.svg; do
    python tools/svg2pdc.py -p "$svg"
done
