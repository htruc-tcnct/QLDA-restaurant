import { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Badge, Row, Col, InputGroup, Modal } from 'react-bootstrap';
import { 
  FaShoppingCart, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaEye, 
  FaPrint, 
  FaReceipt,
  FaCheck,
  FaTimes,
  FaUtensils,
  FaTruck,
  FaCreditCard,
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import orderService from '../../services/orderService';
import useAuthStore from '../../store/authStore';

const OrderManagementPage = () => {
  // State for orders
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  
  // Modal state
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Create Order Modal state
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    customerType: 'walkin', // walkin or registered
    customerId: '',
    customerName: '',
    customerPhone: '',
    tableId: '',
    orderType: 'dine_in', // dine_in or takeaway
    notes: ''
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // Lấy thông tin người dùng từ store
  const { user } = useAuthStore();
  
  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);
  
  // Apply filters when filter states change
  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, dateRangeFilter, sortField, sortDirection]);
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter,
        startDate: dateRangeFilter.startDate,
        endDate: dateRangeFilter.endDate
      };
      
      const response = await orderService.getOrders(filters);
      console.log('Order response data:', response.data); // Debug log
      
      // Kiểm tra cấu trúc dữ liệu
      if (response.data && response.data.data && Array.isArray(response.data.data.orders)) {
        const orderData = response.data.data.orders;
        console.log(`Loaded ${orderData.length} orders`);
        setOrders(orderData);
        setFilteredOrders(orderData);
      } else {
        console.error('Unexpected order data structure:', response.data);
        toast.warning('Định dạng dữ liệu đơn hàng không đúng');
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.orderNumber.toLowerCase().includes(term) || 
        (order.customer && order.customer.fullName && 
         order.customer.fullName.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(order => order.orderStatus === statusFilter);
    }
    
    // Apply date filter
    if (dateRangeFilter.startDate) {
      const startDate = new Date(dateRangeFilter.startDate);
      result = result.filter(order => new Date(order.createdAt) >= startDate);
    }
    
    if (dateRangeFilter.endDate) {
      const endDate = new Date(dateRangeFilter.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      result = result.filter(order => new Date(order.createdAt) <= endDate);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      // Handle date fields
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }
      
      // Handle string fields
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredOrders(result);
  };
  
  // Handle viewing order details
  const handleViewOrder = async (order) => {
    try {
      // Lấy thông tin chi tiết đơn hàng
      const response = await orderService.getOrderById(order._id);
      if (response.data && response.data.data && response.data.data.order) {
        setSelectedOrder(response.data.data.order);
        setShowOrderDetails(true);
      } else {
        toast.error('Định dạng dữ liệu đơn hàng không đúng');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };
  
  // Handle updating order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const statusData = {
        status: newStatus,
        statusNote: '', // Có thể thêm ghi chú khi cập nhật trạng thái
        updatedBy: user?.fullName || user?.username || 'admin' // Lấy từ context người dùng hiện tại
      };
      
      await orderService.updateOrderStatus(orderId, statusData);
      
      // Fetch lại đơn hàng sau khi cập nhật để có dữ liệu mới nhất
      const response = await orderService.getOrderById(orderId);
      const updatedOrder = response.data.data.order;
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? updatedOrder : order
      ));
      
      toast.success(`Đơn hàng #${updatedOrder.orderNumber} đã được cập nhật thành ${getReadableStatus(newStatus)}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng');
    }
  };
  
  // Handle printing order receipt
  const handlePrintReceipt = async (orderId) => {
    try {
      // Lấy dữ liệu hóa đơn
      const response = await orderService.getReceipt(orderId);
      
      if (response.data && response.data.data && response.data.data.receipt) {
        const receiptData = response.data.data.receipt;
        
        // Tạo cửa sổ in mới
        const printWindow = window.open('', '_blank');
        
        // HTML cho hóa đơn
        const receiptHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Hóa đơn #${receiptData.orderNumber}</title>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .restaurant-name { font-size: 24px; font-weight: bold; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f2f2f2; }
              .total-section { margin-top: 20px; }
              .total-row { display: flex; justify-content: space-between; }
              .grand-total { font-weight: bold; font-size: 18px; margin-top: 10px; }
              .footer { margin-top: 30px; text-align: center; font-style: italic; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <div class="restaurant-name">NHÀ HÀNG XYZ</div>
                <div>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</div>
                <div>SĐT: 0123-456-789 | Email: info@nhahangxyz.com</div>
              </div>
              
              <div class="info-section">
                <div class="info-row">
                  <div><strong>Số hóa đơn:</strong> #${receiptData.orderNumber}</div>
                  <div><strong>Ngày:</strong> ${receiptData.orderDate}</div>
                </div>
                <div class="info-row">
                  <div><strong>Khách hàng:</strong> ${receiptData.customerName}</div>
                  <div><strong>Bàn:</strong> ${receiptData.tableName}</div>
                </div>
                <div class="info-row">
                  <div><strong>Nhân viên:</strong> ${receiptData.waiterName}</div>
                  <div><strong>Trạng thái:</strong> ${
                    receiptData.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'
                  }</div>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Món</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${receiptData.items.map((item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                      <td>${item.price.toLocaleString()}đ</td>
                      <td>${item.total.toLocaleString()}đ</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="total-section">
                <div class="total-row">
                  <div>Tạm tính:</div>
                  <div>${receiptData.subTotal.toLocaleString()}đ</div>
                </div>
                ${receiptData.discountAmount > 0 ? `
                <div class="total-row">
                  <div>Giảm giá:</div>
                  <div>-${receiptData.discountAmount.toLocaleString()}đ</div>
                </div>
                ` : ''}
                <div class="total-row">
                  <div>Thuế (10%):</div>
                  <div>${receiptData.taxAmount.toLocaleString()}đ</div>
                </div>
                <div class="total-row grand-total">
                  <div>Tổng cộng:</div>
                  <div>${receiptData.totalAmount.toLocaleString()}đ</div>
                </div>
              </div>
              
              <div class="footer">
                <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
                <p>Hẹn gặp lại quý khách lần sau.</p>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
          </html>
        `;
        
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        
      } else {
        toast.error('Không thể tạo hóa đơn');
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Không thể tạo hóa đơn');
    }
  };
  
  // Handle deleting order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) {
      try {
        await orderService.deleteOrder(orderId);
        toast.success('Đã xóa đơn hàng thành công');
        
        // Refresh orders list
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error(error.response?.data?.message || 'Không thể xóa đơn hàng');
      }
    }
  };
  
  // Handle sorting
  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
  };
  
  // Get badge color based on order status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending_confirmation': return 'warning';
      case 'confirmed_by_customer': return 'info';
      case 'sent_to_kitchen': return 'primary';
      case 'partially_ready': return 'secondary';
      case 'all_ready_to_serve': return 'success';
      case 'partially_served': return 'info';
      case 'fully_served': return 'success';
      case 'payment_pending': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };
  
  // Get human-readable status
  const getReadableStatus = (status) => {
    switch (status) {
      case 'pending_confirmation': return 'Chờ xác nhận';
      case 'confirmed_by_customer': return 'Khách xác nhận';
      case 'sent_to_kitchen': return 'Gửi bếp';
      case 'partially_ready': return 'Một phần sẵn sàng';
      case 'all_ready_to_serve': return 'Sẵn sàng phục vụ';
      case 'partially_served': return 'Đã phục vụ một phần';
      case 'fully_served': return 'Đã phục vụ';
      case 'payment_pending': return 'Chờ thanh toán';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };
  
  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  
  // Handle opening create order modal
  const handleOpenCreateOrderModal = async () => {
    try {
      // Fetch available tables
      const tablesResponse = await fetch('/api/v1/tables?status=available');
      const tablesData = await tablesResponse.json();
      setAvailableTables(tablesData.data.tables || []);
      
      // Fetch customers (if admin/manager)
      if (user.role === 'admin' || user.role === 'manager') {
        const customersResponse = await fetch('/api/admin/users?role=customer');
        const customersData = await customersResponse.json();
        setCustomers(customersData.data.users || []);
      }
      
      setShowCreateOrderModal(true);
    } catch (error) {
      console.error('Error preparing create order form:', error);
      toast.error('Không thể tải dữ liệu cần thiết');
    }
  };
  
  // Handle create order input changes
  const handleCreateOrderInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrderData({
      ...newOrderData,
      [name]: value
    });
    
    // Reset customer fields if customer type changes
    if (name === 'customerType' && value === 'walkin') {
      setNewOrderData({
        ...newOrderData,
        customerType: 'walkin',
        customerId: '',
        customerName: '',
        customerPhone: ''
      });
    }
  };
  
  // Handle customer selection
  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    if (customerId) {
      const selectedCustomer = customers.find(c => c._id === customerId);
      if (selectedCustomer) {
        setNewOrderData({
          ...newOrderData,
          customerId,
          customerName: selectedCustomer.fullName || selectedCustomer.username,
          customerPhone: selectedCustomer.phoneNumber || ''
        });
      }
    }
  };
  
  // Handle create order submission
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare order data
      const orderData = {
        orderType: newOrderData.orderType,
        tableId: newOrderData.tableId,
        notes: newOrderData.notes,
      };
      
      // Add customer info based on type
      if (newOrderData.customerType === 'registered' && newOrderData.customerId) {
        orderData.customerId = newOrderData.customerId;
      } else if (newOrderData.customerType === 'walkin') {
        orderData.guestInfo = {
          name: newOrderData.customerName,
          phone: newOrderData.customerPhone
        };
      }
      
      // Create order
      const response = await orderService.createOrder(orderData);
      
      toast.success('Tạo đơn hàng mới thành công');
      setShowCreateOrderModal(false);
      
      // Reset form
      setNewOrderData({
        customerType: 'walkin',
        customerId: '',
        customerName: '',
        customerPhone: '',
        tableId: '',
        orderType: 'dine_in',
        notes: ''
      });
      
      // Refresh orders list
      fetchOrders();
      
      // If response includes order ID, redirect to POS page
      if (response?.data?.order?._id && newOrderData.orderType === 'dine_in') {
        // Optionally redirect to POS with the new order
        window.location.href = `/waiter/pos?tableId=${newOrderData.tableId}`;
      }
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo đơn hàng');
    }
  };
  
  // Create Order Modal
  const CreateOrderModal = () => {
    return (
      <Modal 
        show={showCreateOrderModal} 
        onHide={() => setShowCreateOrderModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            Tạo đơn hàng mới
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateOrder}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại khách hàng</Form.Label>
                  <Form.Select 
                    name="customerType"
                    value={newOrderData.customerType}
                    onChange={handleCreateOrderInputChange}
                  >
                    <option value="walkin">Khách vãng lai</option>
                    <option value="registered">Khách đã đăng ký</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {newOrderData.customerType === 'registered' ? (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chọn khách hàng</Form.Label>
                    <Form.Select
                      name="customerId"
                      value={newOrderData.customerId}
                      onChange={handleCustomerSelect}
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {customers.map(customer => (
                        <option key={customer._id} value={customer._id}>
                          {customer.fullName || customer.username} - {customer.email}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              ) : (
                <>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên khách hàng</Form.Label>
                      <Form.Control
                        type="text"
                        name="customerName"
                        value={newOrderData.customerName}
                        onChange={handleCreateOrderInputChange}
                        placeholder="Nhập tên khách hàng"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control
                        type="text"
                        name="customerPhone"
                        value={newOrderData.customerPhone}
                        onChange={handleCreateOrderInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </Form.Group>
                  </Col>
                </>
              )}
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại đơn hàng</Form.Label>
                  <Form.Select
                    name="orderType"
                    value={newOrderData.orderType}
                    onChange={handleCreateOrderInputChange}
                  >
                    <option value="dine_in">Tại chỗ</option>
                    <option value="takeaway">Mang đi</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {newOrderData.orderType === 'dine_in' && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chọn bàn</Form.Label>
                    <Form.Select
                      name="tableId"
                      value={newOrderData.tableId}
                      onChange={handleCreateOrderInputChange}
                      required
                    >
                      <option value="">-- Chọn bàn --</option>
                      {availableTables.map(table => (
                        <option key={table._id} value={table._id}>
                          {table.name} - {table.capacity} người
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={newOrderData.notes}
                onChange={handleCreateOrderInputChange}
                placeholder="Ghi chú cho đơn hàng (nếu có)"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant="secondary" 
                onClick={() => setShowCreateOrderModal(false)}
                className="me-2"
              >
                Hủy
              </Button>
              <Button 
                variant="primary" 
                type="submit"
              >
                Tạo đơn hàng
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    );
  };
  
  // Order detail modal
  const OrderDetailModal = () => {
    if (!selectedOrder) return null;
    
    return (
      <Modal 
        show={showOrderDetails} 
        onHide={() => setShowOrderDetails(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaShoppingCart className="me-2" />
            Chi tiết đơn hàng #{selectedOrder.orderNumber || selectedOrder._id.toString().substr(-6)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <Row className="mb-4">
            <Col md={6}>
              <h5 className="border-bottom pb-2 mb-3">Thông tin đơn hàng</h5>
              <Table bordered>
                <tbody>
                  <tr>
                    <td><strong>Order ID</strong></td>
                    <td>{selectedOrder._id}</td>
                  </tr>
                  <tr>
                    <td><strong>Ngày tạo</strong></td>
                    <td>{format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                  </tr>
                  <tr>
                    <td><strong>Trạng thái</strong></td>
                    <td>
                      <Badge bg={getStatusBadgeColor(selectedOrder.orderStatus)}>
                        {getReadableStatus(selectedOrder.orderStatus)}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Bàn</strong></td>
                    <td>{selectedOrder.table ? selectedOrder.table.name : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Loại đơn</strong></td>
                    <td>{selectedOrder.orderType === 'dine_in' ? 'Tại chỗ' : 'Mang đi'}</td>
                  </tr>
                  <tr>
                    <td><strong>Nhân viên</strong></td>
                    <td>{selectedOrder.waiter ? selectedOrder.waiter.fullName : 'N/A'}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <h5 className="border-bottom pb-2 mb-3">Thông tin khách hàng</h5>
              <Table bordered>
                <tbody>
                  {selectedOrder.customer ? (
                    <>
                      <tr>
                        <td><strong>Khách hàng</strong></td>
                        <td>{selectedOrder.customer.fullName}</td>
                      </tr>
                      <tr>
                        <td><strong>Email</strong></td>
                        <td>{selectedOrder.customer.email}</td>
                      </tr>
                      <tr>
                        <td><strong>Điện thoại</strong></td>
                        <td>{selectedOrder.customer.phoneNumber || 'N/A'}</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center">Khách vãng lai</td>
                    </tr>
                  )}
                  {selectedOrder.orderNotes && (
                    <tr>
                      <td><strong>Ghi chú</strong></td>
                      <td>{selectedOrder.orderNotes}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>
          
          <h5 className="border-bottom pb-2 mb-3">Danh sách món</h5>
          <div className="table-responsive">
            <Table bordered hover>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Món</th>
                  <th className="text-center">Số lượng</th>
                  <th className="text-end">Đơn giá</th>
                  <th className="text-end">Thành tiền</th>
                  <th>Ghi chú</th>
                  <th className="text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items && selectedOrder.items.map((item, index) => (
                  <tr key={item._id || index}>
                    <td>{index + 1}</td>
                    <td>{item.menuItem ? item.menuItem.name : 'Món không xác định'}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">{item.priceAtOrder ? item.priceAtOrder.toLocaleString() : 0}đ</td>
                    <td className="text-end">{item.priceAtOrder ? (item.priceAtOrder * item.quantity).toLocaleString() : 0}đ</td>
                    <td>{item.notes || '-'}</td>
                    <td className="text-center">
                      <Badge bg={item.status === 'served' ? 'success' : 'warning'}>
                        {item.status === 'served' ? 'Đã phục vụ' : 'Chờ phục vụ'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          <Row className="mt-4">
            <Col md={6} className="ms-auto">
              <Table bordered>
                <tbody>
                  <tr>
                    <td><strong>Tạm tính</strong></td>
                    <td className="text-end">{selectedOrder.subTotal ? selectedOrder.subTotal.toLocaleString() : 0}đ</td>
                  </tr>
                  {selectedOrder.discountAmount > 0 && (
                    <tr>
                      <td><strong>Giảm giá</strong></td>
                      <td className="text-end text-danger">-{selectedOrder.discountAmount.toLocaleString()}đ</td>
                    </tr>
                  )}
                  <tr>
                    <td><strong>Thuế ({(selectedOrder.taxRate * 100).toFixed(0)}%)</strong></td>
                    <td className="text-end">{selectedOrder.taxAmount ? selectedOrder.taxAmount.toLocaleString() : 0}đ</td>
                  </tr>
                  <tr className="table-active">
                    <td><strong>Tổng cộng</strong></td>
                    <td className="text-end fw-bold">{selectedOrder.totalAmount ? selectedOrder.totalAmount.toLocaleString() : 0}đ</td>
                  </tr>
                  {selectedOrder.paymentMethod && (
                    <tr>
                      <td><strong>Phương thức thanh toán</strong></td>
                      <td className="text-end">
                        {selectedOrder.paymentMethod === 'cash' ? 'Tiền mặt' : 
                         selectedOrder.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' : 
                         selectedOrder.paymentMethod === 'banking' ? 'Chuyển khoản' : 
                         selectedOrder.paymentMethod}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td><strong>Trạng thái thanh toán</strong></td>
                    <td className="text-end">
                      <Badge bg={selectedOrder.paymentStatus === 'paid' ? 'success' : 'warning'}>
                        {selectedOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
          
          {/* Thêm lịch sử cập nhật trạng thái */}
          {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
            <>
              <h5 className="border-bottom pb-2 mb-3 mt-4">Lịch sử cập nhật trạng thái</h5>
              <div className="table-responsive">
                <Table bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>Thời gian</th>
                      <th>Trạng thái</th>
                      <th>Người cập nhật</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.statusHistory.map((history, index) => (
                      <tr key={index}>
                        <td>{format(new Date(history.timestamp), 'dd/MM/yyyy HH:mm')}</td>
                        <td>
                          <Badge bg={getStatusBadgeColor(history.status)}>
                            {getReadableStatus(history.status)}
                          </Badge>
                        </td>
                        <td>{history.updatedBy || 'Hệ thống'}</td>
                        <td>{history.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowOrderDetails(false)}
            >
              Đóng
            </Button>
            <Button 
              variant="outline-primary"
              onClick={() => handlePrintReceipt(selectedOrder._id)}
            >
              <FaPrint className="me-1" /> In hóa đơn
            </Button>
            {selectedOrder.orderStatus !== 'completed' && selectedOrder.orderStatus !== 'cancelled' && (
              <Button 
                variant="outline-success"
                onClick={() => {
                  handleUpdateStatus(selectedOrder._id, 'completed');
                  setShowOrderDetails(false);
                }}
              >
                <FaCheck className="me-1" /> Hoàn thành
              </Button>
            )}
            {selectedOrder.orderStatus !== 'cancelled' && selectedOrder.orderStatus !== 'completed' && (
              <Button 
                variant="outline-danger"
                onClick={() => {
                  handleUpdateStatus(selectedOrder._id, 'cancelled');
                  setShowOrderDetails(false);
                }}
              >
                <FaTimes className="me-1" /> Hủy đơn
              </Button>
            )}
            <Button 
              variant="outline-danger"
              onClick={() => {
                setShowOrderDetails(false);
                handleDeleteOrder(selectedOrder._id);
              }}
            >
              <FaTrash className="me-1" /> Xóa đơn
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  };
  
  return (
    <div className="order-management p-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0 text-gray-800">
              <FaShoppingCart className="me-2 text-primary" />
              Quản lý đơn hàng
            </h1>
            <Button
              variant="primary"
              onClick={handleOpenCreateOrderModal}
              className="d-flex align-items-center"
            >
              <FaPlus className="me-2" /> Tạo đơn hàng mới
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Filters */}
          <Row className="mb-4 g-3">
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm theo mã đơn hoặc tên khách..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending_confirmation">Chờ xác nhận</option>
                  <option value="confirmed_by_customer">Khách xác nhận</option>
                  <option value="sent_to_kitchen">Gửi bếp</option>
                  <option value="partially_ready">Một phần sẵn sàng</option>
                  <option value="all_ready_to_serve">Sẵn sàng phục vụ</option>
                  <option value="partially_served">Đã phục vụ một phần</option>
                  <option value="fully_served">Đã phục vụ</option>
                  <option value="payment_pending">Chờ thanh toán</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Control
                type="date"
                placeholder="Từ ngày"
                value={dateRangeFilter.startDate}
                onChange={(e) => setDateRangeFilter({...dateRangeFilter, startDate: e.target.value})}
              />
            </Col>
            <Col md={2}>
              <Form.Control
                type="date"
                placeholder="Đến ngày"
                value={dateRangeFilter.endDate}
                onChange={(e) => setDateRangeFilter({...dateRangeFilter, endDate: e.target.value})}
              />
            </Col>
            <Col md={2}>
              <InputGroup>
                <InputGroup.Text>
                  Hiển thị
                </InputGroup.Text>
                <Form.Select 
                  value={ordersPerPage}
                  onChange={(e) => setOrdersPerPage(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={1}>
              <Button variant="outline-secondary" onClick={fetchOrders}>
                <FaFilter /> Lọc
              </Button>
            </Col>
          </Row>
          
          {/* Orders Table */}
          <div className="table-responsive">
            <Table striped hover className="align-middle">
              <thead>
                <tr>
                  <th onClick={() => handleSort('orderNumber')} className="user-select-none">
                    Mã đơn {sortField === 'orderNumber' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('createdAt')} className="user-select-none">
                    Ngày tạo {sortField === 'createdAt' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th>Khách hàng</th>
                  <th>Bàn</th>
                  <th onClick={() => handleSort('orderType')} className="user-select-none">
                    Loại đơn {sortField === 'orderType' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('totalAmount')} className="user-select-none">
                    Tổng tiền {sortField === 'totalAmount' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('orderStatus')} className="user-select-none">
                    Trạng thái {sortField === 'orderStatus' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      Không tìm thấy đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  currentOrders.map(order => (
                    <tr key={order._id}>
                      <td><strong>{order.orderNumber}</strong></td>
                      <td>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                      <td>
                        {order.customer ? order.customer.fullName : 'Khách vãng lai'}
                      </td>
                      <td>{order.table ? order.table.name : 'N/A'}</td>
                      <td>
                        {order.orderType === 'dine_in' ? 'Tại chỗ' : 'Mang đi'}
                      </td>
                      <td>
                        <strong>{order.totalAmount.toLocaleString()}đ</strong>
                      </td>
                      <td>
                        <Badge bg={getStatusBadgeColor(order.orderStatus)}>
                          {getReadableStatus(order.orderStatus)}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </Button>
                          
                          {order.orderStatus === 'pending_confirmation' && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleUpdateStatus(order._id, 'confirmed_by_customer')}
                              title="Xác nhận đơn"
                            >
                              <FaCheck />
                            </Button>
                          )}
                          
                          {(order.orderStatus === 'confirmed_by_customer' || order.orderStatus === 'pending_confirmation') && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleUpdateStatus(order._id, 'sent_to_kitchen')}
                              title="Gửi bếp"
                            >
                              <FaUtensils />
                            </Button>
                          )}
                          
                          {order.orderStatus === 'all_ready_to_serve' && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleUpdateStatus(order._id, 'fully_served')}
                              title="Đánh dấu đã phục vụ"
                            >
                              <FaTruck />
                            </Button>
                          )}
                          
                          {order.orderStatus === 'fully_served' && (
                            <Button 
                              variant="outline-warning" 
                              size="sm"
                              onClick={() => handleUpdateStatus(order._id, 'payment_pending')}
                              title="Chờ thanh toán"
                            >
                              <FaCreditCard />
                            </Button>
                          )}
                          
                          {order.orderStatus === 'payment_pending' && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleUpdateStatus(order._id, 'completed')}
                              title="Hoàn thành đơn"
                            >
                              <FaCheck />
                            </Button>
                          )}
                          
                          {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                              title="Hủy đơn"
                            >
                              <FaTimes />
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handlePrintReceipt(order._id)}
                            title="In hóa đơn"
                          >
                            <FaPrint />
                          </Button>
                          
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteOrder(order._id)}
                            title="Xóa đơn hàng"
                          >
                            <FaTrash />
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
          {filteredOrders.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {indexOfFirstOrder + 1} đến {Math.min(indexOfLastOrder, filteredOrders.length)} của {filteredOrders.length} đơn hàng
              </div>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(1)}
                  >
                    Đầu
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Trước
                  </button>
                </li>
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  // Create a window of 5 pages around the current page
                  let pageNum = currentPage - 2 + index;
                  if (pageNum < 1) pageNum = 1 + index;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - index);
                  
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <li 
                        key={pageNum} 
                        className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  }
                  return null;
                })}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Sau
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    Cuối
                  </button>
                </li>
              </ul>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Create Order Modal */}
      <CreateOrderModal />
      
      {/* Order Detail Modal */}
      <OrderDetailModal />
    </div>
  );
};

export default OrderManagementPage; 