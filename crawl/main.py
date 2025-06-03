import requests
import os
import time

# --- Cấu hình ---
PIXABAY_API_KEY = "50373751-4ed8fe2e32024b1636146f68d"  # <<< THAY THẾ BẰNG API KEY CỦA BẠN
OUTPUT_FOLDER = "pixabay_vip_dishes_images" # Thư mục chính lưu tất cả ảnh
IMAGES_TO_DOWNLOAD_PER_DISH = 7          # Số lượng ảnh muốn tải cho MỖI món (bạn có thể thay đổi)
IMAGE_TYPE = "photo"
LANGUAGE = "en"                         # QUAN TRỌNG: Giữ "en" để tìm kiếm bằng tiếng Anh
SAFE_SEARCH = "true"                    # Bật/tắt tìm kiếm an toàn (true/false)

# Danh sách các món ăn "VIP" cần crawl (BẰNG TIẾNG ANH)
DISH_NAMES_TO_CRAWL = [
    "Grilled Lobster with Garlic Butter", "Abalone with Oyster Sauce", "Steamed King Crab Legs",
    "Bird's Nest Soup with Crabmeat", "Steamed Codfish with Ginger and Scallions",
    "Grilled Wagyu Beef Steak", "Peking Duck with Pancakes", "Roasted Suckling Pig",
    "Luxury Seafood Salad", "Premium Mushroom Hot Pot", "King Prawn Fried Rice",
    "Stir-fried Glass Noodles with Crab", "Deluxe Seafood Spring Rolls",
    "Steamed Whole Garoupa with Soy Sauce", "Grilled Lamb Chops with Rosemary",
    "Pan-Seared Foie Gras with Berry Sauce", "Crispy Skin Roasted Pigeon",
    "Fresh Salmon Sashimi Platter", "Giant River Prawns with Tamarind Glaze",
    "Premium Vietnamese Dessert Platter"
]

def download_image_from_url(image_url, image_id_from_api, dish_name_for_folder, image_index):
    """Tải một hình ảnh từ URL và lưu vào thư mục được chỉ định."""
    try:
        print(f"  Đang tải: {image_url}")
        # Lấy header để kiểm tra content-type trước khi tải toàn bộ nếu cần thiết (tùy chọn)
        head_response = requests.head(image_url, headers={'User-Agent': HEADERS.get('User-Agent')}, timeout=10)
        head_response.raise_for_status()
        content_type = head_response.headers.get('content-type')

        img_response = requests.get(image_url, headers={'User-Agent': HEADERS.get('User-Agent')}, stream=True, timeout=15)
        img_response.raise_for_status()

        file_extension = '.jpg' # Mặc định
        if content_type:
            if 'jpeg' in content_type: file_extension = '.jpg'
            elif 'png' in content_type: file_extension = '.png'
            elif 'webp' in content_type: file_extension = '.webp'
        else: # Thử đoán từ URL nếu không có content-type
            if '.png' in image_url.lower(): file_extension = '.png'
            elif '.jpg' in image_url.lower() or '.jpeg' in image_url.lower(): file_extension = '.jpg'
            elif '.webp' in image_url.lower(): file_extension = '.webp'
        
        filename_base = f"pixabay_{image_id_from_api}_{str(image_index).zfill(2)}"
        filename = os.path.join(dish_name_for_folder, f"{filename_base}{file_extension}")

        with open(filename, 'wb') as f:
            for chunk in img_response.iter_content(8192):
                f.write(chunk)
        print(f"  ĐÃ TẢI: {filename}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"  Lỗi khi tải {image_url}: {e}")
        return False
    except Exception as e:
        print(f"  Lỗi không xác định khi xử lý {image_url}: {e}")
        return False

def fetch_images_for_dish_via_api(api_key, dish_search_query, num_images_per_dish, img_type, lang, safe_search, dish_output_folder):
    """Lấy và tải ảnh cho một món ăn cụ thể từ Pixabay API."""
    
    api_url = "https://pixabay.com/api/"
    # Pixabay API giới hạn số kết quả mỗi trang (thường là 200), mặc định là 20.
    # Để lấy đúng số lượng mong muốn (num_images_per_dish), đặt per_page bằng số đó (nhưng không quá 200).
    results_per_page = min(num_images_per_dish, 200) 

    params = {
        'key': api_key,
        'q': dish_search_query,
        'image_type': img_type,
        'lang': lang,
        'safesearch': safe_search,
        'per_page': results_per_page, # Lấy đủ số ảnh cần trong 1 request (nếu <=200)
        'page': 1 # Bắt đầu từ trang 1
    }

    try:
        print(f"Đang gửi yêu cầu API cho từ khóa: '{dish_search_query}' (ngôn ngữ: {lang}, số lượng yêu cầu: {results_per_page})...")
        response = requests.get(api_url, params=params, timeout=10)
        response.raise_for_status() # Kiểm tra lỗi HTTP (4xx, 5xx)
        
        data = response.json()
        
        total_downloaded_for_this_dish = 0
        if 'hits' in data and data['hits']:
            print(f"API trả về {len(data['hits'])} kết quả (trên tổng số {data.get('totalHits', 0)} tìm thấy cho '{dish_search_query}').")
            
            for i, hit in enumerate(data['hits']):
                # Chỉ tải đủ số lượng yêu cầu cho mỗi món
                if total_downloaded_for_this_dish >= num_images_per_dish:
                    break
                
                # Ưu tiên ảnh chất lượng cao nếu có từ API response
                image_to_download_url = hit.get('largeImageURL')  # Ảnh lớn
                if not image_to_download_url:
                    image_to_download_url = hit.get('webformatURL') # Ảnh kích thước web (thường là 640px rộng)
                if not image_to_download_url:
                    image_to_download_url = hit.get('previewURL') # Ảnh preview (nhỏ nhất)

                if image_to_download_url:
                    image_id = hit.get('id', str(i+1)) # Lấy ID ảnh từ Pixabay để đặt tên file
                    if download_image_from_url(image_to_download_url, image_id, dish_output_folder, total_downloaded_for_this_dish + 1):
                        total_downloaded_for_this_dish += 1
                    time.sleep(0.5) # Đợi một chút giữa các lần tải để tránh gây quá tải
                else:
                    print(f"  Không tìm thấy URL ảnh phù hợp cho item {i+1} của món '{dish_search_query}'")
            
            if total_downloaded_for_this_dish < num_images_per_dish and data.get('totalHits', 0) > total_downloaded_for_this_dish and len(data['hits']) == results_per_page :
                 print(f"Lưu ý: Bạn yêu cầu {num_images_per_dish} ảnh cho '{dish_search_query}', API đã trả về đủ số lượng trên trang đầu tiên. Nếu muốn nhiều hơn 200, cần xử lý phân trang.")
            elif total_downloaded_for_this_dish < num_images_per_dish:
                 print(f"Lưu ý: Bạn yêu cầu {num_images_per_dish} ảnh, nhưng API chỉ tìm thấy/trả về {total_downloaded_for_this_dish} ảnh phù hợp cho '{dish_search_query}'.")
        
        else: # Không có 'hits' hoặc 'hits' rỗng
            print(f"API không trả về kết quả nào hoặc có lỗi cho từ khóa '{dish_search_query}'.")
            if 'totalHits' in data and data['totalHits'] == 0:
                 print(f"Không tìm thấy ảnh nào trên Pixabay cho '{dish_search_query}'.")
            else: # Có thể có lỗi khác từ API, in ra để debug
                print("Phản hồi từ API (có thể chứa thông báo lỗi):", data)
        
        return total_downloaded_for_this_dish # Trả về số lượng ảnh đã tải thành công cho món này
                
    except requests.exceptions.RequestException as e:
        print(f"Lỗi kết nối hoặc yêu cầu API cho '{dish_search_query}': {e}")
    except ValueError as e: # Lỗi khi parse JSON
        print(f"Lỗi khi xử lý dữ liệu JSON từ API cho '{dish_search_query}': {e}")
        # print("Nội dung phản hồi (nếu có):", response.text if 'response' in locals() else "Không có response") # Bỏ comment nếu muốn debug
    except Exception as e:
        print(f"Lỗi không xác định khi xử lý '{dish_search_query}': {e}")
    return 0 # Trả về 0 nếu có lỗi

# Biến toàn cục cho header (để hàm download_image_from_url có thể dùng)
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# --- Chạy script cho từng món ăn ---
if __name__ == "__main__":
    print("--- SỬ DỤNG API PIXABAY ĐỂ TẢI ẢNH MÓN ĂN 'VIP' (TIẾNG ANH) ---")
    
    # Kiểm tra API Key ngay từ đầu
    if PIXABAY_API_KEY == "YOUR_PIXABAY_API_KEY" or not PIXABAY_API_KEY:
        print(">>> LỖI QUAN TRỌNG: Vui lòng mở code và thay thế 'YOUR_PIXABAY_API_KEY' bằng API Key Pixabay thực tế của bạn! <<<")
        print("Bạn có thể lấy API key tại: https://pixabay.com/api/docs/")
    else:
        # Tạo thư mục chính nếu chưa có
        if not os.path.exists(OUTPUT_FOLDER):
            try:
                os.makedirs(OUTPUT_FOLDER)
                print(f"Đã tạo thư mục chính: '{OUTPUT_FOLDER}'")
            except OSError as e:
                print(f"Lỗi khi tạo thư mục chính '{OUTPUT_FOLDER}': {e}. Vui lòng kiểm tra quyền ghi.")
                # Thoát nếu không tạo được thư mục chính
                exit() 
            
        total_images_successfully_downloaded_overall = 0
        for dish_search_term in DISH_NAMES_TO_CRAWL:
            print(f"\n--- Bắt đầu xử lý món: {dish_search_term} ---")
            
            # Tạo tên thư mục con hợp lệ từ tên món ăn
            # Loại bỏ các ký tự không hợp lệ và giới hạn độ dài
            sanitized_folder_name_base = "".join(c if c.isalnum() or c in " _-" else "" for c in dish_search_term)
            sanitized_folder_name = "_".join(sanitized_folder_name_base.split()).lower() # Thay khoảng trắng bằng _
            max_folder_name_len = 50 
            if len(sanitized_folder_name) > max_folder_name_len:
                sanitized_folder_name = sanitized_folder_name[:max_folder_name_len]
            if not sanitized_folder_name: # Nếu tên rỗng sau khi làm sạch
                sanitized_folder_name = f"dish_{DISH_NAMES_TO_CRAWL.index(dish_search_term)}"


            current_dish_output_folder = os.path.join(OUTPUT_FOLDER, sanitized_folder_name)
            
            if not os.path.exists(current_dish_output_folder):
                try:
                    os.makedirs(current_dish_output_folder)
                except OSError as e:
                    print(f"  Lỗi khi tạo thư mục con '{current_dish_output_folder}': {e}. Ảnh sẽ được lưu vào thư mục gốc '{OUTPUT_FOLDER}'.")
                    current_dish_output_folder = OUTPUT_FOLDER # Lưu vào thư mục gốc nếu không tạo được thư mục con

            print(f"Ảnh cho '{dish_search_term}' sẽ được lưu vào: '{current_dish_output_folder}'")

            downloaded_for_this_dish = fetch_images_for_dish_via_api(
                PIXABAY_API_KEY,
                dish_search_term,
                IMAGES_TO_DOWNLOAD_PER_DISH,
                IMAGE_TYPE,
                LANGUAGE,
                SAFE_SEARCH,
                current_dish_output_folder
            )
            total_images_successfully_downloaded_overall += downloaded_for_this_dish
            print(f"Đã tải {downloaded_for_this_dish} ảnh cho món '{dish_search_term}'.")
            print(f"--- Hoàn tất xử lý món: {dish_search_term} ---\n")
            
            # Đợi một chút trước khi xử lý món tiếp theo để tránh gửi quá nhiều request liên tục
            time.sleep(1) # Có thể tăng lên 2-3 giây nếu cần

        print(f"--- HOÀN TẤT TOÀN BỘ QUÁ TRÌNH ---")
        print(f"Tổng cộng đã tải về thành công {total_images_successfully_downloaded_overall} ảnh.")
        print(f"Tất cả ảnh được lưu trong các thư mục con bên trong: '{OUTPUT_FOLDER}'")