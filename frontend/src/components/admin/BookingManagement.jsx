import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Button,
  Row,
  Col,
  Form,
  InputGroup,
  Spinner,
  Modal,
} from "react-bootstrap";
import {
  FaSearch,
  FaCalendarAlt,
  FaFilter,
  FaCheck,
  FaTimes,
  FaEye,
  FaEdit,
  FaTrash,
  FaTable,
  FaInfoCircle,
  FaUsers,
  FaUtensils,
} from "react-icons/fa";
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns";
import { toast } from "react-toastify";
import bookingService from "../../services/bookingService";
import tableService from "../../services/tableService";
import TableBookingDetails from "./TableBookingDetails";

const BookingManagement = () => {
  // State for bookings
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);

  // State for filters
  const [filters, setFilters] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    status: "",
    search: "",
  });

  // State for table booking details modal
  const [showTableDetails, setShowTableDetails] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(null);

  // State for edit booking modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    customerName: "",
    customerPhone: "",
    numberOfGuests: 2,
    date: "",
    time: "",
    status: "",
    specialRequests: "",
    tableId: "",
  });

  // State for pre-ordered items modal
  const [showPreOrderedModal, setShowPreOrderedModal] = useState(false);
  const [preOrderedItems, setPreOrderedItems] = useState([]);

  const [availableTables, setAvailableTables] = useState([]);
  const [loadingAvailableTables, setLoadingAvailableTables] = useState(false);
  const [modalMode, setModalMode] = useState("edit");

  // Fetch bookings on component mount and when filters change
  useEffect(() => {
    fetchBookings();
  }, [filters.date, filters.status]);

  // Fetch tables when date changes
  useEffect(() => {
    fetchTables();
  }, [filters.date]);

  // Apply search filter when search term changes
  useEffect(() => {
    if (bookings.length > 0) {
      applySearchFilter();
    }
  }, [filters.search, bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getAllBookings({
        date: filters.date,
        status: filters.status || undefined,
      });

      // Kiểm tra cấu trúc dữ liệu và trích xuất đúng mảng bookings
      let bookingsData = [];
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.bookings)
      ) {
        bookingsData = response.data.data.bookings;
      } else if (response.data && Array.isArray(response.data.data)) {
        bookingsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        bookingsData = response.data;
      } else {
        console.error("Unexpected API response structure:", response.data);
        bookingsData = [];
      }

      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Không thể tải danh sách đặt bàn");
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      const dateTime = `${filters.date}T00:00:00`;
      console.log("Fetching tables with booking info for datetime:", dateTime);
      const response = await tableService.getTablesWithBookingInfo(dateTime);

      // Kiểm tra cấu trúc dữ liệu và trích xuất đúng mảng tables
      let tablesData = [];
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.tables)
      ) {
        tablesData = response.data.data.tables;
      } else if (response.data && Array.isArray(response.data.data)) {
        tablesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        tablesData = response.data;
      } else {
        console.error("Unexpected API response structure:", response.data);
        tablesData = [];
      }

      console.log("Tables data loaded:", tablesData);
      setTables(tablesData);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Không thể tải thông tin bàn");
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchAvailableTables = async (date, time, bookingId) => {
    setLoadingAvailableTables(true);
    try {
      const dateTime = `${date}T${time}:00`;
      const response = await tableService.getAvailableTablesForBooking(
        dateTime,
        editForm.numberOfGuests
      );

      // Kiểm tra cấu trúc dữ liệu và trích xuất đúng mảng tables
      let availableTablesData = [];
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.tables)
      ) {
        availableTablesData = response.data.data.tables;
      } else if (response.data && Array.isArray(response.data.data)) {
        availableTablesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        availableTablesData = response.data;
      } else {
        console.error(
          "Unexpected API response structure for available tables:",
          response.data
        );
        availableTablesData = [];
      }

      // Nếu đang chỉnh sửa đặt bàn hiện tại đã có bàn, thêm bàn đó vào danh sách có sẵn
      if (selectedBooking && selectedBooking.tableAssigned) {
        const currentTable = selectedBooking.tableAssigned;
        const tableExists = availableTablesData.some(
          (table) => table._id === currentTable._id
        );

        if (!tableExists) {
          availableTablesData.push(currentTable);
        }
      }

      setAvailableTables(availableTablesData);
    } catch (error) {
      console.error("Error fetching available tables:", error);
      toast.error("Không thể tải danh sách bàn khả dụng");
      setAvailableTables([]);
    } finally {
      setLoadingAvailableTables(false);
    }
  };

  const applySearchFilter = () => {
    if (!filters.search.trim()) {
      setFilteredBookings([...bookings]);
      return;
    }

    const searchTerm = filters.search.toLowerCase();
    const filtered = bookings.filter(
      (booking) =>
        booking.customerName.toLowerCase().includes(searchTerm) ||
        booking.customerPhone.toLowerCase().includes(searchTerm) ||
        (booking.tableAssigned &&
          booking.tableAssigned.name.toLowerCase().includes(searchTerm))
    );

    setFilteredBookings(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateQuickSelect = (option) => {
    let selectedDate;

    if (option === "today") {
      selectedDate = new Date();
    } else if (option === "tomorrow") {
      selectedDate = addDays(new Date(), 1);
    }

    setFilters((prev) => ({
      ...prev,
      date: format(selectedDate, "yyyy-MM-dd"),
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge bg="warning" text="dark">
            Chờ xác nhận
          </Badge>
        );
      case "confirmed":
        return <Badge bg="success">Đã xác nhận</Badge>;
      case "cancelled":
        return <Badge bg="danger">Đã hủy</Badge>;
      case "cancelled_by_customer":
        return <Badge bg="danger">Khách hàng đã hủy</Badge>;
      case "completed":
        return <Badge bg="info">Hoàn thành</Badge>;
      case "no-show":
        return <Badge bg="dark">Không đến</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDateTime = (date, time) => {
    if (!date) return "";

    const dateObj = new Date(date);
    const formattedDate = format(dateObj, "dd/MM/yyyy");
    return `${formattedDate} ${time || ""}`;
  };

  const handleViewBooking = (bookingId) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (!booking) return;

    setSelectedBooking(booking);

    // Điền thông tin vào form nhưng chỉ cho xem
    const dateObj = new Date(booking.date);

    setEditForm({
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      numberOfGuests: booking.numberOfGuests,
      date: format(dateObj, "yyyy-MM-dd"),
      time: booking.time,
      status: booking.status,
      specialRequests: booking.specialRequests || "",
      tableId: booking.tableAssigned ? booking.tableAssigned._id : "",
    });

    // Đặt mode là view
    setModalMode("view");

    // Mở modal
    setShowEditModal(true);
  };

  const handleEditBooking = (bookingId) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (!booking) return;

    setSelectedBooking(booking);

    // Điền thông tin vào form
    const dateObj = new Date(booking.date);

    setEditForm({
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      numberOfGuests: booking.numberOfGuests,
      date: format(dateObj, "yyyy-MM-dd"),
      time: booking.time,
      status: booking.status,
      specialRequests: booking.specialRequests || "",
      tableId: booking.tableAssigned ? booking.tableAssigned._id : "",
    });

    // Đặt mode là edit
    setModalMode("edit");

    // Lấy danh sách bàn khả dụng
    fetchAvailableTables(
      format(dateObj, "yyyy-MM-dd"),
      booking.time,
      bookingId
    );

    // Mở modal
    setShowEditModal(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đặt bàn này không?")) {
      try {
        console.log("Deleting booking:", bookingId);
        await bookingService.cancelBooking(bookingId, "Xóa bởi quản trị viên");

        toast.success("Đã xóa đặt bàn thành công");

        // Tải lại dữ liệu
        await fetchBookings();
        await fetchTables();
      } catch (error) {
        console.error("Error deleting booking:", error);
        toast.error(
          "Không thể xóa đặt bàn: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  // Xác nhận đặt bàn (chuyển trạng thái từ pending sang confirmed)
  const handleConfirmBooking = async (bookingId) => {
    try {
      const booking = bookings.find((b) => b._id === bookingId);
      if (!booking) {
        toast.error("Không tìm thấy thông tin đặt bàn");
        return;
      }

      // Cập nhật trạng thái thành confirmed
      await bookingService.updateBookingStatus(bookingId, {
        status: "confirmed",
      });

      toast.success("Đã xác nhận đặt bàn thành công");

      // Tải lại dữ liệu
      await fetchBookings();
      await fetchTables();
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error(
        "Không thể xác nhận đặt bàn: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleTableClick = (tableId) => {
    setSelectedTableId(tableId);
    setShowTableDetails(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Nếu thay đổi ngày hoặc giờ, cần lấy lại danh sách bàn khả dụng
    if (name === "date" || name === "time") {
      if (editForm.date && editForm.time) {
        fetchAvailableTables(
          name === "date" ? value : editForm.date,
          name === "time" ? value : editForm.time,
          selectedBooking._id
        );
      }
    }

    // Nếu thay đổi số khách, cũng cần lấy lại danh sách bàn
    if (name === "numberOfGuests" && editForm.date && editForm.time) {
      fetchAvailableTables(editForm.date, editForm.time, selectedBooking._id);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    try {
      // Tạo dữ liệu cập nhật
      const updateData = {
        customerName: editForm.customerName,
        customerPhone: editForm.customerPhone,
        numberOfGuests: parseInt(editForm.numberOfGuests),
        date: editForm.date,
        time: editForm.time,
        status: editForm.status,
        specialRequests: editForm.specialRequests,
        tableId: editForm.tableId || undefined,
      };

      console.log("Updating booking with data:", updateData);

      // Gọi API cập nhật
      const response = await bookingService.updateBooking(
        selectedBooking._id,
        updateData
      );
      console.log("Booking updated successfully:", response.data);

      // Nếu đã gán bàn và trạng thái là confirmed, cập nhật trạng thái bàn thành reserved
      if (editForm.tableId && editForm.status === "confirmed") {
        console.log("Marking table as reserved:", editForm.tableId);
        try {
          await tableService.markTableAsReserved(
            editForm.tableId,
            selectedBooking._id
          );
          console.log("Table marked as reserved successfully");
        } catch (tableError) {
          console.error("Error marking table as reserved:", tableError);
          // Không hiển thị lỗi này cho người dùng vì booking đã được cập nhật thành công
          // và backend cũng đã tự động đánh dấu bàn là reserved
        }
      }

      toast.success("Cập nhật đặt bàn thành công");
      setShowEditModal(false);

      // Tải lại dữ liệu
      await fetchBookings();
      await fetchTables();
    } catch (error) {
      console.error("Error updating booking:", error);

      // Xử lý thông báo lỗi từ backend
      let errorMessage = "Không thể cập nhật đặt bàn";

      if (error.response) {
        // Lấy thông báo lỗi từ response của API
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  // Handler to view pre-ordered items
  const handleViewPreOrderedItems = (booking) => {
    if (booking.preOrderedItems && booking.preOrderedItems.length > 0) {
      setPreOrderedItems(booking.preOrderedItems);
      setShowPreOrderedModal(true);
    } else {
      toast.info("Khách hàng này không có món ăn đặt trước");
    }
  };

  return (
    <div className="booking-management">
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Danh sách đặt bàn</h5>
            </Card.Header>
            <Card.Body>
              {/* Filters */}
              <Row className="mb-3 align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Ngày</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={filters.date}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                    >
                      <option value="">Tất cả</option>
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="cancelled">Đã hủy</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="no-show">Không đến</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Tìm kiếm theo tên, SĐT..."
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                  </InputGroup>
                </Col>
                <Col md={2}>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleDateQuickSelect("today")}
                    >
                      Hôm nay
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleDateQuickSelect("tomorrow")}
                    >
                      Ngày mai
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* Bookings Table */}
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">
                    Đang tải danh sách đặt bàn...
                  </p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-5">
                  <p>Không có đặt bàn nào cho ngày đã chọn</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Khách hàng</th>
                        <th>Thời gian</th>
                        <th>Số khách</th>
                        <th>Bàn</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            <div>{booking.customerName}</div>
                            <small className="text-muted">
                              {booking.customerPhone}
                            </small>
                          </td>
                          <td>
                            <div>
                              {formatDateTime(booking.date, booking.time)}
                            </div>
                          </td>
                          <td className="text-center">
                            <FaUsers className="me-1" />{" "}
                            {booking.numberOfGuests}
                          </td>
                          <td>
                            {booking.tableAssigned ? (
                              <div>
                                <FaTable className="me-1 text-success" />
                                {booking.tableAssigned.name}
                                {booking.tableAssigned.capacity && (
                                  <small className="text-muted d-block">
                                    Sức chứa: {booking.tableAssigned.capacity}{" "}
                                    người
                                  </small>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted">Chưa gán bàn</span>
                            )}
                          </td>
                          <td>{getStatusBadge(booking.status)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              {booking.status === "pending" && (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() =>
                                    handleConfirmBooking(booking._id)
                                  }
                                  title="Xác nhận đặt bàn"
                                >
                                  <FaCheck />
                                </Button>
                              )}{" "}
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleViewBooking(booking._id)}
                                title="Xem chi tiết"
                              >
                                <FaEye />
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditBooking(booking._id)}
                                title="Chỉnh sửa"
                              >
                                <FaEdit />
                              </Button>{" "}
                              {booking.preOrderedItems &&
                                booking.preOrderedItems.length > 0 && (
                                  <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() =>
                                      handleViewPreOrderedItems(booking)
                                    }
                                    title="Xem món ăn đặt trước"
                                  >
                                    <FaUtensils />
                                  </Button>
                                )}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteBooking(booking._id)}
                                title="Xóa đặt bàn"
                              >
                                <FaTrash />
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() =>
                                  handleViewPreOrderedItems(booking)
                                }
                                title="Xem món đã đặt trước"
                              >
                                <FaInfoCircle />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Bàn đã đặt</h5>
            </Card.Header>
            <Card.Body>
              {loadingTables ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Đang tải thông tin bàn...</p>
                </div>
              ) : (
                <div
                  className="table-grid-container"
                  style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
                >
                  {tables
                    .filter((table) => table.isBookedAt)
                    .map((table) => (
                      <div
                        key={table._id}
                        style={{
                          width: "calc(50% - 10px)",
                          backgroundColor: "#ffe8cc",
                          border: "1px solid #dee2e6",
                          borderRadius: "4px",
                          padding: "10px",
                          marginBottom: "10px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleTableClick(table._id)}
                      >
                        <div className="fw-bold">{table.name}</div>
                        <div className="small">
                          <FaUsers className="me-1" /> {table.capacity} người
                        </div>
                        <div className="small text-muted mt-1">
                          <FaCalendarAlt className="me-1" />
                          {table.bookingInfo
                            ? formatDateTime(
                                table.bookingInfo.date,
                                table.bookingInfo.time
                              )
                            : "Đã đặt"}
                        </div>
                      </div>
                    ))}

                  {tables.filter((table) => table.isBookedAt).length === 0 && (
                    <div className="text-center w-100 py-4">
                      <p className="text-muted mb-0">
                        Không có bàn nào được đặt cho ngày đã chọn
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Table Booking Details Modal */}
      <TableBookingDetails
        show={showTableDetails}
        onHide={() => setShowTableDetails(false)}
        tableId={selectedTableId}
        date={filters.date}
      />

      {/* Edit Booking Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "view" ? "Chi tiết đặt bàn" : "Chỉnh sửa đặt bàn"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitEdit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên khách hàng</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={editForm.customerName}
                    onChange={handleEditFormChange}
                    disabled={modalMode === "view"}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerPhone"
                    value={editForm.customerPhone}
                    onChange={handleEditFormChange}
                    disabled={modalMode === "view"}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditFormChange}
                    disabled={modalMode === "view"}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Giờ</Form.Label>
                  <Form.Control
                    type="time"
                    name="time"
                    value={editForm.time}
                    onChange={handleEditFormChange}
                    disabled={modalMode === "view"}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Số khách</Form.Label>
                  <Form.Control
                    type="number"
                    name="numberOfGuests"
                    value={editForm.numberOfGuests}
                    onChange={handleEditFormChange}
                    disabled={modalMode === "view"}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditFormChange}
                    disabled={modalMode === "view"}
                    required
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="cancelled">Đã hủy</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="no-show">Không đến</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bàn</Form.Label>
                  {loadingAvailableTables && modalMode !== "view" ? (
                    <div className="d-flex align-items-center">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Đang tải bàn khả dụng...</span>
                    </div>
                  ) : (
                    <Form.Select
                      name="tableId"
                      value={editForm.tableId}
                      onChange={handleEditFormChange}
                      disabled={modalMode === "view"}
                    >
                      <option value="">-- Chọn bàn --</option>
                      {availableTables.map((table) => (
                        <option key={table._id} value={table._id}>
                          {table.name} - {table.capacity} người
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Yêu cầu đặc biệt</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="specialRequests"
                value={editForm.specialRequests}
                onChange={handleEditFormChange}
                disabled={modalMode === "view"}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => setShowEditModal(false)}
              >
                {modalMode === "view" ? "Đóng" : "Hủy"}
              </Button>
              {modalMode !== "view" && (
                <Button variant="primary" type="submit">
                  Lưu thay đổi
                </Button>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Pre-Ordered Items Modal */}
      <Modal
        show={showPreOrderedModal}
        onHide={() => setShowPreOrderedModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Danh sách món ăn đặt trước</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {preOrderedItems.length === 0 ? (
            <p className="text-center">Không có món ăn đặt trước</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Món ăn</th>
                  <th>Số lượng</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {preOrderedItems.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {item.menuItem ? (
                        <>
                          <div>{item.menuItem.name}</div>
                          {item.menuItem.price && (
                            <small className="text-muted">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(item.menuItem.price)}
                            </small>
                          )}
                          {item.menuItem.imageUrls &&
                            item.menuItem.imageUrls.length > 0 && (
                              <img
                                src={item.menuItem.imageUrls[0]}
                                alt={item.menuItem.name}
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                  marginTop: "5px",
                                  borderRadius: "4px",
                                }}
                              />
                            )}
                        </>
                      ) : (
                        <span className="text-danger">Món ăn đã bị xóa</span>
                      )}
                    </td>
                    <td className="text-center">{item.quantity || 1}</td>
                    <td>
                      {item.notes || (
                        <span className="text-muted">Không có</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPreOrderedModal(false)}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingManagement;
