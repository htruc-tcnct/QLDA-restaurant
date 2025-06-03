import React from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { FaTrash, FaPlusCircle, FaMinusCircle, FaPen } from 'react-icons/fa';

const OrderDetails = ({ 
  orderItems, 
  subTotal, 
  taxAmount, 
  discountAmount, 
  totalAmount,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNotes,
  currentTable,
  currentOrder,
  disabled
}) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="order-details d-flex flex-column h-100">
      {/* Bàn và trạng thái */}
      <div className="p-2 bg-light border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong>Bàn:</strong> {currentTable ? currentTable.name : 'Chưa chọn bàn'}
          </div>
          {currentOrder && (
            <div>
              <span className="badge bg-info">
                {currentOrder.orderStatus === 'pending_confirmation' ? 'Chờ xác nhận' :
                 currentOrder.orderStatus === 'confirmed_by_customer' ? 'Đã xác nhận' :
                 currentOrder.orderStatus === 'paid' ? 'Đã thanh toán' :
                 'Đang xử lý'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách món */}
      <div className="flex-grow-1 overflow-auto">
        {orderItems.length === 0 ? (
          <div className="text-center text-muted p-4">
            <p>Chưa có món nào được chọn</p>
            <p>Vui lòng chọn món từ thực đơn</p>
          </div>
        ) : (
          <Table responsive borderless className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Món</th>
                <th className="text-center">SL</th>
                <th className="text-end">Đơn giá</th>
                <th className="text-end">Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={item.id || `item-${index}`}>
                  <td>
                    <div className="fw-bold">{item.name}</div>
                    <div className="text-muted small">
                      {item.notes && <em>Ghi chú: {item.notes}</em>}
                    </div>
                    <Form.Control
                      as="textarea"
                      placeholder="Ghi chú..."
                      rows={1}
                      className="mt-1 form-control-sm"
                      value={item.notes || ''}
                      onChange={(e) => onUpdateNotes(item.id || index, e.target.value)}
                      disabled={disabled}
                    />
                  </td>
                  <td className="text-center align-middle">
                    <div className="d-flex align-items-center justify-content-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id || index, item.quantity - 1)}
                        disabled={item.quantity <= 1 || disabled}
                      >
                        <FaMinusCircle />
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id || index, item.quantity + 1)}
                        disabled={disabled}
                      >
                        <FaPlusCircle />
                      </Button>
                    </div>
                  </td>
                  <td className="text-end align-middle">{formatCurrency(item.price)}</td>
                  <td className="text-end align-middle">{formatCurrency(item.price * item.quantity)}</td>
                  <td className="align-middle">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onRemoveItem(item.id || index)}
                      disabled={disabled}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Tổng cộng */}
      <div className="p-3 border-top">
        <div className="d-flex justify-content-between mb-2">
          <span>Tạm tính:</span>
          <span>{formatCurrency(subTotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="d-flex justify-content-between mb-2 text-danger">
            <span>Giảm giá:</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="d-flex justify-content-between mb-2">
          <span>Thuế (10%):</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="d-flex justify-content-between fw-bold">
          <span>Tổng cộng:</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 