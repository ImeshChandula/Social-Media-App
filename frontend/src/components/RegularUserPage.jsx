import React, { useEffect, useState } from "react";
import { getFeedStories } from "../api/storyAPI";
import Feed from "./Feed";

const RegularUserPage = () => {
    const [stories, setStories] = useState([]);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const response = await getFeedStories();
                setStories(response.data); // Adjust if backend wraps data
            } catch (error) {
                console.error("Error loading stories:", error);
            }
        };

        fetchStories();
    }, []);

    return (
        <div className="py-5 py-md-0 mt-2 mt-md-0">
            {/* Stories */}
            <div className="d-flex gap-3 overflow-auto mb-4">
                {stories.map((story) => (
                    <div
                        key={story._id}
                        className="position-relative rounded-4"
                        style={{
                            width: "110px",
                            height: "180px",
                            backgroundImage: `url(${story.bg || story.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            flex: "0 0 auto",
                            borderRadius: "15px",
                            overflow: "hidden",
                        }}
                    >
                        <img
                            src={story.profileImage || "https://via.placeholder.com/40"}
                            alt={story.author || "User"}
                            className="rounded-circle border border-2 border-primary"
                            style={{
                                width: "40px",
                                height: "40px",
                                position: "absolute",
                                top: "10px",
                                left: "10px",
                                objectFit: "cover",
                            }}
                        />
                        <div
                            className="position-absolute bottom-0 start-0 end-0 text-white text-center"
                            style={{
                                background: "rgba(0, 0, 0, 0.4)",
                                fontSize: "14px",
                                padding: "5px",
                            }}
                        >
                            {story.author || story.name}
                        </div>
                    </div>
                ))}
            </div>

            <Feed />
        </div>
    );
};

export default RegularUserPage;
