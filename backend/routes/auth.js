const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { userQueries, favoriteQueries, resetTokenQueries } = require('../utils/database');
const { generateToken, verifyToken, requireAdmin } = require('../middleware/auth');
const { 
  signupSchema, 
  loginSchema, 
  changePasswordSchema, 
  resetPasswordSchema, 
  updateProfileSchema,
  validate,
  sanitizeUser
} = require('../utils/validation');

const router = express.Router();

// 로그인 시도 제한
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5회 시도
  message: {
    success: false,
    message: '너무 많은 로그인 시도가 있었습니다. 15분 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 회원가입 시도 제한
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // 최대 3회 시도
  message: {
    success: false,
    message: '너무 많은 회원가입 시도가 있었습니다. 1시간 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 회원가입 API
router.post('/signup', signupLimiter, validate(signupSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // 이메일 중복 확인
    const existingUser = await userQueries.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 가입된 이메일입니다.'
      });
    }
    
    // 닉네임 중복 확인
    const users = await userQueries.findAll();
    const existingName = users.find(u => u.name && u.name.toLowerCase() === name.toLowerCase());
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.'
      });
    }
    
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 사용자 생성
    const userId = await userQueries.create({
      name,
      email,
      password: hashedPassword
    });
    
    // 생성된 사용자 정보 조회
    const newUser = await userQueries.findById(userId);
    
    // JWT 토큰 생성
    const token = generateToken(newUser);
    
    // 마지막 로그인 시간 업데이트
    await userQueries.update(userId, {
      last_login: new Date().toISOString()
    });
    
    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      token,
      user: sanitizeUser(newUser)
    });
    
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      message: '회원가입 중 오류가 발생했습니다.'
    });
  }
});

// 로그인 API
router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 관리자 계정 확인
    if (email === 'admin@gmail.com' && password === 'admin123') {
      const adminUser = await userQueries.findByEmail(email);
      if (adminUser) {
        const token = generateToken(adminUser);
        
        // 마지막 로그인 시간 업데이트
        await userQueries.update(adminUser.id, {
          last_login: new Date().toISOString()
        });
        
        return res.json({
          success: true,
          message: '로그인되었습니다.',
          token,
          user: sanitizeUser(adminUser)
        });
      }
    }
    
    // 일반 사용자 로그인
    const user = await userQueries.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // JWT 토큰 생성
    const token = generateToken(user);
    
    // 마지막 로그인 시간 업데이트
    await userQueries.update(user.id, {
      last_login: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: '로그인되었습니다.',
      token,
      user: sanitizeUser(user)
    });
    
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다.'
    });
  }
});

// 사용자 정보 조회 API
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await userQueries.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      user: sanitizeUser(user)
    });
    
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 정보 조회 중 오류가 발생했습니다.'
    });
  }
});

// 프로필 업데이트 API
router.put('/profile', verifyToken, validate(updateProfileSchema), async (req, res) => {
  try {
    const { name, exchangeEmail, exchangeRegistered } = req.body;
    const updateData = {};
    
    if (name !== undefined) {
      // 닉네임 중복 확인 (본인 제외)
      const users = await userQueries.findAll();
      const existingName = users.find(u => 
        u.name && 
        u.name.toLowerCase() === name.toLowerCase() && 
        u.id !== req.user.id
      );
      
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: '이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.'
        });
      }
      
      updateData.name = name;
    }
    
    if (exchangeEmail !== undefined) {
      updateData.exchange_email = exchangeEmail;
    }
    
    if (exchangeRegistered !== undefined) {
      updateData.exchange_registered = exchangeRegistered;
      // 거래소 등록 시 프리미엄 활성화
      if (exchangeRegistered) {
        updateData.is_premium = true;
      }
    }
    
    await userQueries.update(req.user.id, updateData);
    
    const updatedUser = await userQueries.findById(req.user.id);
    
    res.json({
      success: true,
      message: '프로필이 업데이트되었습니다.',
      user: sanitizeUser(updatedUser)
    });
    
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다.'
    });
  }
});

// 비밀번호 변경 API
router.put('/change-password', verifyToken, validate(changePasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await userQueries.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 현재 비밀번호 확인
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 새 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // 비밀번호 업데이트
    await userQueries.update(req.user.id, {
      password: hashedPassword
    });
    
    res.json({
      success: true,
      message: '비밀번호가 변경되었습니다.'
    });
    
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({
      success: false,
      message: '비밀번호 변경 중 오류가 발생했습니다.'
    });
  }
});

// 비밀번호 재설정 API
router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    // 토큰 확인
    const resetToken = await resetTokenQueries.findByEmailAndToken(email, token);
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 인증 코드입니다.'
      });
    }
    
    // 사용자 확인
    const user = await userQueries.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 새 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // 비밀번호 업데이트
    await userQueries.update(user.id, {
      password: hashedPassword
    });
    
    // 토큰 사용 처리
    await resetTokenQueries.markAsUsed(resetToken.id);
    
    res.json({
      success: true,
      message: '비밀번호가 재설정되었습니다.'
    });
    
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    res.status(500).json({
      success: false,
      message: '비밀번호 재설정 중 오류가 발생했습니다.'
    });
  }
});

// 즐겨찾기 목록 조회 API
router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const favorites = await favoriteQueries.getByUser(req.user.id);
    const coinIds = favorites.map(f => f.coin_id);
    
    res.json({
      success: true,
      favorites: coinIds
    });
    
  } catch (error) {
    console.error('즐겨찾기 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '즐겨찾기 조회 중 오류가 발생했습니다.'
    });
  }
});

// 즐겨찾기 토글 API
router.post('/favorites/:coinId', verifyToken, async (req, res) => {
  try {
    const { coinId } = req.params;
    const { action } = req.body; // 'add' 또는 'remove'
    
    if (action === 'add') {
      await favoriteQueries.add(req.user.id, coinId);
    } else if (action === 'remove') {
      await favoriteQueries.remove(req.user.id, coinId);
    } else {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 액션입니다.'
      });
    }
    
    res.json({
      success: true,
      message: action === 'add' ? '즐겨찾기에 추가되었습니다.' : '즐겨찾기에서 제거되었습니다.'
    });
    
  } catch (error) {
    console.error('즐겨찾기 토글 오류:', error);
    res.status(500).json({
      success: false,
      message: '즐겨찾기 처리 중 오류가 발생했습니다.'
    });
  }
});

// 모든 사용자 조회 API (관리자용)
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await userQueries.findAll();
    
    res.json({
      success: true,
      users: users.map(sanitizeUser)
    });
    
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 사용자 삭제 API (관리자용)
router.delete('/users/:userId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '본인 계정은 삭제할 수 없습니다.'
      });
    }
    
    await userQueries.delete(userId);
    
    res.json({
      success: true,
      message: '사용자가 삭제되었습니다.'
    });
    
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 삭제 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 