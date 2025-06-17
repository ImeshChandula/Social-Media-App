import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios"; // adjust path as needed

const MarketProducts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItems = async () => {
    try {
      const response = await axiosInstance.get("/marketplace/getAllItems");
      setItems(response.data.data || []);
    } catch (err) {
      console.error("Error fetching marketplace items:", err);
      setError(err.response?.data?.message || "Failed to fetch items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) return <div>Loading market products...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div>
      <h2>Marketplace Products</h2>
      {items.length === 0 ? (
        <p>No items available.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item._id}>
              <strong>{item.title}</strong> - ${item.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MarketProducts;
