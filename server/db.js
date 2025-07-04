const { Pool } = require("pg");

const db = new Pool({
  connectionString:
    "postgresql://postgres.vztnnforysjfnlizhtnw:scraping@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

db.connect((err, client, release) => {
  if (err) {
    console.error("❌ Gagal konek ke PostgreSQL Supabase:", err.stack);
  } else {
    console.log("✅ Terhubung ke Supabase Pooler");
  }
});

module.exports = db;
