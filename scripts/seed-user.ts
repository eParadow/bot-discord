import dotenv from "dotenv";
import {
  getDatabase,
  initializeDatabase,
  closeDatabase,
} from "../src/common/database/connection";
import { getUserByUsername, createUser } from "../src/common/database/users";

// Load environment variables
dotenv.config();

async function seedUser() {
  try {
    console.log("🌱 Démarrage du seed utilisateur...");

    // Get credentials from environment variables
    const username = process.env.SEED_USERNAME;
    const password = process.env.SEED_PASSWORD;

    if (!username || !password) {
      console.error(
        "❌ Erreur: SEED_USERNAME et SEED_PASSWORD doivent être définis dans le fichier .env",
      );
      process.exit(1);
    }

    // Initialize database
    const db = getDatabase();
    await initializeDatabase();

    // Check if user already exists
    const existingUser = await getUserByUsername(username);

    if (existingUser) {
      console.log(`✅ L'utilisateur "${username}" existe déjà`);
      await closeDatabase();
      process.exit(0);
    }

    // Create user
    const user = await createUser({
      username,
      password,
    });

    console.log(`✅ Utilisateur créé avec succès:`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Created at: ${user.created_at}`);

    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    await closeDatabase();
    process.exit(1);
  }
}

seedUser();
