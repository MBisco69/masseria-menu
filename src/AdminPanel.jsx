import { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import { onValue, ref, remove } from "firebase/database";

export default function AdminPanel() {
  const [allChoices, setAllChoices] = useState([]);
  const printRef = useRef(null);

  useEffect(() => {
    const scelteRef = ref(db, "scelte");
    const unsubscribe = onValue(scelteRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAllChoices(Object.values(data));
      } else {
        setAllChoices([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleReset = () => {
    const confirm = window.confirm("Vuoi davvero cancellare tutte le scelte?");
    if (confirm) {
      remove(ref(db, "scelte"));
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=1000,height=800");

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ordini per camera</title>
            <style>
              @page {
                margin: 0;
              }

              body {
                font-family: sans-serif;
                padding: 40px 60px;
                font-size: 14pt;
                color: #2e3e4f;
                line-height: 1.8;
                -webkit-print-color-adjust: exact;
              }

              h2 {
                color: #4a5f44;
                text-align: center;
                font-size: 24pt;
                margin-bottom: 30px;
              }

              img {
                display: block;
                margin: 0 auto 20px;
                max-width: 140px;
              }

              ul {
                list-style: none;
                padding-left: 0;
              }

              li {
                margin-bottom: 16px;
              }

              @media print {
                button, .no-print {
                  display: none !important;
                }
              }
            </style>
          </head>
          <body>
            <img src="/logo.png" alt="Logo Masseria" />
            <h2>Ordini per camera</h2>
            ${printContent}
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
        <ul style={{ marginTop: "30px" }}>
          {allChoices.map(({ room, choices, wantsAppetizer }, idx) => (
            <li key={idx}>
              <strong>Camera {room}:</strong>{" "}
              {Object.entries(choices)
                .map(([dish, qty]) =>
                  dish === "Altro" ? `Altro: ${qty}` : `${dish}: ${qty}`
                )
                .join(", ")}
              {typeof wantsAppetizer === "boolean" && (
                <span style={{ marginLeft: "10px" }}>
                  • Antipasto di mare {wantsAppetizer ? "✅" : "❌"}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={handleReset}
          className="no-print"
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
          className="no-print"
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
          🖨️ Stampa ordini
        </button>
      </div>
    </div>
  );
}
