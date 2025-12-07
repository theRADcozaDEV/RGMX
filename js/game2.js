const game2 = {
    score: 0,
    targetScore: 4,
    timerInstance: null,
    isPlaying: false,
    draggedItem: null,

    start: function () {
        console.log('Game 2 Started');
        this.score = 0;
        this.isPlaying = true;

        const container = document.getElementById('game2-container');
        container.innerHTML = `
            <div id="g2-timer-container" class="position-absolute top-0 start-0 m-5" style="z-index: 20;"></div>
            
            <div class="d-flex w-100 h-100">
                <!-- Column 1: Draggable Items (33%) -->
                <div class="d-flex flex-column justify-content-around align-items-center" style="width: 33%; background: rgba(0,0,0,0.2);">
                    <div id="g2-drag-container" class="d-flex flex-column justify-content-around h-100 w-100 align-items-center position-relative">
                        <!-- Items will be injected here -->
                    </div>
                </div>

                <!-- Column 2: Drop Zones (66%) -->
                <div class="d-flex flex-wrap" style="width: 67%;">
                    <div class="drop-zone-quadrant d-flex justify-content-center align-items-center" data-id="1" style="width: 50%; height: 50%; border: 1px solid rgba(255,255,255,0.1);">
                        <div class="drop-zone" data-id="1">Zone 1</div>
                    </div>
                    <div class="drop-zone-quadrant d-flex justify-content-center align-items-center" data-id="2" style="width: 50%; height: 50%; border: 1px solid rgba(255,255,255,0.1);">
                        <div class="drop-zone" data-id="2">Zone 2</div>
                    </div>
                    <div class="drop-zone-quadrant d-flex justify-content-center align-items-center" data-id="3" style="width: 50%; height: 50%; border: 1px solid rgba(255,255,255,0.1);">
                        <div class="drop-zone" data-id="3">Zone 3</div>
                    </div>
                    <div class="drop-zone-quadrant d-flex justify-content-center align-items-center" data-id="4" style="width: 50%; height: 50%; border: 1px solid rgba(255,255,255,0.1);">
                        <div class="drop-zone" data-id="4">Zone 4</div>
                    </div>
                </div>
            </div>
        `;

        this.createDraggableItems();

        // Timer
        if (this.timerInstance) this.timerInstance.stop();
        this.timerInstance = new CountdownTimer('g2-timer-container', 20, () => this.endGame(false));
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
            { id: 1, text: 'Item 1', top: '10%' },
            { id: 2, text: 'Item 2', top: '35%' },
            { id: 3, text: 'Item 3', top: '60%' },
            { id: 4, text: 'Item 4', top: '85%' }
        ];

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'draggable-item';
            el.setAttribute('data-id', item.id);
            el.innerText = item.text;
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

        if (this.currentDropZone) {
            this.snapToZone(el, this.currentDropZone);
        } else {
            // Reset to initial position?
            // For now, let's just re-center it in the column if missed?
            // Or leave it.
            // Let's re-apply the centering transform if it's not dropped.
            // Actually, finding the original 'top' is hard unless stored.
            // Let's just leave it where dropped for now.
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

        // Aggressive snap: As long as there is ANY overlap, pick the best one.
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
            // We need to move the element from the left column container to the game container 
            // or just position it absolutely relative to the zone.
            // Easiest is to append it to the zone? No, styles might break.
            // Let's calculate position relative to the *current parent* (#g2-drag-container) 
            // that makes it appear over the zone.

            const zoneRect = zone.getBoundingClientRect();
            const container = document.getElementById('g2-drag-container');
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
