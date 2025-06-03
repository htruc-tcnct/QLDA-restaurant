import { useState, useEffect } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import api from '../../services/api';
import { toast } from 'react-toastify';

const TestTablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/v1/tables');
      console.log('API response:', response.data);
      setTables(response.data.data.tables || []);
      toast.success('Đã tải dữ liệu bàn thành công');
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError(error.response?.data?.message || error.message);
      toast.error('Không thể tải dữ liệu bàn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Kiểm tra token và user khi component được tải
    setToken(localStorage.getItem('token'));
    setUser(JSON.parse(localStorage.getItem('user')));
  }, []);

  return (
    <Container className="py-4">
      <h1 className="mb-4">Kiểm tra API Bàn</h1>
      
      <Card className="mb-4">
        <Card.Header>Thông tin xác thực</Card.Header>
        <Card.Body>
          <div><strong>Token:</strong> {token ? 'Có' : 'Không có'}</div>
          <div><strong>User:</strong> {user ? `${user.fullName} (${user.role})` : 'Chưa đăng nhập'}</div>
          <div className="mt-2">
            {!token && (
              <Alert variant="warning">
                Bạn chưa đăng nhập. Vui lòng đăng nhập để sử dụng API.
              </Alert>
            )}
          </div>
        </Card.Body>
      </Card>
      
      <div className="mb-4">
        <Button 
          variant="primary" 
          onClick={fetchTables} 
          disabled={loading || !token}
        >
          {loading ? 'Đang tải...' : 'Tải dữ liệu bàn'}
        </Button>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Lỗi:</strong> {error}
        </Alert>
      )}
      
      <Card>
        <Card.Header>Danh sách bàn ({tables.length})</Card.Header>
        <Card.Body>
          {tables.length === 0 ? (
            <p className="text-muted">Không có dữ liệu bàn</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Trạng thái</th>
                    <th>Sức chứa</th>
                    <th>Vị trí</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map(table => (
                    <tr key={table._id}>
                      <td>{table._id}</td>
                      <td>{table.name}</td>
                      <td>
                        <span className={`badge bg-${
                          table.status === 'available' ? 'success' :
                          table.status === 'occupied' ? 'danger' :
                          table.status === 'reserved' ? 'warning' :
                          table.status === 'needs_cleaning' ? 'info' : 'secondary'
                        }`}>
                          {table.status}
                        </span>
                      </td>
                      <td>{table.capacity}</td>
                      <td>{table.location || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TestTablesPage; 