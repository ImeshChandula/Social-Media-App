import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

const ManageMarketplace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="normal-loading-spinner">
        Loading<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </div>
    )
  }
  if (error) return <div className="alert alert-danger mt-4 text-center">Error: {error}</div>;

  return (
    <div className="container">
      <h2 className="mb-4 text-light">Manage Marketplace</h2>
      <div className="row">
        {items.map((item) => (
          <div className="col-lg-4 col-md-6 mb-4" key={item.id}>
            <div className="marketplace-card card h-100">
              <div className="card-header d-flex align-items-center border-secondary bg-dark marketplace-header">
                <img
                  src={item.author?.profilePicture}
                  alt={item.author?.username}
                  className="rounded-circle me-2"
                  width="40"
                  height="40"
                  style={{ objectFit: "cover" }}
                />
                <small>{item.author?.username}</small>
              </div>

              {item.images?.length > 0 && (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="marketplace-image card-img-top"
                />
              )}

              <div className="card-body">
                <h5 className="marketplace-card-title card-title">{item.title}</h5>
                <p className="marketplace-card-text card-text">{item.description}</p>
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

export default ManageMarketplace;
