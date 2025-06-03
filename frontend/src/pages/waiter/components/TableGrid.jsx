import { useState, useEffect } from 'react';
import { Form, InputGroup, Button, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { FaSearch, FaCheck, FaUserClock, FaUsers, FaBroom, FaBan, FaCalendarAlt, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { format } from 'date-fns';
import tableService from '../../../services/tableService';

const TableGrid = ({ tables, loading, onSelectTable, filterValue, onFilterChange, currentTable, onClearTable }) => {
  const [tablesWithReservations, setTablesWithReservations] = useState({});
  
  // Check for upcoming reservations when tables change
  useEffect(() => {
    checkUpcomingReservations();
  }, [tables]);
  
  // Check for upcoming reservations for all tables
  const checkUpcomingReservations = async () => {
    const reservationsMap = {};
    
    // Only check tables that are available or occupied
    // No need to check tables that are already reserved or unavailable
    const tablesToCheck = tables.filter(table => 
      table.status === 'available' || 
      table.status === 'occupied' || 
      table.status === 'needs_cleaning'
    );
    
    // Process tables in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < tablesToCheck.length; i += batchSize) {
      const batch = tablesToCheck.slice(i, i + batchSize);
      
      // Process batch in parallel
      const promises = batch.map(async (table) => {
        try {
          const response = await tableService.getUpcomingReservations(table._id);
          const upcomingReservations = response.data.data.upcomingBookings;
          
          if (upcomingReservations && upcomingReservations.length > 0) {
            reservationsMap[table._id] = upcomingReservations[0]; // Store the closest reservation
          }
          return true;
        } catch (error) {
          console.error(`Error checking reservations for table ${table._id}:`, error);
          return false;
        }
      });
      
      // Wait for all promises in the batch to resolve
      await Promise.all(promises);
      
      // Small delay between batches to avoid overloading the server
      if (i + batchSize < tablesToCheck.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setTablesWithReservations(reservationsMap);
  };
  
  // Helper function to get table card color
  const getTableCardColor = (status, isSelected, isBookedAt, hasUpcomingReservation) => {
    if (isSelected) {
      return '#b8daff'; // Light blue for selected table
    }
    
    if (hasUpcomingReservation) {
      return '#ffe8cc'; // Light orange for tables with upcoming reservations
    }
    
    if (isBookedAt) {
      return '#ffe8cc'; // Light orange for tables with upcoming bookings
    }
    
    const colorMap = {
      available: '#d4edda', // Light green
      occupied: '#f8d7da', // Light red
      reserved: '#fff3cd', // Light yellow
      unavailable: '#e2e3e5', // Light gray
      needs_cleaning: '#d1ecf1'  // Light blue
    };
    
    return colorMap[status] || colorMap.unavailable;
  };
  
  // Helper function to get status icon
  const getStatusIcon = (status, isBookedAt, hasUpcomingReservation) => {
    if (hasUpcomingReservation) {
      return <FaExclamationTriangle className="text-danger" />;
    }
    
    if (isBookedAt) {
      return <FaCalendarAlt className="text-warning" />;
    }
    
    const iconMap = {
      available: <FaCheck className="text-success" />,
      occupied: <FaUsers className="text-danger" />,
      reserved: <FaUserClock className="text-warning" />,
      unavailable: <FaBan className="text-secondary" />,
      needs_cleaning: <FaBroom className="text-info" />
    };
    
    return iconMap[status] || iconMap.unavailable;
  };
  
  // Format booking time for display
  const formatBookingTime = (booking) => {
    if (!booking) return '';
    
    const bookingDate = new Date(booking.date);
    const formattedDate = format(bookingDate, 'dd/MM/yyyy');
    return `${formattedDate} ${booking.time}`;
  };
  
  return (
    <div className="table-grid">
      {/* Search input */}
      <div className="p-2">
        <InputGroup>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Tìm bàn..."
            value={filterValue}
            onChange={onFilterChange}
          />
        </InputGroup>
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-4">
          <p>Không tìm thấy bàn nào</p>
        </div>
      ) : (
        <div className="p-2">
          {/* Grid hiển thị bàn */}
          <div className="table-grid-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {tables.map((table) => {
              const isSelected = currentTable && currentTable._id === table._id;
              const isBookedAt = table.isBookedAt;
              const bookingInfo = table.bookingInfo;
              const upcomingReservation = tablesWithReservations[table._id];
              const hasUpcomingReservation = !!upcomingReservation;
              
              return (
                <div 
                  key={table._id} 
                  style={{ 
                    width: 'calc(33.33% - 10px)', 
                    minWidth: '120px',
                    backgroundColor: getTableCardColor(table.status, isSelected, isBookedAt, hasUpcomingReservation),
                    border: hasUpcomingReservation ? '2px solid #fd7e14' : 
                           isSelected ? '2px solid #007bff' : '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '10px',
                    cursor: 'pointer',
                    marginBottom: '10px'
                  }}
                  onClick={() => onSelectTable(table)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h6 style={{ margin: 0 }}>{table.name}</h6>
                    {getStatusIcon(table.status, isBookedAt, hasUpcomingReservation)}
                  </div>
                  <div>
                    <div 
                      style={{ 
                        backgroundColor: 
                          hasUpcomingReservation ? '#fd7e14' :
                          isBookedAt ? '#fd7e14' :
                          table.status === 'available' ? '#28a745' : 
                          table.status === 'occupied' ? '#dc3545' :
                          table.status === 'reserved' ? '#ffc107' :
                          table.status === 'needs_cleaning' ? '#17a2b8' : '#6c757d',
                        color: '#fff',
                        padding: '2px 5px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        textAlign: 'center',
                        marginBottom: '5px'
                      }}
                    >
                      {hasUpcomingReservation ? 'Sắp có khách đặt' : 
                       isBookedAt ? 'Đã đặt trước' : (
                        isSelected ? 'Đã chọn' : (
                          table.status === 'available' ? 'Trống' : 
                          table.status === 'occupied' ? 'Có khách' :
                          table.status === 'reserved' ? 'Đã đặt' :
                          table.status === 'needs_cleaning' ? 'Cần dọn' : 'Không dùng'
                        )
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center' }}>
                      {table.capacity} người
                    </div>
                    {table.location && (
                      <div style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center' }}>
                        {table.location}
                      </div>
                    )}
                    
                    {/* Hiển thị thông tin đặt bàn */}
                    {isBookedAt && bookingInfo && (
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            <div>Khách: {bookingInfo.customerName}</div>
                            <div>SĐT: {bookingInfo.customerPhone}</div>
                            <div>Thời gian: {formatBookingTime(bookingInfo)}</div>
                            <div>Số khách: {bookingInfo.numberOfGuests}</div>
                          </Tooltip>
                        }
                      >
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#fd7e14', 
                          textAlign: 'center',
                          marginTop: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FaInfoCircle className="me-1" />
                          Đặt: {formatBookingTime(bookingInfo)}
                        </div>
                      </OverlayTrigger>
                    )}
                    
                    {/* Hiển thị thông tin đặt bàn sắp tới */}
                    {hasUpcomingReservation && (
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            <div>Khách: {upcomingReservation.customerName}</div>
                            <div>SĐT: {upcomingReservation.customerPhone}</div>
                            <div>Thời gian: {formatBookingTime(upcomingReservation)}</div>
                            <div>Số khách: {upcomingReservation.numberOfGuests}</div>
                            <div>Còn: {upcomingReservation.minutesUntil} phút nữa</div>
                          </Tooltip>
                        }
                      >
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#dc3545', 
                          textAlign: 'center',
                          marginTop: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          <FaExclamationTriangle className="me-1" />
                          Còn {upcomingReservation.minutesUntil} phút
                        </div>
                      </OverlayTrigger>
                    )}
                    
                    {/* Nút dọn bàn cho bàn cần dọn dẹp */}
                    {table.status === 'needs_cleaning' && onClearTable && (
                      <div className="mt-2 text-center">
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
                            onClearTable(table._id);
                          }}
                        >
                          <FaBroom className="me-1" /> Đã dọn xong
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableGrid; 