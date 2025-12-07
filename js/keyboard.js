class VirtualKeyboard {
    constructor(containerId, inputIds) {
        this.container = document.getElementById(containerId);
        this.inputs = inputIds.map(id => document.getElementById(id));
        this.activeInput = this.inputs[0]; // Default to first input
        this.capsLock = false;

        this.init();
    }

    init() {
        this.render();
        this.attachInputListeners();
    }

    attachInputListeners() {
        this.inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.activeInput = input;
                this.show();
            });
            // Prevent default keyboard on touch devices if needed, 
            // but usually we want to keep it simple. 
            // For a kiosk, we might want to prevent blur or force focus.
        });
    }

    render() {
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];

        let html = '<div class="keyboard-wrapper" style="background: #333; padding: 20px; border-radius: 10px;">';

        rows.forEach(row => {
            html += '<div class="d-flex justify-content-center mb-2">';
            row.forEach(key => {
                html += `<button class="btn btn-danger m-1 key-btn" data-key="${key}" style="width: 60px; height: 60px; font-size: 1.5rem;">${key}</button>`;
            });
            html += '</div>';
        });

        // Space and Backspace
        html += '<div class="d-flex justify-content-center mb-2">';
        html += `<button class="btn btn-danger m-1 key-btn" data-key="SPACE" style="width: 300px; height: 60px; font-size: 1.5rem;">SPACE</button>`;
        html += `<button class="btn btn-dark m-1 key-btn" data-key="BACKSPACE" style="width: 100px; height: 60px; font-size: 1.5rem;">⌫</button>`;
        html += '</div>';

        html += '</div>';
        this.container.innerHTML = html;

        // Attach click listeners
        this.container.querySelectorAll('.key-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent focus loss
                this.handleKey(btn.getAttribute('data-key'));
            });
        });
    }

    handleKey(key) {
        if (!this.activeInput) return;

        if (key === 'BACKSPACE') {
            this.activeInput.value = this.activeInput.value.slice(0, -1);
        } else if (key === 'SPACE') {
            this.activeInput.value += ' ';
        } else {
            this.activeInput.value += key;
        }
    }

    show() {
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }
}
