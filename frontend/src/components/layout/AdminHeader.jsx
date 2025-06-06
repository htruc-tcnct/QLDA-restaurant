import { FaUser } from 'react-icons/fa';
import NotificationCenter from '../common/NotificationCenter';

const AdminHeader = () => {
  return (
    <header className="bg-white shadow-sm py-3">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">Dashboard</h1>
          <div className="d-flex align-items-center gap-3">
            <NotificationCenter />
            <div className="dropdown">
              <button 
                className="btn d-flex align-items-center gap-2" 
                type="button" 
                id="userDropdown" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <FaUser />
                <span>Admin User</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a className="dropdown-item" href="#">Profile</a></li>
                <li><a className="dropdown-item" href="#">Settings</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item" href="#">Logout</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 