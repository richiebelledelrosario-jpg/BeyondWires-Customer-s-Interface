document.addEventListener("DOMContentLoaded", function () {

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

// 1. Connect to your real-time WebSocket server
const socket = io('https://your-backend-server.com');

// Helper function to dynamically build notification item HTML
function createNotificationItem(data) {
  const item = document.createElement('div');
  item.className = 'notif-item unread';
  
  item.innerHTML = `
    <span class="unread-dot"></span>
    <div class="notif-icon ${data.colorClass}">
      ${data.iconSvg}
    </div>
    <div class="notif-content">
      <p class="notif-text">${data.message}</p>
      <span class="notif-time">${data.timestamp}</span>
    </div>
  `;

  // Attach click listener to clear unread status when clicked
  item.addEventListener('click', () => {
    if (item.classList.contains('unread')) {
      item.classList.remove('unread');
      decrementBadge();
    }
  });

  return item;
}

// Helper to update badge count
function incrementBadge() {
  const notifBadge = document.getElementById('notifBadge');
  let currentCount = parseInt(notifBadge.textContent || '0', 10);
  
  if (isNaN(currentCount)) currentCount = 0;
  
  notifBadge.textContent = currentCount + 1;
  notifBadge.style.display = 'inline-block';
}

function decrementBadge() {
  const notifBadge = document.getElementById('notifBadge');
  let currentCount = parseInt(notifBadge.textContent || '0', 10);
  
  if (currentCount > 1) {
    notifBadge.textContent = currentCount - 1;
  } else {
    notifBadge.style.display = 'none';
    notifBadge.textContent = '0';
  }
}

// 2. Listen for 'new_notification' event emitted by the server
socket.on('new_notification', (data) => {
  const notifList = document.getElementById('notifList');

  // Build the new notification DOM node
  const newNotifItem = createNotificationItem(data);

  // Prepend to top of the notification list
  notifList.prepend(newNotifItem);

  // Update badge count
  incrementBadge();
});










});
