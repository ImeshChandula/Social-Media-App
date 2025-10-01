import React, { useEffect, useState, useCallback } from "react";
import { axiosInstance } from "../lib/axios";
import MarketplaceCard from "../components/MarketplaceCard";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import useThemeStore from "../store/themeStore";

const MarketProducts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [strategy, setStrategy] = useState("hybrid");
  const [meta, setMeta] = useState(null);
  const { isDarkMode } = useThemeStore();

  const { authUser } = useAuthStore();

  const fetchItems = useCallback(async (refresh = false) => {
    try {
      const params = new URLSearchParams();
      params.append('strategy', strategy);
      if (refresh) params.append('refresh', 'true');

      const userId = authUser.id;
      if (userId) params.append('userId', userId);

      const response = await axiosInstance.get(`/marketplace/activeItems?${params}`);

      if (response.data.success) {
        setItems(response.data.data || []);
        setMeta(response.data.meta || null);
      } else {
        setError(response.data.message || "Failed to fetch items.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch items.");
      toast.error(err.response?.data?.message || "Failed to fetch items.")
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy]);

  // Track user interactions with items
  const trackInteraction = useCallback(async (itemId, action) => {
    const userId = authUser.id;
    if (!userId) return;

    try {
      await axiosInstance.post('/marketplace/track-interaction', {
        userId,
        itemId,
        action
      });

      // If using personalized strategy, refresh feed after interaction
      if (strategy === 'personalized') {
        setTimeout(() => fetchItems(), 1000);
      }
    } catch (err) {
      console.error('Failed to track interaction:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy, fetchItems]);

  // Handle item interactions (pass this to MarketplaceCard if it supports callbacks)
  const handleItemInteraction = (item, action = 'view') => {
    trackInteraction(item.id, action);
  };

  // Handle strategy change
  const handleStrategyChange = (event) => {
    setStrategy(event.target.value);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchItems(true);
  };

  // Fetch items when component mounts or strategy changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (loading) {
    return (
      <div className="normal-loading-spinner text-secondary">
        Loading<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center mt-4">
        Error: {error}
        <button
          className="btn btn-outline-danger btn-sm ms-2"
          onClick={() => fetchItems(true)}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header with controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className={`${isDarkMode ? "text-white" : "text-black"}`}>Marketplace</h2>

        <div className="d-flex align-items-center gap-3">
          {/* Strategy Selector */}
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="strategy-select" className="text-light small mb-0">
              Sort by:
            </label>
            <select
              id="strategy-select"
              value={strategy}
              onChange={handleStrategyChange}
              className="form-select form-select-sm"
              style={{ minWidth: '140px' }}
            >
              <option value="hybrid">Smart Mix</option>
              <option value="weighted">Recommended</option>
              <option value="random">Random</option>
              <option value="category-mixed">Category Mix</option>
              <option value="time-based">Time Based</option>
              <option value="personalized">For You</option>
              <option value="engagement-based">Popular</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className={`btn btn-sm border ${isDarkMode ? "btn-outline-light border-light" : "btn-outline-dark border-black"}`}
            title="Refresh feed"
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* Meta Info */}
      {meta && (
        <div className="mb-3">
          <small className={`text-${isDarkMode ? "secondary" : "muted"}`}>
            {items.length} items • {meta.strategy} • Updated {new Date(meta.timestamp).toLocaleTimeString()}
          </small>
        </div>
      )}

      {/* Items Grid */}
      <div className="row">
        {items.length > 0 ? (
          items.map(item => (
            <MarketplaceCard
              key={item.id}
              item={item}
              showCategory={true}
              showAllDetails={true}
              showContactDetails={true}
              showTags={false}
              // Pass interaction handler if MarketplaceCard supports it
              onInteraction={(action) => handleItemInteraction(item, action)}
            />
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info text-center">
              <h4>No items found</h4>
              <p>Try refreshing or check back later for new listings.</p>
              <button
                className="btn btn-primary"
                onClick={handleRefresh}
              >
                Refresh Feed
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Debug Info (remove in production) */}
      {import.meta.VITE_NODE_ENV === 'development' && meta && (
        <div className="mt-4 p-3 bg-dark text-light rounded">
          <small>
            <strong>Debug Info:</strong> Strategy: {meta.strategy} |
            Items: {items.length} |
            Timestamp: {meta.timestamp}
          </small>
        </div>
      )}
    </div>
  );
};

export default MarketProducts;
