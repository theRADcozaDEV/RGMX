const game2 = {
    score: 0,
    targetScore: 4,
    timerInstance: null,
    isPlaying: false,
    draggedItem: null,

    start: function () {
        console.log('Game 2 Started');
        this.score = 0;
        this.placedCount = 0;
        this.isPlaying = true;

        const container = document.getElementById('game2-container');
        container.innerHTML = `
            <div id="g2-timer-container" class="position-absolute top-0 start-0 m-5" style="z-index: 20;"></div>
            
            <div class="d-flex w-100 h-100">
                <!-- Column 1: Draggable Items (33%) -->
                <div class="d-flex flex-column justify-content-around align-items-center" style="width: 33%; ">
                    <div id="g2-drag-container" class="d-flex flex-column justify-content-around h-100 w-100 align-items-center position-relative">
                        <!-- Items will be injected here -->
                    </div>
                </div>

                <!-- Column 2: Drop Zones (66%) -->
                <div class="d-flex flex-wrap align-content-start" style="width: 67%; padding-top: 65%; padding-right: 30px;">
                    <div class="drop-zone-quadrant d-flex justify-content-center align-items-center" data-id="1" style="width: 50%; height: 460px; border: 1px solid rgba(255,255,255,0.1);">
                        <div class="drop-zone" data-id="1">Zone 1</div>
                    </div>
                    <div class="drop-zone-quadrant d-flex justify-content-center align-items-center" data-id="2" style="width: 50%; height: 460px; border: 1px solid rgba(255,255,255,0.1);">
                        <div class="drop-zone" data-id="2">Zone 2</div>
                    </div>
                    <div class="drop-zone-quadrant d-flex justify-content-center align-items-center" data-id="3" style="width: 50%; height: 460px; border: 1px solid rgba(255,255,255,0.1);">
                        <div class="drop-zone" data-id="3">Zone 3</div>
                    </div>
                    <div class="drop-zone-quadrant d-flex justify-content-center align-items-center" data-id="4" style="width: 50%; height: 460px; border: 1px solid rgba(255,255,255,0.1);">
                        <div class="drop-zone" data-id="4">Zone 4</div>
                    </div>
                </div>
            </div>
        `;

        this.createDraggableItems();

        // Timer
        if (this.timerInstance) this.timerInstance.stop();
        this.timerInstance = new CountdownTimer('g2-timer-container', 300, () => this.endGame(false, true));
        this.timerInstance.start();
    },

    createDraggableItems: function () {
        const container = document.getElementById('g2-drag-container');
        // We need to position them relative to the container or just flow them?
        // If we flow them, dragging logic needs to handle "absolute" positioning during drag.
        // In Game 1 we used absolute positioning. Here let's try to keep them in flow initially, 
        // but switch to absolute on drag? Or just use absolute from start.
        // Let's use absolute within the left column for smoother drag.

        const items = [
            { id: 1, img: 'assets/piece_game2_1_1.png', top: '35%' },
            { id: 2, img: 'assets/piece_game2_1_2.png', top: 'calc(35% + 160px)' },
            { id: 3, img: 'assets/piece_game2_1_3.png', top: 'calc(35% + 320px)' },
            { id: 4, img: 'assets/piece_game2_1_4.png', top: 'calc(35% + 480px)' }
        ];

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'draggable-item';
            el.setAttribute('data-id', item.id);
            // el.innerText = item.text; // Removed text
            
            // Image styling
            el.style.backgroundImage = `url('${item.img}')`;
            el.style.backgroundSize = 'contain';
            el.style.backgroundRepeat = 'no-repeat';
            el.style.backgroundPosition = 'center';
            el.style.width = '170px'; // Adjusted width
            el.style.height = '150px';

            el.style.position = 'absolute';
            el.style.top = item.top;
            // Center horizontally in the 33% column
            el.style.left = '50%';
            el.style.transform = 'translateX(-50%)';

            // Touch events
            el.addEventListener('touchstart', (e) => this.handleDragStart(e, el), { passive: false });
            el.addEventListener('touchmove', (e) => this.handleDragMove(e, el), { passive: false });
            el.addEventListener('touchend', (e) => this.handleDragEnd(e, el));

            // Mouse events
            el.addEventListener('mousedown', (e) => this.handleDragStart(e, el));

            container.appendChild(el);
        });

        // Global mouse move/up
        document.addEventListener('mousemove', (e) => this.handleGlobalMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleGlobalMouseUp(e));
    },

    handleDragStart: function (e, el) {
        if (!this.isPlaying) return;
        e.preventDefault();
        this.draggedItem = el;
        el.classList.add('dragging');

        const touch = e.touches ? e.touches[0] : e;
        const rect = el.getBoundingClientRect();
        this.offsetX = touch.clientX - rect.left;
        this.offsetY = touch.clientY - rect.top;

        // When dragging starts, we might want to move it to body or a higher container 
        // to avoid clipping if the column has overflow hidden (it shouldn't, but safe practice).
        // For now, we keep it in place but ensure z-index is high.
    },

    handleDragMove: function (e, el) {
        if (!this.draggedItem) return;
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;

        // We need to calculate position relative to the *game container* or *drag container*.
        // Since we want to drag across columns, we should probably set position to fixed or 
        // calculate relative to the main #game-container.

        // Let's use the same logic as Game 1: relative to #game-container.
        // But wait, the item is inside #g2-drag-container.
        // We should move the item to #game-container during drag to escape the column?
        // Or just rely on visual overflow.

        // Simple approach: Update left/top based on clientX/Y relative to the parent offset.
        // But the parent is the narrow column. If we move 'left' too much, it goes out.
        // As long as overflow is visible, it's fine.

        const container = document.getElementById('g2-drag-container');
        const containerRect = container.getBoundingClientRect();

        const x = touch.clientX - containerRect.left - this.offsetX;
        const y = touch.clientY - containerRect.top - this.offsetY;

        // We need to remove the transform translate we added for centering
        el.style.transform = 'none';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        this.checkDropZones(el);
    },

    handleDragEnd: function (e, el) {
        if (!this.draggedItem) return;
        el.classList.remove('dragging');

        console.log('Drag End. Current Drop Zone:', this.currentDropZone);

        if (this.currentDropZone) {
            this.snapToZone(el, this.currentDropZone);
        } else {
            // Reset...
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
        const elCenterX = elRect.left + elRect.width / 2;
        const elCenterY = elRect.top + elRect.height / 2;

        let minDistance = Infinity;
        let bestZone = null;
        const SNAP_THRESHOLD = 300; // Pixels

        document.querySelectorAll('.drop-zone').forEach(zone => {
            const zoneRect = zone.getBoundingClientRect();
            const zoneCenterX = zoneRect.left + zoneRect.width / 2;
            const zoneCenterY = zoneRect.top + zoneRect.height / 2;

            const dist = Math.sqrt(
                Math.pow(elCenterX - zoneCenterX, 2) + 
                Math.pow(elCenterY - zoneCenterY, 2)
            );

            // console.log(`Distance to zone ${zone.getAttribute('data-id')}: ${dist}`);

            if (dist < SNAP_THRESHOLD && dist < minDistance) {
                minDistance = dist;
                bestZone = zone;
            }
            zone.classList.remove('drag-over');
        });

        if (bestZone) {
            bestZone.classList.add('drag-over');
            this.currentDropZone = bestZone;
        } else {
            this.currentDropZone = null;
        }
    },

    snapToZone: function (el, zone) {
        const itemId = el.getAttribute('data-id');
        const zoneId = zone.getAttribute('data-id');

        console.log(`Snapping Item ${itemId} to Zone ${zoneId}`);

        // Always snap visual
        const zoneRect = zone.getBoundingClientRect();
        const container = document.getElementById('g2-drag-container');
        const containerRect = container.getBoundingClientRect();

        el.style.left = `${zoneRect.left - containerRect.left + (zoneRect.width - el.offsetWidth) / 2}px`;
        el.style.top = `${zoneRect.top - containerRect.top + (zoneRect.height - el.offsetHeight) / 2}px`;

        // Always lock and count
        el.style.pointerEvents = 'none';
        this.placedCount++;
        console.log(`Placed Count: ${this.placedCount}, Score: ${this.score}`);

        if (itemId === zoneId) {
            zone.classList.add('correct');
            this.score++;
        } else {
            zone.classList.add('wrong');
        }

        // Check completion (4 items)
        if (this.placedCount >= 4) {
            console.log('Game Over triggered');
            setTimeout(() => this.endGame(this.score >= this.targetScore, false), 500);
        }
    },

    endGame: function (win, isTimeout = false) {
        console.log(`Game 2 Ended. Win: ${win}, Timeout: ${isTimeout}, Score: ${this.score}`);
        this.isPlaying = false;
        if (this.timerInstance) this.timerInstance.stop();
        if (win) {
            app.showReward(20);
        } else if (isTimeout) {
            app.showScreen('screen-8');
        } else {
            app.showScreen('screen-next');
        }
    }
};
