/**
 * config.js — Site Configuration
 *
 * 이 파일에서 사이트 전체 설정을 수정할 수 있습니다.
 * ============================================================
 *
 * Google Drive 이미지 자동 로드 설정 방법:
 *
 *  1. https://console.cloud.google.com/ 에서 프로젝트 생성
 *  2. "Google Drive API" 활성화
 *  3. 사용자 인증 정보 → API 키 생성
 *  4. API 키를 아래 googleDrive.apiKey 에 입력
 *  5. 각 이벤트의 driveFolderUrl 에 Google Drive 폴더 공유 URL 입력
 *     (폴더 공유 설정: "링크가 있는 모든 사용자" → "뷰어")
 *
 * ============================================================
 */

const SITE_CONFIG = {

  /* 브랜드 정보 */
  brand: {
    name:        "Prestige Events",
    tagline:     "Gallery",
    description: "Documenting and preserving exceptional moments from premium events and gatherings around the world.",
    year:        "2025"
  },

  /* 통계 수치 (홈 히어로 섹션) */
  stats: {
    events:      "6+",
    photos:      "500+",
    established: "2025"
  },

  /* Google Drive 연동 */
  googleDrive: {
    /**
     * Google Drive API 키를 여기에 입력하세요.
     * 비워두면 각 이벤트의 images[] 배열에서 이미지를 로드합니다.
     */
    apiKey: ""
  },

  /* 푸터 카테고리 링크 */
  footerCategories: [
    { label: "Gala",             value: "Gala"       },
    { label: "Conferences",      value: "Conference" },
    { label: "Festivals",        value: "Festival"   },
    { label: "Product Launches", value: "Launch"     }
  ],

  /* 소셜 링크 */
  social: [
    { label: "Instagram", url: "#" },
    { label: "Twitter",   url: "#" },
    { label: "LinkedIn",  url: "#" }
  ]

};
