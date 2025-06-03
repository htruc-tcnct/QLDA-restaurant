import { useState, useEffect } from 'react';
import { Table, Form, Button, Badge, InputGroup, Row, Col, Card, Modal, Spinner } from 'react-bootstrap';
import { 
  FaTable, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaSearch, 
  FaFilter, 
  FaSort,
  FaCheck,
  FaBan,
  FaUsers,
  FaBroom
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import tableService from '../../services/tableService';

const TableManagementPage = () => {
  // State management
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [tablesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', or 'view'
  const [currentTable, setCurrentTable] = useState(null);
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    capacity: 2,
    location: 'main',
    status: 'available',
    description: ''
  });
  
  // Fetch tables on component mount
  useEffect(() => {
    fetchTables();
  }, []);
  
  // Apply filters when filter states change
  useEffect(() => {
    applyFilters();
  }, [tables, searchTerm, statusFilter, locationFilter, sortField, sortDirection]);
  
  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await tableService.getAllTables();
      setTables(response.data);
      setFilteredTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...tables];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(table => 
        table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(table => table.status === statusFilter);
    }
    
    // Apply location filter
    if (locationFilter) {
      result = result.filter(table => table.location === locationFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];
      
      // Handle numeric fields
      if (sortField === 'capacity') {
        fieldA = Number(fieldA);
        fieldB = Number(fieldB);
      }
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredTables(result);
  };
  
  // Pagination
  const indexOfLastTable = currentPage * tablesPerPage;
  const indexOfFirstTable = indexOfLastTable - tablesPerPage;
  const currentTables = filteredTables.slice(indexOfFirstTable, indexOfLastTable);
  const totalPages = Math.ceil(filteredTables.length / tablesPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Modal handlers
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      capacity: 2,
      location: 'main',
      status: 'available',
      description: ''
    });
    setShowModal(true);
  };
  
  const openEditModal = (table) => {
    setModalMode('edit');
    setCurrentTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity,
      location: table.location,
      status: table.status,
      description: table.description || ''
    });
    setShowModal(true);
  };
  
  const openViewModal = (table) => {
    setModalMode('view');
    setCurrentTable(table);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // CRUD operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await tableService.createTable(formData);
        toast.success('Tạo bàn mới thành công');
      } else if (modalMode === 'edit') {
        await tableService.updateTable(currentTable._id, formData);
        toast.success('Cập nhật bàn thành công');
      }
      
      handleCloseModal();
      fetchTables();
    } catch (error) {
      console.error('Error saving table:', error);
      toast.error(modalMode === 'add' ? 'Không thể tạo bàn mới' : 'Không thể cập nhật bàn');
    }
  };
  
  const handleDeleteTable = async (tableId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bàn này không?')) {
      try {
        await tableService.deleteTable(tableId);
        toast.success('Xóa bàn thành công');
        fetchTables();
      } catch (error) {
        console.error('Error deleting table:', error);
        toast.error('Không thể xóa bàn');
      }
    }
  };
  
  // Helper functions
  const getStatusBadge = (status) => {
    const statusMap = {
      available: { bg: 'success', icon: <FaCheck className="me-1" />, text: 'Trống' },
      occupied: { bg: 'danger', icon: <FaUsers className="me-1" />, text: 'Đang sử dụng' },
      reserved: { bg: 'warning', icon: <FaUsers className="me-1" />, text: 'Đã đặt trước' },
      unavailable: { bg: 'secondary', icon: <FaBan className="me-1" />, text: 'Không khả dụng' },
      needs_cleaning: { bg: 'info', icon: <FaBroom className="me-1" />, text: 'Cần dọn dẹp' }
    };
    
    const { bg, icon, text } = statusMap[status] || statusMap.unavailable;
    
    return (
      <Badge bg={bg} className="d-inline-flex align-items-center">
        {icon} {text}
      </Badge>
    );
  };
  
  const getLocationText = (location) => {
    const locationMap = {
      main: 'Khu vực chính',
      outdoor: 'Ngoài trời',
      private: 'Phòng riêng',
      bar: 'Quầy bar'
    };
    
    return locationMap[location] || location;
  };
  
  return (
    <div className="table-management-page">
      <PageHeader 
        title="Quản lý bàn" 
        icon={<FaTable className="me-2" />}
        description="Quản lý tất cả các bàn trong nhà hàng"
      />
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="mb-3 align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm kiếm bàn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="available">Trống</option>
                  <option value="occupied">Đang sử dụng</option>
                  <option value="reserved">Đã đặt trước</option>
                  <option value="unavailable">Không khả dụng</option>
                  <option value="needs_cleaning">Cần dọn dẹp</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="">Tất cả khu vực</option>
                  <option value="main">Khu vực chính</option>
                  <option value="outdoor">Ngoài trời</option>
                  <option value="private">Phòng riêng</option>
                  <option value="bar">Quầy bar</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={2} className="text-end">
              <Button variant="primary" onClick={openAddModal}>
                <FaPlus className="me-1" /> Thêm bàn
              </Button>
            </Col>
          </Row>
          
          {/* Tables Table */}
          <div className="table-responsive">
            <Table striped hover className="align-middle">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="user-select-none">
                    Tên bàn {sortField === 'name' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('capacity')} className="user-select-none">
                    Sức chứa {sortField === 'capacity' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('location')} className="user-select-none">
                    Khu vực {sortField === 'location' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('status')} className="user-select-none">
                    Trạng thái {sortField === 'status' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2 text-muted">Đang tải danh sách bàn...</p>
                    </td>
                  </tr>
                ) : currentTables.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      Không tìm thấy bàn nào
                    </td>
                  </tr>
                ) : (
                  currentTables.map(table => (
                    <tr key={table._id}>
                      <td>{table.name}</td>
                      <td>{table.capacity} người</td>
                      <td>{getLocationText(table.location)}</td>
                      <td>{getStatusBadge(table.status)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            onClick={() => openViewModal(table)}
                          >
                            <FaSearch />
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => openEditModal(table)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteTable(table._id)}
                          >
                            <FaTrashAlt />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          
          {/* Pagination */}
          {filteredTables.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {indexOfFirstTable + 1} - {Math.min(indexOfLastTable, filteredTables.length)} / {filteredTables.length} bàn
              </div>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &laquo;
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    &raquo;
                  </button>
                </li>
              </ul>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Add/Edit/View Table Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'add' ? 'Thêm bàn mới' : 
             modalMode === 'edit' ? 'Chỉnh sửa bàn' : 
             'Chi tiết bàn'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên bàn</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Sức chứa (người)</Form.Label>
              <Form.Control
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
                min="1"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Khu vực</Form.Label>
              <Form.Select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
                required
              >
                <option value="main">Khu vực chính</option>
                <option value="outdoor">Ngoài trời</option>
                <option value="private">Phòng riêng</option>
                <option value="bar">Quầy bar</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
                required
              >
                <option value="available">Trống</option>
                <option value="occupied">Đang sử dụng</option>
                <option value="reserved">Đã đặt trước</option>
                <option value="unavailable">Không khả dụng</option>
                <option value="needs_cleaning">Cần dọn dẹp</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={modalMode === 'view'}
              />
            </Form.Group>
            
            {modalMode !== 'view' && (
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={handleCloseModal}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit">
                  {modalMode === 'add' ? 'Thêm bàn' : 'Lưu thay đổi'}
                </Button>
              </div>
            )}
          </Form>
          
          {modalMode === 'view' && (
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={handleCloseModal}>
                Đóng
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TableManagementPage; 