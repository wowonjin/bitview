// 모바일 디바이스 감지 함수
export const isMobileDevice = () => {
  // 화면 너비 기준
  const screenWidth = window.innerWidth;
  
  // User Agent 기준 모바일 감지
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileUserAgents = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Mobile/i,
    /Tablet/i
  ];
  
  const isMobileUA = mobileUserAgents.some(regex => regex.test(userAgent));
  
  // 터치 지원 여부
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // 화면 너비가 768px 이하이거나 모바일 User Agent이거나 터치 디바이스인 경우
  return screenWidth <= 768 || isMobileUA || isTouchDevice;
};

// 태블릿 감지 함수
export const isTabletDevice = () => {
  const screenWidth = window.innerWidth;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // iPad 또는 Android 태블릿 감지
  const isIPad = /iPad/i.test(userAgent);
  const isAndroidTablet = /Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
  
  // 화면 너비가 768px 이상 1024px 이하인 경우
  return (screenWidth >= 768 && screenWidth <= 1024) || isIPad || isAndroidTablet;
};

// 모바일 또는 태블릿 감지
export const isMobileOrTablet = () => {
  return isMobileDevice() || isTabletDevice();
};

// 화면 크기 변화 감지를 위한 리스너
export const addResizeListener = (callback) => {
  const handleResize = () => {
    callback({
      isMobile: isMobileDevice(),
      isTablet: isTabletDevice(),
      isMobileOrTablet: isMobileOrTablet(),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    });
  };
  
  window.addEventListener('resize', handleResize);
  
  // 초기 상태 콜백
  handleResize();
  
  // 리스너 제거 함수 반환
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}; 