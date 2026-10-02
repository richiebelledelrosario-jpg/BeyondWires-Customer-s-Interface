document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // DARK / LIGHT MODE TOGGLE
    // =========================

    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    // 1. Check user's saved preference on page load
    if (localStorage.getItem('theme') === 'dark') {
        htmlElement.classList.add('dark-theme');
        if (themeIcon) themeIcon.textContent = 'light_mode';
    }

    // 2. Listen for clicks on the theme toggle button
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            htmlElement.classList.toggle('dark-theme');
            
            if (htmlElement.classList.contains('dark-theme')) {
                if (themeIcon) themeIcon.textContent = 'light_mode';
                localStorage.setItem('theme', 'dark');
            } else {
                if (themeIcon) themeIcon.textContent = 'dark_mode';
                localStorage.setItem('theme', 'light');
            }
        });
    }


    // =========================
    // ACCOUNT MODAL
    // =========================

    const accountBtn = document.getElementById("accountBtn");
    const footerAccount = document.getElementById("footerAccount");
    const accountModal = document.getElementById("accountModal");
    const modalClose = document.getElementById("modalClose");
    const modalBackdrop = document.querySelector(".modal-backdrop");

    function openAccountModal(event) {
        if (event) {
            event.preventDefault();
        }

        if (accountModal) {
            accountModal.classList.add("show");
            accountModal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeAccountModal() {
        if (accountModal) {
            accountModal.classList.remove("show");
            accountModal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    if (accountBtn) {
        accountBtn.addEventListener("click", openAccountModal);
    }

    if (footerAccount) {
        footerAccount.addEventListener("click", openAccountModal);
    }

    if (modalClose) {
        modalClose.addEventListener("click", closeAccountModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener("click", closeAccountModal);
    }


    // =========================
    // ESC KEY
    // =========================

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeAccountModal();
        }
    });

    //==========================
    //updated products & services//
    const productData = {
  'ir-cctv': { title: 'IR CCTVs', desc: 'Infrared cameras that keep recording clearly in low-light and night conditions.', features: ['Night vision capability', 'Indoor and outdoor models', 'Durable, weather-resistant housing'] },
  'ip-cctv': { title: 'IP CCTVs', desc: 'Network cameras that stream high-quality video over your network.', features: ['High-resolution video', 'Remote viewing support', 'Easy to scale and expand'] },
  'biometrics': { title: 'Biometrics', desc: 'Fingerprint and face-based systems for secure entry and attendance.', features: ['Fingerprint / face recognition', 'Access and time logging', 'Works with door lock systems'] },
  'intercom': { title: 'Intercom', desc: 'Two-way communication between entrances and indoor units.', features: ['Audio / video options', 'Door release support', 'For homes, offices, and gates'] },
  'doorbell': { title: 'Doorbell', desc: 'Smart doorbells so you can see and talk to visitors.', features: ['Video doorbell options', 'Phone notifications', 'Easy installation'] },
  'smart-lock': { title: 'Smart Door Lock', desc: 'Keyless entry with modern, secure locking options.', features: ['PIN / fingerprint / card access', 'Auto-lock features', 'Suitable for home and office doors'] },
  'solar-light': { title: 'Solar Street Lights', desc: 'Energy-saving outdoor lighting powered by the sun.', features: ['No electrical bills', 'Automatic dusk-to-dawn operation', 'Ideal for roads, gates, and compounds'] },
  'accessories': { title: 'CCTV Accessories', desc: 'Everything needed to complete your CCTV setup.', features: ['CAT6 wire cables', 'Connectors, power supplies, and mounts', 'Storage and other add-ons'] }
};

const detailsBox = document.getElementById('productDetails');
const detailsTitle = document.getElementById('detailsTitle');
const detailsDesc = document.getElementById('detailsDesc');
const detailsList = document.getElementById('detailsList');

document.querySelectorAll('[data-product]').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = productData[btn.dataset.product];
    if (!item) return;
    detailsTitle.textContent = item.title;
    detailsDesc.textContent = item.desc;
    detailsList.innerHTML = item.features.map(f => `<li>${f}</li>`).join('');
    detailsBox.hidden = false;

    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('active'));
    btn.closest('.product-card').classList.add('active');
    detailsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

document.getElementById('detailsClose').addEventListener('click', () => {
  detailsBox.hidden = true;
  document.querySelectorAll('.product-card').forEach(c => c.classList.remove('active'));
});

    // =========================
    // HERO BUTTON SCROLLING
    // =========================

    const scrollButtons = document.querySelectorAll("[data-scroll]");

    scrollButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const targetSelector = button.getAttribute("data-scroll");
            const target = document.querySelector(targetSelector);

            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        });

    });


    // =========================
    // FAQ
    // =========================

    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach(function (question) {

        question.addEventListener("click", function () {

            const faqItem = question.closest(".faq-item");

            if (!faqItem) {
                return;
            }

            const isCurrentlyOpen = faqItem.classList.contains("open");


            // Close every FAQ
            document.querySelectorAll(".faq-item").forEach(function (item) {
                item.classList.remove("open");
            });


            // Open the clicked FAQ
            if (!isCurrentlyOpen) {
                faqItem.classList.add("open");
            }

        });

    });


    // =========================
    // LOGIN BUTTON
    // =========================
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
      loginBtn.addEventListener("click", function () {
        // Hide the modal
        document.getElementById("accountModal").setAttribute("aria-hidden", "true");

        // Show the login view from your AccountSignIn script
        window.location.href = "../HTML/AccountSignIn.html#loginView";

      });
    }


    // =========================
    // CREATE ACCOUNT BUTTON
    // =========================
    const createBtn = document.getElementById("createBtn");

    if (createBtn) {
      createBtn.addEventListener("click", function () {
        // Hide the modal
        document.getElementById("accountModal").setAttribute("aria-hidden", "true");

        // Show the signup view from your AccountSignIn script
        window.location.href = "../HTML/AccountSignIn.html#signupView";

      });
    }


    // =========================
    // PACKAGE "GET STARTED" BUTTONS
    // =========================
    document.querySelectorAll(".package-card .primary-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.location.href = "../HTML/AccountSignIn.html#loginView";
      });
    });


});