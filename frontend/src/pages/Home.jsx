import React, { useState } from 'react';
import RegularUserPage from '../components/RegularUserPage';
import Advertiser from '../components/Advertiser';
import AdminPage from '../components/AdminPage';
import GroupAdmin from '../components/GroupAdmin';
import RestrictedUser from '../components/RestrictedUser';

const Home = () => {
  const [activeComponent, setActiveComponent] = useState('UserManagement')

  // Function to render the active component
  const renderComponent = () => {
    switch (activeComponent) {
      case 'RegularUserPage':
        return <RegularUserPage />
      case 'AdminPage':
        return <AdminPage />
      case 'GroupAdmin':
        return <GroupAdmin />
      case 'Advertiser':
        return <Advertiser />
      case 'RestrictedUser':
        return <RestrictedUser />
      default:
        return <RegularUserPage />
    }
  }
  return (

    <div>
      
      <div className="dashboard-nav">
        <div className="btn-group" role="group" aria-label="Dashboard Navigation">
          <button 
            className={`btn nav-button ${activeComponent === 'RegularUserPage' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveComponent('RegularUserPage')}
          >
            <span className="btn-text">Regular User</span>
          </button>
          <button 
            className={`btn nav-button ${activeComponent === 'AdminPage' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveComponent('AdminPage')}
          >
            <span className="btn-text">Admin Page</span>
          </button>
          <button 
            className={`btn nav-button ${activeComponent === 'GroupAdmin' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveComponent('GroupAdmin')}
          >
            <span className="btn-text">Group Admin</span>
          </button>
          <button 
            className={`btn nav-button ${activeComponent === 'Advertiser' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveComponent('Advertiser')}
          >
            <span className="btn-text">Advertiser</span>
          </button>
          <button 
            className={`btn nav-button ${activeComponent === 'RestrictedUser' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveComponent('RestrictedUser')}
          >
            <span className="btn-text">Restricted User</span>
          </button>
        </div>
      </div>
      
      <div className="bg-dark py-4">
        <div className="component-container">
          {renderComponent()}
        </div>
      </div>
    </div>
  )
}

export default Home