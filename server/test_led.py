import socket
import sys
import time

# DEFAULT IP - PLEASE CHANGE THIS
# You can find the IP in your router settings or the LedShop app
CONTROLLER_IP = "192.168.0.141" 
PORT = 8189

def send_cmd(data):
    try:
        print(f"Connecting to {CONTROLLER_IP}:{PORT}...")
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect((CONTROLLER_IP, PORT))
        print(f"Sending: {data.hex()}")
        sock.send(data)
        # Some controllers send a response, but we might not need to wait for it for simple control
        sock.close()
        print("Command sent successfully.")
    except Exception as e:
        print(f"Error: {e}")

def set_color(r, g, b):
    # Protocol: 38 R G B 22 83 (Common for SP108E static color)
    # Byte 0: 0x38 (Start)
    # Byte 1: Red
    # Byte 2: Green
    # Byte 3: Blue
    # Byte 4: 0x22 (Set Color Instruction?) - Or maybe 0x02?
    # Byte 5: 0x83 (End)
    
    # Note: Some sources say the instruction is byte 4 (0-indexed).
    # Let's try the pattern: 38 R G B 22 83
    cmd = bytearray([0x38, r, g, b, 0x22, 0x83])
    send_cmd(cmd)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        CONTROLLER_IP = sys.argv[1]
    
    print(f"Target IP: {CONTROLLER_IP}")
    print("Trying to set color to RED...")
    set_color(255, 255, 0)
    
    print("\nIf the LED did not turn RED, please check:")
    print("1. The IP address is correct.")
    print("2. The controller is powered on.")
    print("3. Your PC is on the same WiFi network.")
