import { Container } from 'react-bootstrap';
import BookingManagement from '../../components/admin/BookingManagement';
import PageHeader from '../../components/common/PageHeader';
import { FaCalendarAlt } from 'react-icons/fa';

const BookingManagementPage = () => {
  return (
    <Container fluid className="p-3">
      <PageHeader 
        title="Quản lý đặt bàn" 
        icon={<FaCalendarAlt className="me-2" />}
        description="Quản lý và theo dõi các đặt bàn của khách hàng"
      />
      
      <BookingManagement />
    </Container>
  );
};

export default BookingManagementPage; 