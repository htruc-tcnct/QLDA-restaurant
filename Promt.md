Module 1: Xác Thực & Phân Quyền (Đã Refactor)
1.1. Backend
Model User - Backend (Cập nhật sau refactor)
Trong models/User.js, Mongoose schema User đã được cập nhật:
Trường role (String) được cập nhật với enum: ['customer', 'staff', 'waiter', 'manager', 'admin'].
customer: Vai trò mặc định cho người dùng đăng ký mới.
staff và waiter: Có quyền tương đương, chủ yếu truy cập các chức năng nghiệp vụ của nhân viên (ví dụ: POS).
manager và admin: Có quyền tương đương, với quyền quản trị cao nhất hệ thống.
Vai trò chef đã được loại bỏ hoàn toàn khỏi hệ thống.
Các trường khác như name, email, password, passwordChangedAt, passwordResetToken, passwordResetExpires và các phương thức correctPassword, changedPasswordAfter, createPasswordResetToken được giữ nguyên cấu trúc cơ bản. timestamps: true.
Seed Data - Backend (Cập nhật)
Trong backend/data/seed_user_data.json:
Dữ liệu người dùng mẫu đã được điều chỉnh để phản ánh cấu trúc vai trò mới:
Người dùng manager01 có vai trò là manager.
Người dùng waiter_a, waiter_b, waiter_c có vai trò là waiter.
Các tài khoản với vai trò "chef" đã được loại bỏ.
Script backend/scripts/create-admin.js (nếu có và được sử dụng) cần đảm bảo tạo tài khoản admin với vai trò admin hoặc manager.
API Xác Thực - Backend (Logic phân quyền cập nhật)
Các API endpoints trong routes/authRoutes.js và controllers/authController.js về cơ bản giữ nguyên (Đăng ký, Đăng nhập, Quên mật khẩu, Reset mật khẩu, Lấy thông tin user, Cập nhật mật khẩu, Cập nhật thông tin cá nhân).
Tuy nhiên, logic bên trong, đặc biệt là liên quan đến việc trả về thông tin người dùng sau khi đăng nhập, đã được điều chỉnh để bao gồm vai trò đã cập nhật, phục vụ cho việc điều hướng ở frontend.
Middleware Phân Quyền - Backend (Cập nhật logic)
Trong middlewares/authMiddleware.js:
Middleware protect: Tiếp tục xác thực JWT token và đính kèm user vào request.
Middleware authorize(...roles): Logic kiểm tra quyền truy cập đã được cập nhật để xử lý các vai trò mới và sự tương đương quyền:
Nếu một route yêu cầu quyền admin, người dùng với vai trò manager cũng sẽ được phép truy cập.
Nếu một route yêu cầu quyền manager, người dùng với vai trò admin cũng sẽ được phép truy cập.
Nếu một route yêu cầu quyền staff, người dùng với vai trò waiter (và ngược lại) cũng sẽ được phép truy cập.
Vai trò chef đã được gỡ bỏ khỏi tất cả các kiểm tra authorize.
Middleware này được áp dụng nhất quán trên các routes cần bảo vệ (menuItemRoutes.js, tableRoutes.js, bookingRoutes.js, orderRoutes.js, adminRoutes.js, reportRoutes.js, v.v.) để đảm bảo logic phân quyền mới.
Logic kiểm tra req.user.role trực tiếp trong controllers (ví dụ: orderController.js cho việc gán waiter cho đơn hàng) cũng đã được cập nhật để phù hợp với các vai trò staff/waiter.
1.2. Frontend
Trang Đăng Nhập - Frontend (Cập nhật logic điều hướng)
Trong src/pages/auth/LoginPage.jsx:
Sau khi đăng nhập thành công:
Người dùng với vai trò admin hoặc manager sẽ được điều hướng đến trang /admin.
Người dùng với vai trò staff hoặc waiter sẽ được điều hướng đến trang /staff/pos.
Người dùng với vai trò customer sẽ được điều hướng đến trang chủ hoặc trang người dùng.
Xử lý lỗi và hiển thị thông báo vẫn được duy trì.
JWT token vẫn được lưu vào localStorage và global store (Zustand).
Global State Management (Zustand) - Frontend (Cập nhật)
Trong src/store/authStore.js:
Hàm login đã được cập nhật để trả về đối tượng người dùng đầy đủ (bao gồm role) sau khi đăng nhập thành công, giúp LoginPage.jsx thực hiện điều hướng dựa trên vai trò.
Hàm logout được sử dụng để xóa thông tin người dùng và token, điều hướng về trang đăng nhập.
Protected Routes & Role-Based Navigation - Frontend (Cập nhật)
Trong src/App.jsx:
RoleBasedRoute HOC được sử dụng để bảo vệ các routes và kiểm tra vai trò:
Route /admin (và các sub-routes của nó sử dụng AdminLayout) có allowedRoles={['admin', 'manager']}.
Route /staff/pos (trước đây là /waiter/pos) dành cho nhân viên/phục vụ truy cập trực tiếp vào POS, sử dụng PosLayout (không có admin sidebar) và có allowedRoles={['staff', 'waiter', 'admin', 'manager']} (cho phép cả admin/manager truy cập nếu cần).
Route mới /admin/pos được tạo, sử dụng AdminLayout (có admin sidebar) để render PointOfSalePage, và có allowedRoles={['admin', 'manager']}.
Các vai trò chef đã được loại bỏ khỏi tất cả allowedRoles.
Các debug log trong RoleBasedRoute.jsx đã được thêm và sau đó gỡ bỏ khi quá trình gỡ lỗi hoàn tất.
Layouts & Components - Frontend (Cập nhật)
1. Admin Layout & Sidebar
src/components/layout/NewAdminHeader.jsx:
Thêm nút "Đăng xuất" và xử lý logic đăng xuất sử dụng useAuthStore và useNavigate.
Hiển thị tên người dùng đang đăng nhập một cách động.
Sửa lỗi đường dẫn import cho authStore.
src/components/layout/NewAdminSidebar.jsx:
Liên kết "Màn hình POS" được cập nhật để trỏ đến /admin/pos (phiên bản POS trong layout admin).
Thuộc tính roles của liên kết này được đặt thành ['admin', 'manager'] để chỉ hiển thị cho admin/manager.
Các vai trò không còn tồn tại (như "chef") đã được dọn dẹp khỏi các định nghĩa roles của mục menu.
2. POS Layout (Mới)
src/components/layout/PosLayout.jsx (Mới):
Layout này được tạo để sử dụng cho trang POS khi nhân viên (staff/waiter) truy cập trực tiếp (ví dụ: sau khi đăng nhập).
Layout này KHÔNG bao gồm NewAdminSidebar nhưng tái sử dụng NewAdminHeader (có thể có hoặc không có chức năng đăng xuất tùy theo thiết kế cuối cùng cho nhân viên POS).
3. User Management Form
src/components/admin/UserFormModal.jsx:
Dropdown chọn vai trò người dùng khi tạo/chỉnh sửa người dùng đã được cập nhật.
Chỉ hiển thị 3 tùy chọn: "Customer" (giá trị customer), "Staff" (giá trị staff), và "Manager" (giá trị manager).
