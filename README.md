# 🥚 발표 체크 앱 (GitHub + Netlify)

Apps Script 웹앱을 GitHub + Netlify 기반으로 전환한 버전입니다.

---

## 프로젝트 구조

```
├── netlify/functions/        ← 백엔드 API (Netlify Functions)
│   ├── _sheets.js            ← Google Sheets 공통 헬퍼
│   ├── classes.js            ← GET  /api/classes
│   ├── students.js           ← GET  /api/students
│   ├── presentation.js       ← POST /api/presentation
│   ├── class-presentation.js ← POST /api/class-presentation
│   ├── hatch.js              ← POST /api/hatch
│   └── collection.js         ← GET  /api/collection
├── public/
│   ├── index.html            ← 학급 선택 홈
│   └── class.html            ← 학급 페이지
├── netlify.toml
└── package.json
```

---

## 배포 전 설정

### 1. Google 서비스 계정 만들기

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 (또는 기존 프로젝트 선택)
3. **API 및 서비스 → 라이브러리** 에서 `Google Sheets API` 활성화
4. **API 및 서비스 → 사용자 인증 정보** → **서비스 계정 만들기**
5. 서비스 계정 생성 후 **키 추가 → JSON** 다운로드

### 2. 스프레드시트 공유

다운로드한 JSON 파일 안의 `client_email` 값을 복사해서,
Google Sheets 스프레드시트를 해당 이메일에 **편집자** 권한으로 공유

### 3. 스프레드시트 ID 확인

스프레드시트 URL에서 ID 복사:
```
https://docs.google.com/spreadsheets/d/[★이 부분★]/edit
```

---

## GitHub + Netlify 배포

### 1. GitHub 저장소 생성 및 푸시

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 2. Netlify 연동

1. [netlify.com](https://netlify.com) 접속 → **Add new site → Import an existing project**
2. GitHub 저장소 선택
3. Build settings는 자동 감지됨 (netlify.toml 기반)
4. **Deploy site** 클릭

### 3. 환경변수 설정

Netlify 대시보드 → **Site configuration → Environment variables** 에서 추가:

| 변수명 | 값 |
|--------|-----|
| `SPREADSHEET_ID` | 스프레드시트 ID |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | 서비스 계정 JSON 전체 내용 (한 줄로) |

> **JSON 한 줄 변환 방법**: 터미널에서 `cat service-account.json | tr -d '\n'` 실행

### 4. 재배포

환경변수 저장 후 **Deploys → Trigger deploy** 클릭

---

## 로컬 개발

```bash
npm install
cp .env.example .env
# .env 파일에 실제 값 입력

npx netlify dev
# http://localhost:8888 에서 확인
```

---

## REWARDS 시트 컬럼 구조

| 열 | 내용 |
|----|------|
| A (index 0) | 보상 ID |
| B (index 1) | 보상 이름 |
| C (index 2) | 이미지 (이모지) |
| D (index 3) | 희귀도 (common / rare / legendary) |
| E (index 4) | 확률 (숫자, 합산 기준 가중치) |
| F (index 5) | 활성화 여부 (TRUE/FALSE) |

희귀도 판별은 `getRarity()` 함수에서 이름 기반으로 동작합니다.
이름 목록을 바꾸려면 `public/class.html` 하단의 `getRarity()` 함수를 수정하세요.
