import React, { useState } from 'react';
import RegularUserPage from '../components/RegularUserPage';
import Advertiser from '../components/Advertiser';
import AdminPage from '../components/AdminPage';
import GroupAdmin from '../components/GroupAdmin';
import RestrictedUser from '../components/RestrictedUser';

const Home = () => {
  const [activeComponent, setActiveComponent] = useState('UserManagement');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'RegularUserPage':
        return <RegularUserPage />;
      case 'AdminPage':
        return <AdminPage />;
      case 'GroupAdmin':
        return <GroupAdmin />;
      case 'Advertiser':
        return <Advertiser />;
      case 'RestrictedUser':
        return <RestrictedUser />;
      default:
        return <RegularUserPage />;
    }
  };

  return (
    <div>
      {/* Navigation Buttons */}
      <div className="dashboard-nav text-center my-3">
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <button
            className={`btn text-white rounded-pill px-4 ${activeComponent === 'RegularUserPage' ? 'btn-success' : 'btn-outline-success'
              }`}
            onClick={() => setActiveComponent('RegularUserPage')}
          >
            Regular User
          </button>
          <button
            className={`btn text-white rounded-pill px-4 ${activeComponent === 'AdminPage' ? 'btn-success' : 'btn-outline-success'
              }`}
            onClick={() => setActiveComponent('AdminPage')}
          >
            Admin Page
          </button>
          <button
            className={`btn text-white rounded-pill px-4 ${activeComponent === 'GroupAdmin' ? 'btn-success' : 'btn-outline-success'
              }`}
            onClick={() => setActiveComponent('GroupAdmin')}
          >
            Group Admin
          </button>
          <button
            className={`btn text-white rounded-pill px-4 ${activeComponent === 'Advertiser' ? 'btn-success' : 'btn-outline-success'
              }`}
            onClick={() => setActiveComponent('Advertiser')}
          >
            Advertiser
          </button>
          <button
            className={`btn text-white rounded-pill px-4 ${activeComponent === 'RestrictedUser' ? 'btn-success' : 'btn-outline-success'
              }`}
            onClick={() => setActiveComponent('RestrictedUser')}
          >
            Restricted User
          </button>
        </div>
      </div>

      {/* Rendered Component */}
      <div className="bg-dark py-4">
          {renderComponent()}
      </div>
    </div>
  );
};

export default Home;
