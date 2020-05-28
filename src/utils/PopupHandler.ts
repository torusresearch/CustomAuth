import { EventEmitter } from "events";

class PopupHandler extends EventEmitter {
  url: URL;

  target: string;

  features: string;

  window: Window;

  windowTimer: NodeJS.Timeout; // Not picking up browser overload for some reason

  iClosedWindow: boolean;

  constructor({ url, target, features }: { url: URL; target?: string; features?: string }) {
    super();
    this.url = url;
    this.target = target || "_blank";
    this.features = features || "directories=0,titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=700,width=1200";
    this.window = undefined;
    this.windowTimer = undefined;
    this.iClosedWindow = false;
    this._setupTimer();
  }

  _setupTimer(): void {
    this.windowTimer = setInterval(() => {
      if (this.window && this.window.closed) {
        clearInterval(this.windowTimer);
        if (!this.iClosedWindow) {
          this.emit("close");
        }
        this.iClosedWindow = false;
        this.window = undefined;
      }
      if (this.window === undefined) clearInterval(this.windowTimer);
    }, 500);
  }

  open(): Promise<void> {
    this.window = window.open(this.url.href, this.target, this.features);
    return Promise.resolve();
  }

  close(): void {
    this.iClosedWindow = true;
    if (this.window) this.window.close();
  }
}

export default PopupHandler;
