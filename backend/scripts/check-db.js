const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, '../database/bitview.db');

console.log('=== BitView 데이터베이스 현황 ===\n');
console.log('📍 데이터베이스 위치:', dbPath);

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ 데이터베이스 연결 오류:', err.message);
    return;
  }
  console.log('✅ 데이터베이스 연결 성공\n');
});

// 테이블 목록 조회
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('테이블 조회 오류:', err.message);
    return;
  }
  
  console.log('📋 생성된 테이블 목록:');
  tables.forEach((table, index) => {
    console.log(`${index + 1}. ${table.name}`);
  });
  console.log('');

  // 각 테이블의 데이터 개수 확인
  let completedQueries = 0;
  const totalTables = tables.length;

  tables.forEach((table) => {
    db.get(`SELECT COUNT(*) as count FROM ${table.name}`, [], (err, row) => {
      if (err) {
        console.error(`${table.name} 테이블 조회 오류:`, err.message);
      } else {
        console.log(`📊 ${table.name}: ${row.count}개 레코드`);
      }
      
      completedQueries++;
      if (completedQueries === totalTables) {
        console.log('');
        
        // 사용자 정보 미리보기
        db.all("SELECT id, name, email, join_date, exchange_registered, is_premium FROM users LIMIT 5", [], (err, users) => {
          if (err) {
            console.error('사용자 조회 오류:', err.message);
          } else if (users.length > 0) {
            console.log('👥 사용자 목록 (최근 5명):');
            users.forEach((user) => {
              console.log(`- ID: ${user.id}, 이름: ${user.name}, 이메일: ${user.email}`);
              console.log(`  가입일: ${user.join_date}, 프리미엄: ${user.is_premium ? '✅' : '❌'}`);
            });
          } else {
            console.log('👥 등록된 사용자가 없습니다.');
          }
          
          console.log('\n=== 데이터베이스 크기 정보 ===');
          
          // 파일 크기 확인
          const fs = require('fs');
          try {
            const stats = fs.statSync(dbPath);
            const fileSizeInBytes = stats.size;
            const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
            const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
            
            console.log(`💾 데이터베이스 파일 크기: ${fileSizeInKB} KB (${fileSizeInMB} MB)`);
          } catch (error) {
            console.error('파일 크기 확인 오류:', error.message);
          }
          
          db.close();
        });
      }
    });
  });
}); 