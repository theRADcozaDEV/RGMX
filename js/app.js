const app = {
    currentScreen: 'screen-1',
    idleTimer: null,
    idleTimeout: 60000, // 60 seconds to reset to home

    keyboard: null,

    init: function () {
        console.log('App initialized');
        this.resetIdleTimer();
        document.addEventListener('click', () => this.resetIdleTimer());
        document.addEventListener('touchstart', () => this.resetIdleTimer());

        // Initialize Keyboard
        this.keyboard = new VirtualKeyboard('keyboard-container', ['input-name', 'input-dept']);

        // Initial LED Color (Idle)
        this.setLedColor(0, 100, 255);
    },

    showScreen: function (screenId) {
        // Hide current
        const current = document.getElementById(this.currentScreen);
        if (current) {
            current.classList.remove('active');
        }

        // Show new
        const next = document.getElementById(screenId);
        if (next) {
            next.classList.add('active');
            this.currentScreen = screenId;
            this.checkGameStart(screenId);

            // LED Control
            if (screenId === 'screen-1') {
                this.setLedColor(0, 100, 255); // Idle Blue
            } else if (screenId === 'screen-7') {
                this.setLedColor(0, 255, 0); // Win Green
            } else if (screenId === 'screen-8') {
                this.setLedColor(255, 0, 0); // Lose Red
            } else if (['screen-3', 'screen-4', 'screen-5', 'screen-6'].includes(screenId)) {
                this.setLedColor(255, 0, 0); // Game 1 Red
            } else if (['screen-9', 'screen-10', 'screen-11'].includes(screenId)) {
                this.setLedColor(0, 255, 0); // Game 2 Green
            } else if (['screen-12', 'screen-13', 'screen-14', 'screen-15'].includes(screenId)) {
                this.setLedColor(0, 0, 255); // Game 3 Blue
            }

            // Reset inputs if showing input screen
            if (screenId === 'screen-input') {
                document.getElementById('input-name').value = '';
                document.getElementById('input-dept').value = '';
                // Focus first input
                setTimeout(() => {
                    document.getElementById('input-name').focus();
                    // Ensure keyboard is shown
                    if (this.keyboard) this.keyboard.show();
                }, 100);
            }
        } else {
            console.error(`Screen ${screenId} not found`);
        }
    },

    startGame: function (gameId) {
        console.log(`Starting Game ${gameId}`);
        if (gameId === 1) {
            this.showScreen('screen-3');
        } else if (gameId === 2) {
            this.showScreen('screen-9');
        } else if (gameId === 3) {
            this.showScreen('screen-12');
        }
    },

    // Hook into showScreen to trigger game logic if needed
    // But actually, we want to trigger the game logic when the specific PLAY button is pressed
    // which leads to the gameplay screen.
    // Game 1: Screen 5 is gameplay.
    // Game 2: Screen 11 is gameplay.
    // Game 3: Screen 14 is gameplay.

    checkGameStart: function (screenId) {
        if (screenId === 'screen-5') {
            if (typeof game1 !== 'undefined') game1.start();
        } else if (screenId === 'screen-11') {
            if (typeof game2 !== 'undefined') game2.start();
        } else if (screenId === 'screen-14') {
            if (typeof game3 !== 'undefined') game3.start();
        }
    },

    submitInput: function () {
        const name = document.getElementById('input-name').value;
        const dept = document.getElementById('input-dept').value;
        console.log(`Submitted: Name=${name}, Dept=${dept}`);

        // Here you would save the data

        // Go back to home
        this.showScreen('screen-1');
    },

    setLedColor: function (r, g, b) {
        // Call local Python server
        fetch(`http://localhost:8000/set_color?r=${r}&g=${g}&b=${b}`)
            .catch(err => console.error('LED Error:', err));
    },

    resetIdleTimer: function () {
        if (this.idleTimer) clearTimeout(this.idleTimer);
        // Only set idle timer if not on home screen
        if (this.currentScreen !== 'screen-1') {
            this.idleTimer = setTimeout(() => {
                console.log('Idle timeout - resetting to home');
                this.showScreen('screen-1');
            }, this.idleTimeout);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
