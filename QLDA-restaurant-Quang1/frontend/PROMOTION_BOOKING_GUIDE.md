# Hướng Dẫn Sử Dụng Chức Năng Khuyến Mãi Trong Đặt Bàn

## Tổng Quan
Chức năng khuyến mãi đã được tích hợp vào hệ thống đặt bàn, cho phép khách hàng:
- Đặt bàn và pre-order món ăn
- Áp dụng mã khuyến mãi để giảm giá
- Thanh toán trực tuyến hoặc thanh toán khi đến

## Quy Trình Sử Dụng

### 1. Đặt Bàn và Chọn Món
1. Vào trang **Đặt Bàn** (`/booking`)
2. Điền thông tin cá nhân (tên, số điện thoại, email)
3. Chọn ngày, giờ và số lượng khách
4. **Chọn món ăn từ danh sách đề xuất** (bắt buộc để áp dụng khuyến mãi)

### 2. Áp Dụng Mã Khuyến Mãi
1. Sau khi chọn món, phần **"Tổng Kết & Thanh Toán"** sẽ xuất hiện
2. Trong phần **"🎫 Mã Khuyến Mãi"**:
   - Nhập mã khuyến mãi (ví dụ: `WELCOME10`)
   - Nhấn nút **"Áp dụng"**
   - Hệ thống sẽ kiểm tra và áp dụng giảm giá

### 3. Xem Tổng Kết
Phần **"📋 Tổng Kết Đơn Hàng"** hiển thị:
- **Tạm tính**: Tổng tiền trước giảm giá
- **Giảm giá**: Số tiền được giảm (nếu có)
- **Tổng cộng**: Số tiền cuối cùng phải trả

### 4. Chọn Phương Thức Thanh Toán
Trong phần **"💳 Phương Thức Thanh Toán"**:
- **Thanh toán tiền mặt khi đến** (mặc định)
- **Thẻ tín dụng/ghi nợ**
- **Chuyển khoản ngân hàng**
- **Ví điện tử**

### 5. Hoàn Tất Đặt Bàn
- Nhấn **"Đặt Bàn"** để hoàn tất
- Hệ thống sẽ lưu thông tin khuyến mãi và thanh toán

## Mã Khuyến Mãi Có Sẵn

Các mã khuyến mãi mẫu (từ backend seed data):

| Mã | Tên | Loại | Giá Trị | Điều Kiện | Giới Hạn |
|----|-----|------|---------|-----------|----------|
| `WELCOME10` | Giảm giá 10% cho đơn hàng đầu tiên | Phần trăm | 10% | Từ 100K | Tối đa 50K |
| `SAVE50K` | Giảm 50K cho đơn từ 200K | Số tiền cố định | 50K | Từ 200K | 500 lượt |
| `WEEKEND20` | Giảm 20% cuối tuần | Phần trăm | 20% | Từ 150K | Tối đa 100K |
| `VIP25` | Khuyến mãi VIP - 25% | Phần trăm | 25% | Từ 300K | Tối đa 200K |
| `BIGORDER` | Giảm 100K cho đơn lớn | Số tiền cố định | 100K | Từ 500K | 50 lượt |
| `FLASH30` | Flash Sale - 30% | Phần trăm | 30% | Từ 100K | 20 lượt |

## Xem Lịch Sử Đặt Bàn

Vào trang **"Đặt Bàn Của Tôi"** (`/my-bookings`) để xem:
- **Thông tin đặt bàn**: Ngày, giờ, số khách
- **Món đã đặt trước**: Danh sách món và số lượng
- **Khuyến mãi**: Tên, mã và số tiền giảm (nếu có)
- **Thông tin thanh toán**: Tạm tính, giảm giá, tổng cộng, phương thức

## Lưu Ý

### Điều Kiện Áp Dụng Mã Khuyến Mãi:
- ✅ Phải chọn ít nhất 1 món ăn
- ✅ Tổng tiền phải đạt mức tối thiểu
- ✅ Mã còn hiệu lực (trong thời hạn)
- ✅ Mã chưa hết lượt sử dụng
- ✅ Chỉ được áp dụng 1 mã khuyến mãi cho mỗi đơn

### Quản Lý Mã Khuyến Mãi:
- **Gỡ mã**: Nhấn nút "Gỡ" bên cạnh mã đã áp dụng
- **Đổi mã**: Gỡ mã cũ rồi nhập mã mới
- **Lỗi mã**: Kiểm tra chính tả và điều kiện áp dụng

## API Endpoints (Cho Developer)

```bash
# Kiểm tra mã khuyến mãi
POST /api/v1/promotions/apply-code
{
  "code": "WELCOME10",
  "orderTotal": 150000
}

# Tạo đặt bàn với khuyến mãi
POST /api/v1/bookings
{
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "date": "2024-12-20",
  "time": "19:00",
  "numberOfGuests": 4,
  "preOrderedItems": [...],
  "appliedPromotion": {
    "id": "...",
    "code": "WELCOME10",
    "name": "Giảm giá 10%",
    "discountAmount": 15000
  },
  "paymentInfo": {
    "subtotal": 150000,
    "discountAmount": 15000,
    "totalAmount": 135000,
    "paymentMethod": "cash",
    "paymentStatus": "pending"
  }
}
```

## Troubleshooting

### Lỗi Thường Gặp:
1. **"Vui lòng chọn món ăn trước khi áp dụng khuyến mãi"**
   - Chọn ít nhất 1 món từ danh sách đề xuất

2. **"Mã khuyến mãi không hợp lệ"**
   - Kiểm tra chính tả mã
   - Kiểm tra mã có còn hiệu lực không

3. **"Đơn hàng cần tối thiểu XXXđ"**
   - Thêm món để đạt mức tối thiểu

4. **"Khuyến mãi đã hết lượt sử dụng"**
   - Chọn mã khuyến mãi khác

### Support:
- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- Liên hệ: 0123 456 789 