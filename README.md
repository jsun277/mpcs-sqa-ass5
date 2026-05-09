# Assignment 5 — Performance Regression Testing

Author: Jingchen Sun
Course: MPCS 51300 — Software Quality & Testing

## Tools used

| Purpose | Tool | Version |
| --- | --- | --- |
| Server-side performance testing | k6 | v1.7.1 |
| Client-side performance testing | Google Lighthouse CLI | v13.3.0 |
| Headless browser for Lighthouse | Google Chrome (headless) | system |

## Install

brew install k6
npm install -g lighthouse

Lighthouse needs a Chrome/Chromium binary on the path. On macOS, Lighthouse picks up Google Chrome automatically.

## Targets under test

| Exercise | Target | Feature |
| --- | --- | --- |
| Exercise 2 | https://quickpizza.grafana.com (k6 official demo) | POST /api/pizza — pizza recommendation API |
| Exercise 3 | https://www.python.org/ | Homepage (above-the-fold render + interactivity) |

The QuickPizza auth token is the static demo token shipped with the public training instance (Token abcdef0123456789).

## How to run the tests

### Exercise 2 — k6

# Load test (20 VUs, ~1m45s)
k6 run scripts/loadtest.js --summary-export results/loadtest_summary.json

# Spike test (50 → 1000 → 50 VUs, ~5m40s)
k6 run scripts/spiketest.js --summary-export results/spiketest_summary.json

Both scripts share the same operational profile (`landing` then `recommend`) and SLA thresholds, so the only difference is the load shape.

### Exercise 3 — Lighthouse

# Mobile
lighthouse https://www.python.org/ \
  --form-factor=mobile --screen-emulation.mobile=true \
  --throttling-method=simulate \
  --output=html --output=json \
  --output-path=lighthouse/python_mobile \
  --chrome-flags="--headless=new --no-sandbox" --quiet

# Desktop
lighthouse https://www.python.org/ \
  --preset=desktop \
  --output=html --output=json \
  --output-path=lighthouse/python_desktop \
  --chrome-flags="--headless=new --no-sandbox" --quiet

## Repository layout

ass5/
  scripts/loadtest.js      k6 load test
  scripts/spiketest.js     k6 spike test
  README.md                this file
