// extract-icons.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Paths and module metadata
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'SvgIconExtract.vue'); // Change to your input file name
const outputDir = path.join(__dirname, 'assets/icons'); // Ensure this path points to the correct folder

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true }); // Ensures nested folders are created if necessary
}

// Read the component file
const componentContent = fs.readFileSync(inputFile, 'utf8');

// Match each SVG icon template section, handling both `v-if` and `v-else-if` conditions
const svgRegex = /<svg\s+(v-if|v-else-if)="svg === '(.*?)'".*?>([\s\S]*?)<\/svg>/g;
let match;

while ((match = svgRegex.exec(componentContent)) !== null) {
  const iconName = match[2]; // Icon name
  const svgAttributes = match[0]
    .replace(/<svg\s+(v-if|v-else-if)="[^"]+"\s*/, '<svg ') // Remove `v-if` or `v-else-if` condition
    .match(/<svg(.*?)>/)[1]; // Capture other attributes in the <svg> tag
  const svgContent = `<svg${svgAttributes}>${match[3]}</svg>`; // Reassemble the full SVG with preserved attributes

  // Write each SVG to a separate file in assets/icons
  const outputFilePath = path.join(outputDir, `${iconName}.svg`);
  fs.writeFileSync(outputFilePath, svgContent);
  console.log(`Saved: ${outputFilePath}`);
}

console.log('Icons extracted successfully!');
