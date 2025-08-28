import { useEffect, useState } from "react";
import { db } from "./firebase";
import { onValue, ref, remove, update } from "firebase/database";

// ✅ Menu aggiornato 28/08/2025
const menuData = {
  firstCourses: [
    { it: "Troccoli con sugo di seppia ripiena e cacioricotta" },
    { it: "Cicatelli con verza, bietola e fonduta di formaggi locali" }
  ],
  secondCourses: [
    { it: "Seppia ripiena" },
    { it: "Scaloppina agli agrumi" }
  ]
};

const allDishes = [
  ...menuData.firstCourses.map(d => d.it.trim()),
  ...menuData.secondCourses.map(d => d.it.trim()),
  "Altro"
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
      if (
        (typeof qty === "number" && qty > 0) ||
        (trimmedDish === otherKey && qty.trim())
      ) {
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

  const handlePrintSingle = (room, choices, noStarter) => {
    const printWindow = window.open("", "_blank");
    const logoUrl = "/logo.png";
    const entries = [];

    allDishes.forEach((dish) => {
      const qty = choices[dish];
      if (qty) {
        entries.push(`<li>${dish}: ${qty}</li>`);
      }
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Comanda Camera ${room}</title>
          <style>
            body {
              font-family: monospace;
              font-size: 16px;
              padding: 10px;
              margin: 0;
              text-align: center;
            }
            img {
              width: 150px;
              margin-bottom: 10px;
            }
            ul {
              padding: 0;
              list-style: none;
              text-align: left;
            }
            li {
              margin: 6px 0;
            }
          </style>
        </head>
        <body>
          <img src="${logoUrl}" alt="Logo" />
          <h2>Camera ${room}</h2>
          <ul>
            ${entries.join("\n")}
          </ul>
          <p>Antipasto di mare: ${noStarter ? "❌" : "✅"}</p>
          <script>
            window.onload = function () {
              window.print();
              window.onafterprint = function () {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totals = allDishes.reduce((acc, dish) => {
    acc[dish] = allChoices.reduce((sum, entry) => {
      const val = entry.choices?.[dish];
      if (typeof val === "string") return sum + 1;
      if (typeof val === "number") return sum + val;
      return sum;
    }, 0);
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

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold" }}>Numero Camera:</label>
              <input
                type="text"
                value={editData.room}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    room: e.target.value
                  }))
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "6px",
                  borderRadius: "6px",
                  backgroundColor: "#f1f1f1",
                  color: "#000"
                }}
              />
            </div>

            {allDishes.map((dish, idx) => (
              <div key={idx} style={{ marginBottom: "10px" }}>
                {dish}: {" "}
                <input
                  type={dish === otherKey ? "text" : "number"}
                  value={editData.choices[dish] || ""}
                  onChange={(e) =>
                    dish === otherKey
                      ? handleOtherChange(e.target.value)
                      : handleEditChange(dish, e.target.value)
                  }
                  style={{ width: dish === otherKey ? "100%" : "60px", marginLeft: "10px" }}
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
