import db, { RPL_DB } from '../config/db.js';

export async function getActiveSports() {
  const [rows] = await db.query(`SELECT id, name FROM ${RPL_DB}.rpl_sports WHERE is_active = TRUE`);
  return rows;
}

export async function getRegistrationFields() {
  const [rows] = await db.query(`SELECT * FROM ${RPL_DB}.rpl_registration_fields ORDER BY sort_order ASC`);
  return rows.map((field) => ({
    ...field,
    options: typeof field.options === 'string' ? JSON.parse(field.options) : field.options,
    validation_rules: typeof field.validation_rules === 'string' ? JSON.parse(field.validation_rules) : field.validation_rules,
  }));
}
