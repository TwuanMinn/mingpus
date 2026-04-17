import urllib.request
from rembg import remove
from PIL import Image
import os

input_path = r"C:\Users\Admin\.gemini\antigravity\brain\64718066-e243-4fa2-ae1b-131afdf287e9\auth_isometric_cyan_1776418147486.png"
output_path = r"c:\Users\Admin\Downloads\IT career projects\mingpus\public\auth-cyan-3d.png"

# First, ensure u2net.onnx exists in ~/.u2net/ to avoid huge download delays in the middle of executing.
u2net_dir = os.path.expanduser('~/.u2net')
os.makedirs(u2net_dir, exist_ok=True)
u2net_path = os.path.join(u2net_dir, 'u2net.onnx')

# if not os.path.exists(u2net_path):
#    print("Wait, rembg downloads automatically. Let's just let it run.")

print("Loading image...")
input_image = Image.open(input_path)
print("Removing background... this might take a moment if it needs to download the model.")
output_image = remove(input_image)
print("Saving image with true transparency...")
output_image.save(output_path)
print("Done!")
