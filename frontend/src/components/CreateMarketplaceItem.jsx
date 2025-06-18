import React, { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const initialState = {
    category: "",
    title: "",
    description: "",
    price: "",
    currency: "USD",
    contactDetails: {
        phone: "",
        email: "",
    },
    location: {
        city: "",
        state: "",
        country: "",
        postalCode: "",
    },
    conditionType: "new",
    quantity: 1,
    isNegotiable: false,
    tags: [],
};

const CreateMarketplaceItem = () => {
    const [formData, setFormData] = useState(initialState);
    const [images, setImages] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes("contactDetails.") || name.includes("location.")) {
            const [parent, key] = name.split(".");
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [key]: value,
                },
            }));
        } else if (name === "tags") {
            setFormData((prev) => ({
                ...prev,
                tags: value.split(",").map((tag) => tag.trim()),
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImages(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dataToSend = {
            ...formData,
            images,
        };

        try {
            const res = await axiosInstance.post("/marketplace/createItem", dataToSend);
            toast.success(res.data.message);
            setFormData(initialState);
            setImages(null);
            setPreviewUrl("");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to create item");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="marketplace-form container p-4 bg-light shadow-sm rounded">
            <h2 className="text-center mb-4 fw-bold text-primary">Post a Marketplace Item</h2>

            <div className="row g-3">
                <div className="col-md-6">
                    <input type="text" name="category" className="form-control marketplace-input" placeholder="Category" required onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <input type="text" name="title" className="form-control marketplace-input" placeholder="Title" required onChange={handleChange} />
                </div>

                <div className="col-12">
                    <textarea name="description" rows="3" className="form-control marketplace-input" placeholder="Description" onChange={handleChange}></textarea>
                </div>

                <div className="col-md-6">
                    <input type="number" name="price" className="form-control marketplace-input" placeholder="Price" required onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <input type="text" name="currency" className="form-control marketplace-input" defaultValue="USD" placeholder="Currency (e.g. USD)" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <input type="text" name="contactDetails.phone" className="form-control marketplace-input" placeholder="Phone" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <input type="email" name="contactDetails.email" className="form-control marketplace-input" placeholder="Email" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <input type="text" name="location.city" className="form-control marketplace-input" placeholder="City" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <input type="text" name="location.state" className="form-control marketplace-input" placeholder="State" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <input type="text" name="location.country" className="form-control marketplace-input" placeholder="Country" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <input type="text" name="location.postalCode" className="form-control marketplace-input" placeholder="Postal Code" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <select name="conditionType" className="form-select marketplace-input" onChange={handleChange}>
                        <option value="new">New</option>
                        <option value="like_new">Like New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <input type="number" name="quantity" min="1" className="form-control marketplace-input" placeholder="Quantity" onChange={handleChange} />
                </div>

                <div className="col-md-6 d-flex align-items-center">
                    <input type="checkbox" name="isNegotiable" className="form-check-input me-2" onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })} />
                    <label className="form-check-label text-black">Negotiable</label>
                </div>

                <div className="col-md-6">
                    <input type="text" name="tags" className="form-control marketplace-input" placeholder="Tags (comma separated)" onChange={handleChange} />
                </div>

                <div className="col-md-12">
                    <label className="form-label">Upload Image:</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="form-control marketplace-input" />
                    {previewUrl && (
                        <div className="mt-3">
                            <img src={previewUrl} alt="Preview" className="img-thumbnail w-100" style={{ maxWidth: "250px" }} />
                        </div>
                    )}
                </div>

                <div className="col-12 text-center mt-3">
                    <button type="submit" className="btn btn-primary px-4 py-2">Submit Item</button>
                </div>
            </div>
        </form>
    );
};

export default CreateMarketplaceItem;
