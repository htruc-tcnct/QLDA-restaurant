import { Outlet } from 'react-router-dom';
import NewAdminHeader from '../components/layout/NewAdminHeader'; // Reusing for now, can be replaced with a specific PosHeader later

const PosLayout = () => {
  return (
    <div className="pos-layout">
      <NewAdminHeader /> 
      <main className="container-fluid py-4"> {/* Adjust padding/container as needed for POS */}
        <Outlet />
      </main>
    </div>
  );
};

export default PosLayout; 