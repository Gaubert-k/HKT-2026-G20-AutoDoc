#!/usr/bin/env node
/**
 * Génère un PDF minimal valide (Helvetica, une ligne de texte), sans dépendance npm.
 * Usage : node generate-demo-pdf.js [sortie.pdf]
 */
const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, process.argv[2] || "demo-facture.pdf");

const objects = [
  "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
  "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
  "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
  "4 0 obj\n<< /Length 68 >>\nstream\nBT /F1 14 Tf 72 720 Td (Facture demo AutoDoc - G20) Tj ET\nendstream\nendobj\n",
  "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
];

let body = "%PDF-1.4\n";
const offsets = [0]; // index 0 unused for xref free entry

for (let i = 0; i < objects.length; i++) {
  offsets[i + 1] = Buffer.byteLength(body, "binary");
  body += objects[i];
}

const xrefOffset = Buffer.byteLength(body, "binary");
let xref = "xref\n0 6\n0000000000 65535 f \n";
for (let i = 1; i <= 5; i++) {
  xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
}
const trailer =
  "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" +
  xrefOffset +
  "\n%%EOF\n";

fs.writeFileSync(outPath, body + xref + trailer, "binary");
console.log("Écrit :", outPath);
