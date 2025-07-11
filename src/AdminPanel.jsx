import { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import { onValue, ref, remove } from "firebase/database";
import logo from "./assets/logo.png";

export default function AdminPanel() {
  const [allChoices, setAllChoices] = useState([]);
  const printRef = useRef();

  const language = "it";
  const otherKey = "Altro";

  // Lettura dati in tempo reale da Firebase
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
      if (dish === "Antipasto di mare") {
        totals[dish] = (totals[dish] || 0) + 1;
      } else if (dish === "No antipasto di mare") {
        // non conteggiare nelle quantità
      } else if (dish === otherKey) {
        totals[otherKey] = qty;
      } else {
        totals[dish] = (totals[dish] || 0) + qty;
      }
    });
  });

  // ❌ Reset globale
  const handleReset = () => {
    const confirm = window.confirm("Vuoi davvero cancellare tutte le scelte?");
    if (confirm) {
      remove(ref(db, "scelte"));
    }
  };

  // 🖨️ Funzione di stampa
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "", "width=800,height=600");
    win.document.write(`
      <html>
        <head>
          <title>Stampa Ordini</title>
          <style>
            body {
              font-family: sans-serif;
              padding: 40px;
            }
            img {
              max-width: 160px;
              margin-bottom: 20px;
            }
            h2, h3 {
              color: #2e3e4f;
            }
            ul {
              padding-left: 20px;
            }
            hr {
              margin: 16px 0;
              border: none;
              border-top: 1px solid #ccc;
            }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <img src="${logo}" alt="Logo" />
          ${printContent}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div style={{ padding: "30px", color: "#2e3e4f" }}>
      <h2 style={{ fontSize: "26px" }}>🛠️ Pannello Amministratore</h2>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={handlePrint}
          style={{
            backgroundColor: "#4a5f44",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          📄 Stampa ordini
        </button>

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

      <div ref={printRef}>
        <h3 style={{ marginTop: "30px" }}>📋 Scelte per camera:</h3>
        <hr />
        <ul>
          {allChoices.map(({ room, choices }, idx) => (
            <li key={idx}>
              <strong>Camera {room}:</strong>{" "}
              {Object.entries(choices)
                .map(([dish, qty]) => {
                  if (dish === "Antipasto di mare") return "✅ Antipasto di mare";
                  if (dish === "No antipasto di mare") return "❌ Antipasto di mare";
                  return `${dish}: ${qty}`;
                })
                .join(", ")}
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
      </div>
    </div>
  );
}
