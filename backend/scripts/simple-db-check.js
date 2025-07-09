const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, '../database/bitview.db');

console.log('=== BitView 데이터베이스 정보 ===');
console.log('📍 위치:', dbPath);

// 파일 크기 확인
try {
  const stats = fs.statSync(dbPath);
  const fileSizeInKB = (stats.size / 1024).toFixed(2);
  console.log(`💾 크기: ${fileSizeInKB} KB`);
} catch (error) {
  console.log('❌ 파일을 찾을 수 없습니다.');
  process.exit(1);
}

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

// 사용자 수 확인
db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
  if (err) {
    console.error('❌ 오류:', err.message);
  } else {
    console.log(`👥 등록된 사용자: ${row.count}명`);
  }
  
  // 즐겨찾기 수 확인
  db.get("SELECT COUNT(*) as count FROM user_favorites", [], (err, row) => {
    if (err) {
      console.error('❌ 오류:', err.message);
    } else {
      console.log(`⭐ 즐겨찾기: ${row.count}개`);
    }
    
    // 관리자 확인
    db.get("SELECT name FROM users WHERE email = 'admin@gmail.com'", [], (err, row) => {
      if (err) {
        console.error('❌ 오류:', err.message);
      } else if (row) {
        console.log(`🔑 관리자: ${row.name}`);
      } else {
        console.log('❌ 관리자 계정 없음');
      }
      
      console.log('✅ 데이터베이스 상태 정상');
      db.close();
    });
  });
}); 