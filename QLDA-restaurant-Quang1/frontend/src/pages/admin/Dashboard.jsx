import {
  Row,
  Col,
  Card,
  ProgressBar,
} from 'react-bootstrap';
import { FaUtensils, FaUsers, FaShoppingCart, FaStar } from 'react-icons/fa';

const Dashboard = () => {
  // Sample data for dashboard
  const stats = [
    { id: 1, title: 'Total Orders', value: 156, icon: <FaShoppingCart />, color: 'primary' },
    { id: 2, title: 'Menu Items', value: 42, icon: <FaUtensils />, color: 'success' },
    { id: 3, title: 'Customers', value: 89, icon: <FaUsers />, color: 'info' },
    { id: 4, title: 'Avg. Rating', value: 4.5, icon: <FaStar />, color: 'warning' },
  ];

  const recentOrders = [
    { id: '#1234', customer: 'John Doe', total: 125.50, status: 'Completed' },
    { id: '#1235', customer: 'Jane Smith', total: 89.00, status: 'Pending' },
    { id: '#1236', customer: 'Peter Jones', total: 245.20, status: 'Completed' },
    { id: '#1237', customer: 'Mary Jane', total: 45.80, status: 'Cancelled' },
  ];

  const popularItems = [
    { name: 'Pho Bo', orders: 120 },
    { name: 'Banh Mi', orders: 98 },
    { name: 'Bun Cha', orders: 85 },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="dashboard">
      <div className="row mb-4">
        {stats.map((stat) => (
          <div key={stat.id} className="col-md-3 mb-3">
            <div className={`card border-${stat.color} h-100`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title text-muted">{stat.title}</h5>
                    <h3 className="card-text">{stat.value}</h3>
                  </div>
                  <div className={`fs-2 text-${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-md-8">
          <Card>
            <Card.Header>
              <Card.Title>Recent Orders</Card.Title>
            </Card.Header>
            <Card.Body>
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td><span className={`badge bg-${getStatusColor(order.status)}`}>{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <Card.Header>
              <Card.Title>Popular Items</Card.Title>
            </Card.Header>
            <Card.Body>
              {popularItems.map((item, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>{item.name}</span>
                    <span>{item.orders} orders</span>
                  </div>
                  <ProgressBar now={(item.orders / 150) * 100} style={{height: '10px'}} />
                </div>
              ))}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 