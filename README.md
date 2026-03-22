# 초록별 (Chorokbyeol) 🌿

**생명과 교감하는 가드닝 · 초록별**

A personalized plant gardening companion app that combines weather-based care guidance with emotional connection.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)

**🌐 배포 사이트 | Live Demo**: [배포 후 주소 삽입 예정]

---

## 소개 | Introduction

초록별은 반려식물을 사랑하는 사람들을 위한 개인화 가드닝 앱입니다. 날씨 데이터를 기반으로 한 스마트 관리 가이드와 AI 기반 식물 케어 조언을 제공합니다.

Chorokbyeol is a personalized gardening app for plant lovers, providing smart care guidance based on weather data and AI-powered plant care advice.

---

## 주요 기능 | Features

### 🌱 식물 관리 | Plant Management
- 농사로 API 연동으로 1,000+ 식물 정보 검색
- 반려식물 등록 및 닉네임 설정
- 광도, 물주기, 온도, 습도 등 상세 정보 제공

### 💧 스마트 케어 추적 | Smart Care Tracking
- 물주기, 분무, 잎닦기, 영양제, 분갈이 활동 기록
- 흙 상태(건조/촉촉) 추적으로 개인화된 물주기 주기 학습
- 날씨 기반 케어 가이드라인 제공
- 4대 바이탈 게이지 (수분, 조도, 통풍, 온도)

### 🤖 AI 식물 페르소나 | AI Plant Persona
- Google Generative AI 기반 식물 목소리
- 날씨와 케어 상태에 따른 개인화된 메시지
- 식물이 말하는 듯한 자연스러운 대화 경험

### 🌦️ 날씨 연동 테마 | Weather-Integrated Themes
- 실시간 날씨에 따른 배경 테마 자동 변화
- 맑음, 비, 눈, 흐림, 밤 하늘 등 다양한 분위기
- 날씨 기반 식물 관리 조언

### 📝 초록별 일기 | Plant Diary
- 반려식물과의 추억 기록
- 사진, 날씨, 온도 함께 저장
- 식물별 일기 관리

### 🔔 스마트 알림 | Smart Reminders
- 물주기/케어 알림 설정
- 브라우저 푸시 알림 지원
- 개인화된 알림 스케줄

### 👤 사용자 인증 | User Authentication
- 이메일 기반 회원가입/로그인
- Supabase 인증으로 안전한 데이터 관리
- 로컬 데이터 클라우드 동기화

---

## 기술 스택 | Tech Stack

### Frontend
| 기술 | 설명 |
|------|------|
| **React 18** | UI 프레임워크 |
| **TypeScript** | 타입 안정성 |
| **Vite** | 빠른 개발 서버 & 빌드 |
| **TailwindCSS** | 유틸리티 퍼스트 스타일링 |
| **shadcn/ui** | Radix 기반 UI 컴포넌트 |
| **Framer Motion** | 부드러운 애니메이션 |
| **Zustand** | 가벼운 상태 관리 |
| **TanStack Query** | 서버 상태 관리 |
| **React Router** | 클라이언트 라우팅 |
| **Zod** | 스키마 검증 |

### Backend & Services
| 기술 | 설명 |
|------|------|
| **Supabase** | 인증, 데이터베이스, 실시간 동기화 |
| **Google Generative AI** | AI 케어 조언 및 페르소나 |

### APIs
| API | 설명 |
|-----|------|
| **농사로 API** | 농촌진흥청 식물 정보 데이터 (1,000+ 식물) |
| **OpenWeather** | 실시간 날씨 데이터 |

---

## 설치 및 실행 | Installation

### 요구사항 | Requirements
- Node.js 18+
- npm 또는 yarn

### 설치 | Install

```bash
# 저장소 클론
git clone https://github.com/your-username/chorok.git
cd chorok

# 의존성 설치
npm install
```

### 개발 서버 실행 | Development

```bash
npm run dev
```

개발 서버가 http://localhost:8080에서 실행됩니다.

### 프로덕션 빌드 | Production Build

```bash
npm run build
npm run preview
```

### 테스트 | Test

```bash
# 1회 실행
npm run test

# 감시 모드
npm run test:watch
```

### 린트 | Lint

```bash
npm run lint
```

---

## 환경 변수 | Environment Variables

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
# Supabase (필수)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI (선택 - AI 기능 사용 시)
VITE_GOOGLE_AI_KEY=your_google_ai_api_key

# 농사로 API (선택 - 기본값 제공됨)
VITE_NONGSARO_API_KEY=your_nongsaro_api_key
```

| 변수 | 필수 | 설명 |
|------|------|------|
| `VITE_SUPABASE_URL` | ✅ | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase 익명 키 |
| `VITE_GOOGLE_AI_KEY` | ❌ | Google AI API 키 (AI 기능) |
| `VITE_NONGSARO_API_KEY` | ❌ | 농사로 API 키 (기본값 제공) |

---

## 프로젝트 구조 | Project Structure

```
src/
├── components/           # UI 컴포넌트
│   ├── ui/              # shadcn/ui 기본 컴포넌트
│   ├── GreenStarCard.tsx    # 메인 식물 카드
│   ├── GardenList.tsx       # 식물 목록
│   ├── WeatherWidget.tsx    # 날씨 위젯
│   ├── ScheduleWidget.tsx   # 스케줄 위젯
│   ├── VitalGauge.tsx       # 바이탈 게이지
│   ├── DiaryModal.tsx       # 일기 모달
│   ├── PlantSearchModal.tsx # 식물 검색 모달
│   └── ...
├── contexts/            # React Context
│   ├── AuthContext.tsx      # 인증 컨텍스트
│   └── ReminderContext.tsx  # 알림 컨텍스트
├── hooks/               # 커스텀 훅
│   ├── useReminderCheck.ts
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                 # 유틸리티 & API
│   ├── supabase.ts          # Supabase 클라이언트
│   ├── nongsaroApi.ts       # 농사로 API
│   ├── aiVoice.ts           # AI 목소리 생성
│   ├── vitals.ts            # 바이탈 계산
│   ├── notifications.ts     # 알림 관리
│   └── utils.ts             # 공통 유틸리티
├── pages/               # 페이지 컴포넌트
│   ├── Index.tsx            # 메인 페이지
│   └── NotFound.tsx         # 404 페이지
├── store/               # Zustand 스토어
│   └── useAppStore.ts       # 앱 상태 스토어
├── types/               # TypeScript 타입
│   └── database.ts          # DB 타입 정의
├── test/                # 테스트 파일
├── App.tsx              # 루트 컴포넌트
├── main.tsx             # 진입점
└── vite-env.d.ts        # Vite 타입 선언
```

---

## 데이터베이스 구조 | Database Schema

Supabase PostgreSQL 테이블:

| 테이블 | 설명 |
|--------|------|
| `user_plants` | 사용자 반려식물 정보 |
| `care_logs` | 케어 활동 로그 |
| `diary_entries` | 식물 일기 |
| `chat_threads` | AI 채팅 스레드 |
| `chat_messages` | AI 채팅 메시지 |

---

## API 명시 | API Attribution

- **농사로 API** - 농촌진흥청에서 제공하는 식물 정보 API  
  https://www.nongsaro.go.kr

- **OpenWeather API** - 날씨 데이터

---

## 기여 | Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 라이선스 | License

MIT License

---

## 만든 사람 | Author

**초록별 팀**

---

<p align="center">
  🌿 생명과 교감하는 가드닝 · 초록별 🌿
</p>