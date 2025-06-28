document.addEventListener('DOMContentLoaded', () => {
    // Create the counter element
    const counterElement = document.createElement('div');
    counterElement.id = 'visitor-counter';
    document.body.appendChild(counterElement);

    // Style the counter for a nice, clean look in the top-left corner
    Object.assign(counterElement.style, {
        position: 'fixed',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '5px 15px',
        borderRadius: '15px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        zIndex: '9999',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        transition: 'transform 0.2s ease-in-out',
    });

    // Add a little hover effect for interactivity
    counterElement.addEventListener('mouseover', () => {
        counterElement.style.transform = 'scale(1.05)';
    });
    counterElement.addEventListener('mouseout', () => {
        counterElement.style.transform = 'scale(1)';
    });

    const namespace = 'hanwen-portfolio-site'; // A unique ID for your website's counter
    const key = 'total-visits'; // The specific counter key
    const hitUrl = `https://api.countapi.xyz/hit/${namespace}/${key}`;
    const getUrl = `https://api.countapi.xyz/get/${namespace}/${key}`;

    const updateCounterDisplay = (count) => {
        counterElement.innerHTML = `👁️ Total Views: <strong>${count.toLocaleString()}</strong>`;
    };

    // Use sessionStorage to count a visitor only once per session
    if (sessionStorage.getItem('siteVisited')) {
        // If already visited in this session, just get the count without incrementing
        fetch(getUrl).then(res => res.json()).then(data => {
            updateCounterDisplay(data.value || 0);
        }).catch(() => counterElement.textContent = '👁️ Counter unavailable');
    } else {
        // For a new session, increment the count
        fetch(hitUrl).then(res => res.json()).then(data => {
            updateCounterDisplay(data.value);
            // Mark as visited for this session
            sessionStorage.setItem('siteVisited', 'true');
        }).catch(() => counterElement.textContent = '👁️ Counter unavailable');
    }
});