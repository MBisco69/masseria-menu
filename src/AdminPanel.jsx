import { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import { onValue, ref, remove, update } from "firebase/database";

// ✅ Nuovo menu del giorno
const menuData = {
  firstCourses: [
    { it: "Spaghetti aglio olio e peperoncino in crema di cavolfiore e pane aromatizzato all'acciuga" },
    { it: "Tubettini di pasta con un brodetto di rana pescatrice" }
  ],
  secondCourses: [
    { it: "Salsiccia alla griglia" },
    { it: "Spigola al sale" }
  ]
};

const allDishes = [
  ...menuData.firstCourses.map(d => d.it),
  ...menuData.secondCourses.map(d => d.it)
];

export default function AdminPanel() {
  const [allChoices, setAllChoices] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ room: "", choices: {}, antipasto: true });
  const [entryKeys, setEntryKeys] = useState([]);

  const printRef = useRef();
  const otherKey = "Altro";

  useEffect(() => {
    const scelteRef = ref(db, "scelte");
    const unsubscribe = onValue(scelteRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        setAllChoices(values);
        setEntryKeys(keys);
      } else {
        setAllChoices([]);
        setEntryKeys([]);
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

  const openEdit = (idx) => {
    const current = allChoices[idx];
    setEditData({
      room: current.room,
      choices: { ...current.choices },
      antipasto: current.antipasto !== false
    });
    setEditIndex(idx);
  };

  const handleEditChange = (dish, value) => {
    setEditData((prev) => ({
      ...prev,
      choices: {
        ...prev.choices,
        [dish]: parseInt(value) || 0
      }
    }));
  };

  const handleOtherChange = (value) => {
    setEditData((prev) => ({
      ...prev,
      choices: {
        ...prev.choices,
        [otherKey]: value
      }
    }));
  };

  const handleSaveEdit = async () => {
    const key = entryKeys[editIndex];

    const cleanedChoices = {};
    Object.entries(editData.choices).forEach(([dish, qty]) => {
      if ((typeof qty === "number" && qty > 0) || (dish === otherKey && qty.trim())) {
        cleanedChoices[dish] = qty;
      }
    });

    const updated = {
      room: editData.room,
      choices: cleanedChoices,
      antipasto: editData.antipasto
    };

    await update(ref(db, `scelte/${key}`), updated);
    setEditIndex(null);
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Stampa Ordini</title>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                margin: 0;
                box-sizing: border-box;
              }
              img {
                display: block;
                margin: 0 auto 30px auto;
                max-width: 150px;
              }
              h2 {
                text-align: center;
                color: #4a5f44;
                margin-bottom: 40px;
                font-size: 24px;
              }
              ul {
                list-style-type: none;
                padding: 0;
              }
              li {
                margin-bottom: 30px;
                font-size: 16px;
                line-height: 1.6;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const totals = allChoices.reduce((acc, entry) => {
    Object.entries(entry.choices).forEach(([dish, qty]) => {
      if (dish !== otherKey) {
        acc[dish] = (acc[dish] || 0) + qty;
      }
    });
    return acc;
  }, {});

  return (
    <div style={{ padding: "30px", color: "#2e3e4f", position: "relative" }}>
      <h2 style={{ fontSize: "26px" }}>🛠️ Pannello Amministratore</h2>

      <button
        onClick={handlePrint}
        style={{
          backgroundColor: "#4a5f44",
          color: "white",
          padding: "10px 20px",
          marginBottom: "20px",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        🖨️ Stampa ordini
      </button>

      <h3 style={{ marginTop: "30px" }}>📋 Scelte per camera:</h3>
      <hr />
      <ul>
        {allChoices.map(({ room, choices, antipasto }, idx) => (
          <li key={idx} style={{ marginBottom: "10px" }}>
            <strong>Camera {room}:</strong>{" "}
            {Object.entries(choices)
              .map(([dish, qty]) =>
                dish === otherKey ? `${otherKey}: ${qty}` : `${dish}: ${qty}`
              )
              .join(", ")}
            {" — "}
            Antipasto di mare:{" "}
            {antipasto === false ? <span style={{ color: "red" }}>❌</span> : <span style={{ color: "green" }}>✅</span>}
            <button
              onClick={() => openEdit(idx)}
              style={{
                marginLeft: "10px",
                padding: "4px 10px",
                fontSize: "12px",
                backgroundColor: "#ddd",
                border: "1px solid #aaa",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Modifica
            </button>
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

      <div ref={printRef} style={{ display: "none" }}>
        <img src="/logo.png" alt="Logo Masseria" />
        <h2>Ordini per camera</h2>
        <ul>
          {allChoices.map(({ room, choices, antipasto }, idx) => (
            <li key={idx}>
              <strong>Camera {room}:</strong>{" "}
              {Object.entries(choices)
                .map(([dish, qty]) =>
                  dish === otherKey ? `${otherKey}: ${qty}` : `${dish}: ${qty}`
                )
                .join(", ")}
              {" — "}
              Antipasto di mare: {antipasto === false ? "❌" : "✅"}
            </li>
          ))}
        </ul>
      </div>

      {editIndex !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 0 15px rgba(0,0,0,0.3)"
            }}
          >
            <h3>✏️ Modifica scelta - Camera {editData.room}</h3>
            <br />
            {allDishes.map((dish, idx) => (
              <div key={idx} style={{ marginBottom: "10px" }}>
                {dish}:{" "}
                <input
                  type="number"
                  value={editData.choices[dish] || ""}
                  min="0"
                  onChange={(e) => handleEditChange(dish, e.target.value)}
                  style={{ width: "60px", marginLeft: "10px" }}
                />
              </div>
            ))}

            <div style={{ marginTop: "20px" }}>
              Antipasto di mare:&nbsp;
              <input
                type="checkbox"
                checked={editData.antipasto}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, antipasto: e.target.checked }))
                }
              />
              <span>{editData.antipasto ? "✅" : "❌"}</span>
            </div>

            <div style={{ marginTop: "20px" }}>
              {otherKey}:{" "}
              <input
                type="text"
                value={editData.choices[otherKey] || ""}
                onChange={(e) => handleOtherChange(e.target.value)}
                style={{ width: "100%", marginTop: "6px" }}
              />
            </div>

            <div style={{ marginTop: "30px", textAlign: "right" }}>
              <button
                onClick={handleSaveEdit}
                style={{
                  backgroundColor: "#4a5f44",
                  color: "white",
                  padding: "10px 16px",
                  marginRight: "10px",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Salva
              </button>
              <button
                onClick={() => setEditIndex(null)}
                style={{
                  backgroundColor: "#aaa",
                  color: "white",
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
