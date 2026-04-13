/**
 * config.js — Site Configuration
 * Managed via Admin Panel (/admin.html)
 * ============================================================
 *
 * Google Drive 이미지 자동 로드 설정 방법:
 *  1. https://console.cloud.google.com/ 에서 프로젝트 생성
 *  2. "Google Drive API" 활성화
 *  3. 사용자 인증 정보 → API 키 생성 (도메인 제한 권장)
 *  4. 아래 googleDrive.apiKey 에 입력
 */

const SITE_CONFIG = {

  /* ── 브랜드 ─────────────────────────────────────────────── */
  brand: {
    name:        "Prestige Events",
    tagline:     "Gallery",
    description: "Documenting and preserving exceptional moments from premium events and gatherings around the world.",
    year:        "2025"
  },

  /* ── 히어로 섹션 ─────────────────────────────────────────── */
  hero: {
    label:        "Premium Event Gallery",
    title:        "Moments That\nDefine Excellence",
    description:  "Discover our curated collection of premium event galleries. From galas to conferences, explore the moments that make each occasion unforgettable.",
    ctaPrimary:   "Explore All Events →",
    ctaSecondary: "View Featured",
    image:        "https://picsum.photos/seed/prestige-hero/600/750",
    captionTitle: "Gallery Archive",
    captionText:  "High quality event photography and curated moments"
  },

  /* ── 통계 수치 ───────────────────────────────────────────── */
  stats: {
    events:      "6+",
    photos:      "500+",
    established: "2025"
  },

  /* ── 섹션 텍스트 ─────────────────────────────────────────── */
  sections: {
    featuredTitle:    "Featured Events",
    featuredSubtitle: "Highlighted moments from our premium collection",
    featuredViewAll:  "View All",
    recentTitle:      "Recent Events",
    recentSubtitle:   "Latest additions to our gallery collection",
    recentBrowseAll:  "Browse All Events",
    ctaTitle:         "Experience Premium Events",
    ctaText:          "Each event is carefully documented to preserve the atmosphere, energy, and special moments that make our gatherings unforgettable.",
    ctaButton:        "Explore Event Galleries →"
  },

  /* ── Google Drive 연동 ──────────────────────────────────── */
  googleDrive: {
    apiKey: ""
  },

  /* ── 푸터 카테고리 ───────────────────────────────────────── */
  footerCategories: [
    { label: "Gala",             value: "Gala"       },
    { label: "Conferences",      value: "Conference" },
    { label: "Festivals",        value: "Festival"   },
    { label: "Product Launches", value: "Launch"     }
  ],

  /* ── 소셜 링크 ──────────────────────────────────────────── */
  social: [
    { label: "Instagram", url: "#" },
    { label: "Twitter",   url: "#" },
    { label: "LinkedIn",  url: "#" }
  ]

};
