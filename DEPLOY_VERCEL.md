# BitView — Vercel 배포 가이드

## 1. 사전 준비

- [Vercel](https://vercel.com) 계정
- GitHub 저장소에 코드 푸시 (`wowonjin/bitview` 또는 본인 fork)
- [Firebase Console](https://console.firebase.google.com) — Authentication, Firestore 활성화

## 2. Vercel 프로젝트 연결

1. Vercel 대시보드 → **Add New** → **Project**
2. GitHub 저장소 `bitview` (또는 `Upbit_trading`) 선택
3. 프레임워크: **Vite** (자동 감지)
4. Root Directory: `.` (기본값)
5. Build Command: `npm run build` (기본값)
6. Output Directory: `dist` (기본값)

`vercel.json`이 있으면 위 설정은 자동 적용됩니다.

## 3. 환경 변수 (필수)

**Project → Settings → Environment Variables** 에 아래를 추가합니다.  
(로컬 개발 시에는 `.env` 파일에 동일 키 사용)

| 이름 | 설명 |
|------|------|
| `VITE_FIREBASE_API_KEY` | Firebase 웹 API 키 |
| `VITE_FIREBASE_AUTH_DOMAIN` | `xxx.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | 프로젝트 ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | 스토리지 버킷 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics (선택) |
| `VITE_APP_URL` | 배포 URL (예: `https://bitview.vercel.app`) |

값은 Firebase Console → 프로젝트 설정 → **내 앱** → SDK 구성에서 확인합니다.

## 4. Firebase 인증 도메인 등록

배포 후 로그인이 동작하려면:

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. 다음 도메인 추가:
   - `your-project.vercel.app`
   - 커스텀 도메인 사용 시 해당 도메인

## 5. 배포

### Git 연동 (권장)

`main` 브랜치에 push하면 Vercel이 자동으로 Production 배포합니다.

### CLI

```powershell
cd c:\Upbit_trading
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
# .env.local 값 확인 후
vercel --prod
```

## 6. 로컬에서 프로덕션 빌드 확인

```powershell
npm run build
npm run preview
```

## 7. 트러블슈팅

| 증상 | 해결 |
|------|------|
| `/chart` 등 직접 URL 404 | `vercel.json` rewrites 확인, 재배포 |
| 로그인 실패 | Firebase Authorized domains에 Vercel URL 추가 |
| 빌드 실패 | `npm ci && npm run build` 로컬 재현 |
| 환경 변수 미반영 | 변수 추가 후 **Redeploy** (VITE_ 접두사 필수) |

## 8. 커스텀 도메인

Vercel → Project → **Domains** 에 도메인 추가 후, DNS(CNAME) 설정.  
Firebase Authorized domains에도 동일 도메인을 등록하세요.
