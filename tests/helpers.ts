export const tick = (ms = 10) => new Promise<void>((resolve) => setTimeout(resolve, ms));
