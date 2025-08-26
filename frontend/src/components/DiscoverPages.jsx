// DiscoverPages.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import PageDetail from './PageDetail';

const DiscoverPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPageDetail, setShowPageDetail] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(null);

  useEffect(() => {
    fetchAllPages();
  }, []);

  const fetchAllPages = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/pages');
      if (res.data.success) {
        setPages(res.data.pages || []);
      }
    } catch (error) {
      console.error('Error fetching all pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPage = (pageId) => {
    setSelectedPageId(pageId);
    setShowPageDetail(true);
  };

  return (
    <div className="my-5">
      <div className="card bg-white border shadow rounded mb-4">
        <div className="card-body p-4">
          <h5 className="text-dark mb-3">Discover Pages</h5>
          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : (
            <div className="row g-4">
              {pages.map((page, index) => (
                <div key={page.id} className="col-md-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card bg-white border shadow rounded h-100"
                  >
                    <div className="card-body">
                      <h6 className="text-dark">{page.pageName}</h6>
                      <p className="text-muted small">{page.description?.substring(0, 100)}...</p>
                      <button className="btn btn-outline-primary" onClick={() => handleViewPage(page.id)}>View</button>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPageDetail && (
        <PageDetail
          show={showPageDetail}
          onClose={() => setShowPageDetail(false)}
          pageId={selectedPageId}
          isOwner={false} // In discover, not necessarily owner
        />
      )}
    </div>
  );
};

export default DiscoverPages;