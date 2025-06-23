const fs = require("fs");

const input = fs.readFileSync("CAD_CHF_D1.csv", "utf-8"); // replace with your actual file
const lines = input.trim().split("\n");

const header = lines[0];
const dataLines = lines.slice(1);

const inverted = dataLines.map(line => {
  const [date, open, high, low, close] = line.split("\t");
  return [
    date,
    (1 / parseFloat(open)).toFixed(5),
    (1 / parseFloat(high)).toFixed(5),
    (1 / parseFloat(low)).toFixed(5),
    (1 / parseFloat(close)).toFixed(5)
  ].join("\t");
});

const output = [header, ...inverted].join("\n");

fs.writeFileSync("CHF_CAD_D1.csv", output, "utf-8");
