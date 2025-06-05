import { FaBell, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore'; // Corrected path

export default function NewAdminHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white shadow-sm py-3">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">Dashboard</h1>
          <div className="d-flex align-items-center gap-3">
            <div className="dropdown">
              <button 
                className="btn position-relative" 
                type="button" 
                id="notificationsDropdown" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <FaBell />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
                <li><a className="dropdown-item" href="#">New order #1234</a></li>
                <li><a className="dropdown-item" href="#">New order #1235</a></li>
                <li><a className="dropdown-item" href="#">New review added</a></li>
              </ul>
            </div>
            {user && (
              <div className="dropdown">
                <button 
                  className="btn d-flex align-items-center gap-2" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <FaUser />
                  <span>{user.fullName || user.username || 'User'}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li><a className="dropdown-item" href="#">Profile</a></li>
                  <li><a className="dropdown-item" href="#">Settings</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" type="button" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 