import { useState } from "react";
import logo from "./assets/logo.png";

const menuData = {
  firstCourses: [
    {
      it: "Pennette all'arrabbiata",
      en: "Penne arrabbiata",
      de: "Penne all’arrabbiata",
    },
    {
      it: "Gnocchi al salmone",
      en: "Salmon gnocchi",
      de: "Lachs-Gnocchi",
    },
  ],
  secondCourses: [
    {
      it: "Caciocavallo al forno",
      en: "Baked caciocavallo",
      de: "Gebackener Caciocavallo",
    },
    {
      it: "Merluzzo al forno",
      en: "Baked cod",
      de: "Gebackener Kabeljau",
    },
  ],
};

export default function MenuForm({ allChoices, setAllChoices }) {
  const [language, setLanguage] = useState("it");
  const [room, setRoom] = useState("");
  const [quantities, setQuantities] = useState({});
  const [otherChoice, setOtherChoice] = useState("");

  const handleQuantityChange = (dish, value) => {
    setQuantities({
      ...quantities,
      [dish]: parseInt(value) || 0,
    });
  };

  const getLabel = (textObj) => textObj[language];

  const handleSubmit = () => {
    const newEntry = {
      room,
      choices: { ...quantities },
      other: otherChoice,
    };
    setAllChoices([...allChoices, newEntry]);
    alert("Scelte salvate con successo!");
    setRoom("");
    setQuantities({});
    setOtherChoice("");
  };

  return (
    <div style={{ backgroundColor: "#fefefe", minHeight: "100vh", padding: "20px", fontFamily: "'Lora', serif" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", backgroundColor: "#f8f4ef", padding: "30px", borderRadius: "16px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <img src={logo} alt="Masseria Torre dei Preti" style={{ maxHeight: "200px" }} />
        </div>

        <h2 style={{ textAlign: "center", color: "#4a5f44" }}>
          {language === "it" ? "Menù del giorno" : language === "en" ? "Menu of the Day" : "Tagesmenü"}
        </h2>

        <label style={{ display: "block", marginTop: "20px", color: "#333", fontWeight: "bold" }}>
          {language === "it"
            ? "Seleziona la lingua"
            : language === "en"
            ? "Select your language"
            : "Sprache auswählen"}
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ marginLeft: "10px", padding: "5px", borderRadius: "6px" }}>
            <option value="it">Italiano</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
        </label>

        <label style={{ display: "block", marginTop: "20px", color: "#333" }}>
          {language === "it"
            ? "Numero camera"
            : language === "en"
            ? "Room number"
            : "Zimmernummer"}
          :
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="12"
            style={{ display: "block", width: "100%", padding: "10px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ccc", backgroundColor: "#fff", color: "#000" }}
          />
        </label>

        <h3 style={{ marginTop: "30px", color: "#4a5f44" }}>
          {language === "it" ? "Primi piatti" : language === "en" ? "First Courses" : "Erste Gänge"}
        </h3>
        {menuData.firstCourses.map((dish, idx) => (
          <div key={idx} style={{ marginBottom: "10px", color: "#333" }}>
            {getLabel(dish)}:
            <input
              type="number"
              min={0}
              value={quantities[getLabel(dish)] || ""}
              onChange={(e) => handleQuantityChange(getLabel(dish), e.target.value)}
              style={{ width: "60px", marginLeft: "10px", borderRadius: "6px", padding: "6px", backgroundColor: "#fff", color: "#000" }}
            />
          </div>
        ))}

        <h3 style={{ marginTop: "30px", color: "#4a5f44" }}>
          {language === "it" ? "Secondi piatti" : language === "en" ? "Second Courses" : "Zweite Gänge"}
        </h3>
        {menuData.secondCourses.map((dish, idx) => (
          <div key={idx} style={{ marginBottom: "10px", color: "#333" }}>
            {getLabel(dish)}:
            <input
              type="number"
              min={0}
              value={quantities[getLabel(dish)] || ""}
              onChange={(e) => handleQuantityChange(getLabel(dish), e.target.value)}
              style={{ width: "60px", marginLeft: "10px", borderRadius: "6px", padding: "6px", backgroundColor: "#fff", color: "#000" }}
            />
          </div>
        ))}

        <label style={{ display: "block", marginTop: "20px", color: "#333" }}>
          {language === "it"
            ? "Altro (specificare)"
            : language === "en"
            ? "Other (please specify)"
            : "Andere (bitte angeben)"}
          :
          <input
            value={otherChoice}
            onChange={(e) => setOtherChoice(e.target.value)}
            placeholder={language === "it" ? "Inserire piatti alternativi" : language === "en" ? "Insert alternative dishes" : "Alternative Gerichte eingeben"}
            style={{ display: "block", width: "100%", padding: "10px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ccc", backgroundColor: "#fff", color: "#000" }}
          />
        </label>

        <button
          onClick={handleSubmit}
          style={{
            marginTop: "30px",
            backgroundColor: "#4a5f44",
            color: "white",
            padding: "12px 20px",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",
            fontSize: "16px",
          }}
        >
          {language === "it"
            ? "Invia scelta"
            : language === "en"
            ? "Submit choice"
            : "Auswahl senden"}
        </button>
      </div>
    </div>
  );
}


