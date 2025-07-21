import { useEffect, useState } from "react";
import { db } from "./firebase";
import { onValue, ref, remove, update } from "firebase/database";

// ✅ Menu aggiornato 20/07/2025
const menuData = {
  firstCourses: [
    { it: "Linguine al nero di seppia" },
    { it: "Spaghetti con datterino giallo, in crema di mozzarella con basilico e pinoli" }
  ],
  secondCourses: [
    { it: "Sogliola alla mugnaia" },
    { it: "Spiedino di carne alla griglia" }
  ]
};

const allDishes = [
  ...menuData.firstCourses.map(d => d.it.trim()),
  ...menuData.secondCourses.map(d => d.it.trim())
];

export default function AdminPanel() {
  const [allChoices, setAllChoices] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ room: "", choices: {}, noStarter: false });
  const [entryKeys, setEntryKeys] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

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
    const trimmedDish = dish.trim();
    setEditData((prev) => ({
      ...prev,
      choices: {
        ...prev.choices,
        [trimmedDish]: parseInt(value) || 0
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
      const trimmedDish = dish.trim();
      if ((typeof qty === "number" && qty > 0) || (trimmedDish === otherKey && qty.trim())) {
        cleanedChoices[trimmedDish] = qty;
      }
    });

    await update(ref(db, `scelte/${key}`), {
      room: editData.room,
      choices: cleanedChoices,
      noStarter: editData.noStarter
    });

    setEditIndex(null);
  };

  // 🖨️ STAMPA COMANDA DA BROWSER
  const handlePrintSingle = (room, choices, noStarter) => {
    const logoUrl = "/logo.png";
    const lines = [];
    lines.push(`<h2 style="margin-bottom: 10px;">🏛️ MASSERIA TORRE</h2>`);
    lines.push(`<hr style="border: 1px dashed black; margin: 10px 0;" />`);
    lines.push(`<strong>Camera:</strong> ${room}`);
    lines.push(`<hr style="border: 1px dashed black; margin: 10px 0;" />`);
    Object.entries(choices).forEach(([dish, qty]) => {
      if (qty) lines.push(`<div>${dish}: ${qty}</div>`);
    });
    lines.push(`<hr style="border: 1px dashed black; margin: 10px 0;" />`);
    lines.push(`Antipasto di mare: ${noStarter ? "❌" : "✅"}`);

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Comanda Camera ${room}</title>
          <style>
            body {
              font-family: monospace;
              font-size: 14px;
              padding: 20px;
              margin: 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <img src="${logoUrl}" width="120" alt="logo" />
          ${lines.join("<br/>")}
          <script>
            window.onload = function () {
              window.print();
              setTimeout(() => window.close(), 200);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totals = allDishes.reduce((acc, dish) => {
    acc[dish] = allChoices.reduce((sum, entry) => sum + (entry.choices?.[dish.trim()] || 0), 0);
    return acc;
  }, {});

  return (
    <div style={{ padding: "30px", color: "#2e3e4f", position: "relative" }}>
      <h2>🛠️ Pannello Amministratore</h2>

      <div style={{ marginBottom: "20px" }}>
        {allChoices.map((entry, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            style={{
              marginRight: "8px",
              marginBottom: "8px",
              padding: "8px 16px",
              backgroundColor: activeTab === idx ? "#4a5f44" : "#ccc",
              color: activeTab === idx ? "white" : "black",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Camera {entry.room}
          </button>
        ))}
      </div>

      {allChoices[activeTab] && (
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "12px" }}>
          <h3>📋 Camera {allChoices[activeTab].room}</h3>
          <p>
            <strong>Antipasto di mare:</strong>{" "}
            {allChoices[activeTab].noStarter ? <span style={{ color: "red" }}>❌</span> : <span style={{ color: "green" }}>✅</span>}
          </p>
          <ul>
            {Object.entries(allChoices[activeTab].choices || {}).map(([dish, qty], i) => (
              <li key={i}>{`${dish}: ${qty}`}</li>
            ))}
          </ul>
          <button onClick={() => openEdit(activeTab)} style={{ marginRight: "10px" }}>Modifica</button>
          <button onClick={() => handleDeleteSingle(activeTab)} style={{ color: "red", marginRight: "10px" }}>🗑️ Elimina</button>
          <button onClick={() => handlePrintSingle(allChoices[activeTab].room, allChoices[activeTab].choices, allChoices[activeTab].noStarter)}>🖨️ Stampa comanda</button>
        </div>
      )}

      <h3 style={{ marginTop: "30px" }}>🍽️ Totale piatti per tipo:</h3>
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
                {dish}: {" "}
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
              Antipasto di mare: {" "}
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
              {otherKey}: {" "}
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
