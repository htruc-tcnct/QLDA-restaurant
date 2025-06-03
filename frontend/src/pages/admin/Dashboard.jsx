import { FaUtensils, FaUsers, FaShoppingCart, FaStar } from 'react-icons/fa';

const Dashboard = () => {
  // Sample data for dashboard
  const stats = [
    { id: 1, title: 'Total Orders', value: 156, icon: <FaShoppingCart />, color: 'primary' },
    { id: 2, title: 'Menu Items', value: 42, icon: <FaUtensils />, color: 'success' },
    { id: 3, title: 'Customers', value: 120, icon: <FaUsers />, color: 'warning' },
    { id: 4, title: 'Reviews', value: 89, icon: <FaStar />, color: 'info' },
  ];

  const recentOrders = [
    { id: 1001, customer: 'John Doe', total: 45.99, date: '2023-10-15', status: 'Completed' },
    { id: 1002, customer: 'Jane Smith', total: 32.50, date: '2023-10-15', status: 'Processing' },
    { id: 1003, customer: 'Robert Johnson', total: 78.25, date: '2023-10-14', status: 'Completed' },
    { id: 1004, customer: 'Emily Davis', total: 24.99, date: '2023-10-14', status: 'Cancelled' },
    { id: 1005, customer: 'Michael Brown', total: 56.75, date: '2023-10-13', status: 'Completed' },
  ];

  return (
    <div className="dashboard">
      <div className="row mb-4">
        {stats.map((stat) => (
          <div key={stat.id} className="col-md-3 mb-3">
            <div className={`card border-${stat.color} h-100`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted">{stat.title}</h6>
                    <h2 className="mb-0">{stat.value}</h2>
                  </div>
                  <div className={`bg-${stat.color} text-white p-3 rounded`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Orders</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customer}</td>
                        <td>${order.total.toFixed(2)}</td>
                        <td>{order.date}</td>
                        <td>
                          <span 
                            className={`badge bg-${
                              order.status === 'Completed' 
                                ? 'success' 
                                : order.status === 'Processing' 
                                ? 'warning' 
                                : 'danger'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Popular Items</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Bào Ngư Sốt Dầu Hào</span>
                  <span className="badge bg-primary rounded-pill">124</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Cua Rang Me</span>
                  <span className="badge bg-primary rounded-pill">98</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Gỏi Ngó Sen Tôm Thịt</span>
                  <span className="badge bg-primary rounded-pill">76</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Lẩu Hải Sản</span>
                  <span className="badge bg-primary rounded-pill">65</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Cơm Chiên Dương Châu</span>
                  <span className="badge bg-primary rounded-pill">52</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 