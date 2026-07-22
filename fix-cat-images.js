import pg from 'pg';

const dbUrl = "postgresql://postgres.ytlpcvmmhqzircthlyjb:Burhan@2211@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new pg.Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log("Connected to DB.");

    // Update any category that doesn't have an image with a default real image
    // I will use a known perfume image as fallback for empty categories so they look real.
    const res = await client.query(`
      UPDATE categories
      SET image_url = '/images/perfumes/kashmiri-oudh.jpeg'
      WHERE image_url IS NULL OR image_url = '';
    `);
    
    console.log(`Updated ${res.rowCount} empty categories with a default real product image.`);

  } catch (err) {
    console.error("Error updating db:", err);
  } finally {
    await client.end();
  }
}

run();
