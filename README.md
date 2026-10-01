# Probe — Web Application Tester

Probe is a lightweight, browser-based workspace for checking HTTP endpoints. Build a request, add expectations, run it, and review timing, status, headers, and response data without installing anything.

## Features

- Request builder with HTTP method, URL, headers, and JSON body
- Reusable status, response-time, and body-content checks
- Clear pass/fail summary and response inspector
- Built-in demo endpoint so the interface can be explored immediately
- Responsive, accessible interface with no build step or dependencies

## Run locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

> Requests made by the tester are subject to the target server's CORS policy. Use the built-in demo URL (`demo://users`) to try the full experience locally.

## Project structure

```text
├── index.html  # Application shell
├── styles.css  # Responsive visual system
└── app.js      # Request runner and assertion engine
```
