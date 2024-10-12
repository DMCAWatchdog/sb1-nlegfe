import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any;

export async function initializeDatabase() {
  db = await open({
    filename: './dmca.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS violations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      domain TEXT NOT NULL,
      criteria TEXT NOT NULL,
      date_detected TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      case_number TEXT
    );

    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_number TEXT NOT NULL,
      violation_id INTEGER,
      date_sent TEXT NOT NULL,
      status TEXT DEFAULT 'Sent',
      backdated BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (violation_id) REFERENCES violations(id)
    );

    CREATE TABLE IF NOT EXISTS notice_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL,
      template TEXT NOT NULL
    );
  `);
}

export async function getViolations() {
  return db.all('SELECT * FROM violations ORDER BY date_detected DESC');
}

export async function addViolation(violation: any) {
  const { url, domain, criteria, date_detected } = violation;
  return db.run(
    'INSERT INTO violations (url, domain, criteria, date_detected) VALUES (?, ?, ?, ?)',
    [url, domain, criteria, date_detected]
  );
}

export async function updateViolationStatus(id: number, status: string, case_number: string | null = null) {
  return db.run(
    'UPDATE violations SET status = ?, case_number = ? WHERE id = ?',
    [status, case_number, id]
  );
}

export async function addNotice(notice: any) {
  const { case_number, violation_id, date_sent, backdated } = notice;
  return db.run(
    'INSERT INTO notices (case_number, violation_id, date_sent, backdated) VALUES (?, ?, ?, ?)',
    [case_number, violation_id, date_sent, backdated]
  );
}

export async function getNotices() {
  return db.all(`
    SELECT n.*, v.url, v.domain, v.criteria
    FROM notices n
    JOIN violations v ON n.violation_id = v.id
    ORDER BY n.date_sent DESC
  `);
}

export async function getNoticeTemplate(domain: string) {
  return db.get('SELECT template FROM notice_templates WHERE domain = ?', [domain]);
}

export async function addNoticeTemplate(domain: string, template: string) {
  return db.run(
    'INSERT OR REPLACE INTO notice_templates (domain, template) VALUES (?, ?)',
    [domain, template]
  );
}