const confettiEffect = {
    intervalId: null,

    start: function () {
        if (this.intervalId) return; // Already running

        // Fire immediately
        this.fireValues();

        // Loop every 2 seconds
        this.intervalId = setInterval(() => {
            this.fireValues();
        }, 2000);
    },

    stop: function () {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },

    fireValues: function () {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        fire(0.2, {
            spread: 60,
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    },

    fire: function() {
        // Backwards compatibility if needed, but we prefer start()
        this.start();
    }
};
