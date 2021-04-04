import { EventEmitter } from "events";

class PopupHandler extends EventEmitter {
  url: URL;

  target: string;

  features: string;

  window: Window;

  windowTimer: number;

  iClosedWindow: boolean;

  constructor({ url, target, features }: { url: URL; target?: string; features?: string }) {
    super();
    this.url = url;
    this.target = target || "_blank";
    // Fixes dual-screen position                             Most browsers      Firefox
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

    const w = 1200;
    const h = 700;

    const width = window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : window.screen.width;

    const height = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : window.screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;
    this.features =
      features || `titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=${h / systemZoom},width=${w / systemZoom},top=${top},left=${left}`;
    this.window = undefined;
    this.windowTimer = undefined;
    this.iClosedWindow = false;
    this._setupTimer();
  }

  _setupTimer(): void {
    this.windowTimer = Number(
      setInterval(() => {
        if (this.window && this.window.closed) {
          clearInterval(this.windowTimer);
          if (!this.iClosedWindow) {
            this.emit("close");
          }
          this.iClosedWindow = false;
          this.window = undefined;
        }
        if (this.window === undefined) clearInterval(this.windowTimer);
      }, 500)
    );
  }

  open(): Promise<void> {
    this.window = window.open(this.url.href, this.target, this.features);
    if (this.window?.focus) this.window.focus();
    return Promise.resolve();
  }

  close(): void {
    this.iClosedWindow = true;
    if (this.window) this.window.close();
  }

  redirect(locationReplaceOnRedirect: boolean): void {
    if (locationReplaceOnRedirect) {
      window.location.replace(this.url.href);
    } else {
      window.location.href = this.url.href;
    }
  }
}

export default PopupHandler;
