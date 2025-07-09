const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BitView 백엔드 프로덕션 시작...');

// 데이터베이스 파일 확인
const dbPath = path.join(__dirname, '../database/bitview.db');
const dbExists = fs.existsSync(dbPath);

console.log(`📍 데이터베이스 위치: ${dbPath}`);
console.log(`💾 데이터베이스 존재: ${dbExists ? '✅' : '❌'}`);

// 데이터베이스가 없으면 초기화
if (!dbExists) {
  console.log('🔧 데이터베이스 초기화 중...');
  try {
    execSync('node scripts/init-db.js', { stdio: 'inherit' });
    console.log('✅ 데이터베이스 초기화 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ 기존 데이터베이스 사용');
}

// 환경 변수 확인
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️ 누락된 환경 변수:', missingEnvVars.join(', '));
  console.warn('💡 Railway 대시보드에서 환경 변수를 설정해주세요.');
}

// 포트 설정
const port = process.env.PORT || 3001;
console.log(`🌐 서버 포트: ${port}`);
console.log(`🔑 JWT 시크릿: ${process.env.JWT_SECRET ? '설정됨' : '❌ 미설정'}`);
console.log(`📧 이메일 설정: ${process.env.EMAIL_USER ? '설정됨' : '❌ 미설정'}`);

console.log('🎯 서버 시작 준비 완료!');

// 메인 서버 시작
require('../server.js'); 