import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const EditMarketPlaceItem = () => {
    const { id } = useParams(); // URL param: /edit/:id
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
        },
        location: {
            city: '',
            state: '',
            country: '',
            postalCode: '',
        },
        conditionType: '',
        status: 'active',
        images: null,
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await axiosInstance.get(`/marketplace/myItems`);
                const item = res.data.data.find((itm) => itm.id === id);
                if (!item) {
                    toast.error("Item not found");
                    return navigate('/marketplace');
                }
                setFormData({
                    ...item,
                    contactDetails: item.contactDetails || { phone: '', email: '' },
                    location: item.location || { city: '', state: '', country: '', postalCode: '' },
                    images: null,
                });
            } catch (error) {
                toast.error(error?.response?.data?.message || "Update failed");
            }
        };

        fetchItem();
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
            const dataToSend = {
                ...formData
            };

            // 🧹 Remove `isAccept` if it exists to avoid backend restriction
            delete dataToSend.isAccept;

            // 🧹 Handle image conversion
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
                <div className="form-group mb-3">
                    <label>Title</label>
                    <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="form-group mb-3">
                    <label>Category</label>
                    <input type="text" name="category" className="form-control" value={formData.category} onChange={handleChange} required />
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
                    <label>Phone</label>
                    <input type="text" name="contactDetails.phone" className="form-control" value={formData.contactDetails.phone} onChange={handleChange} />
                </div>
                <div className="form-group mb-3">
                    <label>Email</label>
                    <input type="email" name="contactDetails.email" className="form-control" value={formData.contactDetails.email} onChange={handleChange} />
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
