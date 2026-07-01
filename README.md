# browshell

A browser-based terminal with WebSocket PTY bridge — a full terminal emulator that runs in your browser, ideal for AI-controlled workflows and vibe coding.

## Features

- **Full terminal emulation** via [xterm.js](https://xtermjs.org/)
- **Real-time WebSocket PTY bridge** using `node-pty` and `ws`
- **Auto-resize** — terminal dimensions sync automatically
- **Windows & Unix support** — auto-detects PowerShell, pwsh, or bash
- **Dark theme** — custom xterm color scheme
- **Reconnection** — auto-retries on disconnect

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

- The server (`server.js`) serves a static frontend (`public/`) via Express.
- A WebSocket server accepts connections from the browser.
- On connection, the server spawns a PTY (PowerShell on Windows, bash on Unix).
- Keystrokes from the browser are forwarded to the PTY; PTY output is streamed back to the terminal.
- Resize events from the browser are sent as JSON and applied to the PTY via `pty.resize()`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `3000`  | HTTP server port |
| `PWSH` / `POWERSHELL` | — | Path to PowerShell (Windows only) |

## Tech Stack

- **Backend:** Node.js, Express, ws, node-pty
- **Frontend:** xterm.js, xterm-addon-fit
