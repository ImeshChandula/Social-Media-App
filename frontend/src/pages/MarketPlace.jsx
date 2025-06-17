import React, { useState } from 'react';
import MarketMyProducts from './MarketMyProducts';
import MarketProducts from './MarketProducts';

const MarketPlace = () => {
  const [activeComponent, setActiveComponent] = useState('UserManagement');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'MarketProducts':
        return <MarketProducts />;
      case 'MarketMyProducts':
        return <MarketMyProducts />;
      default:
        return <MarketProducts />;
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4">
      {/* Navigation Buttons */}
      <div className="dashboard-nav text-center my-3">
        <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
          <button
            className={`btn text-white rounded-pill w-100 w-md-auto ${activeComponent === 'MarketProducts' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setActiveComponent('MarketProducts')}
          >
            Products
          </button>
          <button
            className={`btn text-white rounded-pill w-100 w-md-auto ${activeComponent === 'MarketMyProducts' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setActiveComponent('MarketMyProducts')}
          >
            My Products
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

export default MarketPlace;