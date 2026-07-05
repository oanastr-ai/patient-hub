import postgres from "postgres";
import { readFileSync } from "fs";

const password = process.env.SUPABASE_DB_PASSWORD;
const candidates = [
  `postgresql://postgres.gwqlugravtkffrpuvomh:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.gwqlugravtkffrpuvomh:${password}@aws-1-eu-central-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres:${password}@db.gwqlugravtkffrpuvomh.supabase.co:5432/postgres`,
];

let sql = null;
let lastErr = null;
for (const url of candidates) {
  try {
    const candidate = postgres(url, { ssl: "require", max: 1, connect_timeout: 15, prepare: false });
    await candidate`select 1`;
    sql = candidate;
    console.log("Connected via:", url.replace(password, "***"));
    break;
  } catch (e) {
    lastErr = e;
    console.log("Failed:", url.replace(password, "***"), "-", e.message);
  }
}
if (!sql) {
  console.error("Could not connect:", lastErr?.message);
  process.exit(1);
}

const files = process.argv.slice(2);
for (const f of files) {
  console.log("Running", f, "...");
  const content = readFileSync(f, "utf-8");
  await sql.unsafe(content);
  console.log("OK:", f);
}
await sql.end();
console.log("Done.");
