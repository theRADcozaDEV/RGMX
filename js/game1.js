const game1 = {
    score: 0,
    totalScore: 0, // Track total correct across stages
    targetScore: 4, // 4 items to place
    timerInstance: null,
    isPlaying: false,
    stage: 1,
    draggedItem: null,
    originalParent: null,

    start: function (stage = 1) {
        console.log(`Game 1 Stage ${stage} Started`);
        this.stage = stage;
        this.score = 0;
        if (stage === 1) {
            this.totalScore = 0; // Reset total score only at start of game
        }
        this.itemsPlaced = 0; // Track placed items
        this.isPlaying = true;
        this.targetScore = stage === 1 ? 4 : 3;
        // ... rest of start ...

        const containerId = stage === 1 ? 'game1-container' : 'game1-stage2-container';
        const container = document.getElementById(containerId);

        // HTML Structure
        let zonesHtml = '';
        let zonesClass = 'd-flex justify-content-around w-100 position-absolute';
        let zonesStyle = 'top: 40%; padding: 0 5%;';

        // Drag Container Defaults (Stage 1)
        let dragClass = 'w-100 position-absolute d-flex justify-content-around align-items-center';
        let dragStyle = 'bottom: 2%; height: 40%; padding: 0 5%;';

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
            // Tighter spacing for Stage 2
            zonesClass = 'd-flex justify-content-center w-100 position-absolute';
            zonesStyle += ' gap: 100px;';

            // Match Drag Container to Zones
            dragClass = 'w-100 position-absolute d-flex justify-content-center align-items-center';
            dragStyle += ' gap: 100px;';
        }

        container.innerHTML = `
            <div id="g1-timer-container-${stage}" class="position-absolute top-0 start-0 m-5"></div>
            
            <!-- Drop Zones (Top) -->
            <div class="${zonesClass}" style="${zonesStyle}">
                ${zonesHtml}
            </div>

            <!-- Draggable Items (Bottom) - Flex Container -->
            <div id="drag-container-${stage}" class="${dragClass}" style="${dragStyle}"></div>
        `;

        this.createDraggableItems(stage);
        this.setupDragEvents();

        if (this.timerInstance) this.timerInstance.stop();
        this.timerInstance = new CountdownTimer(`g1-timer-container-${stage}`, 20, () => this.endGame(false));
        this.timerInstance.start();
    },

    createDraggableItems: function (stage) {
        const container = document.getElementById(`drag-container-${stage}`);
        const itemCount = stage === 1 ? 4 : 3;

        for (let i = 1; i <= itemCount; i++) {
            // Create Slot
            const slot = document.createElement('div');
            slot.className = 'd-flex justify-content-center align-items-center';
            
            if (stage === 1) {
                slot.style.flex = '1';
                slot.style.padding = '0 15px'; // Add spacing
            } else {
                // Stage 2: Fixed width to match drop zones (150px)
                slot.style.width = '150px';
                slot.style.flex = 'none';
            }

            slot.style.height = '100%';

            // Create Item
            const el = document.createElement('div');
            el.className = 'draggable-item';
            el.setAttribute('data-id', i);

            const imgPath = `assets/piece_game1_${stage}_${i}.png`;
            el.style.backgroundImage = `url('${imgPath}')`;
            el.style.position = 'relative'; // Start relative
            el.style.left = 'auto';
            el.style.top = 'auto';

            if (stage === 2) {
                el.style.maxWidth = '150px';
            }

            // Touch events
            el.addEventListener('touchstart', (e) => this.handleDragStart(e, el), { passive: false });
            el.addEventListener('touchmove', (e) => this.handleDragMove(e, el), { passive: false });
            el.addEventListener('touchend', (e) => this.handleDragEnd(e, el));

            // Mouse events
            el.addEventListener('mousedown', (e) => this.handleDragStart(e, el));

            slot.appendChild(el);
            container.appendChild(slot);
        }

        // Global mouse move/up for desktop
        document.addEventListener('mousemove', (e) => this.handleGlobalMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleGlobalMouseUp(e));
    },

    setupDragEvents: function () {
        // Handled in createDraggableItems
    },

    handleDragStart: function (e, el) {
        if (!this.isPlaying) return;
        e.preventDefault();
        if (this.draggedItem) return;

        this.draggedItem = el;
        this.originalParent = el.parentElement; // Save slot
        el.classList.add('dragging');

        // Detach from slot and attach to game container to allow free movement
        const rect = el.getBoundingClientRect();
        const container = document.getElementById(this.stage === 1 ? 'game1-container' : 'game1-stage2-container');
        const containerRect = container.getBoundingClientRect();

        // Lock size
        el.style.width = rect.width + 'px';
        el.style.height = rect.height + 'px';

        el.style.position = 'absolute';
        el.style.left = (rect.left - containerRect.left) + 'px';
        el.style.top = (rect.top - containerRect.top) + 'px';

        container.appendChild(el);

        const touch = e.touches ? e.touches[0] : e;
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
        } else {
            this.revertToSlot(el);
        }

        this.draggedItem = null;
        this.currentDropZone = null;
        document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    },

    handleGlobalMouseMove: function (e) {
        if (this.draggedItem) this.handleDragMove(e, this.draggedItem);
    },

    handleGlobalMouseUp: function (e) {
        if (this.draggedItem) this.handleDragEnd(e, this.draggedItem);
    },

    checkDropZones: function (el) {
        const elRect = el.getBoundingClientRect();
        let maxOverlap = 0;
        let bestZone = null;

        document.querySelectorAll('.drop-zone').forEach(zone => {
            // Ignore if already occupied
            if (zone.classList.contains('occupied')) return;

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

        // Snap visual
        const zoneRect = zone.getBoundingClientRect();
        const container = document.getElementById(this.stage === 1 ? 'game1-container' : 'game1-stage2-container');
        const containerRect = container.getBoundingClientRect();

        el.style.left = `${zoneRect.left - containerRect.left + (zoneRect.width - el.offsetWidth) / 2}px`;
        el.style.top = `${zoneRect.top - containerRect.top + (zoneRect.height - el.offsetHeight) / 2}px`;

        // Mark as placed and occupied
        zone.classList.add('occupied');
        el.style.pointerEvents = 'none'; // Lock item
        this.itemsPlaced++;

        if (itemId === zoneId) {
            // Correct
            zone.classList.add('correct');
            this.score++;
            this.totalScore++;
        } else {
            // Wrong but placed
            zone.classList.add('wrong');
        }

        // Check for Game Over (All items placed)
        if (this.itemsPlaced >= this.targetScore) {
            if (this.stage === 1) {
                // Always go to Stage 2
                setTimeout(() => app.showScreen('screen-6'), 500);
            } else {
                // Win if Perfect Score (7 total)
                const won = this.totalScore === 7;
                setTimeout(() => this.endGame(won, false), 500);
            }
        }
    },

    revertToSlot: function (el) {
        if (this.originalParent) {
            el.style.position = 'relative';
            el.style.left = 'auto';
            el.style.top = 'auto';
            el.style.removeProperty('width');
            el.style.removeProperty('height');
            el.style.removeProperty('position');
            el.style.removeProperty('left');
            el.style.removeProperty('top');

            this.originalParent.appendChild(el);
        }
    },

    endGame: function (win, isTimeout = false) {
        console.log(`Game 1 Ended. Win: ${win}, Timeout: ${isTimeout}, Total Score: ${this.totalScore}`);
        this.isPlaying = false;
        if (this.timerInstance) this.timerInstance.stop();
        if (win) {
            // Show 100 Points Reward Screen
            app.showReward(100);
        } else if (isTimeout) {
            app.showScreen('screen-8');
        } else {
            app.showScreen('screen-next');
        }
    }
};
