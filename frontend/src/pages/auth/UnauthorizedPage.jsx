import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const UnauthorizedPage = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="card shadow">
            <div className="card-body p-5">
              <FaExclamationTriangle className="text-warning mb-4" size={80} />
              <h1 className="display-4 mb-4">Access Denied</h1>
              <p className="lead mb-4">
                You do not have permission to access this page.
              </p>
              <div className="d-grid gap-2">
                <Link
                  to="/"
                  className="btn btn-primary btn-lg"
                >
                  <FaHome className="me-2" /> Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 