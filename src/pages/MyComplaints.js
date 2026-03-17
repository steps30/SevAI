import React, { useEffect, useState } from "react";

function MyComplaints() {
  const [my, setMy] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("complaints")) || [];
    setMy(stored);   // ✅ Show all complaints
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