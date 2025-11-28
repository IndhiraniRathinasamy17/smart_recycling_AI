# import uuid
# import os

# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# def save_file(file):
#     filename = f"{uuid.uuid4()}_{file.filename}"
#     file_path = os.path.join(UPLOAD_DIR, filename)

#     with open(file_path, "wb") as f:
#         f.write(file.file.read())

#     return filename, file_path

import uuid
import os

# Create safe upload dir
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "..", "..", "uploads")
UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)

os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_file(original_filename, file_bytes):
    # generate unique name
    filename = f"{uuid.uuid4()}_{original_filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # write file
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    return filename, file_path
