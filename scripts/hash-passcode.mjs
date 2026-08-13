import bcrypt from "bcryptjs";

const passcode = process.argv[2];
if (!passcode) {
  console.error("Uso: node scripts/hash-passcode.mjs <codigo-de-acceso>");
  process.exit(1);
}

const hash = await bcrypt.hash(passcode, 10);
console.log(hash);
