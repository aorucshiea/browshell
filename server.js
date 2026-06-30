const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { spawn } = require('node-pty');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

const wss = new WebSocketServer({ server });

function detectShell() {
  if (os.platform() === 'win32') {
    const pwsh = process.env.PWSH || process.env.POWERSHELL;
    if (pwsh) return pwsh;
    try {
      require('child_process').execSync('where pwsh.exe', { stdio: 'pipe' });
      return 'pwsh.exe';
    } catch {
      return 'powershell.exe';
    }
  }
  return process.env.SHELL || 'bash';
}

wss.on('connection', (ws) => {
  const shell = detectShell();
  const cwd = os.homedir();

  const pty = spawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: cwd,
    env: { ...process.env, TERM: 'xterm-256color' },
  });

  let closed = false;
  const cleanup = () => {
    if (closed) return;
    closed = true;
    try { pty.kill(); } catch {}
    try { ws.close(); } catch {}
  };

  pty.onData((data) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  });

  ws.on('message', (raw) => {
    const msg = typeof raw === 'string' ? raw : raw.toString();
    try {
      const json = JSON.parse(msg);
      if (json.type === 'resize') {
        pty.resize(json.cols, json.rows);
      }
    } catch {
      pty.write(msg);
    }
  });

  ws.on('close', cleanup);
  ws.on('error', cleanup);
  pty.on('exit', cleanup);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Terminal Bridge running at http://localhost:${PORT}`);
});
