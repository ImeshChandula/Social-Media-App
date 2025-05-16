import React from "react";

const mockPeople = new Array(6).fill({
    name: "Mike Ciat",
    mutualFriends: 5,
    img: "https://randomuser.me/api/portraits/men/32.jpg",
});

function Members() {
    return (
        <div className="text-white min-vh-100 p-3 py-5 py-md-0 mt-2 mt-md-0">

            {/* Heading + Search */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-2">
                <h4 className="fw-bold mb-0">People You May Know</h4>
                <input
                    type="text"
                    placeholder="Search People"
                    className="form-control"
                    style={{
                        maxWidth: "100%",
                        width: "250px",
                        backgroundColor: "#fff",
                        color: "#000",
                        border: "none",
                    }}
                />
            </div>

            {/* Member Cards */}
            <div className="row g-4">
                {mockPeople.map((person, index) => (
                    <div className="col-6 col-sm-6 col-md-4 col-lg-3" key={index}>
                        <div className="card h-100 text-white bg-dark border-success border-2 rounded-4 shadow">
                            <img
                                src={person.img}
                                alt={person.name}
                                className="card-img-top"
                                style={{
                                    height: "160px",
                                    objectFit: "cover",
                                }}
                            />
                            <div
                                className="card-body d-flex flex-column justify-content-between"
                                style={{ minHeight: "150px" }}
                            >
                                <div>
                                    <h5 className="card-title mb-1">{person.name}</h5>
                                    <small className="text-muted-dark">
                                        {person.mutualFriends} mutual friends
                                    </small>
                                </div>
                                <button className="btn btn-success mt-3 w-100">Add Friend</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Members;
