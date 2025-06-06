const express = require("express");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

const router = express.Router();

// Public route - can be accessed without login
router.post(
  "/",
  authController.protectOptional,
  bookingController.createBooking
);

// Protected routes - require login
router.use(authController.protect);

// Customer routes
router.get("/my-bookings", bookingController.getMyBookings);
router.put(
  "/:id/cancel-by-customer",
  bookingController.cancelBookingByCustomer
);

// Staff/Admin routes
router.use(authController.restrictTo("staff", "manager", "admin"));

router.route("/").get(bookingController.getAllBookings);

router
  .route("/:id")
  .get(bookingController.getBooking)
  .put(bookingController.updateBooking);

router.put("/:id/status", bookingController.updateBookingStatus);

module.exports = router;
