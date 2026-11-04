# Codewise

**Live:** [codewise.lumivoxx.com](https://codewise.lumivoxx.com)

Codewise is a free, self-hosted learning platform with hands-on courses for data engineers, SAP developers and business leaders. Every lesson is written as Markdown and rendered as a fast static site.

## Courses

| Course | Lessons | For |
|---|---|---|
| **PySpark for Absolute Beginners** | 30 | DataFrames, joins, partitions, shuffles, skew, caching, performance tuning, production patterns, interview prep |
| **ABAP Classic: SAP Programming from Scratch** | 30 | Reports, internal tables, Open SQL, ALV, BAPIs, IDocs, debugging |
| **ABAP Modern: RAP, CDS & ABAP Cloud** | 25 | CDS views, RAP business objects, ABAP Cloud, clean core for S/4HANA |
| **AI for Leadership** | 26 | AI literacy, strategy, governance, risk, talent, ROI and leadership decisions |

That's 110+ lessons in total.

## Tech

- **Next.js (App Router) + TypeScript**, statically exported
- **Content as code:** each course is a folder of Markdown lessons in `content/<course>/` with a `_meta.json`, registered in `content/courses.json`
- **Tailwind CSS** for styling
- **Docker + Nginx** for self-hosting (`Dockerfile`, `nginx.conf`, `deploy.sh`)

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
```

## Add a course

1. Create `content/<course-id>/` with numbered Markdown lessons (`01-intro.md`, …) and a `_meta.json`.
2. Add an entry to `content/courses.json`.
3. Rebuild.

## Author

Built by [Deepak Pandalai](https://github.com/deepakp999), who leads data and AI work in the commercial vehicle industry.
