# RGMX Game App

## Overview
This is an interactive web application designed for a 4k portrait touch screen (9:16 aspect ratio). It features 3 mini-games, a home screen, an input form, and hardware integration for LED control.

## Project Structure
- **index.html**: Main entry point containing all screens and layout.
- **css/styles.css**: Styles for the 4k portrait layout, animations (pulse), and game elements.
- **js/app.js**: Main application logic (screen navigation, idle timer, LED triggers).
- **js/game1.js**: **Drag & Drop Game**. 4 items to 4 top zones.
- **js/game2.js**: **Drag & Drop Game**. 4 items to 4 quadrant zones (2 columns).
- **js/game3.js**: **Grid Tap Game**. 2x3 Grid, find correct items.
- **js/keyboard.js**: Virtual on-screen keyboard for the input form.
- **js/timer.js**: Reusable SVG countdown timer class.
- **server/led_server.py**: Python server for controlling SP108E LED controller.
- **assets/**: Contains all screen images.

## How to Run the Game
1.  **Open the App**: Simply open `index.html` in a modern web browser (Chrome recommended).
2.  **Resolution**: For testing on a standard monitor, use Chrome DevTools "Device Mode" and set the resolution to **2160x3840** (or a 9:16 ratio).

## LED Integration (Hardware)
The game controls an external LED strip via an **SP108E WiFi Controller**.

### Prerequisites
- **Python 3.x** installed on the machine running the game.
- **SP108E Controller** connected to the same WiFi network.

### Setup
1.  Open `server/led_server.py`.
2.  Update the `CONTROLLER_IP` variable with your SP108E's IP address (currently set to `192.168.0.141`).
3.  Open a terminal/command prompt in the project root.
4.  Run the server:
    ```bash
    python server/led_server.py
    ```
5.  Keep this terminal open while playing the game. The game communicates with this server via `http://localhost:8000`.

### LED Behavior
- **Idle (Home)**: Blue
- **Game 1**: Red
- **Game 2**: Green
- **Game 3**: Blue
- **Win**: Green
- **Lose**: Red

## Auto-Start on Windows
To ensure the LED server starts automatically when the PC turns on and stays running:

1.  **Test the Script**: Double-click `start_server.bat` in the project folder. It should open a terminal window and start the server. Close it to test the next step.
2.  **Create a Shortcut**: Right-click `start_server.bat` -> **Create shortcut**.
3.  **Open Startup Folder**:
    - Press `Win + R` on your keyboard.
    - Type `shell:startup` and press Enter.
4.  **Move Shortcut**: Drag the shortcut you created into the Startup folder.

Now, whenever the PC logs in, the server window will pop up and run. The script includes a loop to automatically restart the server if it crashes.

## Game Mechanics
- **Game 1**: Drag 4 items from the bottom to their corresponding numbered slots at the top.
- **Game 2**: Drag 4 items from the left column to the correct quadrants in the right column.
- **Game 3**: Tap the correct blocks in a 2x3 grid. Finding all correct blocks advances the stage.
- **Input Form**: Appears after any game ends (Win or Lose). Allows user to enter Name and Department using an on-screen keyboard.

## Server Upload & Configuration
The app supports background uploading of game scores to a PHP/MySQL server.

### 1. Configuration (`config.json`)
You must create a `config.json` file in the root folder to define the environment settings. This file is **ignored by Git** to allow different settings for Dev and Live environments.

**Example `config.json`:**
```json
{
    "location_id": "Store_NYC_01",
    "api_url": "https://your-domain.com/upload.php"
}
```
*   `location_id`: Identifier for the physical machine/kiosk.
*   `api_url`: Full URL to the `upload.php` script.

To prevent Git from tracking changes to this file on the live server:
```bash
git update-index --skip-worktree config.json
```

### 2. Backend Setup
Files are provided in the `server/` directory:
*   `server/upload.php`: Handles JSON payloads, prevents duplicates, and saves to MySQL.
*   `server/schema.sql`: MySQL table creation script.

**Deployment:**
1.  Create a MySQL database and run `schema.sql`.
2.  Upload `upload.php` to your web server.
3.  Edit `upload.php` with your database credentials (`$host`, `$db`, `$user`, `$pass`).

### 3. Sync Logic
*   **Queue System**: If the device is offline, scores are saved to `localStorage` ("Upload Queue").
*   **Auto-Retry**: The app attempts to upload the queue on startup and after every game submission.
*   **Deduplication**: Each score has a unique UUID. The server rejects duplicates, preventing double-counting.

## Customization
- **Game Logic**: Edit `js/gameX.js` to change scoring, timing, or mechanics.
- **Visuals**: Replace images in `assets/` or update `css/styles.css`.
- **LED Colors**: Update `js/app.js` (look for `setLedColor` calls).
