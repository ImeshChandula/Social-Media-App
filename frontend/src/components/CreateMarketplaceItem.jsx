import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

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
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const [categories, setCategories] = useState([]);
    const [catLoading, setCatLoading] = useState(true);
    const [catError, setCatError] = useState("");

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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axiosInstance.get("/categories/active/marketplace");
                setCategories(res.data.data);
                setCatError("");
            } catch (err) {
                setCatError("Failed to load categories");
            } finally {
                setCatLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const dataToSend = { ...formData, images };

        try {
            const res = await axiosInstance.post("/marketplace/createItem", dataToSend);
            toast.success(res.data.message);
            setFormData(initialState);
            setImages(null);
            setPreviewUrl("");
            navigate(location?.state?.from || -1);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to create item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="marketplace-form container p-4 bg-white shadow rounded mt-4">
            <h2 className="text-center mb-4 fw-bold text-primary">Create Marketplace Item</h2>

            <div className="row g-4">
                <div className="col-md-6">
                    <label className="text-black">Category</label>
                    {catLoading ? (
                        <div className="form-control bg-light text-muted">Loading categories...</div>
                    ) : catError ? (
                        <div className="text-danger">{catError}</div>
                    ) : categories.length === 0 ? (
                        <div className="text-muted">No active categories available</div>
                    ) : (
                        <select
                            name="category"
                            className="form-select"
                            value={formData.category}
                            required
                            onChange={handleChange}
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

                <div className="col-md-6">
                    <label className="text-black">Title</label>
                    <input type="text" name="title" className="form-control" placeholder="Enter item title" required onChange={handleChange} />
                </div>

                <div className="col-12">
                    <label className="text-black">Description</label>
                    <textarea name="description" rows="4" className="form-control" placeholder="Enter a brief description" onChange={handleChange}></textarea>
                </div>

                <div className="col-md-6">
                    <label className="text-black">Price</label>
                    <input type="number" name="price" className="form-control" placeholder="Enter item price" required onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <label className="text-black">Currency</label>
                    <input type="text" name="currency" className="form-control" defaultValue="USD" placeholder="e.g., USD, EUR" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <label className="text-black">Phone</label>
                    <input type="text" name="contactDetails.phone" className="form-control" placeholder="Enter phone number" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <label className="text-black">Email</label>
                    <input type="email" name="contactDetails.email" className="form-control" placeholder="Enter contact email" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <label className="text-black">City</label>
                    <input type="text" name="location.city" className="form-control" placeholder="Enter city" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <label className="text-black">State</label>
                    <input type="text" name="location.state" className="form-control" placeholder="Enter state" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <label className="text-black">Country</label>
                    <input type="text" name="location.country" className="form-control" placeholder="Enter country" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <label className="text-black">Postal Code</label>
                    <input type="text" name="location.postalCode" className="form-control" placeholder="Enter postal code" onChange={handleChange} />
                </div>

                <div className="col-md-6">
                    <label className="text-black">Condition</label>
                    <select name="conditionType" className="form-select" onChange={handleChange}>
                        <option value="new">New</option>
                        <option value="like_new">Like New</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="text-black">Quantity</label>
                    <input type="number" name="quantity" min="1" className="form-control" placeholder="Enter quantity" onChange={handleChange} />
                </div>

                <div className="col-md-6 d-flex align-items-center">
                    <input type="checkbox" name="isNegotiable" className="form-check-input me-2" onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })} />
                    <label className="form-check-label text-dark">Price is Negotiable</label>
                </div>

                <div className="col-md-6">
                    <label className="text-black">Tags</label>
                    <input type="text" name="tags" className="form-control" placeholder="Comma-separated tags (e.g. iPhone, mobile)" onChange={handleChange} />
                </div>

                <div className="col-12">
                    <label className="text-black">Upload Image</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
                    {previewUrl && (
                        <div className="mt-3">
                            <img src={previewUrl} alt="Preview" className="img-thumbnail" style={{ maxWidth: "250px" }} />
                        </div>
                    )}
                </div>

                <div className="col-12 text-center mt-4">
                    <button
                        type="submit"
                        className="btn btn-primary px-4 py-2 fw-semibold"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Submitting...
                            </>
                        ) : (
                            "Submit Item"
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default CreateMarketplaceItem;
