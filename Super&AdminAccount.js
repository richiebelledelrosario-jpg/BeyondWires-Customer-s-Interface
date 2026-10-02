// Where each role lands after signing in (paths are relative to the HTML folder).
const DASHBOARDS = {
    admin: 'AdminHomePage.html',        // <-- change to your admin page's filename
    superadmin: 'SuperHomePage.html'
};
const ROLE_LABEL = { admin: 'Admin', superadmin: 'Super Admin' };

let chosenRole = 'admin';

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const rolePicker = document.getElementById('rolePicker');
const submitBtn = document.getElementById('submitBtn');
const errorBox = document.getElementById('loginError');

function showError(msg) {
    errorBox.textContent = msg || '';
    errorBox.classList.toggle('show', !!msg);
}

/* ---------- Show / hide password ---------- */
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });
}

/* ---------- Role picker ---------- */
rolePicker.addEventListener('click', e => {
    const btn = e.target.closest('[data-role]');
    if (!btn) return;
    chosenRole = btn.dataset.role;
    rolePicker.querySelectorAll('.role-opt').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-checked', String(b === btn));
    });
    submitBtn.textContent = 'Log In as ' + ROLE_LABEL[chosenRole];
    showError('');
});

/* ---------- Sign in ---------- */
form.addEventListener('submit', e => {
    e.preventDefault();
    const id = emailInput.value.trim(), pw = passwordInput.value;

    if (!id || !pw) {
        showError('Please enter your email or username and your password.');
        (id ? passwordInput : emailInput).focus();
        return;
    }

    // TODO: verify the credentials AND that this account really has the chosen role.
    // Do that on your server and only continue if it succeeds. Until then, any
    // filled-in credentials are accepted, so this is for demo/testing only.

    sessionStorage.setItem('bw_role', chosenRole);
    location.href = DASHBOARDS[chosenRole];
});