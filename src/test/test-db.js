import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  connectionString: "database_url",
  ssl: {
    rejectUnauthorized: false, // 🔥 THIS LINE FIXES IT
  },
});

async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT NOW()");
    console.log("✅ Connected:", res.rows);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

run();