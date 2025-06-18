import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import MarketplaceCard from "../components/MarketplaceCard";

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

    if (loading) {
        return (
            <div className="normal-loading-spinner">
                Loading<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
            </div>
        )
    }
    
    if (error) return <div className="alert alert-danger m-4 text-center">Error: {error}</div>;

    return (
        <div className="container">
            <h2 className="mb-4 text-light">My Products</h2>
            <div className="row">
                {myItems.length === 0 ? (
                    <div className="col-12 text-center marketplace-text-muted">No items found.</div>
                ) : (
                    myItems.map(item => (
                        <MarketplaceCard key={item.id} item={item} showAuthor={false} showCategory={true} />
                    ))
                )}
            </div>
        </div>
    );
};

export default MarketMyProducts;
