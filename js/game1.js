const game1 = {
    score: 0,
    targetScore: 4, // 4 items to place
    timerInstance: null,
    isPlaying: false,
    stage: 1,
    draggedItem: null,

    start: function () {
        console.log('Game 1 Started');
        this.score = 0;
        this.isPlaying = true;
        this.stage = 1;

        const container = document.getElementById('game1-container');
        // Setup 4 drop zones at top and 4 draggable items at bottom
        container.innerHTML = `
            <div id="g1-timer-container" class="position-absolute top-0 start-50 translate-middle-x mt-3"></div>
            
            <!-- Drop Zones (Top) -->
            <div class="d-flex justify-content-around w-100 position-absolute" style="top: 20%;">
                <div class="drop-zone" data-id="1">1</div>
                <div class="drop-zone" data-id="2">2</div>
                <div class="drop-zone" data-id="3">3</div>
                <div class="drop-zone" data-id="4">4</div>
            </div>

            <!-- Draggable Items (Bottom) -->
            <div id="drag-container" class="w-100 h-100 position-relative">
                <!-- Items will be positioned absolutely via JS or CSS -->
            </div>
        `;

        this.createDraggableItems();
        this.setupDragEvents();

        if (this.timerInstance) this.timerInstance.stop();
        this.timerInstance = new CountdownTimer('g1-timer-container', 20, () => this.endGame(false));
        this.timerInstance.start();
    },

    createDraggableItems: function () {
        const container = document.getElementById('drag-container');
        const items = [
            { id: 1, text: '1', left: '10%', top: '70%' },
            { id: 2, text: '2', left: '30%', top: '70%' },
            { id: 3, text: '3', left: '50%', top: '70%' },
            { id: 4, text: '4', left: '70%', top: '70%' }
        ];

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

    handleDragStart: function (e, el) {
        if (!this.isPlaying) return;
        e.preventDefault();
        this.draggedItem = el;
        el.classList.add('dragging');

        // Initial offset calculation
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

        // Update position (relative to viewport, but we need to handle container context if needed)
        // Ideally we move it fixed or absolute to body for simplicity during drag, 
        // but here we are absolute in #game-container.
        // Let's convert client coordinates to container relative.
        const container = document.getElementById('game-container');
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

        // Check final drop
        if (this.currentDropZone) {
            this.snapToZone(el, this.currentDropZone);
        } else {
            // Return to start or stay? Let's stay for now or reset.
        }

        this.draggedItem = null;
        this.currentDropZone = null;

        // Clear highlights
        document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    },

    // Mouse handlers wrappers
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
        // Calculate overlap area instead of just center point
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
            // Correct match
            const zoneRect = zone.getBoundingClientRect();
            const container = document.getElementById('game-container');
            const containerRect = container.getBoundingClientRect();

            // Center in zone
            el.style.left = `${zoneRect.left - containerRect.left + (zoneRect.width - el.offsetWidth) / 2}px`;
            el.style.top = `${zoneRect.top - containerRect.top + (zoneRect.height - el.offsetHeight) / 2}px`;

            zone.classList.add('correct');
            el.style.pointerEvents = 'none'; // Disable further dragging
            this.score++;

            if (this.score >= this.targetScore) {
                setTimeout(() => this.endGame(true), 500);
            }
        } else {
            // Wrong match - maybe bounce back?
            // For now just leave it there or let user drag again
        }
    },

    setupDragEvents: function () {
        // Handled in createDraggableItems
    },

    endGame: function (win) {
        this.isPlaying = false;
        if (this.timerInstance) this.timerInstance.stop();

        // Clean up global listeners
        // Note: In a real app, we should name these functions to remove them correctly
        // For this prototype, we might leak listeners if we restart game 1 multiple times without reload.
        // Let's fix that by storing references if needed, or just relying on simple logic.

        if (win) {
            app.showScreen('screen-7'); // Win
        } else {
            app.showScreen('screen-8'); // Timeout
        }
    }
};
