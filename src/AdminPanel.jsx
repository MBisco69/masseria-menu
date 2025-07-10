export default function AdminPanel({ allChoices }) {
  const totals = {};

  const language = "it"; // puoi dinamizzarlo se vuoi

  const otherKey = {
    it: "Altro",
    en: "Other",
    de: "Andere"
  }[language];

  allChoices.forEach(({ choices }) => {
    Object.entries(choices).forEach(([dish, qty]) => {
      if (dish === "other") {
        totals[otherKey] = choices[dish]; // metti direttamente la stringa
      } else {
        totals[dish] = (totals[dish] || 0) + qty;
      }
    });
  });

  return (
    <div style={{ padding: "30px", color: "#2e3e4f" }}>
      <h2 style={{ fontSize: "26px" }}>🛠️ Pannello Amministratore</h2>

      <h3 style={{ marginTop: "30px" }}>📋 Scelte per camera:</h3>
      <hr />
      <ul>
        {allChoices.map(({ room, choices }, idx) => (
          <li key={idx}>
            <strong>Camera {room}:</strong>{" "}
            {Object.entries(choices)
              .map(([dish, qty]) =>
                dish === "other" ? `${otherKey}: ${qty}` : `${dish}: ${qty}`
              )
              .join(", ")}
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: "30px" }}>🍽️ Totale piatti per tipo:</h3>
      <hr />
      <ul>
        {Object.entries(totals).map(([dish, qty], idx) => (
          <li key={idx}>
            {dish === otherKey ? `${dish}: ${qty}` : `${dish}: ${qty}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

