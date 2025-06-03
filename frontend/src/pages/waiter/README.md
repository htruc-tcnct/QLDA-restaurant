# Quy trình đồng bộ giữa đặt bàn và quản lý bàn

## Tổng quan

Hệ thống quản lý nhà hàng cần đảm bảo sự đồng bộ giữa các đơn đặt bàn trước và trạng thái bàn hiện tại trong nhà hàng. Quy trình này giúp nhà hàng tối ưu hóa việc sử dụng bàn và đảm bảo khách hàng có trải nghiệm tốt nhất.

## Các trạng thái của bàn

1. **available**: Bàn trống, sẵn sàng phục vụ khách
2. **reserved**: Bàn đã được đặt trước
3. **occupied**: Bàn đang có khách ngồi
4. **needs_cleaning**: Bàn cần được dọn dẹp sau khi khách rời đi
5. **unavailable**: Bàn không sử dụng được (đang sửa chữa, bảo trì, v.v.)

## Các trạng thái của đơn đặt bàn

1. **pending**: Đơn đặt bàn mới, chưa được xác nhận
2. **confirmed**: Đơn đặt bàn đã được xác nhận
3. **completed**: Khách đã đến và sử dụng bàn
4. **cancelled**: Đơn đặt bàn đã bị hủy
5. **no_show**: Khách không đến theo lịch hẹn

## Quy trình đồng bộ

### 1. Khi có đơn đặt bàn mới:

- Khách hàng đặt bàn qua website hoặc nhân viên nhập đơn đặt bàn
- Đơn đặt bàn được tạo với trạng thái **pending**
- Nhân viên xem và xác nhận đơn đặt bàn, chuyển trạng thái sang **confirmed**
- Tại thời điểm này, chưa có bàn cụ thể nào được gán cho đơn đặt

### 2. Gán bàn cho đơn đặt:

- Nhân viên vào trang **Quản lý bàn và đặt bàn**
- Xem tab **Đơn đặt bàn chờ xử lý** để thấy các đơn đặt bàn chưa được gán bàn
- Chọn một đơn đặt và gán bàn phù hợp dựa trên:
  - Số lượng khách
  - Thời gian đặt
  - Yêu cầu đặc biệt của khách
- Khi gán bàn, bàn sẽ được chuyển sang trạng thái **reserved** và lưu thông tin đặt bàn

### 3. Khi khách đến nhà hàng:

- Nhân viên kiểm tra thông tin đặt bàn
- Tìm bàn đã được gán cho khách
- Nhấn nút **Khách đến** để chuyển trạng thái bàn từ **reserved** sang **occupied**
- Đơn đặt bàn được chuyển sang trạng thái **completed**

### 4. Tạo đơn hàng cho bàn:

- Sau khi khách ngồi vào bàn, nhân viên sử dụng POS để tạo đơn hàng mới
- Chọn bàn đang có trạng thái **occupied**
- Thêm món ăn vào đơn hàng và xử lý như bình thường

### 5. Khi khách rời đi:

- Nhân viên hoàn tất thanh toán cho đơn hàng
- Bàn tự động chuyển sang trạng thái **needs_cleaning**
- Sau khi dọn dẹp, nhân viên nhấn nút **Đã dọn xong** để chuyển bàn về trạng thái **available**

### 6. Xử lý khách không đến:

- Nếu khách không đến theo lịch hẹn, nhân viên có thể:
  - Đợi một khoảng thời gian quy định (ví dụ: 15-30 phút)
  - Chuyển đơn đặt bàn sang trạng thái **no_show**
  - Chuyển bàn về trạng thái **available** để phục vụ khách khác

## Lợi ích của hệ thống đồng bộ

1. **Quản lý hiệu quả**: Nhà hàng có thể tối ưu hóa việc sử dụng bàn, tránh tình trạng bàn trống nhưng khách không có chỗ ngồi
2. **Trải nghiệm khách hàng tốt hơn**: Khách đặt bàn trước sẽ được phục vụ nhanh chóng khi đến nhà hàng
3. **Giảm thời gian chờ đợi**: Nhân viên có thể chuẩn bị trước bàn cho khách đặt trước
4. **Dữ liệu chính xác**: Thông tin về tình trạng bàn và đơn đặt được cập nhật theo thời gian thực
5. **Báo cáo và phân tích**: Dữ liệu về tỷ lệ sử dụng bàn, tỷ lệ khách không đến, v.v. giúp nhà hàng cải thiện dịch vụ

## Các tính năng bổ sung

1. **Thông báo tự động**: Gửi SMS hoặc email nhắc nhở khách hàng về đơn đặt bàn
2. **Danh sách chờ**: Quản lý danh sách khách chờ khi nhà hàng hết bàn
3. **Sơ đồ bàn trực quan**: Hiển thị sơ đồ bàn với màu sắc thể hiện trạng thái
4. **Lịch sử đặt bàn**: Xem lịch sử đặt bàn của khách hàng để cung cấp dịch vụ cá nhân hóa 