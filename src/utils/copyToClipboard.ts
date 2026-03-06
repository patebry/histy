import { execSync } from 'node:child_process';

export type CopyResult =
  | { success: true }
  | { success: false; error: string };

export function copyToClipboard(text: string): CopyResult {
  try {
    const platform = process.platform;
    if (platform === 'darwin') {
      execSync('pbcopy', { input: text, timeout: 3000 });
    } else {
      execSync('xclip -selection clipboard', { input: text, timeout: 3000 });
    }
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message };
  }
}
