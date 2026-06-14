/**
 * Dynamic sandbox utility that isolates transactions, counts, and charts
 * per demo administrator account cleanly.
 */

export function getActiveDemoEmail(): string | null {
  try {
    if (typeof window === "undefined") return null;

    // 1. Check if the active administrator is logged in on this browser
    const savedUser = localStorage.getItem("nabik_current_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed && parsed.is_demo_user && parsed.email) {
        const email = parsed.email.trim().toLowerCase();
        // Keep active_demo_email synced with logged-in user
        localStorage.setItem("active_demo_email", email);
        return email;
      }
    }

    // 2. Fall back to the stored demo email (e.g. set via public URL when sharing demo link with friends)
    const stored = localStorage.getItem("active_demo_email");
    if (stored && stored.trim()) {
      return stored.trim().toLowerCase();
    }
  } catch (_) {}
  return null;
}

/**
 * Parses query string parameters to detect shared sandbox demo accounts.
 * E.g., sharing the shop with a friend via ?demo=john@gmail.com
 */
export function initializeUrlDemoContext() {
  try {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const demoQuery = params.get("demo") || params.get("demo_email") || params.get("demoEmail") || params.get("active_demo");
    
    if (demoQuery && demoQuery.includes("@") && demoQuery.trim()) {
      const cleanEmail = demoQuery.trim().toLowerCase();
      localStorage.setItem("active_demo_email", cleanEmail);
      console.log(`[DEMO CONTEXT] Initialized sandbox store scope to: ${cleanEmail}`);
    }
  } catch (e) {
    console.error("Error setting URL demo context", e);
  }
}
