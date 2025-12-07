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
            <div id="g3-timer-container-${stageNum}" class="position-absolute top-0 start-50 translate-middle-x mt-3"></div>
            <div class="position-absolute w-100 text-center" style="top: 15%;">
                <h2 class="text-white display-4">Select the correct items!</h2>
            </div>
            
            <div class="d-flex flex-wrap justify-content-center align-content-center w-100 h-100" style="padding-top: 20%;">
                <div class="d-flex flex-wrap justify-content-center" style="gap: 20px; max-width: 900px;">
                    <!-- 6 Grid Items -->
                    ${this.generateGridItems(stageNum)}
                </div>
            </div>
        `;

        // Add click listeners
        const items = container.querySelectorAll('.grid-item');
        items.forEach(item => {
            item.addEventListener('click', () => this.handleItemClick(item));
        });

        // Timer
        if (this.timerInstance) this.timerInstance.stop();
        // Pass remaining time if stage 2? Or new time? 
        // User said "same for game 3 gameplay 2", implying similar mechanic. 
        // Usually stages share time or have new time. Let's give new time for simplicity or shared?
        // Let's give 20s per stage for now.
        this.timerInstance = new CountdownTimer(`g3-timer-container-${stageNum}`, 20, () => this.endGame(false));
        this.timerInstance.start();
    },

    generateGridItems: function (stage) {
        // Generate 6 items, some correct, some wrong.
        // For prototype, let's say items 1, 3, 5 are correct.
        this.correctItems = ['1', '3', '5'];
        let html = '';
        for (let i = 1; i <= 6; i++) {
            html += `<div class="grid-item" data-id="${i}">Item ${i}</div>`;
        }
        return html;
    },

    handleItemClick: function (el) {
        if (!this.isPlaying) return;
        if (el.classList.contains('correct') || el.classList.contains('wrong')) return;

        const id = el.getAttribute('data-id');

        if (this.correctItems.includes(id)) {
            el.classList.add('correct');
            this.score++;

            // Check if all correct items found
            // For this logic, we need to know how many correct items there are total.
            // In generateGridItems we set 3 correct items.
            const found = document.querySelectorAll(`#game3-container .grid-item.correct, #game3-stage2-container .grid-item.correct`).length;
            // Actually we need to scope to current container
            const currentContainer = this.stage === 1 ? document.getElementById('game3-container') : document.getElementById('game3-stage2-container');
            const currentFound = currentContainer.querySelectorAll('.grid-item.correct').length;

            if (currentFound >= 3) {
                if (this.stage === 1) {
                    setTimeout(() => this.setupStage(2), 500);
                } else {
                    setTimeout(() => this.endGame(true), 500);
                }
            }
        } else {
            el.classList.add('wrong');
            // Penalty? Time reduction? Or just visual feedback.
            // Let's just show wrong.
        }
    },

    endGame: function (win) {
        this.isPlaying = false;
        if (this.timerInstance) this.timerInstance.stop();
        if (win) {
            app.showScreen('screen-7');
        } else {
            app.showScreen('screen-8');
        }
    }
};
