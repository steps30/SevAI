const departmentOptions = [
  { value: "MAWS - Water supply", en: "MAWS - Water supply", ta: "MAWS - குடிநீர் வழங்கல்" },
  { value: "PWD - Roads", en: "PWD - Roads", ta: "PWD - சாலைகள்" },
  { value: "ENERGY - Electricity", en: "ENERGY - Electricity", ta: "ENERGY - மின்சாரம்" },
  { value: "HEALTH - Public health", en: "HEALTH - Public health", ta: "HEALTH - பொது சுகாதாரம்" },
  { value: "TRANS - Transport", en: "TRANS - Transport", ta: "TRANS - போக்குவரத்து" },
  { value: "ENVFOR - Environment", en: "ENVFOR - Environment", ta: "ENVFOR - சுற்றுச்சூழல்" },
];

function getLocalizedDepartmentLabel(value, language) {
  const match = departmentOptions.find((item) => item.value === value || item.en === value);

  if (!match) {
    return value || (language === "ta" ? "பொது" : "General");
  }

  return language === "ta" ? match.ta : match.en;
}

export { departmentOptions, getLocalizedDepartmentLabel };