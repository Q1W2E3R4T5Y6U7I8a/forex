const fs = require("fs");

const input = fs.readFileSync("CAD_CHF_D1.csv", "utf-8");
const lines = input.split("\n");

const cleanedLines = lines.map(line => {
  const plusIndex = line.indexOf("+");
  const minusIndex = line.indexOf("-");

  const cutIndex = plusIndex !== -1 && minusIndex !== -1
    ? Math.min(plusIndex, minusIndex)
    : plusIndex !== -1
    ? plusIndex
    : minusIndex;

  return cutIndex !== -1 ? line.slice(0, cutIndex).trimEnd() : line;
});

fs.writeFileSync("CAD_CHF_D1.csv", cleanedLines.join("\n"), "utf-8");
