import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

const MarketMyProducts = () => {
    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axiosInstance.get("/marketplace/myItems");
                setMyItems(response.data.data || []);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch items");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    if (loading) return <div className="p-4 text-center">Loading your items...</div>;
    if (error)
        return <div className="alert alert-danger m-4">Error: {error}</div>;

    return (
        <div className="container mt-4">
            <div className="row">
                {myItems.length === 0 ? (
                    <div className="col-12 text-center text-muted">
                        No items found.
                    </div>
                ) : (
                    myItems.map((item) => (
                        <div className="col-sm-6 col-lg-4 mb-4" key={item.id}>
                            <div className="card h-100 shadow-sm">
                                {item.images && item.images.length > 0 && (
                                    <img
                                        src={item.images[0]}
                                        alt={item.title}
                                        className="card-img-top"
                                        style={{ height: "200px", objectFit: "contain" }}
                                    />
                                )}
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{item.title}</h5>
                                    <p className="card-text text-muted mb-1">
                                        <strong>Category:</strong> {item.category}
                                    </p>
                                    <p className="card-text text-muted mb-1">
                                        <strong>Price:</strong> {item.currency} {item.price}
                                    </p>
                                    <p className="card-text small text-secondary">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MarketMyProducts;