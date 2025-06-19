import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import MarketplaceCard from "../components/MarketplaceCard";

const MarketMyProducts = () => {
    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

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

    const handleCreate = () => {
        navigate("/create-marketplace-item");
    };

    const handleDelete = (itemId) => {
        setMyItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    };

    if (loading) {
        return (
            <div className="normal-loading-spinner">
                Loading<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-4 text-center">Error: {error}</div>
        );
    }

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-light">My Products</h2>
                <button className="create-item-button" onClick={handleCreate}>
                    <span className="plus-icon">+</span> Add Item
                </button>
            </div>
            <div className="row">
                {myItems.length === 0 ? (
                    <div className="col-12 text-center marketplace-text-muted">No items found.</div>
                ) : (
                    myItems.map(item => (
                        <MarketplaceCard
                            key={item.id}
                            item={item}
                            showAuthor={true}
                            showCategory={true}
                            showActions={true}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default MarketMyProducts;
