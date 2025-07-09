export default function AdminPanel({ allChoices }) {
  const totals = {};

  allChoices.forEach((entry) => {
    Object.entries(entry.choices).forEach(([dish, qty]) => {
      totals[dish] = (totals[dish] || 0) + qty;
    });
  });

  return (
    <div style={{ padding: "30px", maxWidth: "700px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px", fontSize: "28px" }}>
        🛠️ Pannello Amministratore
      </h2>

      <div style={{ marginBottom: "40px" }}>
        <h3 style={{ color: "#34495e", borderBottom: "1px solid #ccc", paddingBottom: "6px" }}>
          📋 Scelte per camera:
        </h3>
        {allChoices.length === 0 ? (
          <p style={{ color: "#888" }}>Nessuna scelta ricevuta.</p>
        ) : (
          <ul style={{ paddingLeft: "20px", color: "#2c3e50" }}>
            {allChoices.map((entry, index) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                <strong>Camera {entry.room}:</strong>{" "}
                {Object.entries(entry.choices)
                  .map(([dish, qty]) => `${dish}: ${qty}`)
                  .join(", ")}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 style={{ color: "#34495e", borderBottom: "1px solid #ccc", paddingBottom: "6px" }}>
          🍽️ Totale piatti per tipo:
        </h3>
        {Object.keys(totals).length === 0 ? (
          <p style={{ color: "#888" }}>Nessuna scelta ancora da sommare.</p>
        ) : (
          <ul style={{ paddingLeft: "20px", color: "#2c3e50" }}>
            {Object.entries(totals).map(([dish, qty], idx) => (
              <li key={idx}>
                {dish}: {qty}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
