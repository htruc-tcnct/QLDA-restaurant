# Real-time Notification System

This document describes the real-time notification system implemented in the restaurant management application.

## Overview

The notification system allows for real-time alerts to be sent to admin users when important events occur, such as:
- New table bookings
- Order status changes
- System alerts

## Features

- **Real-time notifications**: Instant alerts via WebSockets
- **Sound alerts**: Audio notifications to grab attention
- **Modal overlays**: Visual pop-up notifications for important events
- **Browser notifications**: Native browser notifications when the app is in the background
- **Notification center**: Centralized place to view all notifications

## Components

### Backend

- `socketService.js`: Manages WebSocket connections and broadcasting
- `Notification.js`: MongoDB model for storing notifications
- `notificationController.js`: API endpoints for notifications
- `bookingController.js`: Emits notifications when new bookings are created

### Frontend

- `socketService.js`: Client-side WebSocket management
- `AdminNotification.jsx`: Modal notification component for admin users
- `NotificationCenter.jsx`: Bell icon with dropdown for all notifications
- `notification.mp3`: Sound file for audio alerts

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Download notification sounds**:
   ```bash
   # From backend directory
   npm run download-sounds
   
   # Or from frontend directory
   npm run download-sounds
   ```

3. **Custom sounds**: If you want to use a custom notification sound, replace the file at:
   ```
   frontend/src/assets/sounds/notification.mp3
   ```

## Usage

### Sending Notifications from Backend

```javascript
// Example: Send notification for a new booking
const notificationContent = `Đặt bàn mới: ${customerName} - ${formattedDate} ${time} - ${numberOfGuests} khách`;

// Emit to specific roles
await socketService.emitToRole('manager', 'new_booking', {
  notification: notificationContent,
  booking: bookingData,
  sound: true // Flag to play sound
});

// Broadcast to all admins
socketService.broadcast('admin_notification', {
  type: 'new_booking',
  message: notificationContent,
  booking: bookingData,
  sound: true
});
```

### Listening for Notifications in Frontend

```javascript
// In a React component
useEffect(() => {
  // Initialize socket connection
  socketService.initialize(user._id);
  
  // Listen for notifications
  const removeListener = socketService.addListener('new_booking', handleNotification);
  
  return () => {
    removeListener();
  };
}, [user]);
```

## Troubleshooting

- **No sound playing**: Check that the notification sound file exists and is a valid MP3
- **Socket connection issues**: Verify that the WebSocket server is running and accessible
- **Browser notifications not showing**: Ensure notification permissions are granted in the browser

## Browser Support

- **Chrome/Edge/Opera**: Full support for all features
- **Firefox**: Full support
- **Safari**: Audio notifications may require user interaction first 