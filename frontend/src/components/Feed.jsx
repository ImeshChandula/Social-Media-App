import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosInstance.get("/posts/feed");

        // Posts may be under res.data.posts or directly in res.data
        const postsData = res.data.posts || res.data || [];

        setPosts(postsData);
      } catch (err) {
        if (err.response) {
          setError(err.response.data?.msg || "Failed to fetch posts");
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading)
    return (
      <div className="text-white text-center my-4">Loading feed...</div>
    );

  if (error)
    return (
      <div className="text-danger text-center my-4">
        Error loading feed: {error}
      </div>
    );

  if (!posts.length)
    return <div className="text-white text-center my-4">No posts found</div>;

  return (
    <div>
      {posts.map((post, index) => (
        <div
          key={post._id || post.id || index}
          className="card bg-secondary bg-opacity-10 border-secondary text-white mb-4 p-3 rounded-4"
        >
          <div className="d-flex align-items-center mb-3">
            <img
              src={post.author?.profilePicture || "/default-profile.png"}
              alt="Profile"
              className="rounded-circle me-2"
              style={{ width: "45px", height: "45px", objectFit: "cover" }}
            />
            <div>
              <h6 className="mb-0 fw-bold text-white text-start">
                {post.author
                  ? `${post.author.firstName || ""} ${post.author.lastName || ""}`
                  : "Unknown Author"}
              </h6>
              <small className="text-white-50 text-start">
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleString()
                  : ""}
              </small>
            </div>
          </div>

          {/* Post Content */}
          <div className="card-body bg-dark">
            <p className="text-start text-white">{post.content}</p>

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div className="mt-3 text-white">
                {post.media.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`media-${idx}`}
                    className="img-fluid rounded mb-2"
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed;
