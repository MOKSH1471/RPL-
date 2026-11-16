import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWin = process.platform === 'win32';
const npmCmd = 'npm';

console.log('\x1b[36m===================================================\x1b[0m');
console.log('\x1b[33m\x1b[1m       RAJ PREMIER LEAGUE - LOCAL DEV SERVERS       \x1b[0m');
console.log('\x1b[36m===================================================\x1b[0m');
console.log('\x1b[32m[+] API Server:\x1b[0m    http://localhost:5005');
console.log('\x1b[32m[+] Web Client:\x1b[0m    http://localhost:3000');
console.log('    - Feedback:    http://localhost:3000/#/feedback');
console.log('    - Auction:     http://localhost:3000/#/auction-feedback');
console.log('\x1b[32m[+] Admin Portal:\x1b[0m  http://localhost:3001');
console.log('\x1b[36m===================================================\x1b[0m');
console.log('\x1b[90mPress Ctrl+C to stop all servers cleanly at any time.\x1b[0m\n');

const services = [
  {
    name: 'API',
    color: '\x1b[35m', // magenta
    cmd: npmCmd,
    args: ['run', 'dev:api'],
  },
  {
    name: 'WEB',
    color: '\x1b[34m', // blue
    cmd: npmCmd,
    args: ['run', 'dev', '--workspace=@rpl/web', '--', '--host', '0.0.0.0'],
  },
  {
    name: 'ADMIN',
    color: '\x1b[33m', // yellow
    cmd: npmCmd,
    args: ['run', 'dev', '--workspace=@rpl/admin', '--', '--host', '0.0.0.0'],
  },
];

const children = [];

function killChildren() {
  console.log('\n\x1b[31m[!] Stopping all RPL services...\x1b[0m');
  children.forEach((child) => {
    if (child && child.pid) {
      if (isWin) {
        try {
          spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', shell: true });
        } catch {}
      } else {
        try {
          child.kill('SIGTERM');
        } catch {}
      }
    }
  });
  process.exit(0);
}

process.on('SIGINT', killChildren);
process.on('SIGTERM', killChildren);
process.on('exit', () => {
  children.forEach((child) => {
    if (child && child.pid && isWin) {
      try {
        spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', shell: true });
      } catch {}
    }
  });
});

services.forEach((s) => {
  const child = spawn(s.cmd, s.args, {
    cwd: rootDir,
    env: { ...process.env, FORCE_COLOR: '1' },
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: isWin,
  });

  children.push(child);

  child.stdout.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/);
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`${s.color}[${s.name}]\x1b[0m ${line}`);
      }
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/);
    lines.forEach((line) => {
      if (line.trim()) {
        console.error(`${s.color}[${s.name}]\x1b[0m \x1b[31m${line}\x1b[0m`);
      }
    });
  });

  child.on('error', (err) => {
    console.error(`${s.color}[${s.name} ERROR]\x1b[0m ${err.message}`);
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.log(`${s.color}[${s.name}]\x1b[0m exited with code ${code}`);
    }
  });
});
