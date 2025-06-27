// Function to update the countdown timer
function updateCountdown() {
    // Xi Jinping's 73rd birthday: June 15, 2026
    const targetDate = new Date('2026-06-15T00:00:00').getTime();
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const timerEl = document.getElementById("timer");
    if (timerEl) {
        if (distance < 0) {
            timerEl.textContent = "🎉 Happy Birthday, Xi Jinping!";
        } else {
            timerEl.textContent = `🗓️ Countdown to Xi Jinping's 73rd Birthday: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
    }
}

// Update the countdown every second
setInterval(updateCountdown, 1000);

// Initial call to display the countdown immediately when the DOM is ready
document.addEventListener('DOMContentLoaded', updateCountdown);