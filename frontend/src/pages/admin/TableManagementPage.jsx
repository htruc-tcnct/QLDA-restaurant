import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Form,
  InputGroup,
  Modal,
  Spinner,
  Tabs,
  Tab,
  Alert,
  Nav,
} from "react-bootstrap";
import {
  FaTable,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSort,
  FaCheck,
  FaBan,
  FaUsers,
  FaBroom,
  FaThLarge,
  FaList,
  FaMapMarkerAlt,
  FaChair,
  FaSave,
  FaExclamationTriangle,
  FaInfoCircle,
  FaMapMarked,
} from "react-icons/fa";
import { toast } from "react-toastify";
import tableService from "../../services/tableService";
import RestaurantFloorPlan from "../../components/admin/RestaurantFloorPlan";

const TableManagementPage = () => {
  // State for tables
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [tablesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', or 'view'
  const [currentTable, setCurrentTable] = useState(null);
  const [error, setError] = useState(null);

  // State for filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    location: "",
    capacity: "",
  });

  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // State for view mode
  const [activeTab, setActiveTab] = useState("grid");
  // State for table modal
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableModalMode, setTableModalMode] = useState("add"); // 'add', 'edit', 'view'
  const [selectedTable, setSelectedTable] = useState(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    capacity: 2,
    location: "main",
    status: "available",
    description: "",
  });

  // State for delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  // State for status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateTable, setStatusUpdateTable] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Fetch tables on component mount
  useEffect(() => {
    fetchTables();
  }, []); // Apply filters when filter states change
  useEffect(() => {
    applyFilters();
  }, [filters, tables, sortConfig]);
  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tableService.getAllTables();
      // Extract the tables array from the response data structure
      const tablesData =
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.tables)
          ? response.data.data.tables
          : Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

      setTables(tablesData);
      setFilteredTables(tablesData);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Không thể tải danh sách bàn");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let result = [...tables];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        (table) =>
          table.name.toLowerCase().includes(searchTerm) ||
          (table.location && table.location.toLowerCase().includes(searchTerm))
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((table) => table.status === filters.status);
    }

    // Apply location filter
    if (filters.location) {
      result = result.filter((table) => table.location === filters.location);
    }

    // Apply capacity filter
    if (filters.capacity) {
      const capacity = parseInt(filters.capacity);
      if (!isNaN(capacity)) {
        result = result.filter((table) => table.capacity >= capacity);
      }
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredTables(result);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      location: "",
      capacity: "",
    });
  };
  // Pagination
  const indexOfLastTable = currentPage * tablesPerPage;
  const indexOfFirstTable = indexOfLastTable - tablesPerPage;
  const currentTables = filteredTables.slice(
    indexOfFirstTable,
    indexOfLastTable
  );
  const totalPages = Math.ceil(filteredTables.length / tablesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  // Modal handlers
  const openAddModal = () => {
    setTableModalMode("add");
    setFormData({
      name: "",
      capacity: 2,
      location: "main",
      status: "available",
      description: "",
    });
    setShowTableModal(true);
  };

  const openEditModal = (table) => {
    setTableModalMode("edit");
    setCurrentTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity,
      status: table.status,
      description: table.description || "",
    });
    setShowTableModal(true);
  };

  const openViewModal = (table) => {
    setTableModalMode("view");
    setSelectedTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity,
      status: table.status,
      location: table.location || "main",
    });
    setShowTableModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) : value,
    }));
  };

  // CRUD operations
  const handleTableSubmit = async (e) => {
    e.preventDefault();

    try {
      if (tableModalMode === "add") {
        // Đảm bảo rằng trạng thái bàn mới luôn là "available" (trống)
        const newTableData = {
          ...formData,
          status: "available",
        };
        await tableService.createTable(newTableData);
        toast.success("Tạo bàn mới thành công");
      } else if (tableModalMode === "edit") {
        await tableService.updateTable(currentTable._id, formData);
        toast.success("Cập nhật bàn thành công");
      }

      setShowTableModal(false);
      fetchTables();
    } catch (error) {
      console.error("Error saving table:", error);
      toast.error(
        tableModalMode === "add"
          ? "Không thể tạo bàn mới"
          : "Không thể cập nhật bàn"
      );
    }
  };

  const openDeleteConfirmation = (table) => {
    setTableToDelete(table);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      await tableService.deleteTable(tableToDelete._id);
      toast.success("Xóa bàn thành công");
      setShowDeleteConfirmation(false);
      fetchTables();
    } catch (err) {
      console.error("Error deleting table:", err);
      toast.error(
        err.response?.data?.message ||
          "Không thể xóa bàn. Bàn có thể đang được sử dụng hoặc đã được đặt trước."
      );
    }
  };

  // Status update functions
  const openStatusModal = (table) => {
    setStatusUpdateTable(table);
    setNewStatus(table.status);
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!statusUpdateTable || !newStatus) return;

    try {
      await tableService.updateTableStatus(statusUpdateTable._id, newStatus);
      toast.success("Cập nhật trạng thái bàn thành công");
      setShowStatusModal(false);
      fetchTables();
    } catch (err) {
      console.error("Error updating table status:", err);
      toast.error("Không thể cập nhật trạng thái bàn");
    }
  };

  // Handle quick status change from floor plan
  const handleQuickStatusChange = async (tableId, status) => {
    try {
      await tableService.updateTableStatus(tableId, status);
      toast.success("Cập nhật trạng thái bàn thành công");
      fetchTables();
    } catch (err) {
      console.error("Error updating table status:", err);
      toast.error("Không thể cập nhật trạng thái bàn");
    }
  };

  // Helper functions
  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return (
          <Badge bg="success">
            <FaCheck className="me-1" /> Trống
          </Badge>
        );
      case "occupied":
        return (
          <Badge bg="danger">
            <FaUsers className="me-1" /> Đang sử dụng
          </Badge>
        );
      case "reserved":
        return (
          <Badge bg="warning" text="dark">
            <FaUsers className="me-1" /> Đã đặt trước
          </Badge>
        );
      case "unavailable":
        return (
          <Badge bg="secondary">
            <FaBan className="me-1" /> Không khả dụng
          </Badge>
        );
      case "needs_cleaning":
        return (
          <Badge bg="info">
            <FaBroom className="me-1" /> Cần dọn dẹp
          </Badge>
        );
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getLocationLabel = (location) => {
    switch (location) {
      case "main":
        return "Khu vực chính";
      case "outdoor":
        return "Ngoài trời";
      case "private":
        return "Phòng riêng";
      case "bar":
        return "Quầy bar";
      default:
        return location || "Không xác định";
    }
  };

  // Render functions
  const renderTableCard = (table) => {
    return (
      <Card className="h-100 table-card" key={table._id}>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{table.name}</h5>
          {getStatusBadge(table.status)}
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-column gap-2">
            <div>
              <FaChair className="me-2 text-primary" />
              <strong>Sức chứa:</strong> {table.capacity} người
            </div>
            <div>
              <FaMapMarkerAlt className="me-2 text-primary" />
              <strong>Vị trí:</strong> {getLocationLabel(table.location)}
            </div>
            {table.currentOrderId && (
              <div className="mt-2">
                <Badge bg="info" className="w-100 py-1">
                  <FaInfoCircle className="me-1" /> Đang có đơn hàng
                </Badge>
              </div>
            )}
          </div>
        </Card.Body>
        <Card.Footer>
          <div className="d-flex justify-content-between">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => openStatusModal(table)}
            >
              Đổi trạng thái
            </Button>
            <div>              <Button
                variant="outline-secondary"
                size="sm"
                className="me-1"
                onClick={() => openEditModal(table)}
              >
                <FaEdit />
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => openDeleteConfirmation(table)}
              >
                <FaTrash />
              </Button>
            </div>
          </div>
        </Card.Footer>
      </Card>
    );
  };

  const renderTableRow = (table) => {
    return (
      <tr key={table._id}>
        <td>{table.name}</td>
        <td className="text-center">{table.capacity}</td>
        <td>{getLocationLabel(table.location)}</td>
        <td>{getStatusBadge(table.status)}</td>
        <td>
          <div className="d-flex gap-1 justify-content-end">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => openStatusModal(table)}
              title="Đổi trạng thái"
            >
              Đổi trạng thái
            </Button>
            <Button
              variant="outline-primary"
              size="sm"              onClick={() => openEditModal(table)}
              title="Chỉnh sửa"
            >
              <FaEdit />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => openDeleteConfirmation(table)}
              title="Xóa"
            >
              <FaTrash />
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1">
            <FaTable className="me-2" />
            Quản lý bàn
          </h2>
          <p className="text-muted">Quản lý tất cả các bàn trong nhà hàng</p>
        </Col>
      </Row>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="mb-3 align-items-end">
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Tìm kiếm</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Tìm theo tên bàn..."
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6} lg={2}>
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="available">Trống</option>
                  <option value="occupied">Đang sử dụng</option>
                  <option value="reserved">Đã đặt trước</option>
                  <option value="unavailable">Không khả dụng</option>
                  <option value="needs_cleaning">Cần dọn dẹp</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={2}>
              <Form.Group>
                <Form.Label>Vị trí</Form.Label>
                <Form.Select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả vị trí</option>
                  <option value="main">Khu vực chính</option>
                  <option value="outdoor">Ngoài trời</option>
                  <option value="private">Phòng riêng</option>
                  <option value="bar">Quầy bar</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={2}>
              <Form.Group>
                <Form.Label>Sức chứa tối thiểu</Form.Label>
                <Form.Control
                  type="number"
                  name="capacity"
                  value={filters.capacity}
                  onChange={handleFilterChange}
                  placeholder="Số người"
                  min="1"
                />
              </Form.Group>
            </Col>
            <Col md={12} lg={3} className="d-flex gap-2 mt-md-3 mt-lg-0">
              <Button
                variant="outline-secondary"
                className="flex-grow-1"
                onClick={clearFilters}
              >
                <FaFilter className="me-1" /> Xóa bộ lọc
              </Button>              <Button
                variant="primary"
                className="flex-grow-1"
                onClick={openAddModal}
              >
                <FaPlus className="me-1" /> Thêm bàn mới
              </Button>
            </Col>
          </Row>

          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link
                active={activeTab === "grid"}
                onClick={() => setActiveTab("grid")}
              >
                <FaThLarge className="me-1" /> Lưới
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === "list"}
                onClick={() => setActiveTab("list")}
              >
                <FaList className="me-1" /> Danh sách
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === "floorplan"}
                onClick={() => setActiveTab("floorplan")}
              >
                <FaMapMarked className="me-1" /> Sơ đồ bàn
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải danh sách bàn...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">
              <FaExclamationTriangle className="me-2" />
              {error}
            </Alert>
          ) : filteredTables.length === 0 ? (
            <Alert variant="info">
              <FaInfoCircle className="me-2" />
              Không tìm thấy bàn nào. Hãy thử thay đổi bộ lọc hoặc thêm bàn mới.
            </Alert>
          ) : activeTab === "grid" ? (
            <Row xs={1} md={2} lg={3} xl={4} className="g-4">
              {filteredTables.map((table) => (
                <Col key={table._id}>{renderTableCard(table)}</Col>
              ))}
            </Row>
          ) : activeTab === "list" ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("name")}
                    >
                      Tên bàn{" "}
                      {sortConfig.key === "name" && (
                        <FaSort
                          className={`ms-1 ${
                            sortConfig.direction === "asc"
                              ? "text-primary"
                              : "text-danger"
                          }`}
                        />
                      )}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("capacity")}
                      className="text-center"
                    >
                      Sức chứa{" "}
                      {sortConfig.key === "capacity" && (
                        <FaSort
                          className={`ms-1 ${
                            sortConfig.direction === "asc"
                              ? "text-primary"
                              : "text-danger"
                          }`}
                        />
                      )}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("location")}
                    >
                      Vị trí{" "}
                      {sortConfig.key === "location" && (
                        <FaSort
                          className={`ms-1 ${
                            sortConfig.direction === "asc"
                              ? "text-primary"
                              : "text-danger"
                          }`}
                        />
                      )}
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("status")}
                    >
                      Trạng thái{" "}
                      {sortConfig.key === "status" && (
                        <FaSort
                          className={`ms-1 ${
                            sortConfig.direction === "asc"
                              ? "text-primary"
                              : "text-danger"
                          }`}
                        />
                      )}
                    </th>
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTables.map((table) => renderTableRow(table))}
                </tbody>
              </Table>
            </div>
          ) : (
            <RestaurantFloorPlan
              tables={filteredTables}
              loading={loading}
              onStatusChange={handleQuickStatusChange}
              onEditTable={openEditModal}
              onDeleteTable={openDeleteConfirmation}
            />
          )}
        </Card.Body>
      </Card>{" "}
      {/* Table Modal (Add/Edit/View) */}
      <Modal show={showTableModal} onHide={() => setShowTableModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {tableModalMode === "add"
              ? "Thêm bàn mới"
              : tableModalMode === "edit"
              ? "Chỉnh sửa bàn"
              : "Chi tiết bàn"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleTableSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên bàn</Form.Label>              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={tableModalMode === "view"}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sức chứa (số người)</Form.Label>              <Form.Control
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                disabled={tableModalMode === "view"}
                min="1"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Vị trí</Form.Label>              <Form.Select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={tableModalMode === "view"}
              >
                <option value="main">Khu vực chính</option>
                <option value="outdoor">Ngoài trời</option>
                <option value="private">Phòng riêng</option>
                <option value="bar">Quầy bar</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={tableModalMode === "view"}
              >
                <option value="available">Trống</option>
                <option value="occupied">Đang sử dụng</option>
                <option value="reserved">Đã đặt trước</option>
                <option value="unavailable">Không khả dụng</option>
                <option value="needs_cleaning">Cần dọn dẹp</option>
              </Form.Select>
            </Form.Group>

            {tableModalMode !== "view" && (
              <div className="d-flex justify-content-end">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => setShowTableModal(false)}
                >
                  Hủy
                </Button>
                <Button variant="primary" type="submit">
                  <FaSave className="me-1" />
                  {tableModalMode === "add" ? "Tạo bàn" : "Lưu thay đổi"}
                </Button>
              </div>
            )}

            {tableModalMode === "view" && (
              <div className="d-flex justify-content-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowTableModal(false)}
                >
                  Đóng
                </Button>
              </div>
            )}
          </Form>
        </Modal.Body>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirmation}
        onHide={() => setShowDeleteConfirmation(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa bàn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex align-items-center mb-3">
            <FaExclamationTriangle className="text-danger me-3" size={24} />
            <div>
              <p className="mb-1">
                Bạn có chắc chắn muốn xóa bàn{" "}
                <strong>{tableToDelete?.name}</strong>?
              </p>
              <p className="mb-0 text-danger">
                Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>

          <Alert variant="warning">
            <strong>Lưu ý:</strong> Bàn đang được sử dụng hoặc đã được đặt trước
            sẽ không thể xóa.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirmation(false)}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteTable}>
            <FaTrash className="me-1" /> Xác nhận xóa
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật trạng thái bàn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bàn: <strong>{statusUpdateTable?.name}</strong>
          </p>
          <p>
            Trạng thái hiện tại:{" "}
            {statusUpdateTable && getStatusBadge(statusUpdateTable.status)}
          </p>

          <Form.Group className="mb-3">
            <Form.Label>Trạng thái mới</Form.Label>
            <Form.Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="available">Trống</option>
              <option value="occupied">Đang sử dụng</option>
              <option value="reserved">Đã đặt trước</option>
              <option value="unavailable">Không khả dụng</option>
              <option value="needs_cleaning">Cần dọn dẹp</option>
            </Form.Select>
          </Form.Group>

          {newStatus === "available" &&
            statusUpdateTable?.status === "occupied" && (
              <Alert variant="info">
                <FaInfoCircle className="me-1" />
                Đổi trạng thái thành "Trống" sẽ đóng đơn hàng hiện tại nếu có.
              </Alert>
            )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleStatusChange}
            disabled={statusUpdateTable?.status === newStatus}
          >
            <FaCheck className="me-1" /> Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TableManagementPage;
