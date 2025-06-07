import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { 
  FaChartLine, FaCalendarAlt, FaChartBar, FaChartPie, 
  FaDownload, FaSync, FaUsers, FaShoppingCart, FaMoneyBillWave
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  Line, Bar, Pie, 
  LineChart, BarChart, PieChart, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  getSalesSummary,
  getSalesOverTime,
  getTopSellingItems,
  getCategorySales,
  getBookingStats,
  getStaffPerformance
} from '../../services/reportService';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

const ReportsPage = () => {
  // State for date range selection
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [groupBy, setGroupBy] = useState('day');
  const [reportType, setReportType] = useState('sales');
  
  // State for storing report data
  const [salesSummary, setSalesSummary] = useState(null);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [staffPerformance, setStaffPerformance] = useState([]);
  
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Load initial sales summary data on component mount
  useEffect(() => {
    fetchSalesSummary();
  }, []);
  
  // Load data based on date range and report type when they change
  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [startDate, endDate, groupBy, reportType]);
  
  // Function to fetch all necessary report data based on selected dates and report type
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      switch (reportType) {
        case 'sales':
          const salesResponse = await getSalesOverTime(
            formattedStartDate, 
            formattedEndDate, 
            groupBy
          );
          setSalesOverTime(salesResponse.data.salesData);
          break;
          
        case 'items':
          const itemsResponse = await getTopSellingItems(
            formattedStartDate, 
            formattedEndDate
          );
          setTopSellingItems(itemsResponse.data.items);
          break;
          
        case 'categories':
          const categoriesResponse = await getCategorySales(
            formattedStartDate, 
            formattedEndDate
          );
          setCategorySales(categoriesResponse.data.categories);
          break;
          
        case 'bookings':
          const bookingsResponse = await getBookingStats(
            formattedStartDate, 
            formattedEndDate
          );
          setBookingStats(bookingsResponse.data);
          break;
          
        case 'staff':
          const staffResponse = await getStaffPerformance(
            formattedStartDate, 
            formattedEndDate
          );
          setStaffPerformance(staffResponse.data.staff);
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch sales summary data
  const fetchSalesSummary = async () => {
    setLoading(true);
    
    try {
      const response = await getSalesSummary();
      setSalesSummary(response.data);
    } catch (err) {
      console.error('Error fetching sales summary:', err);
      setError('Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };
  
  // Handle date range preset selections
  const handleDatePresetChange = (preset) => {
    const today = new Date();
    
    switch (preset) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setStartDate(yesterday);
        setEndDate(yesterday);
        break;
      case 'last7days':
        setStartDate(subDays(today, 6));
        setEndDate(today);
        break;
      case 'last30days':
        setStartDate(subDays(today, 29));
        setEndDate(today);
        break;
      case 'thisMonth':
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      default:
        break;
    }
  };
  
  // Render the sales summary cards
  const renderSalesSummaryCards = () => {
    if (!salesSummary) return null;
    
    return (
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FaMoneyBillWave size={24} className="text-success me-2" />
                <h6 className="mb-0">Doanh thu hôm nay</h6>
              </div>
              <h2 className="mb-0">{formatCurrency(salesSummary.today.totalSales || 0)}</h2>
              <p className="text-muted small">{salesSummary.today.orderCount || 0} đơn hàng</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FaChartLine size={24} className="text-primary me-2" />
                <h6 className="mb-0">7 ngày qua</h6>
              </div>
              <h2 className="mb-0">{formatCurrency(salesSummary.last7Days.totalSales || 0)}</h2>
              <p className="text-muted small">{salesSummary.last7Days.orderCount || 0} đơn hàng</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FaShoppingCart size={24} className="text-warning me-2" />
                <h6 className="mb-0">Tháng này</h6>
              </div>
              <h2 className="mb-0">{formatCurrency(salesSummary.thisMonth.totalSales || 0)}</h2>
              <p className="text-muted small">{salesSummary.thisMonth.orderCount || 0} đơn hàng</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-center mb-3">
                <FaUsers size={24} className="text-info me-2" />
                <h6 className="mb-0">Năm nay</h6>
              </div>
              <h2 className="mb-0">{formatCurrency(salesSummary.thisYear.totalSales || 0)}</h2>
              <p className="text-muted small">{salesSummary.thisYear.customerCount || 0} khách hàng</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };
  
  // Render the main report chart based on selected report type
  const renderReportChart = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải dữ liệu báo cáo...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="danger">{error}</Alert>
      );
    }
    
    switch (reportType) {
      case 'sales':
        return renderSalesOverTimeChart();
      case 'items':
        return renderTopSellingItemsChart();
      case 'categories':
        return renderCategorySalesChart();
      case 'bookings':
        return renderBookingStatsChart();
      case 'staff':
        return renderStaffPerformanceChart();
      default:
        return <div>Vui lòng chọn loại báo cáo</div>;
    }
  };
  
  // Render sales over time line chart
  const renderSalesOverTimeChart = () => {
    if (!salesOverTime || salesOverTime.length === 0) {
      return <Alert variant="info">Không có dữ liệu doanh thu trong khoảng thời gian đã chọn.</Alert>;
    }
    
    return (
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">
            <FaChartLine className="me-2" />
            Biểu đồ doanh thu theo thời gian
          </h5>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={salesOverTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatCurrency(value).replace('₫', '')} />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                labelFormatter={(label) => `Ngày: ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="totalSales" stroke="#8884d8" name="Doanh thu" />
            </LineChart>
          </ResponsiveContainer>
          
          <Table striped bordered hover responsive className="mt-4">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Doanh thu</th>
                <th>Số đơn hàng</th>
              </tr>
            </thead>
            <tbody>
              {salesOverTime.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{formatCurrency(item.totalSales)}</td>
                  <td>{item.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };
  
  // Render top selling items chart
  const renderTopSellingItemsChart = () => {
    if (!topSellingItems || topSellingItems.length === 0) {
      return <Alert variant="info">Không có dữ liệu món ăn bán chạy trong khoảng thời gian đã chọn.</Alert>;
    }
    
    return (
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">
            <FaChartBar className="me-2" />
            Các món ăn bán chạy nhất
          </h5>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topSellingItems} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalQuantity" fill="#82ca9d" name="Số lượng bán" />
            </BarChart>
          </ResponsiveContainer>
          
          <Table striped bordered hover responsive className="mt-4">
            <thead>
              <tr>
                <th>Món ăn</th>
                <th>Danh mục</th>
                <th>Số lượng bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topSellingItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.totalQuantity}</td>
                  <td>{formatCurrency(item.totalSales)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };
  
  // Render category sales chart
  const renderCategorySalesChart = () => {
    if (!categorySales || categorySales.length === 0) {
      return <Alert variant="info">Không có dữ liệu doanh thu theo danh mục trong khoảng thời gian đã chọn.</Alert>;
    }
    
    return (
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">
            <FaChartPie className="me-2" />
            Doanh thu theo danh mục
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="totalSales"
                    nameKey="category"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Col>
            <Col md={6}>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Danh mục</th>
                    <th>Doanh thu</th>
                    <th>Số lượng bán</th>
                  </tr>
                </thead>
                <tbody>
                  {categorySales.map((item, index) => (
                    <tr key={index}>
                      <td>{item.category}</td>
                      <td>{formatCurrency(item.totalSales)}</td>
                      <td>{item.itemCount}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };
  
  // Render booking stats chart
  const renderBookingStatsChart = () => {
    if (!bookingStats) {
      return <Alert variant="info">Không có dữ liệu đặt bàn trong khoảng thời gian đã chọn.</Alert>;
    }
    
    const pieData = [
      { name: 'Đã xác nhận', value: bookingStats.summary.confirmed || 0, fill: '#28a745' },
      { name: 'Đã hoàn thành', value: bookingStats.summary.completed || 0, fill: '#17a2b8' },
      { name: 'Đã hủy', value: bookingStats.summary.cancelled || 0, fill: '#dc3545' },
      { name: 'Không đến', value: bookingStats.summary.noShow || 0, fill: '#ffc107' }
    ];
    
    return (
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">
            <FaCalendarAlt className="me-2" />
            Thống kê đặt bàn
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Col>
            <Col md={6}>
              <div className="mb-4">
                <h6>Tổng quan</h6>
                <p className="mb-1">Tổng số đặt bàn: <strong>{bookingStats.summary.total}</strong></p>
                <p className="mb-1">Đã xác nhận: <strong>{bookingStats.summary.confirmed || 0}</strong></p>
                <p className="mb-1">Đã hoàn thành: <strong>{bookingStats.summary.completed || 0}</strong></p>
                <p className="mb-1">Đã hủy: <strong>{bookingStats.summary.cancelled || 0}</strong></p>
                <p className="mb-1">Không đến: <strong>{bookingStats.summary.noShow || 0}</strong></p>
              </div>
              
              <h6>Xu hướng đặt bàn theo ngày</h6>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={bookingStats.trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" name="Tổng số" />
                  <Line type="monotone" dataKey="confirmed" stroke="#28a745" name="Đã xác nhận" />
                  <Line type="monotone" dataKey="cancelled" stroke="#dc3545" name="Đã hủy" />
                </LineChart>
              </ResponsiveContainer>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };
  
  // Render staff performance chart
  const renderStaffPerformanceChart = () => {
    if (!staffPerformance || staffPerformance.length === 0) {
      return <Alert variant="info">Không có dữ liệu hiệu suất nhân viên trong khoảng thời gian đã chọn.</Alert>;
    }
    
    return (
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">
            <FaUsers className="me-2" />
            Hiệu suất nhân viên
          </h5>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={staffPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="totalSales" fill="#8884d8" name="Doanh thu" />
              <Bar yAxisId="right" dataKey="totalOrders" fill="#82ca9d" name="Số đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
          
          <Table striped bordered hover responsive className="mt-4">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Số đơn hàng</th>
                <th>Doanh thu</th>
                <th>Giá trị đơn trung bình</th>
                <th>Tỷ lệ hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {staffPerformance.map((staff, index) => (
                <tr key={index}>
                  <td>{staff.name}</td>
                  <td>{staff.totalOrders}</td>
                  <td>{formatCurrency(staff.totalSales)}</td>
                  <td>{formatCurrency(staff.avgOrderValue)}</td>
                  <td>{staff.completionRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };
  
  return (
    <Container fluid className="p-4">
      <h1 className="mb-4">
        <FaChartLine className="me-2" />
        Báo cáo & Thống kê
      </h1>
      
      {/* Sales Summary Cards */}
      {renderSalesSummaryCards()}
      
      {/* Report Controls */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Loại báo cáo</Form.Label>
                <Form.Select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="sales">Doanh thu theo thời gian</option>
                  <option value="items">Món ăn bán chạy</option>
                  <option value="categories">Doanh thu theo danh mục</option>
                  <option value="bookings">Thống kê đặt bàn</option>
                  <option value="staff">Hiệu suất nhân viên</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Từ ngày</Form.Label>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Đến ngày</Form.Label>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </Form.Group>
            </Col>
            
            <Col md={3}>
              {reportType === 'sales' && (
                <Form.Group className="mb-3">
                  <Form.Label>Nhóm theo</Form.Label>
                  <Form.Select 
                    value={groupBy} 
                    onChange={(e) => setGroupBy(e.target.value)}
                  >
                    <option value="day">Ngày</option>
                    <option value="week">Tuần</option>
                    <option value="month">Tháng</option>
                  </Form.Select>
                </Form.Group>
              )}
            </Col>
          </Row>
          
          <Row>
            <Col>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm" onClick={() => handleDatePresetChange('today')}>
                  Hôm nay
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => handleDatePresetChange('yesterday')}>
                  Hôm qua
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => handleDatePresetChange('last7days')}>
                  7 ngày qua
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => handleDatePresetChange('last30days')}>
                  30 ngày qua
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => handleDatePresetChange('thisMonth')}>
                  Tháng này
                </Button>
                <Button variant="primary" size="sm" onClick={fetchReportData}>
                  <FaSync className="me-1" /> Tải dữ liệu
                </Button>
                <Button variant="success" size="sm">
                  <FaDownload className="me-1" /> Xuất CSV
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Main Report Chart */}
      {renderReportChart()}
    </Container>
  );
};

export default ReportsPage; 