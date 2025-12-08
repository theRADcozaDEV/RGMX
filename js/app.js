const app = {
    currentScreen: 'screen-1',
    idleTimer: null,
    idleTimeout: 300000, // 60 seconds to reset to home

    keyboard: null,

    // Game Tracking
    playedGames: { 1: false, 2: false, 3: false },
    currentGameId: null,

    init: function () {
        console.log('App initialized');
        this.resetIdleTimer();
        document.addEventListener('click', () => this.resetIdleTimer());
        document.addEventListener('touchstart', () => this.resetIdleTimer());

        // Initialize Keyboard
        this.keyboard = new VirtualKeyboard('keyboard-container', ['input-name', 'input-dept']);

        // Initial LED Color (Idle)
        this.setLedColor(255, 255, 255);
    },

    showScreen: function (screenId) {
        // Stop any confetti if running
        if (typeof confettiEffect !== 'undefined') confettiEffect.stop();

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
                this.setLedColor(255, 255, 255); // Idle White
                // Reset game progress on Home
                this.resetProgress();
            } else if (screenId === 'screen-2') {
                this.updateMenuTicks();
            } else if (screenId === 'screen-7') {
                this.setLedColor(0, 255, 0); // Win Green
            } else if (screenId === 'screen-8') {
                this.setLedColor(255, 0, 0); // Lose Red
            } else if (['screen-3', 'screen-4', 'screen-5', 'screen-6'].includes(screenId)) {
                this.setLedColor(255, 0, 0); // Game 1 Red
            } else if (['screen-9', 'screen-10', 'screen-11'].includes(screenId)) {
                this.setLedColor(0, 255, 0); // Game 2 Green
            } else if (screenId === 'screen-15') {
                this.setLedColor(0, 0, 255); // Game 3 Blue
            } else if (screenId === 'screen-game1-reward') {
                this.setLedColor(0, 255, 0); // Win Green
                if (typeof confettiEffect !== 'undefined') confettiEffect.start();
            } else if (screenId === 'screen-next') {
                const title = document.getElementById('next-title');
                const subtitle = document.getElementById('next-subtitle');
                if (title && subtitle) {
                    if (this.currentGameId === 1) {
                        title.innerHTML = 'Get ready to play <span class="fw-bold">GAME TWO</span>';
                        subtitle.innerText = 'MATCH PACK WITH THE KPI';
                    } else if (this.currentGameId === 2) {
                        title.innerHTML = 'Get ready to play <span class="fw-bold">GAME THREE</span>';
                        subtitle.innerText = 'KNOW YOUR SKUs';
                    } else {
                        title.innerHTML = 'Get ready for <span class="fw-bold">LEADERBOARD</span>';
                        subtitle.innerText = 'JOIN THE RANKS';
                    }
                }
            }

            // Reset inputs if showing input screen
            if (screenId === 'screen-input') {
                // Calculate Score
                let totalPoints = 0;
                // Game 1: Must get 7/7 correct
                if (typeof game1 !== 'undefined' && game1.totalScore === 7) totalPoints += 100;
                
                // Game 2 check (existing logic, to be updated later if needed)
                if (typeof game2 !== 'undefined' && game2.score >= 4) totalPoints += 20;
                // Game 3: Add actual score
                if (typeof game3 !== 'undefined') totalPoints += Math.max(0, game3.score);

                console.log('--- Score Calculation ---');
                console.log(`Game 1: Score=${typeof game1 !== 'undefined' ? game1.totalScore : 'N/A'} (Need 7) => ${typeof game1 !== 'undefined' && game1.totalScore === 7 ? 100 : 0} pts`);
                console.log(`Game 2: Score=${typeof game2 !== 'undefined' ? game2.score : 'N/A'} (Need 4) => ${typeof game2 !== 'undefined' && game2.score >= 4 ? 20 : 0} pts`);
                console.log(`Game 3: Score=${typeof game3 !== 'undefined' ? game3.score : 'N/A'} => ${typeof game3 !== 'undefined' ? Math.max(0, game3.score) : 0} pts`);
                console.log(`Total Points: ${totalPoints}`);

                const scoreDisplay = document.getElementById('total-score-value');
                if (scoreDisplay) scoreDisplay.innerText = totalPoints;

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

    showReward: function (points) {
        const screen = document.getElementById('screen-game1-reward');
        if (screen) {
            // screen.style.backgroundImage = `url('assets/game_${points}_point.png')`; // Disabled dynamic image
            this.showScreen('screen-game1-reward');
        }
    },

    startGame: function (gameId) {
        // Force linear progression: Always start with Game 1
        console.log(`Starting Linear Journey (Requested Game ${gameId})`);
        this.currentGameId = 1;
        this.showScreen('screen-3');
    },

    nextAfterGame: function () {
        // Mark current game as played
        if (this.currentGameId) {
            this.playedGames[this.currentGameId] = true;
        }

        // Linear Progression Logic
        if (this.currentGameId === 1) {
            // Move to Game 2
            this.currentGameId = 2;
            this.showScreen('screen-9');
        } else if (this.currentGameId === 2) {
            // Move to Game 3
            this.currentGameId = 3;
            this.showScreen('screen-12');
        } else if (this.currentGameId === 3) {
            // All done, move to Input
            this.showScreen('screen-input');
        } else {
            // Fallback
            this.showScreen('screen-input');
        }
    },

    resetProgress: function () {
        this.playedGames = { 1: false, 2: false, 3: false };
        this.currentGameId = null;
        // Hide ticks
        document.querySelectorAll('.tick-mark').forEach(el => el.style.display = 'none');

        // Reset Game Scores
        if (typeof game1 !== 'undefined') {
            game1.score = 0;
            game1.totalScore = 0;
        }
        if (typeof game2 !== 'undefined') {
            game2.score = 0;
        }
        if (typeof game3 !== 'undefined') {
            game3.score = 0;
        }
    },

    updateMenuTicks: function () {
        for (let i = 1; i <= 3; i++) {
            const tick = document.getElementById(`tick-${i}`);
            if (tick) {
                tick.style.display = this.playedGames[i] ? 'block' : 'none';
            }
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
            if (typeof game1 !== 'undefined') game1.start(1);
        } else if (screenId === 'screen-6') {
            if (typeof game1 !== 'undefined') game1.start(2);
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

        // Go to Leaderboard
        this.showScreen('screen-leaderboard');
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
