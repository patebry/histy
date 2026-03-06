import { spawnSync } from 'node:child_process';

/**
 * Executes a command in the user's interactive shell so aliases,
 * functions, and rc-file config (e.g. .zshrc) are available.
 */
export function executeCommand(command: string): void {
  const shell = process.env.SHELL || '/bin/sh';

  try {
    // -i: interactive — sources .zshrc/.bashrc so aliases and functions work
    // -c: run the provided command string
    spawnSync(shell, ['-i', '-c', command], { stdio: 'inherit' });
  } catch {
    // Command exited with non-zero — that's fine, the user saw the output
  }
}
