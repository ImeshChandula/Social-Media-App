import React from "react";

function ProfilePage() {
  return (
    <div className="text-center">
      <div className="mb-3">
        <img
          src="https://placehold.co/1000x200" // Background
          alt="Cover"
          className="img-fluid w-100"
          style={{ objectFit: "cover", height: "200px" }}
        />
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Profile"
          className="rounded-circle border border-white"
          style={{
            width: "100px",
            height: "100px",
            marginTop: "-50px",
            position: "relative",
            zIndex: "1"
          }}
        />
      </div>
      <h4>Shen Fernando</h4>
      <div className="mb-3">
        <button className="btn btn-success me-2">Edit Profile</button>
        <button className="btn btn-secondary">Add to Story</button>
      </div>
      <div className="d-flex justify-content-center gap-4">
        <div><strong>1234</strong><div>Friends</div></div>
        <div><strong>468</strong><div>Photos</div></div>
        <div><strong>15</strong><div>Videos</div></div>
      </div>
    </div>
  );
}

export default ProfilePage;
