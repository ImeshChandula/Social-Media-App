import React, { useState, useCallback } from 'react';
import MailHead from '../components/MailHead';
import MailContent from '../components/MailContent';
import '../styles/MailPage.css'; // make sure to import styles

const Mail = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [totalMails, setTotalMails] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleFilter = useCallback((filter) => {
    setCurrentFilter(filter);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleMailCountChange = useCallback((total, unread) => {
    setTotalMails(total);
    setUnreadCount(unread);
  }, []);

  return (
    <div className="mail-page-wrapper">
      <div className="mail-header-fixed">
        <MailHead
          totalMails={totalMails}
          unreadCount={unreadCount}
          currentFilter={currentFilter}
          onRefresh={handleRefresh}
          onSearch={handleSearch}
          onFilter={handleFilter}
        />
      </div>
      <div className="mail-scrollable-content">
        <MailContent
          searchTerm={searchTerm}
          currentFilter={currentFilter}
          refreshTrigger={refreshTrigger}
          onMailCountChange={handleMailCountChange}
        />
      </div>
    </div>
  );
};

export default Mail;
