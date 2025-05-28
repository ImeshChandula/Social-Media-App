import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";

const UserProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axiosInstance.get(`/users/getUserByUsername/:username`);
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  if (loading) return <div className="text-center mt-5">Loading profile...</div>;
  if (!user) return <div className="text-center mt-5">User not found</div>;

  return (
    <div className="container mt-4">
      <div className="card bg-secondary bg-opacity-10 text-white shadow-lg rounded-4 overflow-hidden">
        {/* Cover Photo */}
        <div
          className="position-relative"
          style={{
            height: "200px",
            backgroundImage: `url(${user.coverPhoto || "https://via.placeholder.com/1200x300?text=No+Cover"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Profile Picture */}
          <img
            src={user.profilePicture || "https://via.placeholder.com/150"}
            alt="Profile"
            className="rounded-circle border border-3 border-white position-absolute"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              bottom: "-60px",
              left: "30px",
              backgroundColor: "#fff",
            }}
          />
        </div>

        <div className="card-body pt-5 mt-4">
          {/* Name & Username */}
          <div className="d-flex justify-content-between align-items-start flex-wrap">
            <div>
              <h4 className="fw-bold mb-0">
                {user.firstName} {user.lastName}
              </h4>
              <small className="text-white-50">@{user.username}</small>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mt-3">
              <h6 className="fw-semibold">About</h6>
              <p className="text-white-50">{user.bio}</p>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-3">
            <h6 className="fw-semibold">Details</h6>
            <ul className="list-unstyled text-white-50 mb-0">
              {user.email && <li><strong>Email:</strong> {user.email}</li>}
              {user.role && <li><strong>Role:</strong> {user.role}</li>}
              {user.createdAt && (
                <li>
                  <strong>Joined:</strong>{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
