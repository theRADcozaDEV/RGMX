import struct
import sys

def get_png_dimensions(file_path):
    with open(file_path, 'rb') as f:
        data = f.read(24)
        if data[:8] != b'\x89PNG\r\n\x1a\n':
            return "Not a PNG"
        w, h = struct.unpack('>II', data[16:24])
        return f"{w}x{h}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(get_png_dimensions(sys.argv[1]))
