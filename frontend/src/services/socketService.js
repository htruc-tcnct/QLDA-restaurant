import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize the socket connection
  initialize(token) {
    if (this.socket) {
      console.log('Socket already initialized');
      return;
    }

    // Create socket connection
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        token
      }
    });

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.connected = true;
      this.reconnectAttempts = 0;
      
      // Authenticate with the server
      this.socket.emit('authenticate', token);
      
      // Notify listeners of connection
      this.notifyListeners('connect', { connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
      this.notifyListeners('disconnect', { connected: false });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnect attempts reached, giving up');
        this.socket.disconnect();
      }
    });

    // Set up default listeners
    this.setupDefaultListeners();
  }

  // Set up default listeners for common events
  setupDefaultListeners() {
    // Listen for new bookings
    this.socket.on('new_booking', (data) => {
      console.log('New booking notification received:', data);
      this.notifyListeners('new_booking', data);
    });

    // Listen for admin notifications
    this.socket.on('admin_notification', (data) => {
      console.log('Admin notification received:', data);
      this.notifyListeners('admin_notification', data);
    });
    
    // Listen for order updates
    this.socket.on('order_update', (data) => {
      console.log('Order update received:', data);
      this.notifyListeners('order_update', data);
    });
  }

  // Add a listener for an event
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event).push(callback);
    return () => this.removeListener(event, callback);
  }

  // Remove a listener for an event
  removeListener(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  // Disconnect the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.connected;
  }
  
  // Manually emit an event (for testing)
  emit(event, data) {
    if (!this.socket || !this.connected) {
      console.error('Cannot emit event: socket not connected');
      return false;
    }
    
    this.socket.emit(event, data);
    return true;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 