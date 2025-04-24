import React from "react";

function ProfilePage() {
  return (
    <div className="container text-center">
      <div className="position-relative mb-5">
        {/* Cover Image */}
        <img
          src="https://placehold.co/1000x200"
          alt="Cover"
          className="img-fluid w-100 rounded"
          style={{ objectFit: "cover", height: "200px" }}
        />

        {/* Profile Picture */}
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Profile"
          className="rounded-circle border border-white shadow"
          style={{
            width: "120px",
            height: "120px",
            objectFit: "cover",
            position: "absolute",
            bottom: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1
          }}
        />
      </div>

      {/* Name and Buttons */}
      <div className="mt-5 py-3">
        <h4 className="fw-bold">Shen Fernando</h4>
        <div className="d-flex justify-content-center flex-wrap gap-2 mt-2">
          <button className="btn btn-success">Edit Profile</button>
          <button className="btn btn-secondary">Add to Story</button>
        </div>
      </div>

      {/* Stats */}
      <div className="row mt-1">
        <div className="col-4 col-md-2 offset-md-3">
          <div><strong>1234</strong></div>
          <div>Friends</div>
        </div>
        <div className="col-4 col-md-2">
          <div><strong>468</strong></div>
          <div>Photos</div>
        </div>
        <div className="col-4 col-md-2">
          <div><strong>15</strong></div>
          <div>Videos</div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
