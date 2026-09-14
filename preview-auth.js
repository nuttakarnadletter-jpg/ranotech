(function () {
  const AUTH_KEY = "ranotechPreviewAuth";
  const ACCESS_CODE = "rp-ranotech";
  const LOGIN_PAGE = "index.html";
  const ALLOWED_PAGES = /^(home_option_[abc]|index|articles|article-detail|videos|faq|news|news-detail|gallery|manuals|quote-form|product-inquiry|careers|career-detail|contact|customer-care|training|about-history|clients|quality-policy|technical-consulting|certificates|privacy-policy|products-ppr|products-ppr-detail|products-clearance|products-pump|products-heat-exchanger|solution-heat-exchange|solution-cip|solution-pasteurization|solution-solvent-recovery|solution-reactor|solution-gas-cooling)\.html$/i;

  function currentFile() {
    const path = window.location.pathname || "";
    return path.split("/").pop() || "";
  }

  function isLoginPage() {
    const file = currentFile().toLowerCase();
    return !file || file === "index.html";
  }

  function sanitizeNext(next) {
    const value = String(next || "").trim();
    if (!value) return "";
    const file = value.split("?")[0].split("#")[0];
    return ALLOWED_PAGES.test(file) ? value : "";
  }

  function buildReturnPath() {
    const file = currentFile();
    if (!file || file === "index.html" || !ALLOWED_PAGES.test(file)) return "";
    return file + window.location.search + window.location.hash;
  }

  function loginUrl(returnTo) {
    const next = sanitizeNext(returnTo);
    return next ? `${LOGIN_PAGE}?next=${encodeURIComponent(next)}` : LOGIN_PAGE;
  }

  window.RanotechPreviewAuth = {
    isAuthenticated() {
      return true;
    },

    grant() {
      sessionStorage.setItem(AUTH_KEY, "granted");
    },

    verify(code) {
      return String(code || "").trim() === ACCESS_CODE;
    },

    getNextPath() {
      return sanitizeNext(new URLSearchParams(window.location.search).get("next"));
    },

    guardPage() {
      return;
    },

    redirectAfterLogin() {
      const next = this.getNextPath();
      if (next) {
        window.location.replace(next);
        return true;
      }
      return false;
    },

    initLoginGate() {
      const gate = document.getElementById("previewGate");
      document.documentElement.classList.add("preview-authed");
      document.documentElement.classList.remove("preview-locked");
      document.body.classList.remove("preview-locked");
      if (gate) {
        gate.hidden = true;
      }
    }
  };
})();
