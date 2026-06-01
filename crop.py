from PIL import Image
import os

img_path = "/home/kirtagya/Downloads/WhatsApp Image 2026-06-01 at 5.03.38 PM.jpeg"
img = Image.open(img_path)
w, h = img.size

# Assuming the square menu is centered vertically
menu_y = (h - w) // 2
menu = img.crop((0, menu_y, w, menu_y + w))
os.makedirs("public/uploads", exist_ok=True)
menu.save("public/uploads/menu_crop.jpg")

# The menu has 8 rows of items. Let's slice the menu into 8 rows.
# But there is a header at the top of the menu and a footer.
# Let's say header is top 20%, footer is bottom 10%.
start_y = int(w * 0.25)
end_y = int(w * 0.90)
row_h = (end_y - start_y) / 8

for i in range(8):
    y1 = start_y + i * row_h
    y2 = start_y + (i + 1) * row_h
    # Icons are roughly between x=20% and x=40%
    x1 = int(w * 0.20)
    x2 = int(w * 0.40)
    icon = menu.crop((x1, int(y1), x2, int(y2)))
    icon.save(f"public/uploads/icon_{i+1}.jpg")
