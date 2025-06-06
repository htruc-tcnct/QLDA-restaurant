import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  Tabs,
  Tab,
  Alert,
  Spinner,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaPercentage,
  FaMoneyBillWave,
  FaCheck,
  FaTag,
  FaTimes,
  FaSearch,
  FaTags,
} from "react-icons/fa";
import promotionService from "../../../services/promotionService";
import { applyPromoCode } from "../../../services/promotionService";

const DiscountModal = ({
  show,
  onHide,
  onApplyDiscount,
  subTotal,
  currentDiscount = 0,
}) => {
  const [activeTab, setActiveTab] = useState("manual");

  // Manual discount state
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(
    currentDiscount > 0 ? ((currentDiscount / subTotal) * 100).toFixed(0) : 0
  );
  const [discountAmount, setDiscountAmount] = useState(currentDiscount);

  // Promotion code state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [promoData, setPromoData] = useState(null);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);

  // Promotion code states
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);

  // Format price with thousand separator
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Handle discount type change
  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);

    // Reset promotion states when switching away from promotion_code
    if (type !== "promotion_code") {
      setAppliedPromotion(null);
      setPromoError("");
      setPromoCode("");
    }

    if (type === "percentage") {
      // Convert amount to percentage
      setDiscountValue(
        Math.min(((discountAmount / subTotal) * 100).toFixed(0), 100)
      );
    } else if (type === "amount") {
      // Convert percentage to amount
      setDiscountValue(
        Math.min((subTotal * (discountValue / 100)).toFixed(0), subTotal)
      );
    } else if (type === "promotion_code") {
      setDiscountValue(0);
      setDiscountAmount(0);
    }
  };

  // Handle discount value change
  const handleDiscountValueChange = (e) => {
    const value = parseFloat(e.target.value) || 0;

    if (discountType === "percentage") {
      // Limit percentage to 100%
      const limitedValue = Math.min(value, 100);
      setDiscountValue(limitedValue);
      setDiscountAmount((subTotal * (limitedValue / 100)).toFixed(0));
    } else {
      // Limit amount to subtotal
      const limitedValue = Math.min(value, subTotal);
      setDiscountValue(limitedValue);
      setDiscountAmount(limitedValue);
    }
  };

  // Handle promo code change
  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value.toUpperCase());
    setPromoError("");
    setPromoSuccess(false);
    setPromoData(null);
  };

  // Validate promo code
  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Vui lòng nhập mã giảm giá");
      return;
    }

    setPromoLoading(true);
    setPromoError("");
    setPromoSuccess(false);

    try {
      const response = await promotionService.validatePromotion(
        promoCode,
        subTotal
      );
      const { promotion, discountAmount, discountedTotal } = response.data.data;

      setPromoData(promotion);
      setPromoDiscountAmount(discountAmount);
      setPromoSuccess(true);
    } catch (error) {
      console.error("Error validating promo code:", error);
      setPromoError(
        error.response?.data?.message ||
          "Không thể kiểm tra mã giảm giá. Vui lòng thử lại."
      );
      setPromoData(null);
    } finally {
      setPromoLoading(false);
    }
  };

  // Handle promotion code application
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Vui lòng nhập mã khuyến mãi");
      return;
    }

    setPromoLoading(true);
    setPromoError("");

    try {
      const response = await applyPromoCode(promoCode.trim(), subTotal);

      if (response.status === "success") {
        setAppliedPromotion(response.data.promotion);
        setDiscountAmount(response.data.discountAmount);
        setPromoError("");
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      setPromoError(
        error.response?.data?.message || "Mã khuyến mãi không hợp lệ"
      );
      setAppliedPromotion(null);
      setDiscountAmount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  // Handle discount submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (discountType === "percentage") {
      onApplyDiscount({
        discountPercentage: parseFloat(discountValue),
        discountAmount: null,
      });
    } else {
      onApplyDiscount({
        discountPercentage: null,
        discountAmount: parseFloat(discountValue),
      });
    }

    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Áp dụng giảm giá</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Chọn loại giảm giá</Form.Label>
              <Row>
                <Col xs={6}>
                  <Button
                    variant={
                      discountType === "percentage"
                        ? "primary"
                        : "outline-primary"
                    }
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => handleDiscountTypeChange("percentage")}
                    type="button"
                  >
                    <FaPercentage className="me-2" /> Theo phần trăm
                  </Button>
                </Col>
                <Col xs={6}>
                  <Button
                    variant={
                      discountType === "amount" ? "primary" : "outline-primary"
                    }
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => handleDiscountTypeChange("amount")}
                    type="button"
                  >
                    <FaMoneyBillWave className="me-2" /> Theo số tiền
                  </Button>
                </Col>
              </Row>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {discountType === "percentage"
                  ? "Phần trăm giảm giá"
                  : "Số tiền giảm giá"}
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  min="0"
                  max={discountType === "percentage" ? "100" : subTotal}
                  step={discountType === "percentage" ? "1" : "1000"}
                  value={discountValue}
                  onChange={handleDiscountValueChange}
                />
                <InputGroup.Text>
                  {discountType === "percentage" ? "%" : "VND"}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </div>

          <div className="discount-preview p-3 bg-light rounded">
            <div className="d-flex justify-content-between mb-2">
              <span>Tạm tính:</span>
              <span>{formatPrice(subTotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 text-success">
              <span>Giảm giá:</span>
              <span>- {formatPrice(discountAmount)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Sau giảm giá:</span>
              <span>{formatPrice(subTotal - discountAmount)}</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Hủy
          </Button>
          <Button
            variant="success"
            type="submit"
            className="d-flex align-items-center"
            disabled={activeTab === "promo" && !promoSuccess}
          >
            <FaCheck className="me-2" /> Áp dụng
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DiscountModal;
