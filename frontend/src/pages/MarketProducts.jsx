import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

const MarketProducts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItems = async () => {
    try {
      const response = await axiosInstance.get("/marketplace/getAllItems");
      setItems(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) return <div className="text-center mt-4">Loading products...</div>;
  if (error) return <div className="text-danger text-center mt-4">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Marketplace Products</h2>
      <div className="row">
        {items.map((item) => (
          <div className="col-md-4 mb-4" key={item.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-header d-flex align-items-center">
                <img
                  src={item.author?.profilePicture}
                  alt={item.author?.username}
                  className="rounded-circle me-2"
                  width="40"
                  height="40"
                  style={{ objectFit: "cover" }}
                />
                <small className="text-muted">{item.author?.username}</small>
              </div>

              {item.images && item.images.length > 0 && (
                <img
                  src={item.images[0]}
                  className="card-img-top"
                  alt={item.title}
                  style={{ height: "250px", objectFit: "cover" }}
                />
              )}

              <div className="card-body">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text">{item.description}</p>
                <p className="fw-bold">
                  {item.currency} {item.price}
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketProducts;
