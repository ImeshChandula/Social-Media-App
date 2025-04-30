import React from "react";

function RightSidebar() {
  return (
    <div className="bg-black text-white p-3" style={{ width: "250px", height: "100vh" }}>
      <h6 className="text-muted-dark">Sponsored</h6>
      <div className="mb-4">
        <img src="https://via.placeholder.com/200x100" className="img-fluid rounded mb-2" alt="Ad" />
        <p className="small">Your ad here</p>
      </div>

      <h6 className="text-muted-dark">Contacts</h6>
      <ul className="list-unstyled">
        {["Alice", "Bob", "Charlie", "David"].map((contact) => (
          <li key={contact} className="d-flex align-items-center mb-2">
            <span className="me-2 bi bi-person-circle fs-4"></span>
            {contact}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RightSidebar;
