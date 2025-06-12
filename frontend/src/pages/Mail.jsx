import React, { useState, useCallback } from 'react';
import MailHead from '../components/MailHead'
import MailContent from '../components/MailContent'

const Mail = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [totalMails, setTotalMails] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle search from MailHead
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Handle filter change from MailHead
  const handleFilter = useCallback((filter) => {
    setCurrentFilter(filter);
  }, []);

  // Handle refresh from MailHead
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Handle mail count updates from MailContent
  const handleMailCountChange = useCallback((total, unread) => {
    setTotalMails(total);
    setUnreadCount(unread);
  }, []);


  return (
    <div>
        <MailHead 
        totalMails={totalMails}
        unreadCount={unreadCount}
        currentFilter={currentFilter}
        onRefresh={handleRefresh}
        onSearch={handleSearch}
        onFilter={handleFilter}
      />
      <MailContent 
        searchTerm={searchTerm}
        currentFilter={currentFilter}
        refreshTrigger={refreshTrigger}
        onMailCountChange={handleMailCountChange}
      />
    </div>
  )
}

export default Mail