import type { TLogSink } from '../types';

class Logger {
  private isDebugEnabled: boolean;
  private callback?: TLogSink;

  constructor(isDebugEnabled: boolean) {
    this.isDebugEnabled = isDebugEnabled;
  }

  setDebugMode(value: boolean): void {
    this.isDebugEnabled = value;
  }

  setCallback(callback: TLogSink | undefined): void {
    this.callback = callback;
  }

  ready(...message: string[]): void {
    const msg = `🟢 ${message}`;
    this.callback?.(msg);
    if (!this.isDebugEnabled) return;
    console.log(msg);
  }

  error(...message: string[]): void {
    const msg = `🔴 [error] [XTZ-TS] - ${message}`;
    this.callback?.(msg);
    console.error(msg);
  }

  warn(...message: string[]): void {
    const msg = `⚠️ [warn]  [XTZ-TS] - ${message}`;
    this.callback?.(msg);
    if (!this.isDebugEnabled) return;
    console.warn(msg);
  }

  event(...message: string[]): void {
    const msg = `📣 [event]  [XTZ-TS] - ${message}`;
    this.callback?.(msg);
    if (!this.isDebugEnabled) return;
    console.info(msg);
  }

  info(...message: string[]): void {
    const msg = `💡 [info]  [XTZ-TS] - ${message}`;
    this.callback?.(msg);
    if (!this.isDebugEnabled) return;
    console.info(msg);
  
  }
}

export default Logger;
