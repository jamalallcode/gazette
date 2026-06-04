export interface PixelEvent {
  id: string;
  eventName: string;
  timestamp: string;
  data: Record<string, any>;
  origin: "Facebook Pixel" | "Google Tag Manager";
}

export interface PixelSettings {
  pixelId: string;
  gtmId: string;
  enablePixel: boolean;
  enableGtm: boolean;
}

const SETTINGS_KEY = "nabik_pixel_settings_v1";
const LOGS_KEY = "nabik_pixel_logs_v1";

const DEFAULT_SETTINGS: PixelSettings = {
  pixelId: "128491028492023",
  gtmId: "GTM-P83KD9A",
  enablePixel: true,
  enableGtm: true,
};

export function getPixelSettings(): PixelSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed loading Pixel settings", e);
  }
  return DEFAULT_SETTINGS;
}

export function savePixelSettings(settings: PixelSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  injectPixelAndGtmScripts(settings);
}

export function getPixelLogs(): PixelEvent[] {
  try {
    const saved = localStorage.getItem(LOGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed loading Pixel logs", e);
  }
  return [];
}

export function savePixelLogs(logs: PixelEvent[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 40)));
}

// Injects real tracking scripts dynamically into document heads safely
export function injectPixelAndGtmScripts(settings: PixelSettings): void {
  // Prevent duplicate script injection and warning
  if (settings.enablePixel && settings.pixelId) {
    if ((window as any).__fb_pixel_initialized_id === settings.pixelId) {
      // Already fully initialized for this pixel ID, do not re-inject
    } else {
      const existingFb = document.getElementById("fb-pixel-script-core");
      if (existingFb) existingFb.remove();

      (window as any).__fb_pixel_initialized_id = settings.pixelId;
      const script = document.createElement("script");
      script.id = "fb-pixel-script-core";
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.pixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }
  } else {
    const existingFb = document.getElementById("fb-pixel-script-core");
    if (existingFb) existingFb.remove();
    (window as any).__fb_pixel_initialized_id = undefined;
  }

  if (settings.enableGtm && settings.gtmId) {
    if ((window as any).__gtm_initialized_id === settings.gtmId) {
      // Already fully initialized for this GTM ID, do not re-inject
    } else {
      const existingGtm = document.getElementById("gtm-script-core");
      if (existingGtm) existingGtm.remove();

      (window as any).__gtm_initialized_id = settings.gtmId;
      const script = document.createElement("script");
      script.id = "gtm-script-core";
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.gtmId}');
      `;
      document.head.appendChild(script);
    }
  } else {
    const existingGtm = document.getElementById("gtm-script-core");
    if (existingGtm) existingGtm.remove();
    (window as any).__gtm_initialized_id = undefined;
  }
}

// Global fire call
export function triggerPixelEvent(
  eventName: string,
  data: Record<string, any> = {}
): void {
  const settings = getPixelSettings();
  const timestamp = new Date().toLocaleTimeString('bn-BD', {
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  const logs = getPixelLogs();

  // 1. Trigger Facebook Pixel
  if (settings.enablePixel && settings.pixelId) {
    // Call fbq wrapper if available in browser
    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("track", eventName, data);
    }
    const newLog: PixelEvent = {
      id: "PXL-" + Math.floor(10000 + Math.random() * 90000),
      eventName,
      timestamp,
      data,
      origin: "Facebook Pixel"
    };
    logs.unshift(newLog);
  }

  // 2. Trigger Google Tag Manager
  if (settings.enableGtm && settings.gtmId) {
    if (typeof (window as any).dataLayer !== "undefined") {
      (window as any).dataLayer.push({
        event: eventName,
        ...data
      });
    }
    const newLog: PixelEvent = {
      id: "GTM-" + Math.floor(10000 + Math.random() * 90000),
      eventName,
      timestamp,
      data,
      origin: "Google Tag Manager"
    };
    logs.unshift(newLog);
  }

  savePixelLogs(logs);

  // Dispatch live global event so custom monitor panels in our UI can render events live
  window.dispatchEvent(new CustomEvent("nabik_pixel_fired"));
}
