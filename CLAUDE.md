# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**人生K线图 (Life K-Line Chart)** - A Next.js 16.1.4 application that visualizes Chinese BaZi (八字) fortune-telling as financial K-line charts using AI-generated analysis. Users input their BaZi information, generate an AI prompt, and import JSON results to view their life fortune as a 100-year candlestick chart.

**Tech Stack:**
- Next.js 16.1.4 (App Router)
- TypeScript 5
- Tailwind CSS v4
- Recharts 3.7.0 (for K-line charts)
- Lucide React (icons)

## Commands

```bash
# Development
pnpm dev          # Start dev server (usually port 3000, fallback to 3001)

# Build & Production
pnpm run build    # Production build with TypeScript checking
pnpm start        # Run production server

# Linting
pnpm run lint     # Run ESLint
```

## Architecture

### Data Flow (Three-Step Wizard)

```
1. User Input (/input)
   └─> BaziForm: Collect 八字 info (year/month/day/hour pillars, 大运)

2. Prompt Generation (/input)
   └─> PromptGenerator: Generate AI prompt with BAZI_SYSTEM_INSTRUCTION
   └─> User copies prompt → paste to any AI (ChatGPT, Claude, etc.)

3. JSON Import (/input)
   └─> JsonImporter: Parse & validate AI response
   └─> transformToLifeDestinyResult(): Convert formats & normalize scores
   └─> Save to localStorage → Navigate to /result

4. Results Display (/result)
   └─> LifeKLineChart: 100-year candlestick visualization
   └─> AnalysisResult: 9-dimensional fortune analysis cards
```

### Key Data Transformations

**Score Normalization** (`lib/utils.ts:normalizeScore()`):
- AI returns scores in **0-100 range** (百分制)
- System expects **0-10 range** (十分制)
- Auto-converts: `score > 10 ? Math.round(score/10) : score`

**Format Transformation** (`lib/utils.ts:transformToLifeDestinyResult()`):
- **AI Output (Flat)**: `{ bazi: [], chartPoints: [], summary: "", summaryScore: 8, ... }`
- **System Format (Nested)**: `{ chartData: [], analysis: { bazi: [], summary: "", summaryScore: 8, ... } }`
- Handles both `chartPoints` → `chartData` mapping and score normalization

### Type System (`types/index.ts`)

**Core Interfaces:**
- `UserInput`: BaZi form data (四柱, 起运年龄, 第一步大运)
- `KLinePoint`: Single age data point (age 1-100, with OHLC values + score + reason)
- `AnalysisData`: 9 analysis dimensions (summary, personality, industry, fengShui, wealth, marriage, health, family, crypto)
- `LifeDestinyResult`: Complete result = `{ chartData: KLinePoint[], analysis: AnalysisData }`

### Validation Rules (`lib/validator.ts`)

**Critical Constraints:**
1. **100 Data Points**: Must have exactly 100 KLinePoints (ages 1-100)
2. **K-Line Logic**: `high >= max(open, close)` and `low <= min(open, close)`
3. **Score Range**: All scores must be 0-10 (after normalization)
4. **BaZi Format**: Pillars must be 2 Chinese characters (e.g., "癸未")

### Component Structure

```
app/
├── page.tsx              # Redirects to /input
├── input/page.tsx        # Three-step wizard (BaziForm → PromptGenerator → JsonImporter)
└── result/page.tsx       # Chart + Analysis display with export features

components/
├── BaziForm.tsx          # Step 1: 八字 input form with validation
├── PromptGenerator.tsx   # Step 2: AI prompt generation + clipboard copy
├── JsonImporter.tsx      # Step 3: JSON validation + import (uses transformToLifeDestinyResult)
├── LifeKLineChart.tsx    # Recharts-based candlestick chart (100 years)
├── AnalysisResult.tsx    # 9 analysis cards with ScoreBar components
└── shared/
    ├── Button.tsx        # Reusable button with variants (primary/secondary/outline)
    └── StepIndicator.tsx # Progress indicator (1-2-3)

lib/
├── constants.ts          # BAZI_SYSTEM_INSTRUCTION (AI prompt template)
├── utils.ts              # Data transforms, localStorage, export functions
└── validator.ts          # JSON validation logic
```

## Important Implementation Details

### 大运 (Da Yun) Direction Calculation

```typescript
// lib/utils.ts:getDaYunDirection()
// Rule: 阳男/阴女顺行，阴男/阳女逆行
const yangStems = ['甲', '丙', '戊', '庚', '壬']; // Yang heavenly stems
const isYangYear = yangStems.includes(yearPillar[0]);
const isForward = (gender === 'Male') ? isYangYear : !isYangYear;
```

### Client-Side Rendering Requirements

All components using browser APIs must have `'use client'` directive:
- Form components (useState, localStorage)
- PromptGenerator (navigator.clipboard)
- JsonImporter (localStorage)
- LifeKLineChart (Recharts requires client-side)
- Result page (localStorage, window.print)

### Export Features

**Three export formats** (`app/result/page.tsx`):
1. **JSON**: Raw data backup
2. **HTML**: Complete offline report with inline styles
3. **Print/PDF**: Browser native print with `@media print` optimization

### Data Persistence

**localStorage Keys:**
- `userInput`: UserInput (BaZi form data)
- `lifeDestinyResult`: LifeDestinyResult (complete analysis)
- `userName`: string (user name for display)

## AI Prompt Engineering

The `BAZI_SYSTEM_INSTRUCTION` in `lib/constants.ts` defines:
- Output must be **pure JSON** (no markdown wrappers)
- Scores: **0-10 scale** (though AI often returns 0-100, handled by normalizeScore)
- 100 data points required (ages 1-100, 虚岁)
- K-line reason field: **20-30 characters max**
- Special crypto analysis with "暴富流年" and trading style recommendations

## Common Issues & Solutions

**Issue**: "缺少 analysis 字段"
- **Cause**: AI returned flat format with `chartPoints` instead of nested `chartData + analysis`
- **Solution**: `transformToLifeDestinyResult()` auto-converts formats

**Issue**: "score 必须在 0-10 范围内（当前: 54）"
- **Cause**: AI returned 0-100 scale scores
- **Solution**: `normalizeScore()` auto-converts (54 → 5.4 → 5)

**Issue**: Clipboard copy fails in Safari
- **Solution**: Falls back to `document.execCommand('copy')` if `navigator.clipboard` unavailable

## Styling Conventions

- Tailwind CSS v4 (inline theme configuration)
- Chinese color scheme: Red (吉/bull), Green (凶/bear) - opposite of Western markets
- Responsive breakpoints: mobile (default), md (tablet), lg (desktop)
- Print styles: `.no-print` class hides UI elements, `.print-only` shows detailed tables
