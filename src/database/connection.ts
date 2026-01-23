import knex, { Knex } from 'knex';
import { config } from '../config';

let db: Knex | null = null;

export function getDatabase(): Knex {
  if (!db) {
    // Support DATABASE_URL (Railway, Heroku, etc.) or individual parameters
    const connection = config.databaseUrl 
      ? config.databaseUrl 
      : {
          host: config.postgres.host,
          port: config.postgres.port,
          database: config.postgres.database,
          user: config.postgres.user,
          password: config.postgres.password,
        };

    db = knex({
      client: 'postgresql',
      connection,
      pool: {
        min: 2,
        max: 20,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 2000,
      },
    });

    // Handle pool errors
    db.on('query-error', (error) => {
      console.error('Knex query error:', error);
    });
  }
  return db;
}

export async function initializeDatabase(): Promise<void> {
  await initializeSchema();
}

async function initializeSchema(): Promise<void> {
  const knexInstance = getDatabase();
  
  try {
    // Create reminders table
    const remindersTableExists = await knexInstance.schema.hasTable('reminders');
    if (!remindersTableExists) {
      await knexInstance.schema.createTable('reminders', (table) => {
        table.increments('id').primary();
        table.text('guild_id').notNullable();
        table.text('user_id').notNullable();
        table.text('message').notNullable();
        table.text('cron_expression').notNullable();
        table.text('created_by').notNullable();
        table.timestamp('created_at').defaultTo(knexInstance.fn.now());
      });

      await knexInstance.schema.raw(`
        CREATE INDEX idx_reminders_guild_id ON reminders(guild_id)
      `);
    }

    // Create activity_alerts table
    const activityAlertsTableExists = await knexInstance.schema.hasTable('activity_alerts');
    if (!activityAlertsTableExists) {
      await knexInstance.schema.createTable('activity_alerts', (table) => {
        table.increments('id').primary();
        table.text('guild_id').notNullable();
        table.text('target_user_id').notNullable();
        table.text('alert_user_id').notNullable();
        table.text('alert_type').notNullable();
        table.integer('duration_minutes').notNullable().defaultTo(60);
        table.text('message').nullable();
        table.boolean('enabled').notNullable().defaultTo(true);
        table.timestamp('created_at').defaultTo(knexInstance.fn.now());
      });

      // Add CHECK constraint using raw SQL
      await knexInstance.schema.raw(`
        ALTER TABLE activity_alerts 
        ADD CONSTRAINT activity_alerts_alert_type_check 
        CHECK (alert_type IN ('gaming', 'voice', 'both'))
      `);

      await knexInstance.schema.raw(`
        CREATE INDEX idx_activity_alerts_guild ON activity_alerts(guild_id)
      `);

      await knexInstance.schema.raw(`
        CREATE INDEX idx_activity_alerts_target ON activity_alerts(target_user_id)
      `);
    }

    console.log('[DB] Schéma PostgreSQL initialisé avec Knex');
  } catch (error) {
    console.error('[DB] Erreur lors de l\'initialisation du schéma:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}
