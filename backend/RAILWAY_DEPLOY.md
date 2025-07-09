# 🚀 Railway 배포 가이드

## 1단계: Railway 계정 준비

### Railway 가입
1. [Railway.app](https://railway.app) 접속
2. GitHub 계정으로 로그인
3. 무료 플랜으로 시작 (500시간/월 무료)

## 2단계: 프로젝트 배포

### 방법 1: GitHub 연동 (권장)
1. GitHub에 backend 폴더를 푸시
2. Railway 대시보드에서 "Deploy from GitHub" 선택
3. 저장소 선택 후 backend 폴더 지정

### 방법 2: Railway CLI 사용
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 배포
railway up
```

## 3단계: 환경 변수 설정

Railway 대시보드 → Variables 탭에서 다음 변수들을 설정:

### 필수 변수
```env
NODE_ENV=production
JWT_SECRET=super-secure-random-string-at-least-32-characters-long
PORT=3001
```

### 이메일 설정 (선택)
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### 프론트엔드 URL (CORS 설정)
```env
FRONTEND_URL=https://your-netlify-site.netlify.app
CUSTOM_DOMAIN=your-custom-domain.com
```

## 4단계: 도메인 확인

배포 완료 후:
1. Railway에서 제공하는 URL 확인 (예: `https://your-app.railway.app`)
2. `https://your-app.railway.app/api/health` 접속하여 서버 상태 확인
3. 응답 예시:
   ```json
   {
     "success": true,
     "message": "Server is running",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

## 5단계: 프론트엔드 연결

`src/utils/api.js` 파일에서 API URL 업데이트:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.railway.app/api'  // Railway URL로 변경
  : 'http://localhost:3001/api';
```

## 6단계: 테스트

### 기본 테스트
1. 회원가입 테스트
2. 로그인 테스트
3. 즐겨찾기 추가/제거 테스트

### API 직접 테스트
```bash
# 서버 상태 확인
curl https://your-app.railway.app/api/health

# 관리자 로그인 테스트
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin123"}'
```

## 💰 요금 정보

### 무료 플랜
- **500시간/월** 무료 (약 20일)
- **1GB RAM**
- **1GB 스토리지**
- **무제한 대역폭**

### Pro 플랜 ($20/월)
- **무제한 사용시간**
- **8GB RAM**
- **100GB 스토리지**
- **팀 협업 기능**

## 🔧 유용한 명령어

### 로그 확인
```bash
railway logs
```

### 환경 변수 확인
```bash
railway variables
```

### 로컬에서 Railway 환경으로 실행
```bash
railway run npm start
```

### 데이터베이스 백업
```bash
railway run npm run db:check
```

## 🛠️ 문제 해결

### 자주 발생하는 문제들

#### 1. 환경 변수 오류
```
⚠️ 누락된 환경 변수: JWT_SECRET
```
**해결**: Railway 대시보드에서 JWT_SECRET 설정

#### 2. CORS 오류
```
CORS 정책에 의해 차단됨
```
**해결**: FRONTEND_URL 환경 변수 설정

#### 3. 데이터베이스 초기화 실패
```
❌ 데이터베이스 초기화 실패
```
**해결**: Railway 로그 확인 후 재배포

### 로그 확인 방법
1. Railway 대시보드 → Deployments 탭
2. 최신 배포 클릭 → Logs 확인
3. 오류 메시지 확인 후 수정

## ✅ 성공 확인 체크리스트

- [ ] Railway 프로젝트 생성 완료
- [ ] 환경 변수 설정 완료 (JWT_SECRET 필수)
- [ ] 배포 성공 및 서버 실행 확인
- [ ] `/api/health` 엔드포인트 응답 확인
- [ ] 프론트엔드에서 API 연결 테스트
- [ ] 회원가입/로그인 기능 테스트
- [ ] 데이터베이스 정상 작동 확인

배포 성공을 축하합니다! 🎉 