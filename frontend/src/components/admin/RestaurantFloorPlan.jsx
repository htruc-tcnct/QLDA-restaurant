import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { 
  FaCheck, 
  FaBan, 
  FaUsers, 
  FaBroom, 
  FaEdit, 
  FaEllipsisV,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';

const RestaurantFloorPlan = ({ 
  tables = [], 
  onStatusChange, 
  onEditTable, 
  onDeleteTable,
  loading = false
}) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Extract unique locations from tables
  useEffect(() => {
    if (tables.length > 0) {
      const uniqueLocations = [...new Set(tables.map(table => table.location))];
      setLocations(uniqueLocations.filter(Boolean));
    }
  }, [tables]);

  // Filter tables by selected location
  const filteredTables = selectedLocation === 'all' 
    ? tables 
    : tables.filter(table => table.location === selectedLocation);

  // Get color based on table status
  const getTableColor = (status) => {
    switch (status) {
      case 'available':
        return '#28a745'; // Green
      case 'occupied':
        return '#dc3545'; // Red
      case 'reserved':
        return '#ffc107'; // Yellow
      case 'unavailable':
        return '#6c757d'; // Gray
      case 'needs_cleaning':
        return '#17a2b8'; // Blue
      default:
        return '#6c757d'; // Gray
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <FaCheck />;
      case 'occupied':
        return <FaUsers />;
      case 'reserved':
        return <FaUsers />;
      case 'unavailable':
        return <FaBan />;
      case 'needs_cleaning':
        return <FaBroom />;
      default:
        return <FaInfoCircle />;
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Trống';
      case 'occupied':
        return 'Đang sử dụng';
      case 'reserved':
        return 'Đã đặt trước';
      case 'unavailable':
        return 'Không khả dụng';
      case 'needs_cleaning':
        return 'Cần dọn dẹp';
      default:
        return status;
    }
  };

  // Get location name
  const getLocationName = (location) => {
    switch (location) {
      case 'main':
        return 'Khu vực chính';
      case 'outdoor':
        return 'Ngoài trời';
      case 'private':
        return 'Phòng riêng';
      case 'bar':
        return 'Quầy bar';
      default:
        return location || 'Không xác định';
    }
  };

  // Handle quick status change
  const handleQuickStatusChange = (tableId, newStatus) => {
    if (onStatusChange) {
      onStatusChange(tableId, newStatus);
    }
  };

  // Render table item
  const renderTable = (table) => {
    const tableColor = getTableColor(table.status);
    
    return (
      <div 
        className="restaurant-table" 
        key={table._id}
        style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          margin: '15px',
          borderRadius: '8px',
          border: `2px solid ${tableColor}`,
          backgroundColor: `${tableColor}20`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Table name */}
        <h5 className="mb-0 text-center">{table.name}</h5>
        
        {/* Capacity */}
        <div className="mt-1 mb-2">
          <Badge bg="light" text="dark">
            <FaUsers className="me-1" /> {table.capacity} người
          </Badge>
        </div>
        
        {/* Status */}
        <div>
          <Badge 
            bg={
              table.status === 'available' ? 'success' :
              table.status === 'occupied' ? 'danger' :
              table.status === 'reserved' ? 'warning' :
              table.status === 'needs_cleaning' ? 'info' : 'secondary'
            }
            text={table.status === 'reserved' || table.status === 'warning' ? 'dark' : undefined}
          >
            {getStatusIcon(table.status)} {getStatusText(table.status)}
          </Badge>
        </div>
        
        {/* Quick actions */}
        <div className="table-actions" style={{ position: 'absolute', top: '5px', right: '5px' }}>
          <Dropdown>
            <Dropdown.Toggle variant="link" size="sm" className="p-0 text-dark no-arrow">
              <FaEllipsisV />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header>Đổi trạng thái</Dropdown.Header>
              <Dropdown.Item onClick={() => handleQuickStatusChange(table._id, 'available')}>
                <FaCheck className="me-2 text-success" /> Trống
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleQuickStatusChange(table._id, 'occupied')}>
                <FaUsers className="me-2 text-danger" /> Đang sử dụng
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleQuickStatusChange(table._id, 'reserved')}>
                <FaUsers className="me-2 text-warning" /> Đã đặt trước
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleQuickStatusChange(table._id, 'needs_cleaning')}>
                <FaBroom className="me-2 text-info" /> Cần dọn dẹp
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleQuickStatusChange(table._id, 'unavailable')}>
                <FaBan className="me-2 text-secondary" /> Không khả dụng
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => onEditTable(table)}>
                <FaEdit className="me-2" /> Chỉnh sửa bàn
              </Dropdown.Item>
              <Dropdown.Item 
                className="text-danger" 
                onClick={() => onDeleteTable(table)}
              >
                <FaExclamationTriangle className="me-2" /> Xóa bàn
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Sơ đồ bàn nhà hàng</h5>
          <div>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                {selectedLocation === 'all' ? 'Tất cả khu vực' : getLocationName(selectedLocation)}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item 
                  active={selectedLocation === 'all'} 
                  onClick={() => setSelectedLocation('all')}
                >
                  Tất cả khu vực
                </Dropdown.Item>
                <Dropdown.Divider />
                {locations.map(location => (
                  <Dropdown.Item 
                    key={location} 
                    active={selectedLocation === location}
                    onClick={() => setSelectedLocation(location)}
                  >
                    {getLocationName(location)}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải sơ đồ bàn...</p>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center py-5">
            <FaInfoCircle size={32} className="text-muted mb-3" />
            <p className="mb-0">Không tìm thấy bàn nào {selectedLocation !== 'all' ? `ở ${getLocationName(selectedLocation)}` : ''}</p>
          </div>
        ) : (
          <div>
            {selectedLocation === 'all' ? (
              // Group tables by location
              locations.map(location => (
                <div key={location} className="mb-4">
                  <h6 className="border-bottom pb-2 mb-3">{getLocationName(location)}</h6>
                  <div className="d-flex flex-wrap">
                    {tables
                      .filter(table => table.location === location)
                      .map(table => renderTable(table))
                    }
                  </div>
                </div>
              ))
            ) : (
              // Show tables for selected location
              <div className="d-flex flex-wrap">
                {filteredTables.map(table => renderTable(table))}
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RestaurantFloorPlan; 