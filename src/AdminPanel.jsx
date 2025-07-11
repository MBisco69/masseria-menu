import { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import { onValue, ref, remove } from "firebase/database";

export default function AdminPanel() {
  const [allChoices, setAllChoices] = useState([]);
  const printRef = useRef(null);

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
  allChoices.forEach(({ choices, wantsAppetizer }) => {
    Object.entries(choices).forEach(([dish, qty]) => {
      if (dish === otherKey) {
        totals[otherKey] = qty;
      } else {
        totals[dish] = (totals[dish] || 0) + qty;
      }
    });

    if (wantsAppetizer === false) {
      totals["Antipasto di mare ❌"] = (totals["Antipasto di mare ❌"] || 0) + 1;
    } else if (wantsAppetizer === true) {
      totals["Antipasto di mare ✅"] = (totals["Antipasto di mare ✅"] || 0) + 1;
    }
  });

  // Reset globale
  const handleReset = () => {
    const confirm = window.confirm("Vuoi davvero cancellare tutte le scelte?");
    if (confirm) {
      remove(ref(db, "scelte"));
    }
  };

  // Stampa popup con logo e timestamp
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=1000,height=800");

    if (printWindow) {
      const logoURL = `${window.location.origin}/assets/logo.png`;
      const now = new Date();
      const timestamp = now.toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      printWindow.document.write(`
        <html>
          <head>
            <title>Stampa Ordini</title>
            <style>
              body {
                font-family: sans-serif;
                padding: 30px;
                font-size: 14px;
                color: #2e3e4f;
              }
              h2, h3 {
                color: #4a5f44;
                margin-bottom: 10px;
              }
              ul {
                padding-left: 20px;
              }
              hr {
                margin: 16px 0;
                border: none;
                border-top: 1px solid #ccc;
              }
              img {
                max-width: 160px;
                margin-bottom: 20px;
              }
              .timestamp {
                margin-top: 20px;
                font-size: 12px;
                color: #888;
              }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div style="text-align: center;">
              <img src="${logoURL}" alt="Logo" />
            </div>
            ${printContent}
            <div class="timestamp">Stampa generata il ${timestamp}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      alert("⚠️ Popup bloccato! Consenti i popup per questo sito.");
    }
  };

  return (
    <div style={{ padding: "30px", color: "#2e3e4f" }}>
      <h2 style={{ fontSize: "26px" }}>🛠️ Pannello Amministratore</h2>

      <div ref={printRef}>
        <h3 style={{ marginTop: "30px" }}>📋 Scelte per camera:</h3>
        <hr />
        <ul>
          {allChoices.map(({ room, choices, wantsAppetizer }, idx) => (
            <li key={idx}>
              <strong>Camera {room}:</strong>{" "}
              {Object.entries(choices)
                .map(([dish, qty]) =>
                  dish === otherKey ? `${otherKey}: ${qty}` : `${dish}: ${qty}`
                )
                .join(", ")}
              {typeof wantsAppetizer === "boolean" && (
                <span style={{ marginLeft: "10px" }}>
                  • Antipasto di mare{" "}
                  {wantsAppetizer ? "✅" : "❌"}
                </span>
              )}
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
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          ❌ Reset scelte
        </button>

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
      </div>
    </div>
  );
}
