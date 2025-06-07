import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary p-4 bg-light rounded shadow-sm">
          <h2 className="text-danger">Đã xảy ra lỗi</h2>
          <p>Đã có lỗi xảy ra trong component này. Vui lòng thử làm mới trang.</p>
          <details className="mt-3">
            <summary className="text-primary cursor-pointer">Chi tiết lỗi</summary>
            <pre className="mt-2 p-3 bg-dark text-white rounded">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button
            className="btn btn-primary mt-3"
            onClick={() => window.location.reload()}
          >
            Làm mới trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary; 