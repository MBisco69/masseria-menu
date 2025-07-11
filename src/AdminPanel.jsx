import { useEffect, useState } from "react";
import { db } from "./firebase";
import { onValue, ref, remove } from "firebase/database";

export default function AdminPanel() {
  const [allChoices, setAllChoices] = useState([]);

  const language = "it";
  const otherKey = "Altro";

  // Lettura in tempo reale da Firebase
  useEffect(() => {
    const scelteRef = ref(db, "scelte");
    const unsubscribe = onValue(scelteRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const array = Object.values(data);
        setAllChoices(array);
      } else {
        setAllChoices([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Calcolo totali
  const totals = {};
  allChoices.forEach(({ choices }) => {
    Object.entries(choices).forEach(([dish, qty]) => {
      if (dish === "Altro") {
        totals[otherKey] = qty;
      } else {
        totals[dish] = (totals[dish] || 0) + qty;
      }
    });
  });

  // Reset globale
  const handleReset = () => {
    const confirm = window.confirm("Vuoi davvero cancellare tutte le scelte?");
    if (confirm) {
      remove(ref(db, "scelte"));
    }
  };

  return (
    <div style={{ padding: "30px", color: "#2e3e4f" }}>
      <h2 style={{ fontSize: "26px" }}>🛠️ Pannello Amministratore</h2>

      <h3 style={{ marginTop: "30px" }}>📋 Scelte per camera:</h3>
      <hr />
      <ul>
        {allChoices.map(({ room, choices, noStarter }, idx) => (
          <li key={idx}>
            <strong>Camera {room}:</strong>{" "}
            {[
              ...Object.entries(choices).map(([dish, qty]) =>
                dish === "Altro" ? `${otherKey}: ${qty}` : `${dish}: ${qty}`
              ),
              noStarter === true
                ? "❌ Antipasto di mare"
                : "✅ Antipasto di mare"
            ].join(", ")}
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: "30px" }}>🍽️ Totale piatti per tipo:</h3>
      <hr />
      <ul>
        {Object.entries(totals).map(([dish, qty], idx) => (
          <li key={idx}>{`${dish}: ${qty}`}</li>
        ))}
      </ul>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={handleReset}
          style={{
            backgroundColor: "#a94444",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          ❌ Reset scelte
        </button>
      </div>
    </div>
  );
}
