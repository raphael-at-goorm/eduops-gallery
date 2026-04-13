/**
 * data.js — Event Data
 *
 * 이벤트를 추가하거나 수정할 때 이 파일을 편집하세요.
 *
 * driveFolderUrl: Google Drive 폴더 공유 URL을 붙여넣으세요.
 *   예) "https://drive.google.com/drive/folders/1A2B3C4D5E?usp=sharing"
 *   (config.js 에 API 키가 설정되어 있어야 자동 로드됩니다.)
 *
 * images: driveFolderUrl 없이 직접 이미지 URL을 지정할 수도 있습니다.
 *   Google Drive 직접 링크 형식: "https://drive.google.com/uc?export=view&id={파일ID}"
 */

const EVENTS_DATA = [
  {
    id: 1,
    slug: "annual-charity-gala",
    title: "Annual Charity Gala",
    shortDescription: "An Evening of Elegance & Giving",
    description: "Our flagship charity event brought together industry leaders, culinary masters, entertainment icons, and thousands of guests for an unforgettable evening of philanthropy and celebration. The night was filled with inspiring speeches, world-class performances, and extraordinary cuisine.",
    date: "March 15, 2025",
    location: "Grand Ballroom, Baltimore",
    category: "Gala",
    year: "2025",
    coverImage: "https://picsum.photos/seed/gala-cover/800/600",
    featured: true,
    recent: true,
    driveFolderUrl: "",
    images: [
      "https://picsum.photos/seed/gala-01/1200/800",
      "https://picsum.photos/seed/gala-02/1200/800",
      "https://picsum.photos/seed/gala-03/800/1000",
      "https://picsum.photos/seed/gala-04/1200/800",
      "https://picsum.photos/seed/gala-05/800/800",
      "https://picsum.photos/seed/gala-06/1200/800",
      "https://picsum.photos/seed/gala-07/800/1000",
      "https://picsum.photos/seed/gala-08/1200/800",
      "https://picsum.photos/seed/gala-09/800/800",
      "https://picsum.photos/seed/gala-10/1200/800",
      "https://picsum.photos/seed/gala-11/800/800",
      "https://picsum.photos/seed/gala-12/1200/800"
    ]
  },
  {
    id: 2,
    slug: "spring-leadership-summit",
    title: "Spring Leadership Summit",
    shortDescription: "Innovation & Strategy",
    description: "A gathering of thought leaders and innovators exploring the future of industry. Two days of keynotes, workshops, and networking sessions that redefined how we think about leadership in a rapidly changing world.",
    date: "March 22, 2025",
    location: "Innovation Center, Baltimore",
    category: "Conference",
    year: "2025",
    coverImage: "https://picsum.photos/seed/summit-cover/800/600",
    featured: false,
    recent: true,
    driveFolderUrl: "",
    images: [
      "https://picsum.photos/seed/summit-01/1200/800",
      "https://picsum.photos/seed/summit-02/800/1000",
      "https://picsum.photos/seed/summit-03/1200/800",
      "https://picsum.photos/seed/summit-04/800/800",
      "https://picsum.photos/seed/summit-05/1200/800",
      "https://picsum.photos/seed/summit-06/800/1000",
      "https://picsum.photos/seed/summit-07/1200/800",
      "https://picsum.photos/seed/summit-08/800/800"
    ]
  },
  {
    id: 3,
    slug: "fashion-week-showcase",
    title: "Fashion Week Showcase",
    shortDescription: "Future of Sustainable Fashion",
    description: "An exclusive presentation of emerging designers and sustainable fashion innovations. The runway came alive with bold creativity and environmental consciousness, showcasing the next generation of fashion forward thinking.",
    date: "April 5, 2025",
    location: "Skyline Gallery, Baltimore",
    category: "Festival",
    year: "2025",
    coverImage: "https://picsum.photos/seed/fashion-cover/800/600",
    featured: false,
    recent: true,
    driveFolderUrl: "",
    images: [
      "https://picsum.photos/seed/fashion-01/1200/800",
      "https://picsum.photos/seed/fashion-02/800/1000",
      "https://picsum.photos/seed/fashion-03/1200/800",
      "https://picsum.photos/seed/fashion-04/800/800",
      "https://picsum.photos/seed/fashion-05/1200/800",
      "https://picsum.photos/seed/fashion-06/800/1000",
      "https://picsum.photos/seed/fashion-07/1200/800",
      "https://picsum.photos/seed/fashion-08/800/800",
      "https://picsum.photos/seed/fashion-09/1200/800"
    ]
  },
  {
    id: 4,
    slug: "product-launch-event",
    title: "Product Launch Event",
    shortDescription: "Next Generation Innovation",
    description: "Creating breakthrough products with flair. An exclusive gathering of industry insiders, media, and early adopters who witnessed the unveiling of our most ambitious innovations to date.",
    date: "November 30, 2025",
    location: "Tech Hub, Baltimore",
    category: "Launch",
    year: "2025",
    coverImage: "https://picsum.photos/seed/launch-cover/800/600",
    featured: false,
    recent: true,
    driveFolderUrl: "",
    images: [
      "https://picsum.photos/seed/launch-01/1200/800",
      "https://picsum.photos/seed/launch-02/800/1000",
      "https://picsum.photos/seed/launch-03/1200/800",
      "https://picsum.photos/seed/launch-04/800/800",
      "https://picsum.photos/seed/launch-05/1200/800",
      "https://picsum.photos/seed/launch-06/800/1000"
    ]
  },
  {
    id: 5,
    slug: "corporate-awards-dinner",
    title: "Corporate Awards Dinner",
    shortDescription: "Celebrating Excellence in Business",
    description: "An annual celebration recognizing outstanding achievements in business, innovation, and community service. The evening honored leaders who have made extraordinary contributions to their industries and communities.",
    date: "January 20, 2025",
    location: "The Ritz, Baltimore",
    category: "Gala",
    year: "2025",
    coverImage: "https://picsum.photos/seed/awards-cover/800/600",
    featured: false,
    recent: false,
    driveFolderUrl: "",
    images: [
      "https://picsum.photos/seed/awards-01/1200/800",
      "https://picsum.photos/seed/awards-02/800/1000",
      "https://picsum.photos/seed/awards-03/1200/800",
      "https://picsum.photos/seed/awards-04/800/800",
      "https://picsum.photos/seed/awards-05/1200/800",
      "https://picsum.photos/seed/awards-06/800/1000"
    ]
  },
  {
    id: 6,
    slug: "tech-symposium-2025",
    title: "Tech Symposium 2025",
    shortDescription: "The Future of Technology",
    description: "Bringing together the brightest minds in technology for a day of deep insights, hands-on workshops, and meaningful networking. A conference that sets the agenda for the year ahead.",
    date: "February 14, 2025",
    location: "Convention Center, Baltimore",
    category: "Conference",
    year: "2025",
    coverImage: "https://picsum.photos/seed/tech-cover/800/600",
    featured: false,
    recent: false,
    driveFolderUrl: "",
    images: [
      "https://picsum.photos/seed/tech-01/1200/800",
      "https://picsum.photos/seed/tech-02/800/1000",
      "https://picsum.photos/seed/tech-03/1200/800",
      "https://picsum.photos/seed/tech-04/800/800",
      "https://picsum.photos/seed/tech-05/1200/800",
      "https://picsum.photos/seed/tech-06/800/1000",
      "https://picsum.photos/seed/tech-07/1200/800",
      "https://picsum.photos/seed/tech-08/800/800"
    ]
  }
];
