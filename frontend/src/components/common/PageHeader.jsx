import React from 'react';

const PageHeader = ({ title, icon, description }) => {
  return (
    <div className="page-header mb-4">
      <div className="d-flex align-items-center mb-2">
        {icon && <span className="me-2">{icon}</span>}
        <h2 className="m-0">{title}</h2>
      </div>
      {description && <p className="text-muted mb-0">{description}</p>}
    </div>
  );
};

export default PageHeader; 