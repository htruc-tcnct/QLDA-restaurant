import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaPlus, FaSave, FaInfoCircle } from 'react-icons/fa';
import tableService from '../../services/tableService';
import { toast } from 'react-toastify';

const BulkTableCreationModal = ({ show, onHide, onTablesCreated }) => {
  const [formData, setFormData] = useState({
    prefix: 'Bàn',
    startNumber: 1,
    count: 4,
    capacity: 4,
    location: 'main',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'startNumber' || name === 'count' || name === 'capacity' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { prefix, startNumber, count, capacity, location } = formData;
      const creationPromises = [];

      // Create array of table creation promises
      for (let i = 0; i < count; i++) {
        const tableNumber = startNumber + i;
        const tableName = `${prefix} ${tableNumber}`;
        
        const tableData = {
          name: tableName,
          capacity,
          location,
          status: 'available'
        };
        
        creationPromises.push(tableService.createTable(tableData));
      }

      // Execute all promises
      await Promise.all(creationPromises);
      
      toast.success(`Đã tạo thành công ${count} bàn mới`);
      onHide();
      
      if (onTablesCreated) {
        onTablesCreated();
      }
    } catch (error) {
      console.error('Error creating tables:', error);
      toast.error('Không thể tạo bàn. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate preview of table names
  const generateTableNamePreview = () => {
    const { prefix, startNumber, count } = formData;
    if (count <= 0) return [];
    
    const preview = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      preview.push(`${prefix} ${startNumber + i}`);
    }
    
    if (count > 5) {
      preview.push('...');
      preview.push(`${prefix} ${startNumber + count - 1}`);
    }
    
    return preview;
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Tạo nhiều bàn cùng lúc</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Tiền tố tên bàn</Form.Label>
                <Form.Control
                  type="text"
                  name="prefix"
                  value={formData.prefix}
                  onChange={handleInputChange}
                  required
                />
                <Form.Text className="text-muted">
                  Ví dụ: "Bàn" sẽ tạo ra "Bàn 1", "Bàn 2",...
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Bắt đầu từ số</Form.Label>
                <Form.Control
                  type="number"
                  name="startNumber"
                  value={formData.startNumber}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Số lượng bàn</Form.Label>
                <Form.Control
                  type="number"
                  name="count"
                  value={formData.count}
                  onChange={handleInputChange}
                  min="1"
                  max="50"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Sức chứa (người/bàn)</Form.Label>
                <Form.Control
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Khu vực</Form.Label>
                <Form.Select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                >
                  <option value="main">Khu vực chính</option>
                  <option value="outdoor">Ngoài trời</option>
                  <option value="private">Phòng riêng</option>
                  <option value="bar">Quầy bar</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {formData.count > 0 && (
            <Alert variant="info" className="mb-3">
              <FaInfoCircle className="me-2" />
              <strong>Xem trước tên bàn:</strong>
              <div className="mt-2">
                {generateTableNamePreview().map((name, index) => (
                  <span key={index} className="badge bg-light text-dark me-2 mb-1">
                    {name}
                  </span>
                ))}
              </div>
            </Alert>
          )}

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2" disabled={isSubmitting}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang tạo...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Tạo bàn
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BulkTableCreationModal; 