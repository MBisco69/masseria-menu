import { useState } from "react";
import logo from "./assets/logo.png";

const translations = {
  it: {
    title: "Menù del giorno",
    languageLabel: "Seleziona la lingua",
    roomLabel: "Numero camera",
    roomPlaceholder: "Inserire il numero della stanza",
    firstCourses: "Primi piatti",
    secondCourses: "Secondi piatti",
    otherLabel: "Altro (inserire piatti alternativi)",
    otherPlaceholder: "Riportare anche allergie e intolleranze, se presenti",
    submit: "Invia scelta",
  },
  en: {
    title: "Menu of the Day",
    languageLabel: "Select language",
    roomLabel: "Room number",
    roomPlaceholder: "Enter room number",
    firstCourses: "First Courses",
    secondCourses: "Second Courses",
    otherLabel: "Other (insert alternatives)",
    otherPlaceholder: "Also report allergies or intolerances, if any",
    submit: "Submit choice",
  },
  de: {
    title: "Tagesmenü",
    languageLabel: "Sprache auswählen",
    roomLabel: "Zimmernummer",
    roomPlaceholder: "Zimmernummer eingeben",
    firstCourses: "Erste Gänge",
    secondCourses: "Zweite Gänge",
    otherLabel: "Andere (bitte Alternativen angeben)",
    otherPlaceholder: "Bitte auch Allergien und Unverträglichkeiten angeben",
    submit: "Auswahl senden",
  }
};

const menuData = {
  firstCourses: [
    {
      it: "Pennette all'arrabbiata",
      en: "Penne arrabbiata",
      de: "Penne all’arrabbiata"
    },
    {
      it: "Gnocchi al salmone",
      en: "Salmon gnocchi",
      de: "Lachs-Gnocchi"
    }
  ],
  secondCourses: [
    {
      it: "Caciocavallo al forno",
      en: "Baked caciocavallo",
      de: "Gebackener Caciocavallo"
    },
    {
      it: "Merluzzo al forno",
      en: "Baked cod",
      de: "Gebackener Kabeljau"
    }
  ]
};

export default function MenuForm({ allChoices, setAllChoices }) {
  const [language, setLanguage] = useState("it");
  const [room, setRoom] = useState("");
  const [quantities, setQuantities] = useState({});
  const [otherChoice, setOtherChoice] = useState("");

  const t = translations[language];
  const getLabel = (obj) => obj[language];

  const handleQuantityChange = (dish, value) => {
    setQuantities((prev) => ({
      ...prev,
      [dish]: parseInt(value) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!room) {
      alert(t.roomPlaceholder);
      return;
    }

    const choices = { ...quantities };
    if (otherChoice.trim()) {
      choices["Altro"] = otherChoice.trim();
    }

    setAllChoices([...allChoices, { room, choices }]);
    setRoom("");
    setQuantities({});
    setOtherChoice("");
    alert("Scelta inviata!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#f9f6ef",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 0 20px rgba(0,0,0,0.1)",
        color: "#2e2e2e"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img
          src={logo}
          alt="Logo"
          style={{ maxWidth: "180px", marginBottom: "20px" }}
        />
        <h2 style={{ color: "#4a5f44", fontSize: "26px" }}>{t.title}</h2>
      </div>

      <label style={{ fontWeight: "bold", color: "#4a5f44" }}>
        {t.languageLabel}:&nbsp;
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: "6px",
            borderRadius: "6px",
            backgroundColor: "#f1f1f1",
            color: "#4a5f44"
          }}
        >
          <option value="it">Italiano</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </label>

      <br />
      <br />

      <label>
        <strong>{t.roomLabel}:</strong>
        <br />
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder={t.roomPlaceholder}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            marginTop: "4px",
            backgroundColor: "#f1f1f1"
          }}
        />
      </label>

      <br />
      <br />

      <h3 style={{ color: "#4a5f44" }}>{t.firstCourses}</h3>
      {menuData.firstCourses.map((dish, idx) => (
        <div key={idx} style={{ marginBottom: "10px" }}>
          {getLabel(dish)}:
          <input
            type="number"
            min="0"
            value={quantities[getLabel(dish)] || ""}
            onChange={(e) =>
              handleQuantityChange(getLabel(dish), e.target.value)
            }
            style={{
              width: "60px",
              marginLeft: "10px",
              padding: "4px",
              backgroundColor: "#f1f1f1"
            }}
          />
        </div>
      ))}

      <h3 style={{ color: "#4a5f44", marginTop: "20px" }}>{t.secondCourses}</h3>
      {menuData.secondCourses.map((dish, idx) => (
        <div key={idx} style={{ marginBottom: "10px" }}>
          {getLabel(dish)}:
          <input
            type="number"
            min="0"
            value={quantities[getLabel(dish)] || ""}
            onChange={(e) =>
              handleQuantityChange(getLabel(dish), e.target.value)
            }
            style={{
              width: "60px",
              marginLeft: "10px",
              padding: "4px",
              backgroundColor: "#f1f1f1"
            }}
          />
        </div>
      ))}

      <br />

      <label>
        <strong>{t.otherLabel}:</strong>
        <br />
        <input
          type="text"
          value={otherChoice}
          onChange={(e) => setOtherChoice(e.target.value)}
          placeholder={t.otherPlaceholder}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            marginTop: "4px",
            backgroundColor: "#f1f1f1"
          }}
        />
      </label>

      <br />
      <br />

      <button
        type="submit"
        style={{
          backgroundColor: "#4a5f44",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          width: "100%"
        }}
      >
        {t.submit}
      </button>
    </form>
  );
}





