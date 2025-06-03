import { Outlet } from 'react-router-dom';
import NewAdminHeader from '../components/layout/NewAdminHeader';
import NewAdminSidebar from '../components/layout/NewAdminSidebar';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <NewAdminSidebar />
      <div className="main-content">
        <NewAdminHeader />
        <main className="container-fluid py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 