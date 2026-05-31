const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'plants-data.js');
let content = fs.readFileSync(filePath, 'utf8');

const categories = {
  "tulip": "garden",
  "sunflower": "garden",
  "dandelion": "garden",
  "hydrangea": "garden",
  "rose": "garden",
  "sakura": "garden",
  "cosmos": "garden",
  "azalea": "garden",
  "nanohana": "food",
  "lily": "garden",
  "pansy": "garden",
  "carnation": "garden",
  "camellia": "garden",
  "cucumber": "food",
  "strawberry": "food",
  "pumpkin": "food",
  "okra": "food",
  "apple": "food",
  "mandarin": "food",
  "broccoli": "food"
};

for (const [id, cat] of Object.entries(categories)) {
  const regex = new RegExp(`(id:\\s*"${id}",)`, 'g');
  content = content.replace(regex, `$1\n    category: "${cat}",`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Categories added successfully.');
