const Joi = require('joi');

// 회원가입 검증 스키마
const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(20).required().messages({
    'string.empty': '이름을 입력해주세요.',
    'string.min': '이름은 2자 이상이어야 합니다.',
    'string.max': '이름은 20자 이하여야 합니다.',
    'any.required': '이름을 입력해주세요.'
  }),
  email: Joi.string().email().required().messages({
    'string.email': '올바른 이메일 형식이 아닙니다.',
    'string.empty': '이메일을 입력해주세요.',
    'any.required': '이메일을 입력해주세요.'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9]).*$')).required().messages({
    'string.empty': '비밀번호를 입력해주세요.',
    'string.min': '비밀번호는 8자 이상이어야 합니다.',
    'string.pattern.base': '비밀번호는 영문과 숫자를 포함해야 합니다.',
    'any.required': '비밀번호를 입력해주세요.'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': '비밀번호가 일치하지 않습니다.',
    'any.required': '비밀번호 확인을 입력해주세요.'
  })
});

// 로그인 검증 스키마
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '올바른 이메일 형식이 아닙니다.',
    'string.empty': '이메일을 입력해주세요.',
    'any.required': '이메일을 입력해주세요.'
  }),
  password: Joi.string().required().messages({
    'string.empty': '비밀번호를 입력해주세요.',
    'any.required': '비밀번호를 입력해주세요.'
  })
});

// 비밀번호 변경 검증 스키마
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': '현재 비밀번호를 입력해주세요.',
    'any.required': '현재 비밀번호를 입력해주세요.'
  }),
  newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9]).*$')).required().messages({
    'string.empty': '새 비밀번호를 입력해주세요.',
    'string.min': '새 비밀번호는 8자 이상이어야 합니다.',
    'string.pattern.base': '새 비밀번호는 영문과 숫자를 포함해야 합니다.',
    'any.required': '새 비밀번호를 입력해주세요.'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': '새 비밀번호가 일치하지 않습니다.',
    'any.required': '새 비밀번호 확인을 입력해주세요.'
  })
});

// 비밀번호 재설정 검증 스키마
const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '올바른 이메일 형식이 아닙니다.',
    'string.empty': '이메일을 입력해주세요.',
    'any.required': '이메일을 입력해주세요.'
  }),
  token: Joi.string().required().messages({
    'string.empty': '인증 토큰을 입력해주세요.',
    'any.required': '인증 토큰을 입력해주세요.'
  }),
  newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9]).*$')).required().messages({
    'string.empty': '새 비밀번호를 입력해주세요.',
    'string.min': '새 비밀번호는 8자 이상이어야 합니다.',
    'string.pattern.base': '새 비밀번호는 영문과 숫자를 포함해야 합니다.',
    'any.required': '새 비밀번호를 입력해주세요.'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': '새 비밀번호가 일치하지 않습니다.',
    'any.required': '새 비밀번호 확인을 입력해주세요.'
  })
});

// 프로필 업데이트 검증 스키마
const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(20).messages({
    'string.min': '이름은 2자 이상이어야 합니다.',
    'string.max': '이름은 20자 이하여야 합니다.'
  }),
  exchangeEmail: Joi.string().email().allow('').messages({
    'string.email': '올바른 이메일 형식이 아닙니다.'
  }),
  exchangeRegistered: Joi.boolean()
});

// 검증 미들웨어 생성 함수
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    next();
  };
};

// 이메일 형식 검증
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 비밀번호 강도 검증
const isValidPassword = (password) => {
  const minLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  
  return {
    minLength,
    hasNumber,
    hasLetter,
    isValid: minLength && hasNumber && hasLetter
  };
};

// 안전한 사용자 정보 반환 (비밀번호 제외)
const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

module.exports = {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  validate,
  isValidEmail,
  isValidPassword,
  sanitizeUser
}; 