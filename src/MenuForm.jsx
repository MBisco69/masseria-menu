import { useState } from "react";
import menuData from "./data/menu.json";
import logo from "./assets/logo.png";

export default function MenuForm({ allChoices, setAllChoices }) {
  const [language, setLanguage] = useState("it");
  const [room, setRoom] = useState("");
  const [quantities, setQuantities] = useState({});
  const [otherChoice, setOtherChoice] = useState("");

  const getLabel = (dish) => dish[language];

  const handleQuantityChange = (dish, value) => {
    setQuantities({
      ...quantities,
      [dish]: parseInt(value) || 0,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!room) {
      alert("Inserisci il numero di camera");
      return;
    }

    const choices = {};
    [...menuData.firstCourses, ...menuData.secondCourses].forEach((dish) => {
      const label = getLabel(dish);
      const qty = quantities[label];
      if (qty && qty > 0) choices[label] = qty;
    });

    if (otherChoice) choices["Altro"] = otherChoice;

    if (Object.keys(choices).length === 0) {
      alert("Seleziona almeno un piatto");
      return;
    }

    const newEntry = {
      room,
      choices,
    };

    setAllChoices([...allChoices, newEntry]);
    setRoom("");
    setQuantities({});
    setOtherChoice("");
    alert("Scelta inviata con successo!");
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "auto",
        backgroundColor: "#f9f5ee",
        padding: "30px",
        borderRadius: "20px",
        marginTop: "30px",
        boxShadow: "0 0 20px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <img src={logo} alt="Masseria Torre dei Preti" style={{ maxWidth: "180px", marginBottom: "20px" }} />
      </div>
      <h2 style={{ textAlign: "center", color: "#4a5f44" }}>
        {language === "it" ? "Menù del giorno" : language === "en" ? "Menu of the Day" : "Tagesmenü"}
      </h2>

      <label>
        <strong>{language === "it" ? "Seleziona la lingua" : language === "en" ? "Select Language" : "Sprache wählen"}:</strong>{" "}
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ marginLeft: "10px" }}>
          <option value="it">Italiano</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </label>

      <br /><br />

      <label>
        {language === "it" ? "Numero camera:" : language === "en" ? "Room number:" : "Zimmernummer:"}
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="12"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </label>

      <br /><br />
      <h3 style={{ color: "#4a5f44" }}>{language === "it" ? "Primi piatti" : language === "en" ? "First Courses" : "Erste Gänge"}</h3>
      {menuData.firstCourses.map((dish, idx) => (
        <div key={idx}>
          {getLabel(dish)}:
          <input
            type="number"
            min={0}
            value={quantities[getLabel(dish)] || ""}
            onChange={(e) => handleQuantityChange(getLabel(dish), e.target.value)}
            style={{ width: "60px", marginLeft: "10px" }}
          />
        </div>
      ))}

      <br />
      <h3 style={{ color: "#4a5f44" }}>{language === "it" ? "Secondi piatti" : language === "en" ? "Second Courses" : "Zweite Gänge"}</h3>
      {menuData.secondCourses.map((dish, idx) => (
        <div key={idx}>
          {getLabel(dish)}:
          <input
            type="number"
            min={0}
            value={quantities[getLabel(dish)] || ""}
            onChange={(e) => handleQuantityChange(getLabel(dish), e.target.value)}
            style={{ width: "60px", marginLeft: "10px" }}
          />
        </div>
      ))}

      <br />
      <label>
        {language === "it"
          ? "Altro (inserire piatti alternativi):"
          : language === "en"
            ? "Other (insert alternative dishes):"
            : "Andere (alternative Gerichte einfügen):"}
        <input
          value={otherChoice}
          onChange={(e) => setOtherChoice(e.target.value)}
          placeholder=""
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </label>

      <br /><br />
      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#4a5f44",
          color: "white",
          fontWeight: "bold",
          fontSize: "16px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {language === "it" ? "Invia scelta" : language === "en" ? "Submit choice" : "Auswahl senden"}
      </button>
    </div>
  );
}



