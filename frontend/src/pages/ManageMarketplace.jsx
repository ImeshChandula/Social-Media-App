import React, { useState } from 'react';
import MarketplaceAllProduct from './MarketplaceAllProduct';

const ManageMarketplace = () => {
  const [activeComponent, setActiveComponent] = useState('UserManagement');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'MarketplaceAllProduct':
        return <MarketplaceAllProduct />;
      default:
        return <MarketplaceAllProduct />;
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 pt-5 pt-md-0 mt-5 mt-md-0">
      <div className="dashboard-nav text-center my-3">
        <div className="d-flex flex-row justify-content-center gap-2">
          <button
            className={`btn text-white rounded-pill w-50 w-md-auto ${activeComponent === 'MarketplaceAllProduct' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setActiveComponent('MarketplaceAllProduct')}
          >
            All Products
          </button>
        </div>
      </div>

      {/* Rendered Component */}
      <div className="py-4 px-2 rounded">
        {renderComponent()}
      </div>
    </div>
  );
};

export default ManageMarketplace;