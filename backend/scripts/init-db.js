const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, '../database/bitview.db');

// 데이터베이스 디렉토리 생성
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath);

// 테이블 생성
db.serialize(() => {
  console.log('데이터베이스 테이블 생성 중...');
  
  // 사용자 테이블 생성
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      exchange_registered BOOLEAN DEFAULT 0,
      exchange_email TEXT,
      is_premium BOOLEAN DEFAULT 0,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 사용자 즐겨찾기 테이블 생성
  db.run(`
    CREATE TABLE IF NOT EXISTS user_favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      coin_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(user_id, coin_id)
    )
  `);

  // 비밀번호 재설정 토큰 테이블 생성
  db.run(`
    CREATE TABLE IF NOT EXISTS reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 사용자 세션 테이블 생성 (옵션)
  db.run(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // 계산 사용량 테이블 생성
  db.run(`
    CREATE TABLE IF NOT EXISTS calculation_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      calculation_type TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(user_id, calculation_type, date)
    )
  `);

  // 관리자 계정 생성
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'admin123';
  
  bcrypt.hash(adminPassword, 10, (err, hash) => {
    if (err) {
      console.error('관리자 비밀번호 해싱 오류:', err);
      return;
    }
    
    db.run(`
      INSERT OR IGNORE INTO users (name, email, password, is_premium, exchange_registered)
      VALUES (?, ?, ?, ?, ?)
    `, ['Admin', adminEmail, hash, 1, 1], function(err) {
      if (err) {
        console.error('관리자 계정 생성 오류:', err);
      } else {
        console.log('관리자 계정이 생성되었습니다.');
      }
      
      // 관리자 계정 생성 후 데이터베이스 연결 종료
      db.close((err) => {
        if (err) {
          console.error('데이터베이스 연결 종료 오류:', err);
        } else {
          console.log('데이터베이스 연결이 종료되었습니다.');
        }
      });
    });
  });

  console.log('데이터베이스 초기화 완료!');
}); 