import React from 'react';
import styles from '../styles/DashboardHomeStyle';
import "../styles/DashboardHome.css";
import DashboardUserSummery from './DashboardUserSummery';
import TicketsHead from './TicketsHead';
import MailHead from './MailHead';


const DashboardHome = () => {
  return (
    <>
      <div style={styles.container}>
          <h2 style={styles.heading}>Dashboard Overview</h2>
          <p style={styles.paragraph}>Use the sidebar to navigate through admin options.</p>
      </div>

      <TicketsHead />
      <DashboardUserSummery />
      
    </>
    
  )
}

export default DashboardHome