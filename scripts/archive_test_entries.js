import db, { RPL_DB } from '../apps/api/src/config/db.js';

async function archiveTestEntries() {
  const query = `
    UPDATE ${RPL_DB}.rpl_registrations
    SET is_archived = 1, archived_at = NOW()
    WHERE is_archived = 0
      AND (
        email LIKE '%@example.com'
        OR email LIKE '%@test.com'
        OR full_name LIKE '%Test%'
        OR full_name LIKE '%Draft%'
        OR full_name LIKE '%Player%'
        OR full_name LIKE '%Champion%'
        OR full_name LIKE '%Guest%'
        OR full_name LIKE '%Veteran%'
      )
  `;
  const [res] = await db.query(query);
  console.log('Archived rows:', res.affectedRows);
  const [active] = await db.query(`SELECT COUNT(*) as count FROM ${RPL_DB}.rpl_registrations WHERE is_archived = 0`);
  console.log('Active remaining:', active[0].count);
  process.exit(0);
}

archiveTestEntries().catch((err) => {
  console.error(err);
  process.exit(1);
});
