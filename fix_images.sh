#!/bin/bash

# Đường dẫn đến thư mục public của backend
PUBLIC_DIR="/home/charos-nguyen/Music/qlda/backend/public"

# Đọc từng dòng trong file missing_images.txt
while IFS= read -r image_path; do
  # Lấy đường dẫn thư mục chứa hình ảnh
  dir_path=$(dirname "$PUBLIC_DIR$image_path")
  
  # Lấy tên file hình ảnh
  file_name=$(basename "$image_path")
  
  # Kiểm tra xem thư mục có tồn tại không
  if [ -d "$dir_path" ]; then
    # Kiểm tra xem file hình ảnh có tồn tại không
    if [ ! -f "$PUBLIC_DIR$image_path" ]; then
      echo "File không tồn tại: $PUBLIC_DIR$image_path"
      
      # Tìm file hình ảnh đầu tiên trong thư mục
      first_image=$(ls -1 "$dir_path"/*.jpg 2>/dev/null | head -n 1)
      
      if [ -n "$first_image" ]; then
        # Tạo symbolic link từ file đầu tiên đến file cần thiết
        echo "Tạo symbolic link từ $first_image đến $PUBLIC_DIR$image_path"
        ln -sf "$(basename "$first_image")" "$PUBLIC_DIR$image_path"
      else
        echo "Không tìm thấy file hình ảnh nào trong thư mục $dir_path"
      fi
    fi
  else
    echo "Thư mục không tồn tại: $dir_path"
  fi
done < missing_images.txt

echo "Hoàn thành!" 