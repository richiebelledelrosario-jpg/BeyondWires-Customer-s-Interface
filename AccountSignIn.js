
(() => {
  const signupView = document.getElementById("signupView");
  const loginView = document.getElementById("loginView");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const signupNotice = document.getElementById("signupNotice");
  const loginNotice = document.getElementById("loginNotice");

  // Front-end demonstration account only. A production website should authenticate
  // users on a server and never store passwords in browser storage.
  let demoAccount = null;

  function showView(viewName) {
    const isSignup = viewName === "signup";
    signupView.hidden = !isSignup;
    loginView.hidden = isSignup;
    clearNotice(signupNotice);
    clearNotice(loginNotice);
    document.title = `BeyondWires | ${isSignup ? "Create Account" : "Log In"}`;
  }

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });
    // Open the view requested by the URL (#signupView or #loginView).
  // Anything else falls back to Log In.
  function showViewFromHash() {
    showView(window.location.hash === "#signupView" ? "signup" : "login");
  }

  showViewFromHash();
  window.addEventListener("hashchange", showViewFromHash);

  function showNotice(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle("error", isError);
    element.classList.add("show");
  }

  function clearNotice(element) {
    element.textContent = "";
    element.classList.remove("show", "error");
  }

  function setError(inputId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(`${inputId}Error`);
    if (input) input.classList.toggle("invalid", Boolean(message));
    if (error) error.textContent = message || "";
  }

  function clearErrors(form) {
    form.querySelectorAll(".field-error").forEach((item) => item.textContent = "");
    form.querySelectorAll("input").forEach((input) => input.classList.remove("invalid"));
  }

  document.querySelectorAll(".eye-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.password);
      const reveal = input.type === "password";
      input.type = reveal ? "text" : "password";
      button.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
      button.setAttribute("aria-pressed", String(reveal));
      button.innerHTML = reveal
        ? '<svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.1 4.1"/><path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6"/></svg>'
        : '<svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  });

  // First name and last name:
  // Letters and spaces only. Numbers and symbols are not allowed.
  function validName(value) {
    return /^[\p{L}]+(?:\s+[\p{L}]+)*$/u.test(value);
  }

  // Gmail username:
  // - 6 to 30 characters
  // - Letters, numbers, and periods only
  // - Cannot start or end with a period
  // - Cannot contain consecutive periods
  // - Must use the @gmail.com domain
  function validGmail(value) {
    const email = value.toLowerCase();

    const match = email.match(/^([a-z0-9.]+)@gmail\.com$/);

    if (!match) return false;

    const username = match[1];

    if (username.length < 6 || username.length > 30) return false;
    if (username.startsWith(".") || username.endsWith(".")) return false;
    if (username.includes("..")) return false;

    return true;
  }

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(signupForm);
    clearNotice(signupNotice);

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    let valid = true;

    if (!firstName) {
      setError("firstName", "Please enter your first name.");
      valid = false;
    } else if (!validName(firstName)) {
      setError("firstName", "First name can contain letters and spaces only.");
      valid = false;
    }

    if (!lastName) {
      setError("lastName", "Please enter your last name.");
      valid = false;
    } else if (!validName(lastName)) {
      setError("lastName", "Last name can contain letters and spaces only.");
      valid = false;
    }

    if (!validGmail(email)) {
      setError(
        "signupEmail",
        "Enter a valid Gmail address. Use 6–30 letters, numbers, or periods before @gmail.com."
      );
      valid = false;
    }

    if (password.length < 8 || !/\d/.test(password)) {
      setError("signupPassword", "Use at least 8 characters and include a number.");
      valid = false;
    }

    if (!valid) return;

    demoAccount = { firstName, lastName, email, password };
    showNotice(signupNotice, "Account created for this demo. You can now log in.");
    signupForm.reset();

    window.setTimeout(() => {
      showView("login");
      document.getElementById("loginEmail").value = email;
      showNotice(loginNotice, "Your demo account is ready. Please log in.");
    }, 900);
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(loginForm);
    clearNotice(loginNotice);

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    let valid = true;

    if (!validGmail(email)) {
      setError(
        "loginEmail",
        "Enter a valid Gmail address. Use 6–30 letters, numbers, or periods before @gmail.com."
      );
      valid = false;
    }

    if (!password) {
      setError("loginPassword", "Please enter your password.");
      valid = false;
    }

    if (!valid) return;

    if (demoAccount && email === demoAccount.email && password === demoAccount.password) {
      showNotice(loginNotice, `Welcome back, ${demoAccount.firstName}! Login successful.`);
      loginForm.reset();
      window.location.href = "../HTML/HomePage.html";
    } else {
      showNotice(
        loginNotice,
        "We couldn't verify those details. Create an account in this demo first, or check your email and password.",
        true
      );
    }
  });
})();
