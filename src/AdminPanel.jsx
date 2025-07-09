export default function AdminPanel({ allChoices }) {
  const calculateTotals = () => {
    const totals = {};
    allChoices.forEach(({ choices, other }) => {
      Object.entries(choices).forEach(([dish, qty]) => {
        totals[dish] = (totals[dish] || 0) + qty;
      });
      if (other) {
        totals[other] = (totals[other] || 0) + 1;
      }
    });
    return totals;
  };

  const totals = calculateTotals();

  return (
    <div style={{ padding: "20px", fontFamily: "'Lora', serif" }}>
      <h2 style={{ color: "#4a5f44" }}>Pannello Amministratore</h2>

      <h3>Scelte per camera:</h3>
      <ul>
        {allChoices.map((entry, index) => (
          <li key={index}>
            <strong>Camera {entry.room}:</strong>{" "}
            {Object.entries(entry.choices).map(([dish, qty]) => `${dish}: ${qty}`).join(", ")}
            {entry.other && ` | Altro: ${entry.other}`}
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: "20px" }}>Totale piatti per tipo:</h3>
      <ul>
        {Object.entries(totals).map(([dish, qty], idx) => (
          <li key={idx}>{dish}: {qty}</li>
        ))}
      </ul>
    </div>
  );
}
