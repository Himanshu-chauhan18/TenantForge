import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Schema changes:
 *
 * 1. organization_profiles.data_access
 *    BEFORE: ENUM('all','organization','self','custom')
 *    AFTER:  INT UNSIGNED — 0=all 1=organization 2=self 3=custom
 *
 *    Strategy: MySQL stores ENUM values as 1-based ordinals internally.
 *    Changing the column type to INT converts them in-place (all=1, org=2, self=3, custom=4).
 *    A single UPDATE then shifts by -1 to reach the desired 0-based mapping.
 *    No temp column needed.
 *
 * 2. organization_profile_permissions — full table replacement
 *    BEFORE: one row per (profile_id, module_key STRING, feature_key STRING)
 *            with four TINYINT columns (can_view, can_add, can_edit, can_delete)
 *    AFTER:  one row per (profile_id, module_id INT UNSIGNED)
 *            module_id now has a proper FK → modules.id (INT UNSIGNED matches)
 *            permissions JSON holds ALL feature perms for that module:
 *            { "module": {v,a,e,d}, "<addon_id>": {v,a,e,d}, … }
 *            — "module" key = module-level  |  numeric string key = module_addon.id
 *            — v=view  a=add  e=edit  d=delete  (0|1)
 *
 *    UNIQUE index on (profile_id, module_id) enforces one-row-per-module.
 */
export default class extends BaseSchema {
  async up() {
    // ── 1. Convert data_access ENUM → INT UNSIGNED (idempotent) ──────────────
    const [colInfo] = await this.db.rawQuery(`
      SELECT COLUMN_TYPE FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME   = 'organization_profiles'
        AND COLUMN_NAME  = 'data_access'
    `)
    const isEnum = String(colInfo[0]?.COLUMN_TYPE ?? '').startsWith('enum')

    if (isEnum) {
      // MySQL converts ENUM to its 1-based ordinal when the type changes to INT.
      // Ordinals: all=1  organization=2  self=3  custom=4
      await this.schema.raw(`
        ALTER TABLE organization_profiles
          MODIFY COLUMN data_access INT UNSIGNED NOT NULL DEFAULT 3
      `)
      // Shift to 0-based: 1→0  2→1  3→2  4→3
      await this.schema.raw(`
        UPDATE organization_profiles SET data_access = data_access - 1
      `)
      // Set final default and comment
      await this.schema.raw(`
        ALTER TABLE organization_profiles
          MODIFY COLUMN data_access INT UNSIGNED NOT NULL DEFAULT 2
          COMMENT '0=all 1=organization 2=self 3=custom'
      `)
    }

    // ── 2. Rebuild organization_profile_permissions ───────────────────────────
    await this.schema.raw(`DROP TABLE IF EXISTS organization_profile_permissions`)

    await this.schema.raw(`
      CREATE TABLE organization_profile_permissions (
        id         INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        profile_id INT UNSIGNED NOT NULL,
        module_id  INT UNSIGNED NOT NULL
                   COMMENT 'FK to modules.id',
        permissions JSON NOT NULL
                   COMMENT '{"module":{"v":1,"a":1,"e":1,"d":1},"<addon_id>":{"v":1,"a":0,"e":0,"d":0}}',
        created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_profile_module (profile_id, module_id),
        KEY        idx_module_id     (module_id),
        CONSTRAINT fk_opp_profile FOREIGN KEY (profile_id)
          REFERENCES organization_profiles (id) ON DELETE CASCADE,
        CONSTRAINT fk_opp_module  FOREIGN KEY (module_id)
          REFERENCES modules (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  }

  async down() {
    // ── Restore organization_profile_permissions (old schema, no data recovery) ─
    await this.schema.raw(`DROP TABLE IF EXISTS organization_profile_permissions`)

    await this.schema.raw(`
      CREATE TABLE organization_profile_permissions (
        id          INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
        profile_id  INT UNSIGNED  NOT NULL,
        module_key  VARCHAR(64)   NOT NULL,
        feature_key VARCHAR(128)  NOT NULL DEFAULT 'module',
        can_view    TINYINT UNSIGNED NOT NULL DEFAULT 0,
        can_add     TINYINT UNSIGNED NOT NULL DEFAULT 0,
        can_edit    TINYINT UNSIGNED NOT NULL DEFAULT 0,
        can_delete  TINYINT UNSIGNED NOT NULL DEFAULT 0,
        created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_opp_profile_old FOREIGN KEY (profile_id)
          REFERENCES organization_profiles (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // ── Restore data_access INT → ENUM (idempotent) ───────────────────────────
    const [colInfo] = await this.db.rawQuery(`
      SELECT COLUMN_TYPE FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME   = 'organization_profiles'
        AND COLUMN_NAME  = 'data_access'
    `)
    const isInt = String(colInfo[0]?.COLUMN_TYPE ?? '').startsWith('int')

    if (isInt) {
      // Shift to 1-based: 0→1  1→2  2→3  3→4 (ENUM ordinals)
      await this.schema.raw(`
        UPDATE organization_profiles SET data_access = data_access + 1
      `)
      // MySQL converts INT ordinals back to ENUM string values
      await this.schema.raw(`
        ALTER TABLE organization_profiles
          MODIFY COLUMN data_access
          ENUM('all','organization','self','custom') NOT NULL DEFAULT 'self'
      `)
    }
  }
}
