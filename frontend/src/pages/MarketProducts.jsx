import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import MarketplaceCard from "../components/MarketplaceCard";

const MarketProducts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosInstance.get("/marketplace/activeItems");
        setItems(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch items.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="normal-loading-spinner">
        Loading<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </div>
    )
  }

  if (error) return <div className="alert alert-danger text-center mt-4">Error: {error}</div>;

  return (
    <div className="container">
      <h2 className="mb-4 text-light">Marketplace</h2>
      <div className="row">
        {items.map(item => (
          <MarketplaceCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MarketProducts;
