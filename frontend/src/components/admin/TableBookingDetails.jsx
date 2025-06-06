import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Table, Badge } from 'react-bootstrap';
import { format } from 'date-fns';
import { FaCalendarAlt, FaUser, FaPhone, FaUsers, FaClock, FaInfoCircle } from 'react-icons/fa';
import tableService from '../../services/tableService';
import bookingService from '../../services/bookingService';
import { toast } from 'react-toastify';

const TableBookingDetails = ({ show, onHide, tableId, date }) => {
  const [loading, setLoading] = useState(true);
  const [table, setTable] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (show && tableId) {
      fetchTableDetails();
    }
  }, [show, tableId, date]);

  const fetchTableDetails = async () => {
    setLoading(true);
    try {
      console.log('Fetching table details for table ID:', tableId);
      const tableResponse = await tableService.getTableById(tableId);
      
      // Kiểm tra cấu trúc dữ liệu và trích xuất thông tin bàn
      let tableData = null;
      if (tableResponse.data && tableResponse.data.data) {
        tableData = tableResponse.data.data;
      } else if (tableResponse.data) {
        tableData = tableResponse.data;
      }
      
      if (!tableData) {
        throw new Error('Không thể tải thông tin bàn');
      }
      
      setTable(tableData);
      console.log('Table data:', tableData);
      
      // Tìm các đặt bàn cho bàn này trong ngày đã chọn
      if (date) {
        console.log('Fetching bookings for date:', date);
        const bookingsResponse = await bookingService.getAllBookings({
          date: date
        });
        
        // Kiểm tra cấu trúc dữ liệu và trích xuất danh sách đặt bàn
        let bookingsData = [];
        if (bookingsResponse.data && bookingsResponse.data.data && Array.isArray(bookingsResponse.data.data.bookings)) {
          bookingsData = bookingsResponse.data.data.bookings;
        } else if (bookingsResponse.data && Array.isArray(bookingsResponse.data.data)) {
          bookingsData = bookingsResponse.data.data;
        } else if (bookingsResponse.data && Array.isArray(bookingsResponse.data)) {
          bookingsData = bookingsResponse.data;
        }
        
        console.log('All bookings for date:', bookingsData);
        
        // Lọc các đặt bàn cho bàn này
        const tableBookings = bookingsData.filter(booking => 
          booking.tableAssigned && booking.tableAssigned._id === tableId
        );
        
        console.log('Filtered bookings for table:', tableBookings, 'Table ID:', tableId);
        setBookings(tableBookings);
      }
    } catch (error) {
      console.error('Error fetching table details:', error);
      toast.error('Không thể tải thông tin bàn');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date, time) => {
    if (!date) return '';
    
    try {
      const dateObj = new Date(date);
      return `${format(dateObj, 'dd/MM/yyyy')} ${time || ''}`;
    } catch (error) {
      return `${date} ${time || ''}`;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'warning', text: 'Chờ xác nhận' },
      confirmed: { bg: 'success', text: 'Đã xác nhận' },
      cancelled: { bg: 'danger', text: 'Đã hủy' },
      completed: { bg: 'info', text: 'Hoàn thành' },
      'no-show': { bg: 'secondary', text: 'Không đến' }
    };
    
    const { bg, text } = statusConfig[status] || { bg: 'secondary', text: status };
    
    return <Badge bg={bg}>{text}</Badge>;
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Thông tin bàn {table?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Đang tải thông tin bàn...</p>
          </div>
        ) : table ? (
          <div>
            <div className="mb-4">
              <h5 className="mb-3">Thông tin bàn</h5>
              <div className="d-flex mb-2">
                <FaUsers className="me-2 mt-1" />
                <div>
                  <strong>Sức chứa:</strong> {table.capacity} người
                </div>
              </div>
              <div className="d-flex mb-2">
                <FaInfoCircle className="me-2 mt-1" />
                <div>
                  <strong>Trạng thái:</strong> {table.status === 'available' ? 'Trống' : 
                                              table.status === 'occupied' ? 'Đang sử dụng' :
                                              table.status === 'reserved' ? 'Đã đặt trước' :
                                              table.status === 'needs_cleaning' ? 'Cần dọn dẹp' : 
                                              'Không khả dụng'}
                </div>
              </div>
              <div className="d-flex mb-2">
                <FaInfoCircle className="me-2 mt-1" />
                <div>
                  <strong>Khu vực:</strong> {table.location === 'main' ? 'Khu vực chính' :
                                           table.location === 'outdoor' ? 'Ngoài trời' :
                                           table.location === 'private' ? 'Phòng riêng' :
                                           table.location === 'bar' ? 'Quầy bar' : table.location}
                </div>
              </div>
              {table.description && (
                <div className="d-flex mb-2">
                  <FaInfoCircle className="me-2 mt-1" />
                  <div>
                    <strong>Mô tả:</strong> {table.description}
                  </div>
                </div>
              )}
            </div>

            {bookings.length > 0 ? (
              <div>
                <h5 className="mb-3">Đặt bàn</h5>
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Khách hàng</th>
                      <th>Số khách</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking._id}>
                        <td>{formatDateTime(booking.date, booking.time)}</td>
                        <td>
                          <div>{booking.customerName}</div>
                          <small className="text-muted">{booking.customerPhone}</small>
                        </td>
                        <td>{booking.numberOfGuests}</td>
                        <td>{getStatusBadge(booking.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-muted mb-0">Không có đặt bàn nào cho ngày đã chọn</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-muted mb-0">Không tìm thấy thông tin bàn</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TableBookingDetails; 