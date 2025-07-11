import { useEffect, useState } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";

export default function AdminPanel() {
  const [allChoices, setAllChoices] = useState([]);

  useEffect(() => {
    const ordersRef = ref(db, "orders");
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.values(data);
        setAllChoices(parsed);
      } else {
        setAllChoices([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const totals = {};
  const language = "it";
  const otherKey = "Altro";

  allChoices.forEach(({ choices }) => {
    Object.entries(choices).forEach(([dish, qty]) => {
      if (dish === "Altro") {
        totals[otherKey] = qty; // stringa testuale, non sommabile
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
                dish === "Altro" ? `${otherKey}: ${qty}` : `${dish}: ${qty}`
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


