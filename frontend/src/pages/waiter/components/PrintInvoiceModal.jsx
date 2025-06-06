import React, { useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaPrint } from 'react-icons/fa';

const PrintInvoiceModal = ({ 
  show, 
  onHide, 
  orderItems, 
  subTotal, 
  taxAmount, 
  discountAmount, 
  totalAmount,
  currentTable,
  currentOrder
}) => {
  const printRef = useRef();
  
  const handlePrint = () => {
    const printContent = printRef.current;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    
    // Reload the page to restore React components after printing
    window.location.reload();
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Hóa đơn tạm tính</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div ref={printRef} className="p-2">
          <div className="text-center mb-4">
            <h4 className="mb-1">NHÀ HÀNG XYZ</h4>
            <p className="mb-1">Địa chỉ: 123 Đường ABC, Quận XYZ</p>
            <p className="mb-1">SĐT: 0123 456 789</p>
            <h5 className="mt-3 mb-1">HÓA ĐƠN TẠM TÍNH</h5>
            <p className="mb-0">{currentOrder ? `Mã đơn: ${currentOrder._id.substring(0, 8)}` : 'Đơn hàng mới'}</p>
            <p className="mb-0">Thời gian: {currentOrder ? formatDate(currentOrder.createdAt) : formatDate(new Date())}</p>
            <p className="mb-3"><strong>Bàn: {currentTable?.name || 'Chưa chọn bàn'}</strong></p>
          </div>
          
          <div className="mb-3">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Món</th>
                  <th className="text-center">SL</th>
                  <th className="text-end">Đơn giá</th>
                  <th className="text-end">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{index + 1}</td>
                    <td>
                      {item.name}
                      {item.notes && <div className="small text-muted">Ghi chú: {item.notes}</div>}
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">{formatCurrency(item.price)}</td>
                    <td className="text-end">{formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="border-top pt-2">
            <div className="d-flex justify-content-between mb-1">
              <span>Tổng tiền hàng:</span>
              <strong>{formatCurrency(subTotal)}</strong>
            </div>
            {discountAmount > 0 && (
              <div className="d-flex justify-content-between mb-1">
                <span>Giảm giá:</span>
                <strong>- {formatCurrency(discountAmount)}</strong>
              </div>
            )}
            <div className="d-flex justify-content-between mb-1">
              <span>Thuế (10%):</span>
              <strong>{formatCurrency(taxAmount)}</strong>
            </div>
            <div className="d-flex justify-content-between border-top pt-1 mt-1">
              <span className="h5">Tổng cộng:</span>
              <strong className="h5">{formatCurrency(totalAmount)}</strong>
            </div>
          </div>
          
          <div className="text-center mt-4 mb-2">
            <p className="mb-0"><em>Lưu ý: Đây là hóa đơn tạm tính</em></p>
            <p className="mb-0"><em>Cảm ơn quý khách đã sử dụng dịch vụ!</em></p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          <FaPrint className="me-2" /> In hóa đơn
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrintInvoiceModal; 