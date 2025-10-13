import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MyPagesSection from "./MyPagesSection";
import BrowseAllPages from "./BrowseAllPages";
import PagePostsManagement from "./PagePostsManagement";

const CompletePagesSection = ({ onViewPagePosts }) => {
  const [activeView, setActiveView] = useState("my-pages"); // 'my-pages', 'browse-all'
  const [selectedPage, setSelectedPage] = useState(null);
  const [showPagePosts, setShowPagePosts] = useState(false);

  // ===== Handle page posts viewing =====
  const handleViewPagePosts = (page) => {
    setSelectedPage(page);
    setShowPagePosts(true);
    if (onViewPagePosts) onViewPagePosts(page);
  };

  // ===== Back navigation =====
  const handleBackToPages = () => {
    setShowPagePosts(false);
    setSelectedPage(null);
  };

  // ===== Render Section Based on Active View =====
  const renderSection = () => {
    switch (activeView) {
      case "my-pages":
        return <MyPagesSection onViewPagePosts={handleViewPagePosts} />;
      case "browse-all":
        return <BrowseAllPages />;
      default:
        return <MyPagesSection onViewPagePosts={handleViewPagePosts} />;
    }
  };

  // ===== Show Page Posts (Overrides Other Views) =====
  if (showPagePosts && selectedPage) {
    return (
      <div className="container-fluid py-4">
        <div className="mb-4 d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={handleBackToPages}
          >
            <i className="bi bi-arrow-left"></i> Back to My Pages
          </button>
          <h5 className="mb-0 fw-semibold">{selectedPage.pageName}</h5>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PagePostsManagement
            pageId={selectedPage.id || selectedPage._id}
            pageName={selectedPage.pageName}
            isOwner={true}
          />
        </motion.div>
      </div>
    );
  }

  // ===== Main Page View (Navigation + Animated Content) =====
  return (
    <div className="py-4 py-md-0">
      {/* === Navigation Buttons === */}
      <div className="text-center mb-4">
        <div className="d-flex justify-content-center flex-wrap gap-2 pt-5 pt-md-0 mt-5 mt-md-0">
          <button
            className={`btn rounded-pill px-4 ${activeView === "my-pages"
              ? "btn-primary text-white"
              : "btn-outline-primary"
              }`}
            onClick={() => setActiveView("my-pages")}
          >
            My Pages
          </button>

          <button
            className={`btn rounded-pill px-4 ${activeView === "browse-all"
              ? "btn-primary text-white"
              : "btn-outline-primary"
              }`}
            onClick={() => setActiveView("browse-all")}
          >
            Browse All Pages
          </button>
        </div>
      </div>

      {/* === Animated Section Content === */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderSection()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CompletePagesSection;
