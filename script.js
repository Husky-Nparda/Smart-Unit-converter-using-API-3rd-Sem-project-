const typeSelect = document.getElementById("type");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const inputValue = document.getElementById("inputValue");
const resultText = document.getElementById("resultText");
const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");

const conversions = {
  length: { meter: 1, kilometer: 0.001, centimeter: 100, inch: 39.3701, foot: 3.28084 },
  volume: { liter: 1, milliliter: 1000, gallon: 0.264172 },
  temperature: { celsius: 1, fahrenheit: 1, kelvin: 1 },
};

let currencyRates = {};

// Fetch live rates from ExchangeRate.host
async function fetchRates() {
  try {
    const res = await fetch("https://api.exchangerate.host/latest?base=USD");
    const data = await res.json();
    currencyRates = data.rates;
    console.log("Live rates loaded:", currencyRates);
    if (typeSelect.value === "currency") populateUnits();
  } catch (error) {
    console.error("Could not fetch live rates, using fallback:", error);
    currencyRates = { USD: 1, EUR: 0.92, INR: 83.0, GBP: 0.79, JPY: 149.5 };
  }
}
fetchRates();

function populateUnits() {
  const type = typeSelect.value;
  const units = type === "currency" ? Object.keys(currencyRates) : Object.keys(conversions[type]);
  fromUnit.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join("");
  toUnit.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join("");
}
populateUnits();
typeSelect.addEventListener("change", populateUnits);

function convertValue() {
  const type = typeSelect.value;
  const from = fromUnit.value;
  const to = toUnit.value;
  const value = parseFloat(inputValue.value);

  if (isNaN(value)) {
    resultText.textContent = "Please enter a valid number!";
    return;
  }

  let result;
  if (type === "temperature") result = convertTemperature(value, from, to);
  else if (type === "currency") result = (value / currencyRates[from]) * currencyRates[to];
  else result = (value / conversions[type][from]) * conversions[type][to];

  resultText.textContent = `Result: ${result.toFixed(4)} ${to}`;
}

convertBtn.addEventListener("click", convertValue);
inputValue.addEventListener("input", () => {
  if (inputValue.value !== "") convertValue();
});

swapBtn.addEventListener("click", () => {
  const temp = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value = temp;
  convertValue();
});

function convertTemperature(value, from, to) {
  let c;
  if (from === "celsius") c = value;
  else if (from === "fahrenheit") c = (value - 32) * (5 / 9);
  else if (from === "kelvin") c = value - 273.15;

  if (to === "celsius") return c;
  if (to === "fahrenheit") return c * (9 / 5) + 32;
  if (to === "kelvin") return c + 273.15;
  return value;
}
