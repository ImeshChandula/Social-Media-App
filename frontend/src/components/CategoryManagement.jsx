import React, { useState } from 'react';
import CategoryHeader from './CategoryHeader ';
import CategoryListJobRole from './CategoryListJobRole ';
import CategoryListMarketplace from './CategoryListMarketplace';
import '../styles/CategoryManagement.css';

const CategoryManagement = () => {
    const [activeTab, setActiveTab] = useState('jobRole');
    const [showButtons, setShowButtons] = useState(true);

  return (
    <div className='manage-container'>
            <div className='manage-content'>
                <CategoryHeader setShowButtons={setShowButtons} />

                {showButtons && (
                    <div className="tab-buttons">
                        <button
                            className={`tab-button ${activeTab === 'jobRole' ? 'active' : ''}`}
                            onClick={() => setActiveTab('jobRole')}
                        >
                            Job Roles
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'marketplace' ? 'active' : ''}`}
                            onClick={() => setActiveTab('marketplace')}
                        >
                            Marketplace
                        </button>
                    </div>
                )}

                {showButtons && activeTab === 'jobRole' && <CategoryListJobRole />}
                {showButtons && activeTab === 'marketplace' && <CategoryListMarketplace />}
            </div>
        </div>
  )
}

export default CategoryManagement