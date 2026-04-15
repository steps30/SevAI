import React, { useEffect, useState } from "react";

function MyComplaints() {
  const [my, setMy] = useState([]);

  useEffect(() => {
  fetch("http://127.0.0.1:5000/admin")
    .then(res => res.json())
    .then(data => setMy(data));
}, []);

  return (
    <div className="container">
      <h2>My Complaints</h2>

      {my.length === 0 ? (
        <p>No complaints submitted yet.</p>
      ) : (
        my.map((c) => (
          <div className="card" key={c.id}>
            <p><strong>ID:</strong> {c.trackingId}</p>
            <p><strong>Complaint:</strong> {c.complaint}</p>
            <p><strong>Status:</strong> {c.status}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyComplaints;