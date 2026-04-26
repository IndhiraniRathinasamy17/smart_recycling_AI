import { useState } from "react";

function App() {
  const [item, setItem] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);

  const getColor = (category) => {
    if (category === "recyclable") return "#2ecc71";
    if (category === "hazardous" || category === "e-waste") return "#e74c3c";
    return "#f39c12";
  };

  const handleSubmit = async () => {
    if (!item) return alert("Enter an item");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item }),
      });

      const data = await res.json();
      setResult(data);
      setShops([]); // clear old shops
    } catch (err) {
      alert("Error connecting to backend");
    }

    setLoading(false);
  };

  const getShops = async () => {
    if (!location) return alert("Enter location");

    try {
      const res = await fetch("http://127.0.0.1:5000/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location }),
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setShops(data);
      } else {
        alert(data.error || "No shops found");
        setShops([]);
      }
    } catch (err) {
      alert("Error fetching shops");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>♻️ Smart Recycling AI</h1>

      {/* INPUT */}
      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Enter item (e.g. plastic bottle, battery)"
        />
        <button style={styles.button} onClick={handleSubmit}>
          Classify
        </button>
      </div>

      {loading && <p>⏳ Analyzing...</p>}

      {/* RESULT */}
      {result && (
        <div style={styles.card}>
          <h2 style={{ color: getColor(result.category) }}>
            {result.category.toUpperCase()}
          </h2>

          <p><b>Confidence:</b> {result.confidence}</p>

          {/* Disposal */}
          <div style={styles.section}>
            <h3>🗑 Disposal</h3>
            <p>{result.disposal_instructions}</p>
          </div>

          {/* Ideas */}
          <div style={styles.section}>
            <h3>💡 Ideas</h3>

            {result.ideas.length === 0 ? (
              <p style={{ color: "#888" }}>No safe ideas available</p>
            ) : (
              result.ideas.map((idea, i) => (
                <div key={i} style={styles.ideaCard}>
                  <h4>{idea.title}</h4>
                  <p>⏱ {idea.time_minutes} mins | ⭐ {idea.difficulty}</p>

                  <ul>
                    {idea.steps.map((step, j) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* LOCATION INPUT */}
          <div style={{ marginTop: "20px" }}>
            <h3>📍 Find Nearby Recycling Shops</h3>

            <input
              style={styles.input}
              placeholder="Enter your city (e.g. Chennai)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <button style={styles.button} onClick={getShops}>
              Find Shops
            </button>
          </div>
        </div>
      )}

      {/* SHOPS DISPLAY */}
      {shops.length > 0 && (
        <div style={styles.card}>
          <h3>📍 Nearby Recycling Shops</h3>

          {shops.map((shop, i) => (
            <div key={i} style={styles.shopCard}>
              <b>{shop.name}</b>
              <p>{shop.address}</p>

              <a href={shop.maps_link} target="_blank" rel="noreferrer">
                Open in Map
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial",
    textAlign: "center",
    background: "#f4f6f8",
    minHeight: "100vh",
    padding: "40px"
  },
  title: {
    marginBottom: "20px"
  },
  inputContainer: {
    marginBottom: "20px"
  },
  input: {
    padding: "12px",
    width: "280px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    margin: "5px"
  },
  button: {
    padding: "12px 20px",
    background: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    width: "500px",
    margin: "20px auto",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
  },
  section: {
    marginTop: "20px",
    textAlign: "left"
  },
  ideaCard: {
    background: "#fafafa",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd"
  },
  shopCard: {
    background: "#eef9f1",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }
};

export default App;