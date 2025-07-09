// API 기본 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com/api' 
  : 'http://localhost:3001/api';

// 로컬 스토리지에서 토큰 가져오기
const getToken = () => {
  return localStorage.getItem('token');
};

// 토큰 저장
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// 토큰 제거
const removeToken = () => {
  localStorage.removeItem('token');
};

// API 요청 기본 함수
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // 인증 토큰 추가
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 요청 본문이 있는 경우 JSON 문자열로 변환
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
    }

    return data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    throw error;
  }
};

// 인증 관련 API 함수들
export const authAPI = {
  // 회원가입
  signup: async (userData) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: userData,
    });
  },

  // 로그인
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  // 사용자 정보 조회
  getMe: async () => {
    return apiRequest('/auth/me');
  },

  // 프로필 업데이트
  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: profileData,
    });
  },

  // 비밀번호 변경
  changePassword: async (passwordData) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: passwordData,
    });
  },

  // 비밀번호 재설정
  resetPassword: async (resetData) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: resetData,
    });
  },

  // 즐겨찾기 목록 조회
  getFavorites: async () => {
    return apiRequest('/auth/favorites');
  },

  // 즐겨찾기 토글
  toggleFavorite: async (coinId, action) => {
    return apiRequest(`/auth/favorites/${coinId}`, {
      method: 'POST',
      body: { action },
    });
  },

  // 모든 사용자 조회 (관리자용)
  getUsers: async () => {
    return apiRequest('/auth/users');
  },

  // 사용자 삭제 (관리자용)
  deleteUser: async (userId) => {
    return apiRequest(`/auth/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// 기타 API 함수들
export const utilAPI = {
  // 비밀번호 재설정 요청
  forgotPassword: async (email) => {
    return apiRequest('/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  // 토큰 검증
  verifyResetToken: async (email, token) => {
    return apiRequest('/verify-reset-token', {
      method: 'POST',
      body: { email, token },
    });
  },

  // 헬스체크
  healthCheck: async () => {
    return apiRequest('/health');
  },
};

// 토큰 유틸리티 함수들 내보내기
export { getToken, setToken, removeToken };

// 에러 처리 유틸리티
export const handleAPIError = (error) => {
  if (error.message.includes('401')) {
    // 인증 실패 시 토큰 제거하고 로그인 페이지로 리디렉션
    removeToken();
    window.location.href = '/login';
    return '인증이 만료되었습니다. 다시 로그인해주세요.';
  }
  
  return error.message || '요청 처리 중 오류가 발생했습니다.';
}; 