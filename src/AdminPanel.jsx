import { useEffect, useState } from "react";
import { db } from "./firebase";
import { ref, onValue, remove } from "firebase/database";

export default function AdminPanel() {
  const [allChoices, setAllChoices] = useState([]);

  useEffect(() => {
    const choicesRef = ref(db, "orders");
    const unsubscribe = onValue(choicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const choicesArray = Object.values(data);
        setAllChoices(choicesArray);
      } else {
        setAllChoices([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleReset = () => {
    const confirmed = window.confirm("Sei sicuro di voler cancellare tutte le scelte?");
    if (confirmed) {
      remove(ref(db, "orders"));
    }
  };

  const totals = {};
  const language = "it";
  const otherKey = {
    it: "Altro",
    en: "Other",
    de: "Andere"
  }[language];

  allChoices.forEach(({ choices }) => {
    Object.entries(choices).forEach(([dish, qty]) => {
      if (dish === "Altro") {
        totals[otherKey] = qty;
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
              .map(([dish, qty]) => `${dish}: ${qty}`)
              .join(", ")}
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: "30px" }}>🍽️ Totale piatti per tipo:</h3>
      <hr />
      <ul>
        {Object.entries(totals).map(([dish, qty], idx) => (
          <li key={idx}>{dish}: {qty}</li>
        ))}
      </ul>

      <br />
      <button
        onClick={handleReset}
        style={{
          marginTop: "30px",
          backgroundColor: "#d9534f",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        ❌ Reset scelte
      </button>
    </div>
  );
}




