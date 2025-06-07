import { Outlet } from 'react-router-dom';
import NewAdminHeader from '../components/layout/NewAdminHeader';
import NewAdminSidebar from '../components/layout/NewAdminSidebar';
import AdminNotification from '../components/admin/AdminNotification';
import ErrorBoundary from '../components/common/ErrorBoundary';

const AdminLayout = ({ pageTitle }) => {
  return (
    <div className="admin-layout">
      <NewAdminSidebar />
      <div className="main-content">
        <NewAdminHeader pageTitle={pageTitle} />
        <main className="container-fluid py-4">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <ErrorBoundary>
        <AdminNotification />
      </ErrorBoundary>
    </div>
  );
};

export default AdminLayout; 