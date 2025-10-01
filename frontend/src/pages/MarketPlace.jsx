import React, { useState } from 'react';
import MarketMyProducts from './MarketMyProducts';
import MarketProducts from './MarketProducts';
import "../styles/Marketplace.css"
import useThemeStore from '../store/themeStore';

const MarketPlace = () => {
  const [activeComponent, setActiveComponent] = useState('UserManagement');
  const { isDarkMode } = useThemeStore();

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
    <div className="container-fluid px-2 px-md-4 pt-5 pt-md-0 mt-5 mt-md-0">
      <div className="dashboard-nav text-center my-3">
        <div className="d-flex flex-row justify-content-center gap-2">
          <button
            className={`btn rounded-pill w-50 w-md-auto ${activeComponent === 'MarketProducts' ? 'btn-success text-white' : 'btn-outline-success'} ${isDarkMode ? "text-white" : "text-black"} `}
            onClick={() => setActiveComponent('MarketProducts')}
          >
            Products
          </button>
          <button
            className={`btn rounded-pill w-50 w-md-auto ${activeComponent === 'MarketMyProducts' ? 'btn-success text-white' : 'btn-outline-success'} ${isDarkMode ? "text-white" : "text-black"}`}
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