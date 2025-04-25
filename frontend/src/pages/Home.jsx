import React from 'react';

const Home = () => {
  const stories = [
    {
      id: 1,
      name: "You",
      img: "https://randomuser.me/api/portraits/women/11.jpg",
      bg: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Aman",
      img: "https://randomuser.me/api/portraits/men/22.jpg",
      bg: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 3,
      name: "Priya",
      img: "https://randomuser.me/api/portraits/women/33.jpg",
      bg: "https://randomuser.me/api/portraits/men/32.jpg",
    },
  ];

  return (
    <div className=" py-5 py-md-0 mt-2 mt-md-0">
      {/* Post Input */}
      <div className="card bg-dark text-white mb-4 p-3 rounded-4">
        <div className="d-flex align-items-center mb-3">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="profile"
            className="rounded-circle me-2"
            style={{ width: "45px", height: "45px" }}
          />
          <input
            type="text"
            className="form-control rounded-pill bg-secondary text-white border-0"
            placeholder="What's on your mind?"
          />
        </div>
        <hr className="border-secondary" />
        <div className="d-flex justify-content-around text-muted-dark">
          <div><i className="bi bi-image me-1 text-danger"></i> Photo</div>
          <div><i className="bi bi-camera-video me-1 text-success"></i> Video</div>
          <div><i className="bi bi-emoji-smile me-1 text-warning"></i> Feeling</div>
        </div>
      </div>

      {/* Stories */}
      <div className="d-flex gap-3 overflow-auto mb-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className="position-relative rounded-4"
            style={{
              width: "110px",
              height: "180px",
              backgroundImage: `url(${story.bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              flex: "0 0 auto",
              borderRadius: "15px",
              overflow: "hidden",
            }}
          >
            <img
              src={story.img}
              alt={story.name}
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
              {story.name}
            </div>
          </div>
        ))}
      </div>

      
      {/* Feed Post */}
      <div className="card bg-dark text-white mb-4 p-3 rounded-4">
        <div className="d-flex align-items-center mb-3">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="user"
            className="rounded-circle me-2"
            style={{ width: "45px", height: "45px" }}
          />
          <div>
            <strong>John Doe</strong>
            <div className="text-muted-dark small">2 hrs ago</div>
          </div>
        </div>
        <p>This is a sample post from a friend. 👋</p>
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="post"
          className="img-fluid rounded-3"
        />
      </div>
    </div>
  );
};

export default Home;
