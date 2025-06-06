import { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Nav,
  Tab,
  Button,
  Spinner,
  Form,
  ListGroup,
  Badge,
} from "react-bootstrap";
import {
  FaTable,
  FaUsers,
  FaUtensils,
  FaPlusCircle,
  FaMinusCircle,
  FaTrash,
  FaPaperPlane,
  FaPrint,
  FaCreditCard,
  FaTags,
  FaCut,
  FaCheck,
  FaSearch,
  FaFireAlt,
  FaBroom,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import TableGrid from "./components/TableGrid";
import MenuItemList from "./components/MenuItemList";
import OrderDetails from "./components/OrderDetails";
import MenuItemModal from "./components/MenuItemModal";
import PaymentModal from "./components/PaymentModal";
import DiscountModal from "./components/DiscountModal";
import PrintInvoiceModal from "./components/PrintInvoiceModal";
import orderService from "../../services/orderService";
import { formatCurrency } from "../../utils/format";
import menuService from "../../services/menuService";

const PointOfSalePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get tableId from URL query params if available
  const queryParams = new URLSearchParams(location.search);
  const tableIdFromUrl = queryParams.get("tableId");

  // State
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [tableFilter, setTableFilter] = useState("");
  const [activeTab, setActiveTab] = useState("tables");
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [menuItemSearchTerm, setMenuItemSearchTerm] = useState("");
  const [openOrders, setOpenOrders] = useState([]);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Current order state
  const [currentTable, setCurrentTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Promotion states
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [promotionCode, setPromotionCode] = useState("");

  // Modal states
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Loading states
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Fetch tables, categories, menu items, and open orders on component mount
  useEffect(() => {
    fetchTables();
    fetchMenuCategories();
    fetchMenuItems();
    fetchOpenOrders();
    fetchBookings();
  }, []);

  // Set selected table from URL if provided
  useEffect(() => {
    if (tableIdFromUrl && tables.length > 0) {
      const table = tables.find((t) => t._id === tableIdFromUrl);
      if (table) {
        handleSelectTable(table);
      }
    }
  }, [tables, tableIdFromUrl]);

  // Filter menu items when category or search term changes
  useEffect(() => {
    filterMenuItems();
  }, [activeCategory, menuItems, menuItemSearchTerm]);

  // Calculate order totals when order items change
  useEffect(() => {
    calculateOrderTotals();
  }, [orderItems, discountAmount]);

  // Fetch tables
  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      // Get current date and time for checking bookings
      const now = new Date();
      const dateTimeParam = now.toISOString();

      // Fetch tables with booking information for the current time
      const response = await api.get(
        `/api/v1/tables?dateTime=${dateTimeParam}`
      );
      const fetchedTables = response.data.data.tables;

      // Xử lý thông tin đặt bàn
      const tablesWithReservations = await processTablesWithReservations(
        fetchedTables
      );

      setTables(tablesWithReservations);
      setFilteredTables(tablesWithReservations);

      // If tableIdFromUrl is present, try to select that table
      if (tableIdFromUrl) {
        const selectedTable = tablesWithReservations.find(
          (t) => t._id === tableIdFromUrl
        );
        if (selectedTable) {
          handleSelectTable(selectedTable);
        }
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Không thể tải danh sách bàn");
    } finally {
      setLoadingTables(false);
    }
  };

  // Fetch menu categories
  const fetchMenuCategories = async () => {
    try {
      const response = await menuService.getCategories();
      console.log("Categories response:", response.data); // Debug log

      // Đảm bảo dữ liệu categories hợp lệ
      const allCategory = { _id: "all", name: "Tất cả" };

      if (Array.isArray(response.data)) {
        // Kiểm tra và đảm bảo mỗi category có _id và name
        const validCategories = response.data.map((cat, index) => {
          if (typeof cat === "string") {
            // Nếu API trả về mảng các string, chuyển đổi thành object
            return { _id: cat, name: cat };
          }
          // Đảm bảo mỗi category có _id và name
          return {
            _id: cat._id || cat.id || `category-${index}`,
            name: cat.name || cat.categoryName || cat,
          };
        });

        setCategories([allCategory, ...validCategories]);
      } else {
        console.error("Unexpected categories data structure:", response.data);
        toast.error("Định dạng dữ liệu danh mục không đúng");
        setCategories([allCategory]); // Vẫn hiển thị category "Tất cả"
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh mục món ăn");
      // Vẫn hiển thị category "Tất cả" ngay cả khi có lỗi
      setCategories([{ _id: "all", name: "Tất cả" }]);
    }
  };

  // Fetch menu items
  const fetchMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const response = await menuService.getMenuItems({ available: true });
      console.log("Menu items response:", response.data); // Debug log

      // Kiểm tra cấu trúc dữ liệu thực tế từ API
      if (response.data && Array.isArray(response.data.menuItems)) {
        // Cấu trúc API: { menuItems: [...], page: 1, pages: 1, total: 19 }
        setMenuItems(response.data.menuItems);
        setFilteredMenuItems(response.data.menuItems);
        console.log(
          `Đã tải ${response.data.menuItems.length} món ăn thành công`
        );
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.menuItems)
      ) {
        // Cấu trúc dự phòng nếu API thay đổi
        setMenuItems(response.data.data.menuItems);
        setFilteredMenuItems(response.data.data.menuItems);
        console.log(
          `Đã tải ${response.data.data.menuItems.length} món ăn thành công`
        );
      } else {
        console.error("Cấu trúc dữ liệu không đúng định dạng:", response.data);
        toast.error("Định dạng dữ liệu thực đơn không đúng");
        setMenuItems([]);
        setFilteredMenuItems([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải thực đơn:", error);
      if (error.response) {
        console.error("Lỗi từ server:", error.response.data);
        toast.error(
          `Không thể tải thực đơn: ${error.response.data.message || "Lỗi máy chủ"
          }`
        );
      } else if (error.request) {
        console.error("Không nhận được phản hồi từ server");
        toast.error("Không thể kết nối đến máy chủ");
      } else {
        toast.error(`Lỗi: ${error.message}`);
      }
      setMenuItems([]);
      setFilteredMenuItems([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  // Fetch open orders
  const fetchOpenOrders = async () => {
    try {
      const response = await api.get(
        "/api/v1/orders?orderStatus=pending_confirmation,confirmed_by_customer,partially_served,fully_served,payment_pending"
      );
      setOpenOrders(response.data.data.orders);
    } catch (error) {
      console.error("Error fetching open orders:", error);
      toast.error("Không thể tải đơn hàng đang mở");
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const response = await api.get("/api/bookings");
      setBookings(response.data.data.bookings);
      setFilteredBookings(response.data.data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Không thể tải danh sách đặt bàn");
    } finally {
      setBookingsLoading(false);
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = async (bookingId) => {
    try {
      await api.put(`/api/bookings/${bookingId}/status`, {
        status: "confirmed",
      });
      toast.success("Đã xác nhận đặt bàn");
      fetchBookings();
      fetchTables(); // Refresh tables as well
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("Không thể xác nhận đặt bàn");
    }
  };

  // Handle assign table to booking
  const handleAssignTable = async (bookingId, tableId) => {
    try {
      await api.put(`/api/bookings/${bookingId}`, {
        tableAssigned: tableId,
        status: "confirmed",
      });
      toast.success("Đã gán bàn cho đặt bàn");
      fetchBookings();
      fetchTables();
    } catch (error) {
      console.error("Error assigning table:", error);
      toast.error("Không thể gán bàn");
    }
  };

  // Filter menu items based on category and search term
  const filterMenuItems = () => {
    let items = [...menuItems];

    // Filter by category
    if (activeCategory !== "all") {
      items = items.filter(
        (item) => item.category === activeCategory
      );
    }

    // Filter by search term (case-insensitive)
    if (menuItemSearchTerm.trim()) {
      const lowercasedTerm = menuItemSearchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercasedTerm) ||
          (item.category &&
            item.category.name.toLowerCase().includes(lowercasedTerm)) ||
          (item.tags &&
            item.tags.some((tag) => tag.toLowerCase().includes(lowercasedTerm)))
      );
    }

    setFilteredMenuItems(items);
  };

  // Calculate order totals
  const calculateOrderTotals = () => {
    const sub = orderItems.reduce((total, item) => {
      return total + item.quantity * item.price;
    }, 0);

    // Default tax rate is 10%
    const taxRate = 0.1;
    const tax = (sub - discountAmount) * taxRate;
    const total = sub - discountAmount + tax;

    setSubTotal(sub);
    setTaxAmount(tax);
    setTotalAmount(total);
  };

  // Handle table selection
  const handleSelectTable = async (table) => {
    if (!table || !table._id) {
      console.error("Invalid table data:", table);
      toast.error("Dữ liệu bàn không hợp lệ");
      return;
    }

    setCurrentTable(table);

    // Check for upcoming reservations for this table
    try {
      const reservationsResponse = await api.get(
        `/api/v1/tables/${table._id}/upcoming-reservations`
      );
      const upcomingReservations =
        reservationsResponse.data.data.upcomingBookings;

      // If there are upcoming reservations within 24 hours, show an alert (changed from 2 hours for testing)
      if (upcomingReservations && upcomingReservations.length > 0) {
        const nextReservation = upcomingReservations[0]; // Get the closest reservation

        // Format date and time for display
        const reservationDate = new Date(nextReservation.date);
        const formattedDate = reservationDate.toLocaleDateString("vi-VN");

        // Show alert with reservation details
        const alertMessage = `
          CHÚ Ý: Bàn này đã được đặt trước!
          
          Thời gian: ${formattedDate} lúc ${nextReservation.time}
          Khách hàng: ${nextReservation.customerName}
          Số điện thoại: ${nextReservation.customerPhone}
          Số khách: ${nextReservation.numberOfGuests} người
          Còn: ${nextReservation.minutesUntil} phút nữa (${nextReservation.hoursUntil} giờ)
        `;

        alert(alertMessage);

        // Also show a toast notification
        toast.warning(
          `Bàn này đã được đặt trước! Còn ${nextReservation.minutesUntil} phút nữa (${nextReservation.hoursUntil} giờ)`,
          {
            autoClose: 10000, // Keep the toast visible for longer
          }
        );
      }
    } catch (error) {
      console.error("Error checking upcoming reservations:", error);
      // Don't show error to user, just continue with table selection
    }

    // If table is occupied, fetch the current order
    if (table.status === "occupied" && table.currentOrderId) {
      await fetchTableOrder(table._id);
    } else {
      // If table is available, initialize a new order
      initializeNewOrder();
    }

    // Don't automatically switch to menu tab
    // Let the user decide when to switch tabs
    // setActiveTab('menu');

    // Show a toast notification to inform the user that the table was selected
    toast.success(`Đã chọn ${table.name}`);
  };

  // Fetch table's current order
  const fetchTableOrder = async (tableId) => {
    setLoadingOrder(true);
    try {
      const response = await api.get(`/api/v1/orders/table/${tableId}/current`);
      const order = response.data.data.order;

      setCurrentOrder(order);

      // Convert order items to local format
      const items = order.items.map((item) => ({
        id: item._id,
        menuItemId: item.menuItem._id,
        name: item.menuItem.name,
        price: item.priceAtOrder,
        quantity: item.quantity,
        notes: item.notes || "",
        status: item.status,
        imageUrl:
          item.menuItem.imageUrls && item.menuItem.imageUrls.length > 0
            ? item.menuItem.imageUrls[0]
            : null,
      }));

      setOrderItems(items);
      setDiscountAmount(order.discountAmount || 0);
    } catch (error) {
      console.error("Error fetching table order:", error);
      toast.error("Không thể tải thông tin đơn hàng");
      initializeNewOrder();
    } finally {
      setLoadingOrder(false);
    }
  };

  // Initialize a new empty order
  const initializeNewOrder = () => {
    setCurrentOrder(null);
    setOrderItems([]);
    setDiscountAmount(0);
    setAppliedPromotion(null);
    setPromotionCode("");
  };

  // Handle filter tables input
  const handleFilterTables = (e) => {
    const value = e.target.value;
    setTableFilter(value);

    if (value) {
      const filtered = tables.filter(
        (table) =>
          table.name.toLowerCase().includes(value.toLowerCase()) ||
          (table.location &&
            table.location.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredTables(filtered);
    } else {
      setFilteredTables(tables);
    }
  };

  // Open menu item modal to add/edit an item
  const handleMenuItemClick = (item, existingItem = null) => {
    setSelectedMenuItem(item);
    if (existingItem) {
      // Find the full menu item data
      const menuItem = menuItems.find(
        (mi) => mi._id === existingItem.menuItemId
      );
      if (menuItem) {
        setSelectedMenuItem({ ...menuItem, price: existingItem.price });
      }
    }
    setShowMenuItemModal(true);
  };

  // Add item to order
  const handleAddToOrder = (itemData) => {
    // Check if we're editing an existing item
    if (itemData.id) {
      // Update existing item
      setOrderItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemData.id
            ? { ...item, quantity: itemData.quantity, notes: itemData.notes }
            : item
        )
      );
    } else {
      // Check if item already exists in order
      const existingItemIndex = orderItems.findIndex(
        (item) => item.menuItemId === itemData.menuItemId
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...orderItems];
        updatedItems[existingItemIndex].quantity += itemData.quantity;
        if (itemData.notes) {
          updatedItems[existingItemIndex].notes = itemData.notes;
        }
        setOrderItems(updatedItems);
      } else {
        // Add new item
        setOrderItems([
          ...orderItems,
          {
            menuItemId: itemData.menuItemId,
            name: itemData.name,
            price: itemData.price,
            quantity: itemData.quantity,
            notes: itemData.notes,
            status: "pending",
          },
        ]);
      }
    }
  };

  // Update item quantity
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setOrderItems((prevItems) =>
      prevItems.map((item, index) =>
        (item.id || index) === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Update item notes
  const handleUpdateNotes = (itemId, notes) => {
    setOrderItems((prevItems) =>
      prevItems.map((item, index) =>
        (item.id || index) === itemId ? { ...item, notes } : item
      )
    );
  };

  // Remove item from order
  const handleRemoveItem = (itemId) => {
    setOrderItems((prevItems) =>
      prevItems.filter((item, index) => (item.id || index) !== itemId)
    );
  };

  // Handle discount application
  const handleApplyDiscount = (discountData) => {
    if (discountData.promotionCode && discountData.appliedPromotion) {
      // Handle promotion code discount
      setDiscountAmount(discountData.discountAmount);
      setAppliedPromotion(discountData.appliedPromotion);
      setPromotionCode(discountData.promotionCode);
    } else if (discountData.discountPercentage !== null) {
      // Handle percentage discount
      const amount = (
        subTotal *
        (discountData.discountPercentage / 100)
      ).toFixed(0);
      setDiscountAmount(parseFloat(amount));
      setAppliedPromotion(null);
      setPromotionCode("");
    } else if (discountData.discountAmount !== null) {
      // Handle fixed amount discount
      setDiscountAmount(discountData.discountAmount);
      setAppliedPromotion(null);
      setPromotionCode("");
    }

    // Lưu thông tin mã giảm giá nếu có
    if (currentOrder && discountData.promoCode) {
      // Lưu thông tin mã giảm giá vào order để sử dụng khi thanh toán
      setCurrentOrder({
        ...currentOrder,
        promoCode: discountData.promoCode,
        promoId: discountData.promoId,
      });

      // Hiển thị thông báo
      toast.success(`Đã áp dụng mã giảm giá: ${discountData.promoCode}`);
    }

    // Lưu thông tin mã giảm giá nếu có
    if (currentOrder && discountData.promoCode) {
      // Lưu thông tin mã giảm giá vào order để sử dụng khi thanh toán
      setCurrentOrder({
        ...currentOrder,
        promoCode: discountData.promoCode,
        promoId: discountData.promoId,
      });

      // Hiển thị thông báo
      toast.success(`Đã áp dụng mã giảm giá: ${discountData.promoCode}`);
    }
  };

  // Render order action buttons
  const renderOrderActions = () => {
    if (!currentTable) return null;

    const isNewOrder = !currentOrder;
    const needsCleaning = currentTable.status === "needs_cleaning";
    const canCheckout = currentOrder && orderItems.length > 0;

    return (
      <div className="order-actions d-flex flex-wrap gap-2 p-3 border-top">
        {/* Nút dọn bàn khi bàn cần dọn dẹp */}
        {needsCleaning ? (
          <Button
            variant="info"
            disabled={savingOrder}
            onClick={() => handleClearTable(currentTable._id)}
            className="d-flex align-items-center flex-grow-1"
          >
            <FaBroom className="me-2" />
            Đã dọn bàn xong
          </Button>
        ) : (
          <>
            <Button
              variant="primary"
              disabled={orderItems.length === 0 || savingOrder}
              onClick={() => handleSaveOrder()}
              className="d-flex align-items-center flex-grow-1"
            >
              {savingOrder ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
              ) : (
                <FaCheck className="me-2" />
              )}
              {isNewOrder ? "Lưu đơn hàng" : "Cập nhật đơn hàng"}
            </Button>

            <Button
              variant="info"
              disabled={orderItems.length === 0 || savingOrder}
              onClick={() => setShowDiscountModal(true)}
              className="d-flex align-items-center flex-grow-1"
            >
              <FaTags className="me-2" />
              {discountAmount > 0
                ? appliedPromotion
                  ? `Sửa KM (${promotionCode})`
                  : "Sửa giảm giá"
                : "Giảm giá"}
            </Button>

            <Button
              variant="secondary"
              disabled={orderItems.length === 0 || savingOrder}
              onClick={() => setShowPrintModal(true)}
              className="d-flex align-items-center flex-grow-1"
            >
              <FaPrint className="me-2" />
              In tạm tính
            </Button>

            {canCheckout && (
              <>
                <Button
                  variant="success"
                  disabled={savingOrder}
                  onClick={() => handlePayment({ paymentMethod: "cash" })}
                  className="d-flex align-items-center flex-grow-1"
                >
                  <FaCreditCard className="me-2" />
                  Thanh toán tiền mặt
                </Button>
                <Button
                  variant="primary"
                  disabled={savingOrder}
                  onClick={() => handlePayment({ paymentMethod: "banking" })}
                  className="d-flex align-items-center flex-grow-1"
                >
                  <FaCreditCard className="me-2" />
                  Thanh toán QR Code
                </Button>
              </>
            )}
          </>
        )}
      </div>
    );
  };

  // Save or update order
  const handleSaveOrder = async (status = "pending_confirmation") => {
    if (!currentTable) {
      toast.error("Vui lòng chọn bàn trước khi lưu đơn hàng");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Đơn hàng phải có ít nhất một món");
      return;
    }

    setSavingOrder(true);

    try {
      let response;

      if (currentOrder) {
        // Update existing order
        // First, add new items if any
        const newItems = orderItems.filter((item) => !item.id);
        for (const item of newItems) {
          await api.put(`/api/v1/orders/${currentOrder._id}/add-item`, {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            notes: item.notes,
          });
        }

        // Then update existing items
        const existingItems = orderItems.filter((item) => item.id);
        for (const item of existingItems) {
          await api.put(
            `/api/v1/orders/${currentOrder._id}/update-item/${item.id}`,
            {
              quantity: item.quantity,
              notes: item.notes,
            }
          );
        }

        // Apply discount if any
        if (discountAmount > 0) {
          await api.put(`/api/v1/orders/${currentOrder._id}/apply-discount`, {
            discountAmount,
            promoCode: currentOrder.promoCode,
            promoId: currentOrder.promoId,
          });
        }

        // Update order status if needed
        if (
          status !== "pending_confirmation" &&
          status !== currentOrder.orderStatus
        ) {
          await orderService.updateOrderStatus(currentOrder._id, {
            status: status,
          });
        }

        toast.success("Đã cập nhật đơn hàng");
        response = await api.get(`/api/v1/orders/${currentOrder._id}`);
      } else {
        // Create new order
        const orderData = {
          tableId: currentTable._id,
          items: orderItems.map((item) => ({
            menuItem: item.menuItemId,
            quantity: item.quantity,
            notes: item.notes,
          })),
          orderType: "dine-in",
          orderNotes: "",
        };

        console.log("Đang tạo đơn hàng mới:", orderData);
        response = await api.post("/api/v1/orders", orderData);
        console.log("Phản hồi từ API khi tạo đơn hàng:", response.data);

        const orderId = response.data.data.order._id;

        // Apply discount if any
        if (discountAmount > 0) {
          await api.put(`/api/v1/orders/${orderId}/apply-discount`, {
            discountAmount,
            promoCode: currentOrder?.promoCode,
            promoId: currentOrder?.promoId,
          });
        }

        toast.success("Đã tạo đơn hàng mới");

        // Refresh order
        response = await api.get(`/api/v1/orders/${orderId}`);
      }

      // Update current order
      setCurrentOrder(response.data.data.order);

      // Refresh tables to get updated status
      fetchTables();
      fetchOpenOrders();
      fetchBookings();
    } catch (error) {
      console.error("Error saving order:", error);
      console.error("Chi tiết lỗi:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Lỗi khi lưu đơn hàng");
    } finally {
      setSavingOrder(false);
    }
  };

  // Handle payment
  const handlePayment = async (paymentData) => {
    if (!currentOrder && orderItems.length > 0) {
      // Nếu chưa có đơn hàng, tạo đơn hàng mới trước
      await handleSaveOrder();
    }

    if (!currentOrder) {
      toast.error("Không thể thanh toán khi chưa có đơn hàng");
      return;
    }

    setSavingOrder(true);

    try {
      // Process checkout
      await api.post(`/api/v1/orders/${currentOrder._id}/checkout`, {
        paymentMethod: paymentData.paymentMethod,
      });

      toast.success(
        `Thanh toán ${paymentData.paymentMethod === "cash" ? "tiền mặt" : "chuyển khoản"
        } thành công`
      );

      // Reset order
      initializeNewOrder();

      // Refresh tables
      fetchTables();
      fetchOpenOrders();
      fetchBookings();

      // Set table to null
      setCurrentTable(null);

      // Switch to tables tab
      setActiveTab("tables");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error.response?.data?.message || "Lỗi khi xử lý thanh toán");
    } finally {
      setSavingOrder(false);
    }
  };

  // Clear table (set to available)
  const handleClearTable = async (tableId) => {
    if (!tableId) return;

    try {
      await api.put(`/api/v1/tables/${tableId}/clear`);
      toast.success("Đã cập nhật bàn về trạng thái trống");

      // Refresh tables
      fetchTables();

      // If this is the current table, reset it
      if (currentTable && currentTable._id === tableId) {
        setCurrentTable(null);
        initializeNewOrder();
      }
    } catch (error) {
      console.error("Error clearing table:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái bàn"
      );
    }
  };

  // Xử lý thông tin đặt bàn cho các bàn có trạng thái "reserved"
  const processTablesWithReservations = async (fetchedTables) => {
    const tablesWithReservationInfo = [...fetchedTables];

    // Lặp qua các bàn có trạng thái "reserved"
    const reservedTables = fetchedTables.filter(
      (table) => table.status === "reserved"
    );

    // Nếu không có bàn nào được đặt, trả về danh sách ban đầu
    if (reservedTables.length === 0) return fetchedTables;

    try {
      // Xử lý song song các yêu cầu API để tối ưu hiệu suất
      const reservationPromises = reservedTables.map(async (table) => {
        try {
          const response = await api.get(
            `/api/v1/tables/${table._id}/upcoming-reservations`
          );
          const upcomingReservations = response.data.data.upcomingBookings;

          if (upcomingReservations && upcomingReservations.length > 0) {
            const nextReservation = upcomingReservations[0]; // Lấy đặt bàn gần nhất

            // Format date and time for display
            const reservationDate = new Date(nextReservation.date);
            const formattedDate = reservationDate.toLocaleDateString("vi-VN");
            const reservationTime = nextReservation.time;

            // Tìm và cập nhật thông tin bàn trong mảng chính
            const tableIndex = tablesWithReservationInfo.findIndex(
              (t) => t._id === table._id
            );
            if (tableIndex !== -1) {
              tablesWithReservationInfo[tableIndex].nextReservationInfo = {
                time: reservationTime,
                date: formattedDate,
                customerName: nextReservation.customerName,
                customerPhone: nextReservation.customerPhone,
                numberOfGuests: nextReservation.numberOfGuests,
                minutesUntil: nextReservation.minutesUntil,
                hoursUntil: nextReservation.hoursUntil,
              };
            }
          }
        } catch (error) {
          console.error(
            `Error fetching reservations for table ${table._id}:`,
            error
          );
          // Không báo lỗi cho người dùng, chỉ ghi log
        }
      });

      // Đợi tất cả các yêu cầu API hoàn thành
      await Promise.all(reservationPromises);

      return tablesWithReservationInfo;
    } catch (error) {
      console.error("Error processing tables with reservations:", error);
      return fetchedTables; // Trả về danh sách ban đầu nếu có lỗi
    }
  };

  return (
    <div className="pos-page p-2 p-md-3">
      <Row className="g-3">
        {/* Left Column - Tables/Orders */}
        <Col md={3} className="pos-left-column">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <Nav
                  variant="tabs"
                  activeKey={activeTab}
                  onSelect={setActiveTab}
                >
                  <Nav.Item>
                    <Nav.Link
                      eventKey="tables"
                      className="d-flex align-items-center"
                    >
                      <FaTable className="me-2" /> Bàn
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="bookings"
                      className="d-flex align-items-center"
                    >
                      <FaUsers className="me-2" /> Đặt Bàn
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="bookings"
                      className="d-flex align-items-center"
                    >
                      <FaUsers className="me-2" /> Đặt Bàn
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="orders"
                      className="d-flex align-items-center"
                    >
                      <FaUtensils className="me-2" /> Đơn
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="menu"
                      className="d-flex align-items-center"
                    >
                      <FaUtensils className="me-2" /> Menu
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Hiển thị nội dung tab dựa trên activeTab */}
              {activeTab === "tables" && (
                <div>
                  <TableGrid
                    tables={filteredTables}
                    loading={loadingTables}
                    onSelectTable={handleSelectTable}
                    filterValue={tableFilter}
                    onFilterChange={handleFilterTables}
                    currentTable={currentTable}
                    onClearTable={handleClearTable}
                  />

                  {/* Add a button to navigate to menu tab after table selection */}
                  {currentTable && activeTab === "tables" && (
                    <div className="p-2 border-top">
                      <Button
                        variant="primary"
                        className="w-100 d-flex align-items-center justify-content-center"
                        onClick={() => setActiveTab("menu")}
                      >
                        <FaUtensils className="me-2" />
                        Tiếp tục chọn món cho bàn {currentTable.name}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "bookings" && (
                <div className="p-2">
                  <h6 className="mb-3">Danh Sách Đặt Bàn</h6>
                  {bookingsLoading ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" size="sm" />
                      <p className="mt-2">Đang tải...</p>
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <p className="text-center text-muted">
                      Không có đặt bàn nào
                    </p>
                  ) : (
                    <ListGroup>
                      {filteredBookings.map((booking) => (
                        <ListGroup.Item key={booking._id} className="mb-2">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <strong>{booking.customerName}</strong>
                              <div className="text-muted small">
                                {booking.customerPhone}
                              </div>
                            </div>
                            <Badge
                              bg={
                                booking.status === "pending"
                                  ? "warning"
                                  : booking.status === "confirmed"
                                    ? "success"
                                    : booking.status === "cancelled"
                                      ? "danger"
                                      : "secondary"
                              }
                            >
                              {booking.status === "pending"
                                ? "Chờ xác nhận"
                                : booking.status === "confirmed"
                                  ? "Đã xác nhận"
                                  : booking.status === "cancelled"
                                    ? "Đã hủy"
                                    : booking.status === "completed"
                                      ? "Hoàn thành"
                                      : booking.status}
                            </Badge>
                          </div>

                          <div className="row small mb-2">
                            <div className="col-6">
                              <FaUsers className="me-1" />
                              {booking.numberOfGuests} khách
                            </div>
                            <div className="col-6">
                              <FaTable className="me-1" />
                              {booking.tableAssigned?.name || "Chưa gán bàn"}
                            </div>
                          </div>

                          <div className="small mb-2">
                            📅{" "}
                            {new Date(booking.date).toLocaleDateString("vi-VN")}{" "}
                            lúc {booking.time}
                          </div>

                          {/* Pre-ordered items */}
                          {booking.preOrderedItems &&
                            booking.preOrderedItems.length > 0 && (
                              <div className="mb-2">
                                <div className="small fw-bold">
                                  Món đã đặt trước:
                                </div>
                                {booking.preOrderedItems.map((item, index) => (
                                  <div key={index} className="small text-muted">
                                    • {item.menuItem?.name || "Món ăn"} x
                                    {item.quantity}
                                    {item.notes && (
                                      <span className="fst-italic">
                                        {" "}
                                        ({item.notes})
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* Promotion info */}
                          {booking.appliedPromotion && (
                            <div className="mb-2">
                              <div className="small fw-bold text-success">
                                🎫 Khuyến mãi:
                              </div>
                              <div className="small text-success">
                                {booking.appliedPromotion.name} (
                                {booking.appliedPromotion.code})
                                <br />
                                Giảm:{" "}
                                {formatCurrency(
                                  booking.appliedPromotion.discountAmount
                                )}
                              </div>
                            </div>
                          )}

                          {/* Payment info */}
                          {booking.paymentInfo && (
                            <div className="mb-2">
                              <div className="small fw-bold">
                                💰 Thanh toán:
                              </div>
                              <div className="small">
                                Tổng:{" "}
                                {formatCurrency(
                                  booking.paymentInfo.totalAmount
                                )}
                                (
                                {booking.paymentInfo.paymentMethod === "cash"
                                  ? "Tiền mặt"
                                  : booking.paymentInfo.paymentMethod === "card"
                                    ? "Thẻ"
                                    : booking.paymentInfo.paymentMethod ===
                                      "transfer"
                                      ? "Chuyển khoản"
                                      : booking.paymentInfo.paymentMethod ===
                                        "ewallet"
                                        ? "Ví điện tử"
                                        : booking.paymentInfo.paymentMethod}
                                )
                              </div>
                            </div>
                          )}

                          {booking.notes && (
                            <div className="small text-muted mb-2">
                              📝 {booking.notes}
                            </div>
                          )}

                          {/* Action buttons */}
                          {booking.status === "pending" && (
                            <div className="d-flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() =>
                                  handleConfirmBooking(booking._id)
                                }
                              >
                                Xác nhận
                              </Button>
                              {!booking.tableAssigned && (
                                <Form.Select
                                  size="sm"
                                  style={{ width: "auto" }}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAssignTable(
                                        booking._id,
                                        e.target.value
                                      );
                                    }
                                  }}
                                >
                                  <option value="">Gán bàn...</option>
                                  {tables
                                    .filter((t) => t.status === "available")
                                    .map((table) => (
                                      <option key={table._id} value={table._id}>
                                        {table.name} ({table.capacity} chỗ)
                                      </option>
                                    ))}
                                </Form.Select>
                              )}
                            </div>
                          )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div className="p-2">
                  <h6 className="mb-3">Đơn hàng đang mở</h6>
                  {openOrders.length === 0 ? (
                    <p className="text-center text-muted">
                      Không có đơn hàng nào đang mở
                    </p>
                  ) : (
                    <ListGroup>
                      {openOrders.map((order) => {
                        if (!order || !order._id) return null; // Skip invalid orders

                        return (
                          <ListGroup.Item
                            key={order._id}
                            action
                            onClick={() => {
                              // Find the table for this order
                              const table = tables.find(
                                (t) => t._id === order.table?._id
                              );
                              if (table) {
                                handleSelectTable(table);
                              } else {
                                toast.warning(
                                  "Không tìm thấy thông tin bàn cho đơn hàng này"
                                );
                              }
                            }}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <div>
                                <strong>
                                  {order.table?.name || "Không có bàn"}
                                </strong>
                              </div>
                              <div className="text-muted small">
                                {new Date(order.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="d-flex flex-column align-items-end">
                              <Badge
                                bg={
                                  order.orderStatus === "pending_confirmation"
                                    ? "warning"
                                    : order.orderStatus ===
                                      "confirmed_by_customer"
                                      ? "info"
                                      : order.orderStatus ===
                                        "partially_served" ||
                                        order.orderStatus === "fully_served"
                                        ? "secondary"
                                        : order.orderStatus === "payment_pending"
                                          ? "success"
                                          : "danger"
                                }
                              >
                                {order.orderStatus === "pending_confirmation"
                                  ? "Chờ xác nhận"
                                  : order.orderStatus ===
                                    "confirmed_by_customer"
                                    ? "Đã xác nhận"
                                    : order.orderStatus === "partially_served"
                                      ? "Đã phục vụ một phần"
                                      : order.orderStatus === "fully_served"
                                        ? "Đã phục vụ đầy đủ"
                                        : order.orderStatus === "payment_pending"
                                          ? "Chờ thanh toán"
                                          : "Đã hủy"}
                              </Badge>
                              <div className="mt-1">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(order.totalAmount)}
                              </div>
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  )}
                </div>
              )}

              {activeTab === "menu" && (
                <div>
                  <h6 className="p-2 border-bottom">Menu</h6>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Middle Column - Menu */}
        <Col md={5} className="pos-middle-column">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white py-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaUtensils className="me-2 text-primary" /> Thực đơn
                </h5>
                <Form.Control
                  type="text"
                  placeholder="Tìm món ăn..."
                  value={menuItemSearchTerm}
                  onChange={(e) => setMenuItemSearchTerm(e.target.value)}
                  className="w-50"
                />
              </div>
              <div className="categories-scrollable d-flex flex-nowrap overflow-auto pb-2">
                {categories.map((category, index) => (
                  <Button
                    key={
                      category._id ||
                      `category-${index}-${category.name || "unknown"}`
                    }
                    variant={
                      activeCategory === category._id
                        ? "primary"
                        : "outline-primary"
                    }
                    onClick={() => setActiveCategory(category._id)}
                    className="me-2 flex-shrink-0"
                    size="sm"
                  >
                    {category.name || "Không xác định"}
                  </Button>
                ))}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <MenuItemList
                menuItems={filteredMenuItems}
                loading={loadingMenu}
                onAddItem={handleMenuItemClick}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Order Details */}
        <Col md={4} className="pos-right-column">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">
                {currentTable ? (
                  <span>Đơn hàng: {currentTable.name}</span>
                ) : (
                  <span>Chọn bàn để bắt đầu</span>
                )}
              </h5>
            </Card.Header>
            <Card.Body
              className="p-0 d-flex flex-column"
              style={{ height: "calc(100% - 56px)" }}
            >
              <OrderDetails
                orderItems={orderItems}
                subTotal={subTotal}
                taxAmount={taxAmount}
                discountAmount={discountAmount}
                totalAmount={totalAmount}
                appliedPromotion={appliedPromotion}
                promotionCode={promotionCode}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onUpdateNotes={handleUpdateNotes}
                currentTable={currentTable}
                currentOrder={currentOrder}
                disabled={
                  savingOrder ||
                  (currentOrder &&
                    ["paid", "cancelled_order"].includes(
                      currentOrder.orderStatus
                    ))
                }
              />
              {renderOrderActions()}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <MenuItemModal
        show={showMenuItemModal}
        onHide={() => setShowMenuItemModal(false)}
        menuItem={selectedMenuItem}
        onAddToOrder={handleAddToOrder}
        existingItem={null}
      />

      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        onSubmit={handlePayment}
        orderItems={orderItems}
        subTotal={subTotal}
        taxAmount={taxAmount}
        discountAmount={discountAmount}
        totalAmount={totalAmount}
      />

      <DiscountModal
        show={showDiscountModal}
        onHide={() => setShowDiscountModal(false)}
        onApplyDiscount={handleApplyDiscount}
        subTotal={subTotal}
        currentDiscount={discountAmount}
      />

      <PrintInvoiceModal
        show={showPrintModal}
        onHide={() => setShowPrintModal(false)}
        orderItems={orderItems}
        subTotal={subTotal}
        taxAmount={taxAmount}
        discountAmount={discountAmount}
        totalAmount={totalAmount}
        currentTable={currentTable}
        currentOrder={currentOrder}
      />
    </div>
  );
};

export default PointOfSalePage;
