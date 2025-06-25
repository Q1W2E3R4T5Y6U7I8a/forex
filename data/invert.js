const fs = require("fs");
const path = require("path");

const FOLDER = "./"; // <- set your folder here
const PAIRS = [
  "EUR_USD", "CHF_USD", "GBP_USD", "JPY_USD", "CAD_USD", "AUD_USD", "NZD_USD",
  "EUR_CHF", "GBP_CHF", "JPY_CHF", "CAD_CHF", "AUD_CHF", "NZD_CHF",
  "GBP_EUR", "JPY_EUR", "CAD_EUR", "AUD_EUR", "NZD_EUR",
  "JPY_GBP", "CAD_GBP", "AUD_GBP", "NZD_GBP",
  "CAD_JPY", "AUD_JPY", "NZD_JPY",
  "CAD_AUD", "NZD_AUD"
];

// Helper to get reversed pair string, e.g. "EUR_USD" => "USD_EUR"
function reversePair(pair) {
  return pair.split("_").reverse().join("_");
}

fs.readdirSync(FOLDER).forEach(filename => {
  // Check if filename matches a pair and ends with _D1.csv
  const pair = PAIRS.find(p => filename.startsWith(p) && filename.endsWith("_D1.csv"));
  if (!pair) return; // skip if no match

  const filePath = path.join(FOLDER, filename);
  const input = fs.readFileSync(filePath, "utf-8").trim();
  const lines = input.split("\n");

  const header = lines[0];
  const dataLines = lines.slice(1);

  // Invert prices: 1 / price (open, high, low, close)
  const invertedLines = dataLines.map(line => {
    // Adjust split if CSV uses comma or tab; here I assume tab-separated
    const [date, open, high, low, close] = line.split("\t");
    return [
      date,
      (1 / parseFloat(open)).toFixed(5),
      (1 / parseFloat(high)).toFixed(5),
      (1 / parseFloat(low)).toFixed(5),
      (1 / parseFloat(close)).toFixed(5)
    ].join("\t");
  });

  const reversedPair = reversePair(pair);
  const outputFilename = `${reversedPair}_D1.csv`;
  const outputPath = path.join(FOLDER, outputFilename);

  // Write inverted data to new file
  fs.writeFileSync(outputPath, [header, ...invertedLines].join("\n"), "utf-8");
  console.log(`Created reversed file: ${outputFilename}`);

  // Delete original file
  fs.unlinkSync(filePath);
  console.log(`Deleted original file: ${filename}`);
});
