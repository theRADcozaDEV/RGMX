class CountdownTimer {
    constructor(containerId, duration, onComplete, initialTime = null) {
        this.container = document.getElementById(containerId);
        this.duration = duration;
        this.timeLeft = initialTime !== null ? initialTime : duration;
        this.onComplete = onComplete;
        this.radius = 45; // SVG radius (relative to viewBox 100x100)
        this.circumference = 2 * Math.PI * this.radius;
        this.interval = null;
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="countdown-container">
                <svg class="countdown-svg" viewBox="0 0 100 100">
                    <defs>
                        <linearGradient id="countdown-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#fe554a;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#fda13d;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <circle class="countdown-circle-bg" cx="50" cy="50" r="${this.radius}"></circle>
                    <circle class="countdown-circle-fg" cx="50" cy="50" r="${this.radius}" 
                            stroke-dasharray="${this.circumference}"
                            stroke-dashoffset="0"></circle>
                </svg>
                <div class="countdown-text">${this.timeLeft}</div>
            </div>
        `;
        this.circleFg = this.container.querySelector('.countdown-circle-fg');
        this.textDisplay = this.container.querySelector('.countdown-text');
    }

    start() {
        this.render();
        if (this.interval) clearInterval(this.interval);

        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateVisuals();

            if (this.timeLeft <= 0) {
                this.stop();
                if (this.onComplete) this.onComplete();
            }
        }, 1000);
    }

    updateVisuals() {
        if (this.textDisplay) this.textDisplay.innerText = this.timeLeft;
        if (this.circleFg) {
            const offset = this.circumference - (this.timeLeft / this.duration) * this.circumference;
            this.circleFg.style.strokeDashoffset = offset;
        }
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }
}
