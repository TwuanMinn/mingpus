import urllib.request
from rembg import remove
from PIL import Image
import os

input_path = r"C:\Users\Admin\.gemini\antigravity\brain\1a69d836-b830-4c95-9ae2-2fd2e0029336\rocket_white_blue_1776424195141.png"
output_path = r"c:\Users\Admin\Downloads\IT career projects\mingpus\public\images\rocket-transparent.png"

# First, ensure u2net.onnx exists in ~/.u2net/ to avoid huge download delays in the middle of executing.
u2net_dir = os.path.expanduser('~/.u2net')
os.makedirs(u2net_dir, exist_ok=True)
u2net_path = os.path.join(u2net_dir, 'u2net.onnx')

print("Loading image...")
input_image = Image.open(input_path)
print("Removing background... this might take a moment if it needs to download the model.")
output_image = remove(input_image)
print("Saving image with true transparency...")
output_image.save(output_path)
print("Done!")
