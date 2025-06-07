import os
import shutil # Sử dụng shutil để đổi tên an toàn hơn trên một số hệ thống

# --- Cấu hình ---
# Đường dẫn đến thư mục cha chứa các thư mục món ăn tiếng Anh
# Ví dụ: Nếu script này nằm cùng cấp với thư mục 'pixabay_vip_dishes_images'
# thì PARENT_FOLDER_PATH = "." và DISHES_BASE_FOLDER = "pixabay_vip_dishes_images"
# Hoặc bạn có thể đặt đường dẫn tuyệt đối:
# DISHES_BASE_FOLDER = r"C:\Users\YourUser\Path\To\Your\Crawl\Project\pixabay_vip_dishes_images"
DISHES_BASE_FOLDER = "pixabay_vip_dishes_images" # THAY ĐỔI NẾU CẦN

# Ánh xạ từ tên thư mục tiếng Anh (viết thường, nối bằng dấu gạch dưới) sang tên tiếng Việt mong muốn
# Đảm bảo các key tiếng Anh khớp chính xác với tên thư mục hiện tại của bạn
FOLDER_NAME_MAPPING = {
    "grilled_lobster_with_garlic_butter": "Tôm Hùm Nướng Bơ Tỏi",
    "abalone_with_oyster_sauce": "Bào Ngư Sốt Dầu Hào",
    "steamed_king_crab_legs": "Chân Cua Hoàng Đế Hấp",
    "bird_s_nest_soup_with_crabmeat": "Súp Yến Cua", # Lưu ý: 'bird_s_nest'
    "steamed_codfish_with_ginger_and_scallions": "Cá Tuyết Hấp Gừng Hành",
    "grilled_wagyu_beef_steak": "Bò Wagyu Nướng",
    "peking_duck_with_pancakes": "Vịt Quay Bắc Kinh",
    "roasted_suckling_pig": "Heo Sữa Quay Da Giòn",
    "luxury_seafood_salad": "Gỏi Hải Sản Cao Cấp",
    "premium_mushroom_hot_pot": "Lẩu Nấm Thiên Nhiên Cao Cấp",
    "king_prawn_fried_rice": "Cơm Chiên Tôm Càng Vua", # Giả sử script crawl tạo tên này
    "stir_fried_glass_noodles_with_crab": "Miến Xào Cua Bể",
    "deluxe_seafood_spring_rolls": "Chả Giò Hải Sản Cao Cấp",
    "steamed_whole_garoupa_with_soy_sauce": "Cá Song Hấp Xì Dầu",
    "grilled_lamb_chops_with_rosemary": "Sườn Cừu Nướng Lá Hương Thảo",
    "pan_seared_foie_gras_with_berry_sauce": "Gan Ngỗng Áp Chảo Sốt Dâu Rừng",
    "crispy_skin_roasted_pigeon": "Bồ Câu Quay Da Giòn",
    "fresh_salmon_sashimi_platter": "Đĩa Sashimi Cá Hồi Tươi",
    "giant_river_prawns_with_tamarind_glaze": "Tôm Càng Xanh Sốt Me",
    "premium_vietnamese_dessert_platter": "Đĩa Tráng Miệng Việt Cao Cấp"
}

def rename_dish_folders(base_folder_path, mapping):
    """
    Đổi tên các thư mục con trong base_folder_path dựa trên mapping.
    """
    if not os.path.isdir(base_folder_path):
        print(f"LỖI: Không tìm thấy thư mục '{base_folder_path}'. Vui lòng kiểm tra lại đường dẫn.")
        return

    print(f"Đang quét thư mục: '{base_folder_path}'...")
    renamed_count = 0
    skipped_count = 0

    for current_folder_name in os.listdir(base_folder_path):
        old_folder_path = os.path.join(base_folder_path, current_folder_name)

        if os.path.isdir(old_folder_path): # Chỉ xử lý nếu là thư mục
            if current_folder_name in mapping:
                new_vietnamese_name = mapping[current_folder_name]
                new_folder_path = os.path.join(base_folder_path, new_vietnamese_name)

                # Kiểm tra xem tên mới đã tồn tại chưa (để tránh ghi đè nếu có sự trùng lặp không mong muốn)
                if os.path.exists(new_folder_path):
                    print(f"  CẢNH BÁO: Tên thư mục mới '{new_vietnamese_name}' đã tồn tại. Bỏ qua đổi tên cho '{current_folder_name}'.")
                    skipped_count += 1
                    continue
                
                try:
                    # Sử dụng shutil.move để đổi tên, hoạt động tốt hơn os.rename trên một số hệ thống
                    # và có thể di chuyển giữa các ổ đĩa khác nhau (mặc dù ở đây là cùng ổ đĩa)
                    shutil.move(old_folder_path, new_folder_path)
                    print(f"  ĐÃ ĐỔI TÊN: '{current_folder_name}' -> '{new_vietnamese_name}'")
                    renamed_count += 1
                except OSError as e:
                    print(f"  LỖI khi đổi tên '{current_folder_name}' thành '{new_vietnamese_name}': {e}")
                    skipped_count += 1
            else:
                print(f"  Bỏ qua: '{current_folder_name}' (không có trong danh sách ánh xạ).")
                skipped_count += 1
        # Bỏ qua nếu không phải là thư mục (ví dụ: file)
        # else:
        #     print(f"  Bỏ qua (không phải thư mục): '{current_folder_name}'")


    print("\n--- Hoàn tất đổi tên ---")
    print(f"Số thư mục đã đổi tên thành công: {renamed_count}")
    print(f"Số thư mục/mục đã bỏ qua: {skipped_count}")

# --- Chạy script ---
if __name__ == "__main__":
    print("--- BẮT ĐẦU SCRIPT ĐỔI TÊN THƯ MỤC MÓN ĂN ---")
    print("LƯU Ý: Hãy đảm bảo bạn đã sao lưu dữ liệu trước khi chạy!")
    # Xác nhận từ người dùng trước khi chạy để tránh thao tác nhầm
    # confirm = input(f"Bạn có chắc chắn muốn đổi tên các thư mục con trong '{DISHES_BASE_FOLDER}' không? (yes/no): ")
    # if confirm.lower() == 'yes':
    #     rename_dish_folders(DISHES_BASE_FOLDER, FOLDER_NAME_MAPPING)
    # else:
    #     print("Hủy bỏ thao tác đổi tên.")

    # Bỏ comment phần xác nhận ở trên nếu bạn muốn an toàn hơn.
    # Hiện tại, script sẽ chạy trực tiếp.
    rename_dish_folders(DISHES_BASE_FOLDER, FOLDER_NAME_MAPPING)