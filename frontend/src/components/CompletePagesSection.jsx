import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MyPagesSection from "./MyPagesSection";
import BrowseAllPages from "./BrowseAllPages";
import PagePostsManagement from "./PagePostsManagement";

const CompletePagesSection = ({ onViewPagePosts }) => {
  const [activeView, setActiveView] = useState('my-pages'); // 'my-pages', 'browse-all', 'create-page'
  const [selectedPage, setSelectedPage] = useState(null);
  const [showPagePosts, setShowPagePosts] = useState(false);

  // Handle page posts viewing
  const handleViewPagePosts = (page) => {
    setSelectedPage(page);
    setShowPagePosts(true);
    // Call parent callback if provided
    if (onViewPagePosts) {
      onViewPagePosts(page);
    }
  };

  // Handle navigation back from page posts
  const handleBackToPages = () => {
    setShowPagePosts(false);
    setSelectedPage(null);
  };

  // If showing page posts, render the page posts component
  if (showPagePosts && selectedPage) {
    return (
      <div>
        <div className="mb-4">
          <button
            className="btn btn-outline-secondary"
            onClick={handleBackToPages}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to My Pages
          </button>
        </div>
        <PagePostsManagement
          pageId={selectedPage.id || selectedPage._id}
          pageName={selectedPage.pageName}
          isOwner={true}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Navigation Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-center flex-wrap gap-2">
          <button
            className={`btn ${activeView === 'my-pages' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveView('my-pages')}
          >
            <i className="fas fa-user me-2"></i>
            My Pages
          </button>
          <button
            className={`btn ${activeView === 'browse-all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveView('browse-all')}
          >
            <i className="fas fa-globe me-2"></i>
            Browse All Pages
          </button>
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'my-pages' && (
            <MyPagesSection onViewPagePosts={handleViewPagePosts} />
          )}
          
          {activeView === 'browse-all' && (
            <BrowseAllPages />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CompletePagesSection;