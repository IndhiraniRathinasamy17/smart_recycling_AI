# from fastapi import APIRouter, UploadFile, File
# from app.services.file_service import save_file
# from app.utils.db import files_collection

# router = APIRouter()

# @router.post("/file/upload")
# async def upload_file(file: UploadFile = File(...)):
#     filename, path = save_file(file)

#     files_collection.insert_one({
#         "filename": filename,
#         "path": path,
#         "size_kb": round(file.size / 1024, 2)
#     })

#     return {
#         "message": "file uploaded",
#         "file_info": {
#             "filename": filename,
#             "size_kb": round(file.size / 1024, 2)
#         }
#     }

from fastapi import APIRouter, UploadFile, File
from app.services.file_service import save_file
from app.utils.db import files_collection

router = APIRouter()

@router.post("/file/upload")
async def upload_file(file: UploadFile = File(...)):
    # Read file content manually (UploadFile has no .size)
    file_bytes = await file.read()
    size_kb = round(len(file_bytes) / 1024, 2)

    # Save file
    filename, path = save_file(file.filename, file_bytes)

    # Store in DB
    files_collection.insert_one({
        "filename": filename,
        "path": path,
        "size_kb": size_kb
    })

    return {
        "message": "file uploaded successfully",
        "file_info": {
            "filename": filename,
            "path": path,
            "size_kb": size_kb
        }
    }
