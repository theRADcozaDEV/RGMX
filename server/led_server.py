import http.server
import socketserver
import socket
import urllib.parse

# Configuration
CONTROLLER_IP = "192.168.0.141" # Updated with User's IP
LED_PORT = 8189
SERVER_PORT = 8000

def send_led_cmd(data):
    try:
        print(f"Sending to LED: {data.hex()}")
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2) # Short timeout
        sock.connect((CONTROLLER_IP, LED_PORT))
        sock.send(data)
        sock.close()
    except Exception as e:
        print(f"LED Error: {e}")

def set_led_color(r, g, b):
    # Protocol: 38 R G B 22 83
    cmd = bytearray([0x38, r, g, b, 0x22, 0x83])
    send_led_cmd(cmd)

class LEDRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse URL
        parsed_path = urllib.parse.urlparse(self.path)
        query_params = urllib.parse.parse_qs(parsed_path.query)
        
        if parsed_path.path == "/set_color":
            try:
                r = int(query_params.get('r', [0])[0])
                g = int(query_params.get('g', [0])[0])
                b = int(query_params.get('b', [0])[0])
                
                set_led_color(r, g, b)
                
                self.send_response(200)
                self.send_header("Content-type", "text/plain")
                self.send_header("Access-Control-Allow-Origin", "*") # Allow browser access
                self.end_headers()
                self.wfile.write(b"Color set")
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        else:
            self.send_response(404)
            self.end_headers()

    # Handle CORS preflight
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type")
        self.end_headers()

if __name__ == "__main__":
    print(f"Starting LED Server on port {SERVER_PORT}...")
    print(f"Target LED Controller: {CONTROLLER_IP}")
    
    with socketserver.TCPServer(("", SERVER_PORT), LEDRequestHandler) as httpd:
        print("Server running. Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopping server.")
