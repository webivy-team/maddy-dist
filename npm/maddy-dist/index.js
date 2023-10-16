import { spawn, spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";

import { fileURLToPath } from "node:url";

// Is there an official way to get the path to another packages binary?
const __dirname = dirname(fileURLToPath(import.meta.url));
const binPath = resolve(
  __dirname,
  "../",
  `maddy-dist-${process.platform}-${process.arch}`,
  /^win/.test(process.platform) ? "maddy.exe" : "maddy",
);

export const maddyCmd = (...args) => {
  const proc = spawnSync(
    binPath,
    args,
    {
      env: {
        MADDY_CONFIG: resolve(process.cwd(), 'maddy.conf'),
        CURRENT_DIR: process.cwd(),
        ...process.env,
      },
    }
  )
  console.log(proc.stdout.toString())
  console.error(proc.stderr.toString())
}

export const createUser = (email, password) => new Promise(async res => {
  const proc = spawn(
    binPath,
    ['creds', 'create', email],
    {
      env: {
        MADDY_CONFIG: resolve(process.cwd(), 'maddy.conf'),
        CURRENT_DIR: process.cwd(),
        ...process.env,
      },
    }
  )
  // TODO: How to get when maddy is ready for input?
  await new Promise(res => setTimeout(() => res(), 100))
  proc.stdin.write(password)
  proc.stdin.write("\n")
  proc.stdout.on('data', async (data) => {
    console.log(`stdout: "${data}"`);
  });
  proc.stderr.on('data', (data) => {
    console.error(`stderr: "${data}"`);
  });
  proc.on("close", (code) => {
    res()
  });
})

export default async (env = {}) => {
  const proc = await new Promise((pResolve, reject) => {
    const proc = spawn(
      binPath,
      ['run'],
      {
        env: {
          MADDY_CONFIG: resolve(process.cwd(), 'maddy.conf'),
          CURRENT_DIR: process.cwd(),
          ...process.env,
          ...env,
        },
      },
    );
    proc.stderr?.on('data', (chunk) => {
      const message = chunk.toString('utf-8');
      console.error(message);
      if (message.includes('imap: listening on')) {
        pResolve(proc);
      }
    });
    proc.stdout?.on('data', (chunk) => {
      const message = chunk.toString('utf-8');
      console.log(message);
      if (message.includes('imap: listening on')) {
        pResolve(proc);
      }
    });
    proc.on("close", (code) => {
      console.warn("maddyShutdown", code);
    });
  });

  return {
    proc,
    stop: async () => {
      proc.stdout.destroy();
      proc.stderr.destroy();
      proc.kill("SIGKILL");
    },
  };
};
