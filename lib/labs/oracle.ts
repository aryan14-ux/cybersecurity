/**
 * Real-Time In-Browser Exploit Oracle
 *
 * Intercepts JavaScript alert, prompt, confirm, and cookie reads inside lab environments.
 * Signals parent frames and local listeners when an exploit executes successfully,
 * mirroring PortSwigger's automated lab verification.
 */

export interface ExploitEventDetail {
  type: string;
  labSlug: string;
  payload: string;
  timestamp: number;
}

export function getSlugFromPath(pathname: string): string {
  if (pathname.includes("/labs/reflected")) return "reflected-xss-search";
  if (pathname.includes("/labs/stored")) return "stored-xss-comments";
  if (pathname.includes("/labs/dom")) return "dom-xss-client";
  if (pathname.includes("/labs/filter-bypass")) return "filter-bypass-xss";
  if (pathname.includes("/labs/context")) return "context-xss-attribute";
  return "general-xss";
}

/**
 * Play a synthesizer chime using Web Audio API (no external audio files needed)
 */
export function playSuccessChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Pleasant three-tone ascending chord (C5 - E5 - G5)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  } catch (err) {
    // AudioContext may be blocked before user gesture; gracefully ignore
  }
}

/**
 * Installs telemetry hooks on window.alert, confirm, prompt, and custom xss events
 */
export function initExploitOracle(pathname: string) {
  if (typeof window === "undefined") return () => {};
  if ((window as any).__EXPLOIT_ORACLE_INITIALIZED__) return () => {};
  (window as any).__EXPLOIT_ORACLE_INITIALIZED__ = true;

  const originalAlert = window.alert;
  const originalConfirm = window.confirm;
  const originalPrompt = window.prompt;

  const handleExploit = (triggerType: string, message: any) => {
    const currentPath = window.location.pathname || pathname;
    const slug = getSlugFromPath(currentPath);
    const detail: ExploitEventDetail = {
      type: triggerType,
      labSlug: slug,
      payload: String(message ?? "XSS"),
      timestamp: Date.now(),
    };

    // Play celebration audio
    playSuccessChime();

    // Broadcast across windows / iframes
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ event: "XSS_EXPLOIT_SUCCESS", ...detail }, "*");
      }
      if (window.opener) {
        window.opener.postMessage({ event: "XSS_EXPLOIT_SUCCESS", ...detail }, "*");
      }
    } catch {
      // Cross-origin message safety
    }

    // Save to localStorage & sessionStorage for instant popup display
    try {
      localStorage.setItem("xss_last_exploit", JSON.stringify(detail));
      localStorage.setItem(`xss_solved_${slug}`, "true");
      sessionStorage.setItem(`xss_just_solved_${slug}`, JSON.stringify(detail));
      (window as any).__XSS_LAST_EXPLOIT__ = detail;
    } catch {
      // Storage unavailable
    }

    // Dispatch in current document
    window.dispatchEvent(new CustomEvent("xss-exploit-success", { detail }));
  };

  window.alert = function (msg?: any) {
    handleExploit("alert", msg);
    setTimeout(() => {
      try {
        originalAlert.call(window, msg);
      } catch {
        // ignore
      }
    }, 50);
  };

  window.confirm = function (msg?: any) {
    handleExploit("confirm", msg);
    setTimeout(() => {
      try {
        originalConfirm.call(window, msg);
      } catch {
        // ignore
      }
    }, 50);
    return true;
  };

  window.prompt = function (msg?: any, _default?: any) {
    handleExploit("prompt", msg);
    setTimeout(() => {
      try {
        originalPrompt.call(window, msg, _default);
      } catch {
        // ignore
      }
    }, 50);
    return "";
  };

  return () => {
    window.alert = originalAlert;
    window.confirm = originalConfirm;
    window.prompt = originalPrompt;
    (window as any).__EXPLOIT_ORACLE_INITIALIZED__ = false;
  };
}
