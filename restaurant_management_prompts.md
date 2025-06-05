# Hệ Thống Quản Lý Nhà Hàng - Prompts

## Module 1: Xác Thực & Phân Quyền

### 1.1. Backend

#### Model User - Backend
```
Trong models/User.js, định nghĩa Mongoose schema User. Trường: name (String, yêu cầu), email (String, yêu cầu, unique, validate), password (String, yêu cầu, minlength: 8, select: false), role (String, enum: ['customer', 'waiter', 'chef', 'manager'], default: 'customer'), passwordChangedAt (Date), passwordResetToken (String), passwordResetExpires (Date). Phương thức: correctPassword (so sánh password), changedPasswordAfter (kiểm tra thời gian thay đổi password), createPasswordResetToken (tạo token reset password). timestamps: true.
```

#### API Xác Thực - Backend
```
Tạo routes/controllers (routes/authRoutes.js, controllers/authController.js) cho Authentication.

POST /api/v1/auth/register: Đăng ký tài khoản mới (mặc định role: 'customer').

POST /api/v1/auth/login: Đăng nhập, trả về JWT token.

POST /api/v1/auth/forgot-password: Quên mật khẩu, gửi email reset.

POST /api/v1/auth/reset-password/:token: Reset mật khẩu với token.

GET /api/v1/auth/me: Lấy thông tin user hiện tại (protect middleware).

PUT /api/v1/auth/update-password: Cập nhật mật khẩu (protect middleware).

PUT /api/v1/auth/update-me: Cập nhật thông tin cá nhân (protect middleware).
```

#### Middleware Phân Quyền - Backend
```
Tạo middlewares/authMiddleware.js với:

protect: Middleware xác thực JWT token, đính kèm user vào request.

authorize(...roles): Middleware kiểm tra quyền truy cập dựa trên role.

Áp dụng middleware này cho các routes cần bảo vệ.
```

### 1.2. Frontend

#### Trang Đăng Nhập/Đăng Ký - Frontend
```
Tạo src/pages/auth/LoginPage.jsx và RegisterPage.jsx.

Form đăng nhập: Email, Password, nút "Đăng nhập", link "Quên mật khẩu?", link "Đăng ký".

Form đăng ký: Name, Email, Password, Confirm Password, nút "Đăng ký", link "Đã có tài khoản? Đăng nhập".

Xử lý lỗi và hiển thị thông báo.

Lưu JWT token vào localStorage và context/redux store.
```

#### Context API Auth - Frontend
```
Tạo src/contexts/AuthContext.js:

AuthProvider component bao bọc ứng dụng.

useAuth hook để truy cập thông tin người dùng và các hàm xác thực.

State: currentUser, loading, error.

Functions: login, register, logout, forgotPassword, resetPassword, updateProfile.

Kiểm tra token trong localStorage khi khởi động ứng dụng.
```

#### Protected Routes - Frontend
```
Tạo src/components/ProtectedRoute.jsx:

HOC kiểm tra người dùng đã đăng nhập chưa, nếu chưa, redirect đến trang đăng nhập.

RoleBasedRoute: HOC kiểm tra role của người dùng, nếu không đủ quyền, hiển thị trang 403.

Áp dụng cho các routes cần bảo vệ trong src/App.jsx.
```

## Module 2: Quản lý Thực Đơn

### 2.1. Backend

#### Model MenuItem - Backend
```
Trong models/MenuItem.js, định nghĩa Mongoose schema MenuItem. Trường: name (String, yêu cầu, unique), description (String), price (Number, yêu cầu), category (String, yêu cầu), imageUrls (Array of Strings), available (Boolean, default: true), preparationTime (Number, đơn vị: phút). timestamps: true.
```

#### API Quản lý Thực Đơn - Backend
```
Tạo routes/controllers (routes/menuItemRoutes.js, controllers/menuItemController.js) cho Quản lý Thực Đơn (/api/v1/menu-items).

GET /: Lấy danh sách món ăn (lọc theo category, available). Public access.

GET /:id: Lấy chi tiết món ăn. Public access.

POST /: Admin/Manager (protect, authorize('manager')) thêm món ăn mới.

PUT /:id: Admin/Manager (protect, authorize('manager')) sửa thông tin món ăn.

DELETE /:id: Admin/Manager (protect, authorize('manager')) xóa món ăn.

GET /categories: Lấy danh sách categories. Public access.
```

### 2.2. Frontend

#### Trang Quản lý Thực Đơn - Admin/Manager - Frontend
```
Tạo src/pages/admin/MenuManagementPage.jsx.

Tiêu đề 'Quản lý Thực Đơn' với icon FaUtensils. Nút 'Thêm Món Mới'.

Bộ lọc theo danh mục, trạng thái (available/unavailable). Tìm kiếm.

Hiển thị danh sách món ăn dạng grid hoặc bảng: Hình ảnh, Tên, Mô tả, Giá, Danh mục, Trạng thái, Hành động ('Sửa', 'Xóa', 'Đổi trạng thái').

Modal Thêm/Sửa Món: Form với các trường (name, description, price, category, imageUrls, available). Upload hình ảnh.
```

#### Trang Menu - Khách Hàng - Frontend
```
Tạo src/pages/customer/MenuPage.jsx.

Hiển thị danh sách món ăn theo danh mục, có thể lọc và tìm kiếm.

Mỗi món ăn hiển thị: Hình ảnh, Tên, Mô tả ngắn, Giá, Nút 'Thêm vào giỏ hàng' (nếu có tính năng đặt món online).

Khi click vào món ăn, hiển thị modal chi tiết với đầy đủ thông tin.
```

## Module 3: Quản lý Bàn & Đặt Bàn

### 3.1. Backend

#### Model Table - Backend - Quản lý bàn
```
Trong models/Table.js, định nghĩa Mongoose schema Table. Trường: name (String, yêu cầu, unique), capacity (Number, yêu cầu, min: 1 - sức chứa), status (String, enum: ['available', 'occupied', 'reserved', 'unavailable', 'needs_cleaning'], default: 'available' - Hiển thị trạng thái bàn), location (String - Phân loại bàn theo khu vực). timestamps: true.
```

#### API Quản lý Bàn - Backend
```
Tạo routes/controllers (routes/tableRoutes.js, controllers/tableController.js) cho Quản lý Bàn (/api/v1/tables).

GET /: Lấy danh sách bàn (lọc theo status, location). (Quyền: 'waiter', 'manager')

POST /: Admin/Manager (protect, authorize('manager')) thêm thông tin bàn mới.

PUT /:id: Admin/Manager (protect, authorize('manager')) sửa thông tin bàn.

DELETE /:id: Admin/Manager (protect, authorize('manager')) xóa thông tin bàn.

PUT /:id/status: Nhân viên/Quản lý (protect, authorize('waiter', 'manager')) cập nhật trạng thái bàn.
```

#### Model Booking - Backend - Quản lý đặt bàn
```
Trong models/Booking.js, định nghĩa schema Booking. Trường: customerName (String, yêu cầu), customerPhone (String, yêu cầu), customerEmail (String), date (Date, yêu cầu), time (String, yêu cầu), numberOfGuests (Number, yêu cầu, min: 1), status (String, enum: ['pending_confirmation', 'confirmed', 'cancelled_by_customer', 'cancelled_by_restaurant', 'completed', 'no_show'], default: 'pending_confirmation' - Quản lý trạng thái đặt bàn), notes (String), tableAssigned (ObjectId, ref: 'Table', tùy chọn - Đánh dấu trực quan cho bàn có đặt trước). timestamps: true.
```

#### API Đặt Bàn - Backend
```
Tạo routes/controllers (routes/bookingRoutes.js, controllers/bookingController.js) cho Đặt Bàn (/api/v1/bookings).

POST /: Khách hàng có thể đặt bàn trước. Validate input. Kiểm tra xung đột thời gian (không cho đặt bàn cùng thời điểm nếu bàn đã được đặt hoặc không đủ sức chứa cho khoảng thời gian đó - logic này cần kiểm tra các booking khác cho cùng bàn hoặc tổng số khách tại thời điểm đó).

GET /: Admin/Manager (protect, authorize('manager')) xem tất cả đặt bàn (lọc, phân trang).

GET /today-upcoming: Lấy các đặt bàn sắp đến trong hôm nay (cho cảnh báo).

PUT /:id/confirm: Admin/Manager xác nhận đặt bàn.

PUT /:id/cancel: Admin/Manager hoặc Khách hàng (nếu là của họ và được phép) hủy đặt bàn.

PUT /:id: Admin/Manager cập nhật chi tiết đặt bàn (ví dụ: gán bàn).
```

#### Job Cảnh báo Đặt Bàn Sắp Đến - Backend
```
Sử dụng node-cron trong thư mục jobs/bookingReminderJob.js. Tạo một cron job chạy định kỳ (ví dụ: mỗi giờ) để:

Kiểm tra các đặt bàn có trạng thái 'confirmed' và thời gian đến nằm trong vòng 24 giờ tới.

Gửi cảnh báo (ví dụ: log ra console, hoặc nếu có tích hợp email/SMS thì gửi thông báo cho quản lý/nhân viên). Cảnh báo khi có khách đặt bàn sắp đến trong vòng 24 giờ.
```

### 3.2. Frontend

#### Trang Quản lý Bàn - Admin/Manager - Frontend
```
Tạo src/pages/admin/TableManagementPage.jsx.

Tiêu đề 'Quản lý Bàn' với icon FaChair. Nút 'Thêm Bàn Mới'.

Hiển thị trạng thái bàn trực quan (sơ đồ bàn): Các ô đại diện bàn, màu sắc theo trạng thái ('trống', 'có khách', 'đã đặt trước', 'cần dọn dẹp' - Đánh dấu trực quan cho bàn có đặt trước). Hiển thị tên bàn, sức chứa.

Danh sách bàn dạng bảng: Tên, Sức chứa, Khu vực, Trạng thái, Hành động ('Sửa', 'Xóa', 'Đổi trạng thái').

Modal Thêm/Sửa Bàn: Form thêm/sửa/xóa thông tin bàn, phân loại bàn theo khu vực, sức chứa.
```

#### Trang Quản lý Đặt Bàn - Admin/Manager - Frontend
```
Tạo src/pages/admin/BookingManagementPage.jsx.

Tiêu đề 'Quản lý Đặt Bàn' với icon FaCalendarAlt.

Hiển thị danh sách đặt bàn dạng bảng: Tên KH, SĐT, Ngày, Giờ, Số khách, Trạng thái (dùng badge màu và icon), Bàn được gán, Hành động.

Bộ lọc theo ngày, trạng thái. Tìm kiếm.

Hành động: Xác nhận, hủy và quản lý trạng thái đặt bàn (mở modal để thay đổi trạng thái, gán bàn).

Khu vực hiển thị Cảnh báo khi có khách đặt bàn sắp đến (lấy từ API hoặc thông báo real-time).
```

## Module 4: Hệ thống POS (Point of Sale)

### 4.1. Backend

#### Model Order - Backend
```
Trong models/Order.js, định nghĩa schema Order. Trường: table (ObjectId, ref: 'Table', tùy chọn), customer (ObjectId, ref: 'User', tùy chọn), items (Array của: { menuItem: ObjectId, ref: 'MenuItem', yêu cầu; quantity: Number, yêu cầu; priceAtOrder: Number, yêu cầu; notes: String; status: String, enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'], default: 'pending' }), orderType (String, enum: ['dine-in', 'takeaway', 'delivery'], default: 'dine-in'), orderStatus (String, enum: ['pending_confirmation', 'confirmed_by_customer', 'confirmed_by_restaurant', 'partially_served', 'fully_served', 'completed', 'cancelled_by_customer', 'cancelled_by_restaurant', 'payment_pending', 'paid'], default: 'pending_confirmation'), subTotal (Number, yêu cầu), taxAmount (Number, yêu cầu), discountAmount (Number, default: 0), totalAmount (Number, yêu cầu), paymentMethod (String, enum: ['cash', 'card', 'mobile_payment', 'not_paid'], default: 'not_paid'), orderNotes (String), assignedStaff (ObjectId, ref: 'User', tùy chọn). timestamps: true.
```

#### API Quản lý Đơn hàng - Backend
```
Tạo routes/controllers (routes/orderRoutes.js, controllers/orderController.js) cho Quản lý Đơn hàng (/api/v1/orders).

POST /: Tạo đơn hàng mới (từ POS hoặc khách hàng).

GET /: Lấy danh sách đơn hàng (lọc theo ngày, trạng thái, bàn).

GET /:id: Lấy chi tiết đơn hàng.

PUT /:id: Cập nhật đơn hàng.

PUT /:id/add-item: Thêm món vào đơn hàng.

PUT /:id/update-item/:itemId: Cập nhật món trong đơn hàng.

PUT /:id/remove-item/:itemId: Xóa món khỏi đơn hàng.

PUT /:id/status: Cập nhật trạng thái đơn hàng.

PUT /:id/apply-discount: Áp dụng giảm giá.

POST /:id/checkout: Thanh toán đơn hàng.

GET /table/:tableId/current: Lấy đơn hàng hiện tại của bàn.
```

### 4.2. Frontend

#### Trang POS - Nhân viên - Frontend
```
Tạo src/pages/waiter/PointOfSalePage.jsx.

Giao diện chia làm 3 cột:
- Cột 1: Danh sách bàn (hiển thị trạng thái bàn), cảnh báo khi có khách đặt bàn sắp đến trong vòng 24 giờ.
- Cột 2: Danh sách món ăn theo danh mục, tìm kiếm món.
- Cột 3: Chi tiết đơn hàng hiện tại, tính tiền, giảm giá, thanh toán.

Khi chọn bàn, hiển thị đơn hàng hiện tại của bàn (nếu có).

Thêm món vào đơn: Chọn món -> Hiển thị modal số lượng, ghi chú -> Thêm vào đơn.

Chức năng thanh toán: Hiển thị modal thanh toán với các phương thức (tiền mặt, thẻ, chuyển khoản).

Chức năng in hóa đơn tạm tính.

Chức năng đánh dấu bàn cần dọn dẹp sau khi khách rời đi.
```

#### Trang Quản lý Đơn hàng - Admin/Manager - Frontend
```
Tạo src/pages/admin/OrderManagementPage.jsx.

Tiêu đề 'Quản lý Đơn hàng' với icon FaReceipt.

Hiển thị danh sách đơn hàng dạng bảng: ID, Bàn, Ngày giờ, Loại đơn, Trạng thái, Tổng tiền, Hành động.

Bộ lọc theo ngày, trạng thái, bàn. Tìm kiếm.

Khi click vào đơn hàng, hiển thị chi tiết đơn hàng với danh sách món, giá, số lượng, ghi chú, trạng thái từng món.

Chức năng cập nhật trạng thái đơn hàng, in hóa đơn, xem lịch sử.
```

## Module 5: Giao diện Nhà bếp

### 5.1. Backend

#### API Quản lý Nhà bếp - Backend
```
Mở rộng từ API Quản lý Đơn hàng:

GET /api/v1/orders/kitchen: Lấy danh sách món ăn cần chế biến (lọc theo trạng thái 'pending', 'preparing').

PUT /api/v1/orders/:id/items/:itemId/status: Cập nhật trạng thái món ăn (preparing -> ready).
```

### 5.2. Frontend

#### Trang Kitchen Display System - Đầu bếp - Frontend
```
Tạo src/pages/chef/KitchenDisplayPage.jsx.

Giao diện hiển thị danh sách món cần chế biến, phân loại theo đơn hàng/bàn.

Mỗi món hiển thị: Tên món, Số lượng, Ghi chú đặc biệt, Thời gian đặt, Nút cập nhật trạng thái.

Khi món ăn được chuẩn bị xong, đầu bếp click 'Hoàn thành' để cập nhật trạng thái.

Thông báo âm thanh khi có món mới được đặt.

Bộ lọc theo trạng thái (đang chờ, đang chuẩn bị).
```

## Module 6: Báo cáo và Thống kê

### 6.1. Backend

#### API Báo cáo Thống kê - Backend
```
Tạo routes/controllers (routes/reportRoutes.js, controllers/reportController.js) cho Báo cáo (/api/v1/reports).

GET /sales: Thống kê doanh thu (theo ngày/tuần/tháng/năm).

GET /popular-items: Thống kê món ăn bán chạy.

GET /table-utilization: Thống kê hiệu suất sử dụng bàn.

GET /peak-hours: Thống kê thời gian cao điểm.

GET /customer-retention: Thống kê khách hàng quay lại (nếu có hệ thống thành viên).
```

### 6.2. Frontend

#### Trang Dashboard - Admin/Manager - Frontend
```
Tạo src/pages/admin/DashboardPage.jsx.

Hiển thị tổng quan:
- Doanh thu hôm nay/tuần này/tháng này (so sánh với kỳ trước).
- Số đơn hàng hôm nay.
- Số bàn đang sử dụng/tổng số bàn.
- Món ăn bán chạy nhất.

Biểu đồ doanh thu theo thời gian (ngày/tuần/tháng).

Biểu đồ phân bổ doanh thu theo danh mục món ăn.

Bảng thời gian cao điểm trong ngày/tuần.

Bảng hiệu suất sử dụng bàn.
```

#### Trang Báo cáo Chi tiết - Admin/Manager - Frontend
```
Tạo src/pages/admin/ReportsPage.jsx.

Các tab báo cáo:
- Doanh thu
- Món ăn
- Sử dụng bàn
- Khách hàng

Mỗi tab có các bộ lọc theo khoảng thời gian, danh mục, v.v.

Hiển thị dữ liệu dạng bảng và biểu đồ.

Chức năng xuất báo cáo (PDF, Excel).
```

## Module 7: Hệ thống Thông báo

### 7.1. Backend

#### Model Notification - Backend
```
Trong models/Notification.js, định nghĩa schema Notification. Trường: recipient (ObjectId, ref: 'User', yêu cầu), type (String, enum: ['new_order', 'order_status_change', 'booking_reminder', 'system'], yêu cầu), content (String, yêu cầu), relatedResource (Object: { type: String, id: ObjectId }, tùy chọn), isRead (Boolean, default: false). timestamps: true.
```

#### API Thông báo - Backend
```
Tạo routes/controllers (routes/notificationRoutes.js, controllers/notificationController.js) cho Thông báo (/api/v1/notifications).

GET /: Lấy thông báo của người dùng hiện tại.

PUT /:id/read: Đánh dấu thông báo đã đọc.

PUT /read-all: Đánh dấu tất cả thông báo đã đọc.

DELETE /:id: Xóa thông báo.
```

#### WebSocket Notification Service - Backend
```
Sử dụng Socket.IO trong thư mục services/socketService.js.

Thiết lập kết nối WebSocket khi người dùng đăng nhập.

Gửi thông báo real-time khi có sự kiện mới (đơn hàng mới, cập nhật trạng thái, đặt bàn mới).

Lưu thông báo vào database và gửi đến người dùng phù hợp.
```

### 7.2. Frontend

#### Component Notification - Frontend
```
Tạo src/components/common/NotificationCenter.jsx.

Icon thông báo trên thanh navigation với badge hiển thị số thông báo chưa đọc.

Khi click vào icon, hiển thị dropdown danh sách thông báo.

Mỗi thông báo hiển thị: Icon theo loại, nội dung, thời gian, trạng thái đã đọc/chưa đọc.

Khi click vào thông báo, đánh dấu đã đọc và chuyển đến trang liên quan (nếu có).

Nút "Đánh dấu tất cả đã đọc".
```

#### WebSocket Client Integration - Frontend
```
Tạo src/services/socketService.js:

Thiết lập kết nối Socket.IO khi người dùng đăng nhập.

Lắng nghe sự kiện thông báo mới.

Hiển thị toast notification khi có thông báo mới.

Cập nhật số lượng thông báo chưa đọc trong NotificationCenter.
```

### 7.3. Thông báo Đặt Bàn

#### Backend - Notification Service cho Đặt Bàn
```
Trong controllers/bookingController.js, sau khi tạo đặt bàn thành công:

1. Tạo notification mới trong database:
   - recipient: Tất cả users có role 'manager' hoặc 'waiter'
   - type: 'new_booking'
   - content: `Đặt bàn mới: ${customerName} - ${date} ${time} - ${numberOfGuests} khách`
   - relatedResource: { type: 'booking', id: booking._id }

2. Emit sự kiện socket:
   - Gọi socketService.emitToRole('manager', 'new_booking', bookingData)
   - Gọi socketService.emitToRole('waiter', 'new_booking', bookingData)

3. Trong services/socketService.js, thêm method emitToRole(role, event, data):
   - Lấy danh sách socket IDs của users có role tương ứng
   - Emit sự kiện đến các socket IDs đó

4. Thêm API endpoint GET /api/v1/bookings/upcoming để lấy danh sách đặt bàn sắp tới (trong 24 giờ)
```

#### Frontend - Hiển thị Thông báo Đặt Bàn
```
1. Trong src/services/socketService.js:
   - Thêm listener cho sự kiện 'new_booking'
   - Khi nhận được sự kiện, hiển thị toast notification với nội dung đặt bàn
   - Thêm thông báo vào state notifications
   - Phát âm thanh thông báo (tùy chọn)

2. Trong src/components/common/NotificationCenter.jsx:
   - Thêm style đặc biệt cho thông báo đặt bàn (màu sắc, icon)
   - Khi click vào thông báo đặt bàn, chuyển đến trang BookingManagementPage với filter là booking ID

3. Trong src/pages/admin/BookingManagementPage.jsx và src/pages/waiter/PointOfSalePage.jsx:
   - Thêm khu vực hiển thị "Đặt bàn sắp tới" ở vị trí nổi bật
   - Hiển thị danh sách đặt bàn trong 24 giờ tới với đồng hồ đếm ngược
   - Thêm chức năng "Đánh dấu đã xem" để xác nhận đã nhận thông báo

4. Tùy chọn AJAX thay thế Socket.IO:
   - Trong NotificationCenter, thêm hàm fetchNotifications() gọi API định kỳ (mỗi 30 giây)
   - Sử dụng setInterval để poll API endpoint /api/v1/notifications
   - So sánh kết quả với state hiện tại để hiển thị thông báo mới
```

#### Cấu hình Thông báo Đặt Bàn
```
Trong src/pages/admin/SettingsPage.jsx, thêm cấu hình:

1. Bật/tắt thông báo đặt bàn
2. Bật/tắt âm thanh thông báo
3. Thời gian trước khi đặt bàn để hiển thị cảnh báo (mặc định: 24 giờ)
4. Danh sách roles nhận thông báo (mặc định: manager, waiter)
5. Mẫu nội dung thông báo (có thể tùy chỉnh)
```

## Module 8: Giao diện Khách hàng

### 8.1. Backend

#### API Khách hàng - Backend
```
Mở rộng từ các API đã có:

GET /api/v1/menu-items: Public access để hiển thị thực đơn.

POST /api/v1/bookings: Public access để đặt bàn.

POST /api/v1/orders: Khách hàng đặt món trước (protect middleware).

GET /api/v1/bookings/my: Khách hàng xem lịch sử đặt bàn của họ (protect middleware).

GET /api/v1/orders/my: Khách hàng xem lịch sử đơn hàng của họ (protect middleware).
```

### 8.2. Frontend

#### Trang Chủ - Khách hàng - Frontend
```
Tạo src/pages/customer/HomePage.jsx.

Hero section với hình ảnh nhà hàng, slogan, nút "Đặt bàn ngay".

Giới thiệu về nhà hàng.

Hiển thị một số món ăn nổi bật.

Thông tin liên hệ, địa chỉ, giờ mở cửa.
```

#### Trang Đặt Bàn - Khách hàng - Frontend
```
Tạo src/pages/customer/BookingPage.jsx.

Form đặt bàn: Tên, SĐT, Email, Ngày, Giờ, Số khách, Ghi chú.

Hiển thị các khung giờ còn trống cho ngày đã chọn.

Xác nhận đặt bàn và hiển thị thông báo thành công/thất bại.

Nếu đã đăng nhập, tự động điền thông tin cá nhân.
```

#### Trang Đặt Món Online - Khách hàng - Frontend
```
Tạo src/pages/customer/OnlineOrderPage.jsx.

Hiển thị thực đơn theo danh mục, có thể tìm kiếm và lọc.

Thêm món vào giỏ hàng, chỉnh sửa số lượng, ghi chú.

Hiển thị giỏ hàng với tổng tiền, giảm giá, thuế.

Form thông tin giao hàng (nếu có dịch vụ giao hàng).

Chọn phương thức thanh toán và hoàn tất đơn hàng.
```

#### Trang Tài khoản - Khách hàng - Frontend
```
Tạo src/pages/customer/ProfilePage.jsx.

Hiển thị và cập nhật thông tin cá nhân.

Xem lịch sử đặt bàn với trạng thái.

Xem lịch sử đơn hàng.

Đổi mật khẩu.
``` 