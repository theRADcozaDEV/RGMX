const game3 = {
    score: 0,
    targetScore: 3, // Number of correct items to find
    timerInstance: null,
    isPlaying: false,
    stage: 1,
    correctItems: [],

    start: function () {
        console.log('Game 3 Started');
        this.score = 0;
        this.isPlaying = true;
        this.stage = 1;

        this.setupStage(1);
    },

    setupStage: function (stageNum) {
        this.stage = stageNum;
        const containerId = stageNum === 1 ? 'game3-container' : 'game3-stage2-container';
        const container = document.getElementById(containerId);

        // Switch screen if stage 2
        if (stageNum === 2) {
            app.showScreen('screen-15');
        }

        // 2 rows, 3 columns grid
        container.innerHTML = `
            <div id="g3-timer-container-${stageNum}" class="position-absolute top-0 start-0 m-5"></div>
            <div class="position-absolute w-100 text-center" style="top: 15%;">
                
            </div>
            
            <div class="d-flex flex-wrap justify-content-center align-content-center w-100 h-100" style="padding-top: 50%;">
                <div class="d-flex flex-wrap justify-content-center" style="gap: 150px; max-width: 800px; width: 100%;">
                    <!-- 6 Grid Items -->
                    ${this.generateGridItems(stageNum)}
                </div>
            </div>
        `;

        // Add click listeners
        const items = container.querySelectorAll('.grid-item');
        items.forEach(item => {
            // Enforce 3 columns styling - Transparent Hot Zones
            // Using fixed width/height for rigid layout
            item.style.width = '150px'; 
            item.style.height = '350px'; 
            // item.style.border = '2px solid red'; // Debug: Comment out for production
            item.style.cursor = 'pointer';
            item.style.flex = 'none'; // Disable flex grow/shrink behavior if needed, or just let wrap handle it
            
            // Visual feedback handled by adding classes 'correct' (check) or 'wrong' (x)
            // We can add an inner element for the tick/cross mark
            item.innerHTML = '<div class="feedback-mark w-100 h-100 d-flex justify-content-center align-items-center" style="font-size: 3rem; display: none;"></div>';
            
            item.addEventListener('click', () => this.handleItemClick(item));
        });

        // Timer
        if (this.timerInstance) this.timerInstance.stop();
        // Pass remaining time if stage 2? Or new time? 
        // User said "same for game 3 gameplay 2", implying similar mechanic. 
        // Usually stages share time or have new time. Let's give new time for simplicity or shared?
        // Let's give 20s per stage for now.
        this.timerInstance = new CountdownTimer(`g3-timer-container-${stageNum}`, 300, () => this.endGame(false));
        this.timerInstance.start();
    },

    generateGridItems: function (stage) {
        // Generate 6 items, some correct, some wrong.
        // For prototype, let's say items 1, 3, 5 are correct.
        this.correctItems = ['1', '3', '5'];
        let html = '';
        for (let i = 1; i <= 6; i++) {
            html += `<div class="grid-item" data-id="${i}"></div>`;
        }
        return html;
    },

    handleItemClick: function (el) {
        if (!this.isPlaying) return;
        if (el.classList.contains('correct') || el.classList.contains('wrong')) return;

        const id = el.getAttribute('data-id');
        const feedback = el.querySelector('.feedback-mark');
        feedback.style.display = 'flex';

        if (this.correctItems.includes(id)) {
            el.classList.add('correct');
            feedback.innerText = '✓';
            feedback.style.color = '#00ff00';
            feedback.style.textShadow = '0 0 10px #000';
            this.score++;

            // Check if all correct items found
            // For this logic, we need to know how many correct items there are total.
            // In generateGridItems we set 3 correct items.
            const currentContainer = this.stage === 1 ? document.getElementById('game3-container') : document.getElementById('game3-stage2-container');
            const found = currentContainer.querySelectorAll('.grid-item.correct').length;

            if (found >= 3) {
                if (this.stage === 1) {
                    setTimeout(() => this.setupStage(2), 500);
                } else {
                    setTimeout(() => this.endGame(true, false), 500);
                }
            }
        } else {
            el.classList.add('wrong');
            feedback.innerText = '✗';
            feedback.style.color = '#ff0000';
            feedback.style.textShadow = '0 0 10px #000';
            // Penalty? Time reduction? Or just visual feedback.
            // Let's just show wrong.
        }
    },

    endGame: function (win, isTimeout = false) {
        this.isPlaying = false;
        if (this.timerInstance) this.timerInstance.stop();
        if (win) {
            app.showReward(40);
        } else if (isTimeout) {
            app.showScreen('screen-8');
        } else {
            app.showScreen('screen-next');
        }
    }
};
