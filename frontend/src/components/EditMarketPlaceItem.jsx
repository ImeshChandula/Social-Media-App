import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const EditMarketPlaceItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        category: '',
        title: '',
        description: '',
        price: '',
        currency: 'USD',
        contactDetails: {
            phone: '',
            email: '',
            whatsapp: '',
        },
        location: {
            city: '',
            state: '',
            country: '',
            postalCode: '',
        },
        conditionType: '',
        status: 'active',
        expireDate: '',
        images: null,
    });

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [catLoading, setCatLoading] = useState(true);
    const [catError, setCatError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemRes, categoryRes] = await Promise.all([
                    axiosInstance.get("/marketplace/myItems"),
                    axiosInstance.get("/categories/active/marketplace"),
                ]);

                const item = itemRes.data.data.find((itm) => itm.id === id);
                if (!item) {
                    toast.error("Item not found");
                    return navigate(-1);
                }

                setFormData({
                    ...item,
                    contactDetails: {
                        phone: item.contactDetails?.phone || '',
                        email: item.contactDetails?.email || '',
                        whatsapp: item.contactDetails?.whatsapp || '',
                    },
                    location: item.location || { city: "", state: "", country: "", postalCode: "" },
                    expireDate: item.expireDate ? item.expireDate.split('T')[0] : '',
                    images: null,
                });

                setCategories(categoryRes.data.data);
                setCatError("");
            } catch (error) {
                setCatError("Failed to load categories");
                toast.error(error?.response?.data?.message || "Update failed");
            } finally {
                setCatLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes("contactDetails.")) {
            const key = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                contactDetails: {
                    ...prev.contactDetails,
                    [key]: value,
                },
            }));
        } else if (name.includes("location.")) {
            const key = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                location: {
                    ...prev.location,
                    [key]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({
            ...prev,
            images: files,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSend = { ...formData };

            // Set default expireDate if not provided
            if (!formData.expireDate) {
                const defaultExpire = new Date();
                defaultExpire.setDate(defaultExpire.getDate() + 30);
                dataToSend.expireDate = defaultExpire.toISOString().split("T")[0];
            }

            // Handle image encoding if present
            if (formData.images) {
                const base64Images = await Promise.all(
                    formData.images.map((file) =>
                        new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        })
                    )
                );
                dataToSend.images = base64Images;
            } else {
                delete dataToSend.images;
            }

            const res = await axiosInstance.patch(`/marketplace/update/${id}`, dataToSend);
            if (res.data.success) {
                toast.success(res.data.message || "Item updated successfully");
                navigate(-1);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">Edit Marketplace Item</h2>
            <form onSubmit={handleSubmit}>
                {/* Existing Fields */}
                <div className="form-group mb-3">
                    <label>Title</label>
                    <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="form-group mb-3">
                    <label>Category</label>
                    {catLoading ? (
                        <div className="form-control bg-light text-muted">Loading categories...</div>
                    ) : catError ? (
                        <div className="text-danger">{catError}</div>
                    ) : categories.length === 0 ? (
                        <div className="text-muted">No active categories found</div>
                    ) : (
                        <select
                            name="category"
                            className="form-select"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="form-group mb-3">
                    <label>Description</label>
                    <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} />
                </div>

                <div className="form-group mb-3">
                    <label>Price</label>
                    <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required />
                </div>

                <div className="form-group mb-3">
                    <label>Currency</label>
                    <input type="text" name="currency" className="form-control" value={formData.currency} onChange={handleChange} required />
                </div>

                <div className="form-group mb-3">
                    <label>Condition</label>
                    <select name="conditionType" className="form-select" value={formData.conditionType} onChange={handleChange}>
                        <option value="">Select condition</option>
                        <option value="new">New</option>
                        <option value="like_new">Like New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>

                <div className="form-group mb-3">
                    <label>Status</label>
                    <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                        <option value="active">Active</option>
                        <option value="sold">Sold</option>
                        <option value="expired">Expired</option>
                        <option value="removed">Removed</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                {/* New Fields */}
                <div className="form-group mb-3">
                    <label>Phone</label>
                    <input type="text" name="contactDetails.phone" className="form-control" value={formData.contactDetails.phone} onChange={handleChange} />
                </div>

                <div className="form-group mb-3">
                    <label>Email</label>
                    <input type="email" name="contactDetails.email" className="form-control" value={formData.contactDetails.email} onChange={handleChange} />
                </div>

                <div className="form-group mb-3">
                    <label>WhatsApp Number</label>
                    <input type="text" name="contactDetails.whatsapp" className="form-control" value={formData.contactDetails.whatsapp} onChange={handleChange} />
                </div>

                <div className="form-group mb-3">
                    <label>Expire Date</label>
                    <input type="date" name="expireDate" className="form-control" value={formData.expireDate} onChange={handleChange} />
                </div>

                <div className="form-group mb-3">
                    <label>City</label>
                    <input type="text" name="location.city" className="form-control" value={formData.location.city} onChange={handleChange} />
                </div>

                <div className="form-group mb-3">
                    <label>State</label>
                    <input type="text" name="location.state" className="form-control" value={formData.location.state} onChange={handleChange} />
                </div>

                <div className="form-group mb-3">
                    <label>Country</label>
                    <input type="text" name="location.country" className="form-control" value={formData.location.country} onChange={handleChange} />
                </div>

                <div className="form-group mb-3">
                    <label>Postal Code</label>
                    <input type="text" name="location.postalCode" className="form-control" value={formData.location.postalCode} onChange={handleChange} />
                </div>

                <div className="form-group mb-3">
                    <label>Upload Images (optional)</label>
                    <input type="file" className="form-control" onChange={handleImageChange} multiple />
                </div>

                <button className="btn btn-success" type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Item"}
                </button>
            </form>
        </div>
    );
};

export default EditMarketPlaceItem;
