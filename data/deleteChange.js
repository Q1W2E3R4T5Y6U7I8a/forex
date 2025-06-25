const fs = require("fs");
const path = require("path");

const PAIRS = ["USD_EUR", "USD_CHF", "USD_GBP", "USD_JPY", "USD_CAD", "USD_AUD", "USD_NZD",
  "CHF_EUR", "CHF_GBP", "CHF_JPY", "CHF_CAD", "CHF_AUD", "CHF_NZD",
  "EUR_GBP", "EUR_JPY", "EUR_CAD", "EUR_AUD", "EUR_NZD",
  "GBP_JPY", "GBP_CAD", "GBP_AUD", "GBP_NZD",
  "JPY_CAD", "JPY_AUD", "JPY_NZD",
  "AUD_CAD", "AUD_NZD",

  "EUR_USD", "CHF_USD", "GBP_USD", "JPY_USD", "CAD_USD", "AUD_USD", "NZD_USD",
  "EUR_CHF", "GBP_CHF", "JPY_CHF", "CAD_CHF", "AUD_CHF", "NZD_CHF",
  "GBP_EUR", "JPY_EUR", "CAD_EUR", "AUD_EUR", "NZD_EUR",
  "JPY_GBP", "CAD_GBP", "AUD_GBP", "NZD_GBP",
  "CAD_JPY", "AUD_JPY", "NZD_JPY",
  "CAD_AUD", "NZD_AUD"
];
const FOLDER = "./"

fs.readdirSync(FOLDER).forEach((filename) => {
  const match = PAIRS.some(pair => filename.startsWith(pair) && filename.endsWith("_D1.csv"));
  if (!match) return;

  const filePath = path.join(FOLDER, filename);
  const input = fs.readFileSync(filePath, "utf-8");

  const cleanedLines = input.split("\n").map(line => {
    const plusIndex = line.indexOf("+");
    const minusIndex = line.indexOf("-");

    const cutIndex = (plusIndex !== -1 && minusIndex !== -1)
      ? Math.min(plusIndex, minusIndex)
      : (plusIndex !== -1 ? plusIndex : minusIndex);

    return cutIndex !== -1 ? line.slice(0, cutIndex).trimEnd() : line;
  });

  fs.writeFileSync(filePath, cleanedLines.join("\n"), "utf-8");
  console.log(`Cleaned: ${filename}`);
});
