const app = {
    currentScreen: 'screen-1',
    idleTimer: null,
    idleTimeout: 300000, // 5 minutes
    attractTimer: null,
    inAttractLoop: false,
    leaderboardConfetti: null,
    leaderboardConfettiInterval: null,

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

        // Initialize Leaderboard Confetti
        const canvas = document.getElementById('leaderboard-canvas');
        if (canvas && typeof confetti !== 'undefined') {
            this.leaderboardConfetti = confetti.create(canvas, { resize: true, useWorker: true });
        }

        // Initial LED Color (Idle)
        this.setLedColor(255, 255, 255);
    },

    showScreen: function (screenId) {
        // Stop any confetti if running
        if (typeof confettiEffect !== 'undefined') confettiEffect.stop();
        // Stop leaderboard confetti (always stop previous)
        this.stopLeaderboardConfetti();

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
                this.startAttractTimer();
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
                if (typeof game2 !== 'undefined') totalPoints += Math.max(0, game2.score);
                // Game 3: Add actual score
                if (typeof game3 !== 'undefined') totalPoints += Math.max(0, game3.score);

                console.log('--- Score Calculation ---');
                console.log(`Game 1: Score=${typeof game1 !== 'undefined' ? game1.totalScore : 'N/A'} (Need 7) => ${typeof game1 !== 'undefined' && game1.totalScore === 7 ? 100 : 0} pts`);
                console.log(`Game 2: Score=${typeof game2 !== 'undefined' ? game2.score : 'N/A'} => ${typeof game2 !== 'undefined' ? Math.max(0, game2.score) : 0} pts`);
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
            } else if (screenId === 'screen-leaderboard') {
                this.updateLeaderboardUI(this.getLeaderboard());
                if (this.inAttractLoop) this.startAttractTimer();
                if (this.leaderboardConfetti) this.startLeaderboardConfetti();
            }
        } else {
            console.error(`Screen ${screenId} not found`);
        }
    },

    showReward: function (points) {
        const screen = document.getElementById('screen-game1-reward');
        if (screen) {
            // Update text based on next game
            const title = document.getElementById('reward-title');
            const subtitle = document.getElementById('reward-subtitle');
            
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
        const name = document.getElementById('input-name').value.trim() || 'Player';
        const dept = document.getElementById('input-dept').value.trim() || 'General';
        const score = parseInt(document.getElementById('total-score-value').innerText) || 0;
        
        console.log(`Submitted: Name=${name}, Dept=${dept}, Score=${score}`);

        // Save to Leaderboard
        const leaderboard = this.getLeaderboard();
        leaderboard.push({ name, dept, score });
        
        // Sort Descending
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Keep top 10 (though we only show 5)
        const top10 = leaderboard.slice(0, 10);
        localStorage.setItem('rgmx_leaderboard', JSON.stringify(top10));

        // Update UI
        this.updateLeaderboardUI(top10);

        // Go to Leaderboard
        this.showScreen('screen-leaderboard');
    },

    getLeaderboard: function () {
        const stored = localStorage.getItem('rgmx_leaderboard');
        if (stored) return JSON.parse(stored);
        // Default Empty Data
        return [];
    },

    updateLeaderboardUI: function (data) {
        // We assume the HTML structure has a container we can empty and rebuild, 
        // OR we target specific rows. The HTML has hardcoded rows.
        // It's better to clear and rebuild the list to handle dynamic counts.
        
        // Find the container. in HTML it is: <div class="w-75"> ... rows ... </div>
        // I need to add an ID to that container in HTML first to target it easily.
        // Or I can target .screen-leaderboard .w-75
        
        // Let's modify index.html to add an ID to the leaderboard list container first.
        // But I can try to do it via selector if unique.
        const container = document.querySelector('#screen-leaderboard .w-75');
        if (!container) return;

        let html = '';
        
        data.slice(0, 5).forEach((entry, index) => {
            const rank = index + 1;
            let suffix = 'th';
            if (rank === 1) suffix = 'st';
            if (rank === 2) suffix = 'nd';
            if (rank === 3) suffix = 'rd';

            const isTop3 = rank <= 3;
            const bgClass = 'bg-danger'; // All red background
            const padding = isTop3 ? 'p-3' : 'p-2';
            const fontSize = isTop3 ? '26px' : '20px';
            const boxShadow = isTop3 ? 'box-shadow: 0 0 15px rgba(255,0,0,0.5);' : 'opacity: 0.9;';
            const border = 'border border-white';
            
            html += `
            <div class="leaderboard-row d-flex align-items-center ${bgClass} text-white ${padding} mb-2 rounded ${border}" style="font-size: ${fontSize}; ${boxShadow}">
                <div style="width: 15%; font-weight: bold; color: white;">${rank}${suffix}</div>
                <div style="width: 60%; font-weight: ${isTop3 ? 'bold' : 'normal'};">${entry.name}</div>
                <div style="width: 25%; text-align: right; font-weight: bold;">${entry.score}</div>
            </div>
            `;
            
            if (rank === 3 && data.length > 3) {
                html += `<hr class="border border-white border-3 opacity-100 my-3">`;
            }
        });

        container.innerHTML = html;
    },

    startLeaderboardConfetti: function () {
        if (this.leaderboardConfettiInterval) return;

        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        this.leaderboardConfettiInterval = setInterval(() => {
            const particleCount = 50;
            
            // since particles fall down, start a bit higher than random
            this.leaderboardConfetti(Object.assign({}, defaults, { 
                particleCount, 
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
            }));
            this.leaderboardConfetti(Object.assign({}, defaults, { 
                particleCount, 
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
            }));
        }, 250);
    },

    stopLeaderboardConfetti: function () {
        if (this.leaderboardConfettiInterval) {
            clearInterval(this.leaderboardConfettiInterval);
            this.leaderboardConfettiInterval = null;
        }
        if (this.leaderboardConfetti) {
            this.leaderboardConfetti.reset();
        }
    },

    setLedColor: function (r, g, b) {
        // Call local Python server
        fetch(`http://localhost:8000/set_color?r=${r}&g=${g}&b=${b}`)
            .catch(err => console.error('LED Error:', err));
    },

    startAttractTimer: function () {
        if (this.attractTimer) clearTimeout(this.attractTimer);
        // 20 seconds loop
        this.attractTimer = setTimeout(() => {
            if (this.currentScreen === 'screen-1') {
                this.inAttractLoop = true;
                this.showScreen('screen-leaderboard');
            } else if (this.currentScreen === 'screen-leaderboard' && this.inAttractLoop) {
                this.showScreen('screen-1');
            }
        }, 20000);
    },

    resetIdleTimer: function () {
        if (this.idleTimer) clearTimeout(this.idleTimer);
        if (this.attractTimer) clearTimeout(this.attractTimer);
        
        // If user interacts, we break the loop
        this.inAttractLoop = false;

        // Only set idle timer if not on home screen
        if (this.currentScreen !== 'screen-1') {
            this.idleTimer = setTimeout(() => {
                console.log('Idle timeout - resetting to home');
                this.showScreen('screen-1');
            }, this.idleTimeout);
        } else {
            // On Home Screen, restart attract timer
            this.startAttractTimer();
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
