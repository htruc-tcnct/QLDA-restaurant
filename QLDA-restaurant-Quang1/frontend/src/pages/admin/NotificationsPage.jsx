import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { 
  FaBell, 
  FaCheck, 
  FaEye, 
  FaSearch, 
  FaTrash, 
  FaCheckDouble
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import notificationService from '../../services/notificationService';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('all'); // 'all', 'read', 'unread'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      if (response.data && response.data.data) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(notif => 
        notif._id === id ? { ...notif, isRead: true } : notif
      ));
      toast.success('Đã đánh dấu đã đọc');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Không thể cập nhật trạng thái thông báo');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Không thể cập nhật trạng thái thông báo');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(notif => notif._id !== id));
      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Không thể xóa thông báo');
    }
  };

  // Filter notifications based on search term and read status
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReadFilter = filterRead === 'all' || 
      (filterRead === 'read' && notification.isRead) || 
      (filterRead === 'unread' && !notification.isRead);
    
    return matchesSearch && matchesReadFilter;
  });

  // Get notification type badge color
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'new_order': return 'primary';
      case 'order_status_change': return 'info';
      case 'booking_reminder': return 'warning';
      case 'new_booking': return 'success';
      case 'order_update': return 'secondary';
      case 'system': return 'dark';
      default: return 'secondary';
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  // Format notification type to display text
  const formatType = (type) => {
    switch (type) {
      case 'new_order': return 'Đơn hàng mới';
      case 'order_status_change': return 'Thay đổi trạng thái';
      case 'booking_reminder': return 'Nhắc đặt bàn';
      case 'new_booking': return 'Đặt bàn mới';
      case 'order_update': return 'Cập nhật đơn hàng';
      case 'system': return 'Hệ thống';
      default: return type;
    }
  };

  // Handle navigation to related resource
  const navigateToResource = (notification) => {
    if (!notification.relatedResource) return;

    const { type, id } = notification.relatedResource;
    let url;

    switch (type) {
      case 'order':
        url = `/admin/orders`;
        break;
      case 'booking':
        url = `/admin/bookings/${id}`;
        break;
      default:
        return;
    }

    // Mark as read before navigating
    markAsRead(notification._id);

    // Navigate to the URL
    window.location.href = url;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notifications-page p-3">
      <Card>
        <Card.Header className="bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <FaBell className="me-2 text-primary" />
              Thông báo
              {unreadCount > 0 && (
                <Badge bg="danger" className="ms-2">{unreadCount} chưa đọc</Badge>
              )}
            </h4>
            <div>
              <Button 
                variant="outline-primary" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="me-2"
              >
                <FaCheckDouble className="me-2" />
                Đánh dấu tất cả đã đọc
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={fetchNotifications}
              >
                Làm mới
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Filters */}
          <div className="d-flex gap-3 mb-4">
            <div className="flex-grow-1">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm kiếm nội dung thông báo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </div>
            <div style={{ width: '200px' }}>
              <Form.Select 
                value={filterRead} 
                onChange={(e) => setFilterRead(e.target.value)}
              >
                <option value="all">Tất cả thông báo</option>
                <option value="unread">Chưa đọc</option>
                <option value="read">Đã đọc</option>
              </Form.Select>
            </div>
          </div>

          {/* Notifications Table */}
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>Trạng thái</th>
                  <th style={{ width: '15%' }}>Loại</th>
                  <th style={{ width: '40%' }}>Nội dung</th>
                  <th style={{ width: '10%' }}>Độ ưu tiên</th>
                  <th style={{ width: '15%' }}>Thời gian</th>
                  <th style={{ width: '15%' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Không có thông báo nào
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map(notification => (
                    <tr 
                      key={notification._id} 
                      className={!notification.isRead ? 'table-light fw-bold' : ''}
                    >
                      <td className="text-center">
                        {notification.isRead ? (
                          <Badge bg="secondary" pill>Đã đọc</Badge>
                        ) : (
                          <Badge bg="danger" pill>Chưa đọc</Badge>
                        )}
                      </td>
                      <td>
                        <Badge 
                          bg={getTypeBadgeColor(notification.type)}
                          className="text-wrap"
                        >
                          {formatType(notification.type)}
                        </Badge>
                      </td>
                      <td>{notification.content}</td>
                      <td>
                        <Badge 
                          bg={getPriorityBadgeColor(notification.priority)}
                        >
                          {notification.priority === 'high' ? 'Cao' : 
                            notification.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </Badge>
                      </td>
                      <td>{format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                      <td>
                        <div className="d-flex gap-2">
                          {!notification.isRead && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => markAsRead(notification._id)}
                              title="Đánh dấu đã đọc"
                            >
                              <FaCheck />
                            </Button>
                          )}
                          
                          {notification.relatedResource && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => navigateToResource(notification)}
                              title="Xem chi tiết"
                            >
                              <FaEye />
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => deleteNotification(notification._id)}
                            title="Xóa"
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
        </Card.Body>
      </Card>
    </div>
  );
};

export default NotificationsPage; 