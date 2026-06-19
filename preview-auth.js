(function () {
  const AUTH_KEY = "ranotechPreviewAuth";
  const ACCESS_CODE = "rp-renotech";
  const LOGIN_PAGE = "index.html";
  const ALLOWED_PAGES = /^home_option_[abc]\.html$/i;

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
      return sessionStorage.getItem(AUTH_KEY) === "granted";
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
      if (this.isAuthenticated() || isLoginPage()) return;
      window.location.replace(loginUrl(buildReturnPath()));
    },

    redirectAfterLogin() {
      const next = this.getNextPath();
      if (next) {
        window.location.replace(next);
        return true;
      }
      return false;
    }
  };
})();
