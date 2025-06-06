import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import RoleBasedRoute from "./components/routes/RoleBasedRoute";
import RoleNotification from "./components/common/RoleNotification";

// Customer Pages
import HomePage from "./pages/customer/HomePage";
import CustomerMenuPage from "./pages/customer/CustomerMenuPage";
import FavoriteDishesPage from "./pages/customer/FavoriteDishesPage";
import BookingPage from "./pages/customer/BookingPage";
import MyBookingsPage from "./pages/customer/MyBookingsPage";
import ProfilePage from "./pages/customer/ProfilePage";
import CustomerProfilePage from "./pages/customer/CustomerProfilePage";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagementPage from "./pages/admin/UserManagementPage";
import MenuManagementPage from "./pages/admin/MenuManagementPage";
import ReportsPage from "./pages/admin/ReportsPage";
import PromotionManagementPage from "./pages/admin/PromotionManagementPage";
import OrderManagementPage from "./pages/admin/OrderManagementPage";
import BookingManagementPage from "./pages/admin/BookingManagementPage";
import BookingDetailPage from "./pages/admin/BookingDetailPage";
import TableManagementPage from "./pages/admin/TableManagementPage";
import NotificationsPage from "./pages/admin/NotificationsPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

// Waiter Pages
import PointOfSalePage from "./pages/waiter/PointOfSalePage";
import TestTablesPage from "./pages/waiter/TestTablesPage";
import WaiterProfilePage from "./pages/waiter/WaiterProfilePage";
import WaiterSettingsPage from "./pages/waiter/WaiterSettingsPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";

// Auth Store
import useAuthStore from "./store/authStore";

function App() {
  const { loadUserFromToken, user, isAuthenticated } = useAuthStore();

  // Check if user is authenticated on app load
  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  // Redirect based on user role
  const RoleRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" />;

    switch (user?.role) {
      case "admin":
      case "manager":
        return <Navigate to="/admin" />;
      case "waiter":
        // Send waiters to POS by default but they can also access orders
        return <Navigate to="/waiter/pos" />;
      case "staff":
        // Staff can access POS and orders
        return <Navigate to="/waiter/pos" />;
      case "chef":
        return <Navigate to="/admin/orders" />;
      case "customer":
      default:
        return <Navigate to="/" />;
    }
  };

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <RoleNotification />
      <Routes>
        {/* Role-based redirect */}
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Test Routes */}
        <Route path="/test-tables" element={<TestTablesPage />} />

        {/* Public Routes with Customer Layout */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="menu" element={<CustomerMenuPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route
            path="about"
            element={
              <div className="container py-5">
                <h1>Về chúng tôi</h1>
                <p>
                  Nhà hàng của chúng tôi là điểm đến lý tưởng cho những ai yêu
                  thích ẩm thực Việt Nam với hương vị truyền thống.
                </p>
              </div>
            }
          />
          <Route
            path="contact"
            element={
              <div className="container py-5">
                <h1>Liên hệ</h1>
                <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP HCM</p>
                <p>Điện thoại: 0123 456 789</p>
                <p>Email: info@restaurant.com</p>
              </div>
            }
          />
        </Route>

        {/* Customer Routes - Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<CustomerLayout />}>
            <Route path="favorites" element={<FavoriteDishesPage />} />
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="profile" element={<CustomerProfilePage />} />
            <Route path="profile" element={<ProfilePage />} />
            {/* Add more customer routes here */}
          </Route>
        </Route>

        {/* Admin Routes - Protected and Role-Based */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={<RoleBasedRoute allowedRoles={["admin", "manager"]} />}
          >
            <Route path="/admin" element={<AdminLayout pageTitle="Dashboard" />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="menu" element={<MenuManagementPage />} />
              <Route path="tables" element={<TableManagementPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="promotions" element={<PromotionManagementPage />} />
              {/* Admin routes not accessible by staff are here */}
            </Route>
          </Route>
        </Route>

        {/* Direct routes for staff and waiters - these should be BEFORE any other routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={<RoleBasedRoute allowedRoles={["waiter", "staff"]} />}
          >
            <Route path="/orders" element={<OrderManagementPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/bookings" element={<BookingManagementPage />} />
            <Route path="/bookings/:id" element={<BookingDetailPage />} />
            <Route path="/pos" element={<PointOfSalePage />} />
          </Route>
        </Route>

        {/* Staff (Admin/Manager/Chef/Waiter/Staff) Routes for Orders */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <RoleBasedRoute
                allowedRoles={["chef", "admin", "manager", "waiter", "staff"]}
              />
            }
          >
            <Route path="/admin" element={<AdminLayout pageTitle="Orders" />}>
              <Route path="orders" element={<OrderManagementPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Staff (Admin/Manager/Waiter/Staff) Routes for Bookings */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <RoleBasedRoute
                allowedRoles={["waiter", "staff", "admin", "manager"]}
              />
            }
          >
            <Route path="/admin" element={<AdminLayout pageTitle="Bookings" />}>
              <Route path="bookings" element={<BookingManagementPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="bookings/:id" element={<BookingDetailPage />} />
            </Route>
          </Route>
        </Route>

        {/* Waiter/Staff Routes - Protected and Role-Based */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <RoleBasedRoute
                allowedRoles={["waiter", "staff", "admin", "manager"]}
              />
            }
          >
            <Route path="/waiter" element={<AdminLayout />}>
              <Route path="pos" element={<PointOfSalePage />} />
              <Route path="profile" element={<WaiterProfilePage />} />
              <Route path="settings" element={<WaiterSettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all route - 404 */}
        <Route
          path="*"
          element={
            <div className="container py-5 text-center">
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
