import React, { useState } from 'react';
import CategoryHeader from './CategoryHeader ';
import CategoryListJobRole from './CategoryListJobRole ';
import CategoryListMarketplace from './CategoryListMarketplace';
import CategoryListPages from './CategoryListPages';
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
                            className={`tab-button ${activeTab === 'jobRole' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('jobRole')}
                        >
                            Job Roles
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'marketplace' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('marketplace')}
                        >
                            Marketplace
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'pages' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('pages')}
                        >
                            Pages
                        </button>
                    </div>
                )}

                {showButtons && activeTab === 'jobRole' && <CategoryListJobRole />}
                {showButtons && activeTab === 'marketplace' && <CategoryListMarketplace />}
                {showButtons && activeTab === 'pages' && <CategoryListPages />}
            </div>
        </div>
  )
}

export default CategoryManagement