import { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import { onValue, ref, remove, update } from "firebase/database";

// ✅ Menu aggiornato 12/07/2025
const menuData = {
  firstCourses: [
    { it: "Troccoli con sugo di seppia ripiena e cacioricotta" },
    { it: "Orecchiette con cime di rapa" }
  ],
  secondCourses: [
    { it: "Seppia ripiena " },
    { it: "Involtini di capocollo di maiale con caciocavallo" }
  ]
};

const allDishes = [
  ...menuData.firstCourses.map(d => d.it),
  ...menuData.secondCourses.map(d => d.it)
];

export default function AdminPanel() {
  const [allChoices, setAllChoices] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ room: "", choices: {}, noStarter: false });
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
    if (window.confirm("Vuoi davvero cancellare tutte le scelte?")) {
      remove(ref(db, "scelte"));
    }
  };

  const handleDeleteSingle = async (idx) => {
    const key = entryKeys[idx];
    if (window.confirm("Eliminare questa scelta?")) {
      await remove(ref(db, `scelte/${key}`));
    }
  };

  const openEdit = (idx) => {
    const current = allChoices[idx];
    setEditData({
      room: current.room,
      choices: { ...current.choices },
      noStarter: current.noStarter === true
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

    Object.entries(editData.choices || {}).forEach(([dish, qty]) => {
      if ((typeof qty === "number" && qty > 0) || (dish === otherKey && qty.trim())) {
        cleanedChoices[dish] = qty;
      }
    });

    await update(ref(db, `scelte/${key}`), {
      room: editData.room,
      choices: cleanedChoices,
      noStarter: editData.noStarter
    });

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
              }
              ul {
                list-style-type: none;
                padding: 0;
              }
              li {
                margin-bottom: 30px;
                font-size: 16px;
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

  // 🔧 Ordina i piatti nel report secondo il menu
  const getOrderedChoicesString = (choices) => {
    const entries = [];

    menuData.firstCourses.forEach(d => {
      const qty = choices[d.it];
      if (qty) entries.push(`${d.it}: ${qty}`);
    });

    menuData.secondCourses.forEach(d => {
      const qty = choices[d.it];
      if (qty) entries.push(`${d.it}: ${qty}`);
    });

    if (choices[otherKey]) {
      entries.push(`${otherKey}: ${choices[otherKey]}`);
    }

    return entries.join(", ");
  };

  const totals = allDishes.reduce((acc, dish) => {
    acc[dish] = allChoices.reduce((sum, entry) => sum + (entry.choices?.[dish] || 0), 0);
    return acc;
  }, {});

  return (
    <div style={{ padding: "30px", color: "#2e3e4f", position: "relative" }}>
      <h2>🛠️ Pannello Amministratore</h2>

      <button onClick={handlePrint} style={{ backgroundColor: "#4a5f44", color: "white", padding: "10px 20px", borderRadius: "8px", marginBottom: "20px", cursor: "pointer" }}>
        🖨️ Stampa ordini
      </button>

      <h3>📋 Scelte per camera:</h3>
      <hr />
      <ul>
        {allChoices.map(({ room, choices, noStarter }, idx) => (
          <li key={idx}>
            <strong>Camera {room}:</strong>{" "}
            {getOrderedChoicesString(choices || {})}
            {" — "}
            Antipasto di mare: {noStarter ? <span style={{ color: "red" }}>❌</span> : <span style={{ color: "green" }}>✅</span>}
            <button onClick={() => openEdit(idx)} style={{ marginLeft: "10px" }}>Modifica</button>
            <button onClick={() => handleDeleteSingle(idx)} style={{ marginLeft: "10px", color: "red" }}>🗑️ Elimina</button>
          </li>
        ))}
      </ul>

      <h3>🍽️ Totale piatti per tipo:</h3>
      <hr />
      <ul>
        {allDishes.map((dish, idx) => (
          <li key={idx}>{`${dish}: ${totals[dish]}`}</li>
        ))}
      </ul>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button onClick={handleReset} style={{ backgroundColor: "#a94444", color: "white", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>
          ❌ Reset scelte
        </button>
      </div>

      {/* ✅ CONTENUTO PER LA STAMPA */}
      <div ref={printRef} style={{ display: "none" }}>
        <img src="/logo.png" alt="Logo Masseria" />
        <h2>Ordini per camera</h2>
        <ul>
          {allChoices.map(({ room, choices, noStarter }, idx) => (
            <li key={idx}>
              <strong>Camera {room}:</strong>{" "}
              {getOrderedChoicesString(choices || {})}
              {" — "}
              Antipasto di mare: {noStarter ? "❌" : "✅"}
            </li>
          ))}
        </ul>
      </div>

      {/* ✅ POPUP DI MODIFICA */}
      {editIndex !== null && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff", padding: "30px", borderRadius: "12px",
            width: "90%", maxWidth: "500px", boxShadow: "0 0 15px rgba(0,0,0,0.3)"
          }}>
            <h3>✏️ Modifica scelta - Camera {editData.room}</h3>
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
                checked={!editData.noStarter}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    noStarter: !e.target.checked
                  }))
                }
              />
              <span>{!editData.noStarter ? "✅" : "❌"}</span>
            </div>

            <div style={{ marginTop: "20px" }}>
              {otherKey}:{" "}
              <input
                type="text"
                value={editData.choices[otherKey] || ""}
                onChange={(e) => handleOtherChange(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginTop: "30px", textAlign: "right" }}>
              <button onClick={handleSaveEdit} style={{ marginRight: "10px", backgroundColor: "#4a5f44", color: "#fff", padding: "10px", borderRadius: "6px" }}>
                Salva
              </button>
              <button onClick={() => setEditIndex(null)} style={{ backgroundColor: "#aaa", color: "#fff", padding: "10px", borderRadius: "6px" }}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
