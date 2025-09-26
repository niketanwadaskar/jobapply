const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(process.cwd(), 'job_applications.db'));
    this.init();
  }

  init() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          isApplied BOOLEAN DEFAULT FALSE,
          appliedDate TEXT,
          applicationCount INTEGER DEFAULT 0,
          hrReplied BOOLEAN DEFAULT FALSE,
          hrReplyNotes TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add applicationCount column if it doesn't exist (for existing databases)
      this.db.run(`
        ALTER TABLE applications ADD COLUMN applicationCount INTEGER DEFAULT 0
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding applicationCount column:', err);
        }
      });

      // Add hrReplied column if it doesn't exist (for existing databases)
      this.db.run(`
        ALTER TABLE applications ADD COLUMN hrReplied BOOLEAN DEFAULT FALSE
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding hrReplied column:', err);
        }
      });

      // Add hrReplyNotes column if it doesn't exist (for existing databases)
      this.db.run(`
        ALTER TABLE applications ADD COLUMN hrReplyNotes TEXT
      `, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding hrReplyNotes column:', err);
        }
      });
    });
  }

  async addEmails(emails) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO applications (email, name, isApplied, appliedDate, applicationCount, hrReplied, hrReplyNotes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      let successCount = 0;
      let errorCount = 0;
      
      emails.forEach(email => {
        stmt.run([email.email, email.name || null, false, null, 0, false, null], function(err) {
          if (err) {
            errorCount++;
            console.error('Error inserting email:', err);
          } else {
            successCount++;
          }
        });
      });
      
      stmt.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ successCount, errorCount });
        }
      });
    });
  }

  async getAllApplications() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM applications 
        ORDER BY createdAt DESC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getUnappliedEmails() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM applications 
        WHERE isApplied = FALSE
        ORDER BY createdAt DESC
      `, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async updateApplicationStatus(email, isApplied, appliedDate = null) {
    return new Promise((resolve, reject) => {
      if (isApplied) {
        // Increment application count when marking as applied
        this.db.run(`
          UPDATE applications 
          SET isApplied = ?, appliedDate = ?, applicationCount = applicationCount + 1, updatedAt = CURRENT_TIMESTAMP
          WHERE email = ?
        `, [isApplied, appliedDate, email], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        });
      } else {
        // Just update status without incrementing count
        this.db.run(`
          UPDATE applications 
          SET isApplied = ?, appliedDate = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE email = ?
        `, [isApplied, appliedDate, email], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        });
      }
    });
  }

  async updateEmailName(email, name) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE applications 
        SET name = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE email = ?
      `, [name, email], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  async updateHrReplyStatus(email, hrReplied, hrReplyNotes = null) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE applications 
        SET hrReplied = ?, hrReplyNotes = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE email = ?
      `, [hrReplied, hrReplyNotes, email], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  async checkEmailExists(email) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT * FROM applications WHERE email = ?
      `, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });
  }

  async deleteApplication(email) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        DELETE FROM applications WHERE email = ?
      `, [email], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;

