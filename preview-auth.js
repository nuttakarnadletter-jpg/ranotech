(function () {
  const AUTH_KEY = "ranotechPreviewAuth";
  const ACCESS_CODE = "rp-ranotech";
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
    },

    initLoginGate() {
      const gate = document.getElementById("previewGate");
      const form = document.getElementById("previewGateForm");
      const input = document.getElementById("previewAccessCode");
      const error = document.getElementById("previewGateError");

      if (!gate || !form || !input) return;

      if (this.isAuthenticated()) {
        gate.hidden = true;
        document.documentElement.classList.add("preview-authed");
        document.documentElement.classList.remove("preview-locked");
        document.body.classList.remove("preview-locked");
        this.redirectAfterLogin();
        return;
      }

      document.documentElement.classList.remove("preview-authed");
      document.documentElement.classList.add("preview-locked");
      document.body.classList.add("preview-locked");
      gate.hidden = false;
      window.setTimeout(() => input.focus(), 120);

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (this.verify(input.value)) {
          this.grant();
          gate.hidden = true;
          document.documentElement.classList.add("preview-authed");
          document.documentElement.classList.remove("preview-locked");
          document.body.classList.remove("preview-locked");
          if (!this.redirectAfterLogin()) input.value = "";
          return;
        }

        if (error) {
          error.hidden = false;
          error.textContent = "รหัสไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง";
        }
        input.focus();
        input.select();
      });
    }
  };
})();
