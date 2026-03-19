import React, { useEffect, useState } from "react";

function AdminPanel() {
  const [reviews, setReviews] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews");

  const BASE_URL = "http://localhost:3000";
  
  //Admin Login
  const handleLogin = () => {
    const email = prompt("Enter admin email:");
    if (email === "admin@gmail.com") {
      setIsAdmin(true);
    } else {
      alert("Access Denied ❌");
    }
  };

  //Fetch Reviews
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${BASE_URL}/reviews/pending`);
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error(error);
    }
  };

  //Fetch Businesses
  const fetchBusinesses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/business/pending`);
      const data = await res.json();
      setBusinesses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchReviews();
      fetchBusinesses();
    }
  }, [isAdmin]);

  //Approve Review
  const handleApprove = async (id) => {
    try {
      await fetch(`${BASE_URL}/reviews/${id}/approve`, {
        method: "POST",
      });
      fetchReviews(); // real-time update
    } catch (error) {
      alert("Error approving review ❌");
    }
  };

  //Reject Review
  const handleReject = async (id) => {
    try {
      await fetch(`${BASE_URL}/reviews/${id}/reject`, {
        method: "POST",
      });
      fetchReviews();
    } catch (error) {
      alert("Error rejecting review ❌");
    }
  };

  //Approve Business
  const approveBusiness = async (id) => {
    try {
      await fetch(`${BASE_URL}/business/${id}/approve`, {
        method: "POST",
      });
      fetchBusinesses();
    } catch (error) {
      alert("Error approving business ❌");
    }
  };

  //Reject Business
  const rejectBusiness = async (id) => {
    try {
      await fetch(`${BASE_URL}/business/${id}/reject`, {
        method: "POST",
      });
      fetchBusinesses();
    } catch (error) {
      alert("Error rejecting business ❌");
    }
  };

  //Login Screen
  if (!isAdmin) {
    return (
      <div style={styles.center}>
        <h2>Admin Login</h2>
        <button onClick={handleLogin} style={styles.loginBtn}>
          Login as Admin
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Admin Dashboard</h1>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          style={
            activeTab === "reviews"
              ? styles.activeTab
              : styles.inactiveTab
          }
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>

        <button
          style={
            activeTab === "businesses"
              ? styles.activeTab
              : styles.inactiveTab
          }
          onClick={() => setActiveTab("businesses")}
        >
          Businesses
        </button>
      </div>

      {loading ? (
        <p style={styles.message}>Loading...</p>
      ) : (
        <>
          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <div style={styles.section}>
              <h2>Pending Reviews ({reviews.length})</h2>

              {reviews.length === 0 ? (
                <p>No pending reviews</p>
              ) : (
                reviews.map((r) => (
                  <div key={r._id} style={styles.card}>
                    <h3>{r.businessName}</h3>
                    <p><strong>User:</strong> {r.userName}</p>
                    <p>{r.text}</p>
                    <p>⭐ {r.rating}</p>

                    <button
                      style={styles.approveBtn}
                      onClick={() => handleApprove(r._id)}
                    >
                      Approve
                    </button>

                    <button
                      style={styles.rejectBtn}
                      onClick={() => handleReject(r._id)}
                    >
                      Reject
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* BUSINESSES TAB */}
          {activeTab === "businesses" && (
            <div style={styles.section}>
              <h2>Pending Businesses ({businesses.length})</h2>

              {businesses.length === 0 ? (
                <p>No pending businesses</p>
              ) : (
                businesses.map((b) => (
                  <div key={b._id} style={styles.card}>
                    <h3>{b.name}</h3>
                    <p>{b.category}</p>

                    <button
                      style={styles.approveBtn}
                      onClick={() => approveBusiness(b._id)}
                    >
                      Approve
                    </button>

                    <button
                      style={styles.rejectBtn}
                      onClick={() => rejectBusiness(b._id)}
                    >
                      Reject
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Styling
const styles = {
  container: {
    padding: "20px",
    background: "#afd1f3",
    minHeight: "100vh",
  },
  heading: {
    textAlign: "center",
    fontSize: "40px",
  },
  tabContainer: {
    display: "flex",
    justifyContent: "center",
    margin: "20px auto",
    width: "500px",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#ddd",
  },
  activeTab: {
    flex: 1,
    padding: "10px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  inactiveTab: {
    flex: 1,
    padding: "10px",
    background: "#eee",
    border: "none",
    cursor: "pointer",
  },
  section: {
    marginTop: "20px",
  },
  card: {
    background: "#fff",
    padding: "15px",
    margin: "10px auto",
    width: "60%",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  approveBtn: {
    background: "green",
    color: "white",
    marginRight: "10px",
    padding: "6px 10px",
    border: "none",
    borderRadius: "5px",
  },
  rejectBtn: {
    background: "red",
    color: "white",
    padding: "6px 10px",
    border: "none",
    borderRadius: "5px",
  },
  center: {
    textAlign: "center",
    marginTop: "100px",
  },
  loginBtn: {
    padding: "10px 20px",
    background: "blue",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
  message: {
    textAlign: "center",
  },
};

export default AdminPanel;
