const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, '../database/bitview.db');

// 데이터베이스 디렉토리 확인 및 생성
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err);
  } else {
    console.log('SQLite 데이터베이스에 연결되었습니다.');
  }
});

// 프로미스 기반 데이터베이스 쿼리 함수
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// 단일 행 조회
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// 데이터 삽입/업데이트/삭제
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          lastID: this.lastID,
          changes: this.changes
        });
      }
    });
  });
};

// 사용자 관련 쿼리 함수들
const userQueries = {
  // 사용자 생성
  create: async (userData) => {
    const { name, email, password } = userData;
    const result = await run(`
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
    `, [name, email, password]);
    return result.lastID;
  },

  // 이메일로 사용자 찾기
  findByEmail: async (email) => {
    return await get(`
      SELECT * FROM users WHERE email = ?
    `, [email]);
  },

  // ID로 사용자 찾기
  findById: async (id) => {
    return await get(`
      SELECT * FROM users WHERE id = ?
    `, [id]);
  },

  // 사용자 정보 업데이트
  update: async (id, userData) => {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(userData)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    
    if (fields.length === 0) return;
    
    values.push(id);
    
    await run(`
      UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, values);
  },

  // 모든 사용자 조회 (관리자용)
  findAll: async () => {
    return await query(`
      SELECT id, name, email, join_date, exchange_registered, exchange_email, is_premium, last_login, created_at
      FROM users
      ORDER BY created_at DESC
    `);
  },

  // 사용자 삭제
  delete: async (id) => {
    await run(`DELETE FROM users WHERE id = ?`, [id]);
  }
};

// 즐겨찾기 관련 쿼리 함수들
const favoriteQueries = {
  // 즐겨찾기 추가
  add: async (userId, coinId) => {
    await run(`
      INSERT OR IGNORE INTO user_favorites (user_id, coin_id)
      VALUES (?, ?)
    `, [userId, coinId]);
  },

  // 즐겨찾기 제거
  remove: async (userId, coinId) => {
    await run(`
      DELETE FROM user_favorites WHERE user_id = ? AND coin_id = ?
    `, [userId, coinId]);
  },

  // 사용자 즐겨찾기 목록 조회
  getByUser: async (userId) => {
    return await query(`
      SELECT coin_id FROM user_favorites WHERE user_id = ?
    `, [userId]);
  }
};

// 비밀번호 재설정 토큰 관련 쿼리 함수들
const resetTokenQueries = {
  // 토큰 생성
  create: async (email, token, expiresAt) => {
    await run(`
      INSERT INTO reset_tokens (email, token, expires_at)
      VALUES (?, ?, ?)
    `, [email, token, expiresAt]);
  },

  // 토큰 조회
  findByEmailAndToken: async (email, token) => {
    return await get(`
      SELECT * FROM reset_tokens 
      WHERE email = ? AND token = ? AND used = 0 AND expires_at > datetime('now')
    `, [email, token]);
  },

  // 토큰 사용 처리
  markAsUsed: async (id) => {
    await run(`
      UPDATE reset_tokens SET used = 1 WHERE id = ?
    `, [id]);
  },

  // 만료된 토큰 정리
  cleanExpired: async () => {
    await run(`
      DELETE FROM reset_tokens WHERE expires_at < datetime('now')
    `);
  }
};

// 계산 사용량 관련 쿼리 함수들
const calculationQueries = {
  // 사용량 증가
  increment: async (userId, calculationType) => {
    const today = new Date().toISOString().split('T')[0];
    await run(`
      INSERT OR REPLACE INTO calculation_usage (user_id, calculation_type, count, date)
      VALUES (?, ?, COALESCE((SELECT count FROM calculation_usage WHERE user_id = ? AND calculation_type = ? AND date = ?), 0) + 1, ?)
    `, [userId, calculationType, userId, calculationType, today, today]);
  },

  // 일일 사용량 조회
  getDailyUsage: async (userId, calculationType, date) => {
    const result = await get(`
      SELECT count FROM calculation_usage 
      WHERE user_id = ? AND calculation_type = ? AND date = ?
    `, [userId, calculationType, date]);
    return result ? result.count : 0;
  }
};

module.exports = {
  db,
  query,
  get,
  run,
  userQueries,
  favoriteQueries,
  resetTokenQueries,
  calculationQueries
}; 