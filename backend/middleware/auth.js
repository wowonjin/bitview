const jwt = require('jsonwebtoken');
const { userQueries } = require('../utils/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// JWT 토큰 생성
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      isPremium: user.is_premium || false 
    },
    JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'bitview',
      audience: 'bitview-users'
    }
  );
};

// JWT 토큰 검증 미들웨어
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: '인증 토큰이 필요합니다.' 
      });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // 토큰의 사용자 정보가 여전히 유효한지 확인
      const user = await userQueries.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: '유효하지 않은 사용자입니다.' 
        });
      }
      
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.is_premium || false,
        exchangeRegistered: user.exchange_registered || false
      };
      
      next();
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false, 
        message: '유효하지 않은 토큰입니다.' 
      });
    }
  } catch (error) {
    console.error('인증 미들웨어 오류:', error);
    return res.status(500).json({ 
      success: false, 
      message: '인증 처리 중 오류가 발생했습니다.' 
    });
  }
};

// 관리자 권한 확인 미들웨어
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.email !== 'admin@gmail.com') {
    return res.status(403).json({ 
      success: false, 
      message: '관리자 권한이 필요합니다.' 
    });
  }
  next();
};

// 프리미엄 사용자 확인 미들웨어
const requirePremium = (req, res, next) => {
  if (!req.user || (!req.user.isPremium && req.user.email !== 'admin@gmail.com')) {
    return res.status(403).json({ 
      success: false, 
      message: '프리미엄 사용자만 이용할 수 있습니다.' 
    });
  }
  next();
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증하지만 없어도 통과)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await userQueries.findById(decoded.userId);
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          isPremium: user.is_premium || false,
          exchangeRegistered: user.exchange_registered || false
        };
      } else {
        req.user = null;
      }
    } catch (jwtError) {
      req.user = null;
    }
    
    next();
  } catch (error) {
    console.error('선택적 인증 미들웨어 오류:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  generateToken,
  verifyToken,
  requireAdmin,
  requirePremium,
  optionalAuth
}; 