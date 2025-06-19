import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import MarketplaceCard from "../components/MarketplaceCard";

const MarketplaceAllProduct = () => {
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
            <h2 className="mb-4 text-light">Manage All Products</h2>
            <div className="row">
                {items.map(item => (
                    <MarketplaceCard
                        key={item.id}
                        item={item}
                        showCategory={true}
                        showAllDetails={true}
                        showContactDetails={true}
                        showActions={true}
                    />
                ))}
            </div>
        </div>
    );
};

export default MarketplaceAllProduct;