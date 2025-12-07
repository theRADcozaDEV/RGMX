const game1 = {
    score: 0,
    targetScore: 4, // 4 items to place
    timerInstance: null,
    isPlaying: false,
    stage: 1,
    draggedItem: null,

    start: function (stage = 1) {
        console.log(`Game 1 Stage ${stage} Started`);
        this.stage = stage;
        this.score = 0;
        this.isPlaying = true;
        this.targetScore = stage === 1 ? 4 : 3;

        const containerId = stage === 1 ? 'game1-container' : 'game1-stage2-container';
        const container = document.getElementById(containerId);

        // HTML Structure
        let zonesHtml = '';
        if (stage === 1) {
            zonesHtml = `
                <div class="drop-zone" data-id="1">1</div>
                <div class="drop-zone" data-id="2">2</div>
                <div class="drop-zone" data-id="3">3</div>
                <div class="drop-zone" data-id="4">4</div>
            `;
        } else {
            zonesHtml = `
                <div class="drop-zone" data-id="1">1</div>
                <div class="drop-zone" data-id="2">2</div>
                <div class="drop-zone" data-id="3">3</div>
            `;
        }

        container.innerHTML = `
            <div id="g1-timer-container-${stage}" class="position-absolute top-0 start-0 m-3"></div>
            
            <!-- Drop Zones (Top) -->
            <div class="d-flex justify-content-around w-100 position-absolute" style="top: 20%;">
                ${zonesHtml}
            </div>

            <!-- Draggable Items (Bottom) -->
            <div id="drag-container-${stage}" class="w-100 h-100 position-relative"></div>
        `;

        this.createDraggableItems(stage);
        this.setupDragEvents();

        if (this.timerInstance) this.timerInstance.stop();
        this.timerInstance = new CountdownTimer(`g1-timer-container-${stage}`, 20, () => this.endGame(false));
        this.timerInstance.start();
    },

    createDraggableItems: function (stage) {
        const container = document.getElementById(`drag-container-${stage}`);
        let items = [];

        if (stage === 1) {
            items = [
                { id: 1, text: '1', left: '10%', top: '70%' },
                { id: 2, text: '2', left: '30%', top: '70%' },
                { id: 3, text: '3', left: '50%', top: '70%' },
                { id: 4, text: '4', left: '70%', top: '70%' }
            ];
        } else {
            items = [
                { id: 1, text: '1', left: '20%', top: '70%' },
                { id: 2, text: '2', left: '50%', top: '70%' },
                { id: 3, text: '3', left: '80%', top: '70%' }
            ];
        }

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'draggable-item';
            el.setAttribute('data-id', item.id);
            el.innerText = item.text;
            el.style.left = item.left;
            el.style.top = item.top;

            // Touch events
            el.addEventListener('touchstart', (e) => this.handleDragStart(e, el), { passive: false });
            el.addEventListener('touchmove', (e) => this.handleDragMove(e, el), { passive: false });
            el.addEventListener('touchend', (e) => this.handleDragEnd(e, el));

            // Mouse events
            el.addEventListener('mousedown', (e) => this.handleDragStart(e, el));

            container.appendChild(el);
        });

        // Global mouse move/up for desktop
        document.addEventListener('mousemove', (e) => this.handleGlobalMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleGlobalMouseUp(e));
    },

    // ... drag handlers remain mostly the same ...
    // I need to update snapToZone to handle stage progression

    handleDragStart: function (e, el) {
        if (!this.isPlaying) return;
        e.preventDefault();
        this.draggedItem = el;
        el.classList.add('dragging');

        const touch = e.touches ? e.touches[0] : e;
        const rect = el.getBoundingClientRect();
        this.offsetX = touch.clientX - rect.left;
        this.offsetY = touch.clientY - rect.top;
    },

    handleDragMove: function (e, el) {
        if (!this.draggedItem) return;
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;

        const x = touch.clientX - this.offsetX;
        const y = touch.clientY - this.offsetY;

        const container = document.getElementById(this.stage === 1 ? 'game1-container' : 'game1-stage2-container');
        const containerRect = container.getBoundingClientRect();

        const relX = x - containerRect.left;
        const relY = y - containerRect.top;

        el.style.left = `${relX}px`;
        el.style.top = `${relY}px`;

        this.checkDropZones(el);
    },

    handleDragEnd: function (e, el) {
        if (!this.draggedItem) return;
        el.classList.remove('dragging');

        if (this.currentDropZone) {
            this.snapToZone(el, this.currentDropZone);
        }

        this.draggedItem = null;
        this.currentDropZone = null;
        document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    },

    handleGlobalMouseMove: function (e) {
        if (this.draggedItem) {
            this.handleDragMove(e, this.draggedItem);
        }
    },

    handleGlobalMouseUp: function (e) {
        if (this.draggedItem) {
            this.handleDragEnd(e, this.draggedItem);
        }
    },

    checkDropZones: function (el) {
        const elRect = el.getBoundingClientRect();
        let maxOverlap = 0;
        let bestZone = null;

        document.querySelectorAll('.drop-zone').forEach(zone => {
            const zoneRect = zone.getBoundingClientRect();
            const overlapX = Math.max(0, Math.min(elRect.right, zoneRect.right) - Math.max(elRect.left, zoneRect.left));
            const overlapY = Math.max(0, Math.min(elRect.bottom, zoneRect.bottom) - Math.max(elRect.top, zoneRect.top));
            const overlapArea = overlapX * overlapY;

            if (overlapArea > maxOverlap) {
                maxOverlap = overlapArea;
                bestZone = zone;
            }
            zone.classList.remove('drag-over');
        });

        if (bestZone && maxOverlap > 0) {
            bestZone.classList.add('drag-over');
            this.currentDropZone = bestZone;
        } else {
            this.currentDropZone = null;
        }
    },

    snapToZone: function (el, zone) {
        const itemId = el.getAttribute('data-id');
        const zoneId = zone.getAttribute('data-id');

        if (itemId === zoneId) {
            const zoneRect = zone.getBoundingClientRect();
            const container = document.getElementById(this.stage === 1 ? 'game1-container' : 'game1-stage2-container');
            const containerRect = container.getBoundingClientRect();

            el.style.left = `${zoneRect.left - containerRect.left + (zoneRect.width - el.offsetWidth) / 2}px`;
            el.style.top = `${zoneRect.top - containerRect.top + (zoneRect.height - el.offsetHeight) / 2}px`;

            zone.classList.add('correct');
            el.style.pointerEvents = 'none';
            this.score++;

            if (this.score >= this.targetScore) {
                setTimeout(() => this.endGame(true), 500);
            }
        }
    },

    setupDragEvents: function () {
        // Handled in createDraggableItems
    },

    endGame: function (win) {
        this.isPlaying = false;
        if (this.timerInstance) this.timerInstance.stop();

        if (win) {
            if (this.stage === 1) {
                // Go to Stage 2 (Screen 6)
                app.showScreen('screen-6');
            } else {
                // Win Game
                app.showScreen('screen-7');
            }
        } else {
            app.showScreen('screen-8'); // Timeout
        }
    }
};
