const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// 라우터 가져오기
const authRoutes = require('./routes/auth');
const { resetTokenQueries } = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5178';

// 배포 환경을 위한 허용 도메인 설정
const allowedOrigins = [
  'http://localhost:5178',
  'http://localhost:3000', 
  'https://localhost:5178',
  process.env.FRONTEND_URL,
  // Vercel 배포 시 자동으로 생성되는 URL 패턴
  /^https:\/\/.*\.vercel\.app$/,
  // 사용자 정의 도메인
  process.env.CUSTOM_DOMAIN
].filter(Boolean);

// 전역 요청 제한
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100개 요청
  message: {
    success: false,
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 미들웨어 설정
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(globalLimiter);

app.use(cors({
  origin: function (origin, callback) {
    // 같은 도메인에서의 요청이거나 허용된 origin인 경우
    if (!origin || allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      return allowedOrigin.test(origin);
    })) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단됨'));
    }
  },
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 임시 저장소 (실제 프로덕션에서는 데이터베이스 사용)
const resetTokens = new Map();
const userCalculationCounts = new Map(); // 사용자별 계산 횟수 저장

// 이메일 전송 설정
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // 개발 환경에서는 실제 이메일 대신 콘솔에 출력
    return {
      sendMail: async (mailOptions) => {
        console.log('\n=== 이메일 전송 시뮬레이션 ===');
        console.log('받는 사람:', mailOptions.to);
        console.log('제목:', mailOptions.subject);
        console.log('내용:\n', mailOptions.html);
        console.log('===============================\n');
        return { messageId: 'dev-' + Date.now() };
      }
    };
  } else {
    // 프로덕션 환경에서는 실제 이메일 전송
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

const transporter = createTransporter();

// 인증 라우터 등록
app.use('/api/auth', authRoutes);

// 헬스체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 비밀번호 재설정 요청 API
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일을 입력해주세요.' 
      });
    }

    // 데이터베이스에서 사용자 확인
    const { userQueries } = require('./utils/database');
    const user = await userQueries.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '해당 이메일로 가입된 계정이 없습니다.' 
      });
    }
    
    // 재설정 토큰 생성 (6자리 숫자)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15분 후 만료

    // 토큰을 데이터베이스에 저장
    await resetTokenQueries.create(email, resetToken, expiresAt.toISOString());

    // 이메일 내용 생성
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; margin-top: 20px; }
          .header { background: linear-gradient(135deg, #3182F6, #1D4ED8); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .token-box { background: #f8f9fa; border: 2px dashed #3182F6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .token { font-size: 32px; font-weight: bold; color: #3182F6; letter-spacing: 8px; }
          .button { display: inline-block; background: linear-gradient(135deg, #3182F6, #1D4ED8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 BitView 비밀번호 재설정</h1>
          </div>
          <div class="content">
            <h2>안녕하세요!</h2>
            <p>BitView 계정의 비밀번호 재설정을 요청하셨습니다.</p>
            <p>아래의 인증 코드를 사용하여 새 비밀번호를 설정하세요:</p>
            
            <div class="token-box">
              <div class="token">${resetToken}</div>
              <p style="margin: 10px 0 0 0; color: #666;">인증 코드 (15분간 유효)</p>
            </div>
            
            <p>또는 아래 링크를 클릭하여 직접 비밀번호를 재설정하세요:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">비밀번호 재설정하기</a>
            </div>
            
            <p><strong>주의사항:</strong></p>
            <ul>
              <li>이 링크는 15분 후 만료됩니다</li>
              <li>비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요</li>
              <li>보안을 위해 다른 사람과 이 코드를 공유하지 마세요</li>
            </ul>
          </div>
          <div class="footer">
            <p>이 이메일은 BitView에서 자동으로 발송되었습니다.</p>
            <p>문의사항이 있으시면 고객센터로 연락해주세요.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 이메일 전송
    const mailOptions = {
      from: `"BitView" <${process.env.EMAIL_USER || 'noreply@bitview.com'}>`,
      to: email,
      subject: '🔐 BitView 비밀번호 재설정 요청',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    // 만료된 토큰 자동 정리 (백그라운드 작업)
    setTimeout(async () => {
      await resetTokenQueries.cleanExpired();
    }, 15 * 60 * 1000);

    res.json({ 
      success: true, 
      message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.',
      token: process.env.NODE_ENV === 'development' ? resetToken : undefined // 개발환경에서만 토큰 반환
    });

  } catch (error) {
    console.error('이메일 전송 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '이메일 전송 중 오류가 발생했습니다.' 
    });
  }
});

// 토큰 검증 API
app.post('/api/verify-reset-token', async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일과 토큰을 모두 입력해주세요.' 
      });
    }

    // 데이터베이스에서 토큰 검증
    const savedToken = await resetTokenQueries.findByEmailAndToken(email, token);

    if (!savedToken) {
      return res.status(400).json({ 
        success: false, 
        message: '유효하지 않은 인증 코드입니다.' 
      });
    }

    res.json({ 
      success: true, 
      message: '토큰이 확인되었습니다.' 
    });

  } catch (error) {
    console.error('토큰 검증 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '토큰 검증 중 오류가 발생했습니다.' 
    });
  }
});

// 비밀번호 변경 API
app.post('/api/reset-password', (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '모든 필드를 입력해주세요.' 
      });
    }

    const savedToken = resetTokens.get(email);

    if (!savedToken || savedToken.token !== token) {
      return res.status(400).json({ 
        success: false, 
        message: '유효하지 않은 요청입니다.' 
      });
    }

    if (new Date() > savedToken.expiresAt) {
      resetTokens.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: '인증 코드가 만료되었습니다.' 
      });
    }

    // 토큰 삭제 (일회용)
    resetTokens.delete(email);

    // 실제로는 데이터베이스에서 비밀번호 업데이트
    // 현재는 프론트엔드에서 localStorage 업데이트

    res.json({ 
      success: true, 
      message: '비밀번호가 성공적으로 변경되었습니다.' 
    });

  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '비밀번호 변경 중 오류가 발생했습니다.' 
    });
  }
});

// 계산 횟수 조회 API
app.get('/api/calculation-count/:email', (req, res) => {
  try {
    const { email } = req.params;
    const userCounts = userCalculationCounts.get(email) || {
      profitCalculationCount: 0,
      fundingCalculationCount: 0
    };
    
    res.json({ 
      success: true, 
      data: userCounts
    });
  } catch (error) {
    console.error('계산 횟수 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '계산 횟수 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 계산 횟수 증가 API
app.post('/api/calculation-count/increment', (req, res) => {
  try {
    const { email, type } = req.body; // type: 'profit' or 'funding'
    
    if (!email || !type) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일과 계산 타입을 모두 입력해주세요.' 
      });
    }

    const userCounts = userCalculationCounts.get(email) || {
      profitCalculationCount: 0,
      fundingCalculationCount: 0
    };

    if (type === 'profit') {
      userCounts.profitCalculationCount += 1;
    } else if (type === 'funding') {
      userCounts.fundingCalculationCount += 1;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: '유효하지 않은 계산 타입입니다.' 
      });
    }

    userCalculationCounts.set(email, userCounts);

    res.json({ 
      success: true, 
      data: userCounts
    });
  } catch (error) {
    console.error('계산 횟수 증가 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '계산 횟수 증가 중 오류가 발생했습니다.' 
    });
  }
});

// 계산 횟수 초기화 API (관리자용)
app.post('/api/calculation-count/reset', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일을 입력해주세요.' 
      });
    }

    userCalculationCounts.set(email, {
      profitCalculationCount: 0,
      fundingCalculationCount: 0
    });

    res.json({ 
      success: true, 
      message: '계산 횟수가 초기화되었습니다.' 
    });
  } catch (error) {
    console.error('계산 횟수 초기화 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '계산 횟수 초기화 중 오류가 발생했습니다.' 
    });
  }
});

// 모든 사용자 계산 횟수 조회 API (관리자용)
app.get('/api/all-calculation-counts', (req, res) => {
  try {
    const allCounts = {};
    for (const [email, counts] of userCalculationCounts.entries()) {
      allCounts[email] = counts;
    }
    
    res.json({ 
      success: true, 
      data: allCounts
    });
  } catch (error) {
    console.error('전체 계산 횟수 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '전체 계산 횟수 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 헬스 체크 API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BitView Backend API Server is running',
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 BitView Backend API Server is running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.NODE_ENV === 'development' ? 'Development (Console)' : 'Production'}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
});

module.exports = app; 