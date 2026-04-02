import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL.replace('Burhan@2211', 'Burhan%402211').replace('5432', '6543')
  });
  
  await client.connect();
  
  const sql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, password_hash, full_name, role, is_active, preferred_language, newsletter_subscribed
  )
  VALUES (
    NEW.id, NEW.email, '',
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'customer',
    true, 'en', false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_profile_exists(
  p_user_id   uuid,
  p_email     text,
  p_full_name text DEFAULT 'User',
  p_role      text DEFAULT 'customer'
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, password_hash, full_name, role, is_active, preferred_language, newsletter_subscribed
  )
  VALUES (
    p_user_id, p_email, '',
    COALESCE(NULLIF(trim(p_full_name), ''), 'User'),
    'customer',
    true, 'en', false
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;
  `;

  try {
    await client.query(sql);
    console.log("Functions successfully updated in production database!");
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
