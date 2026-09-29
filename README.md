# Toby Worklog

Engineering worklog, knowledge base and problem/solution archive, built with [Astro](https://astro.build).
Target: `https://tobytang-bot.github.io/`. Architecture: [docs/architecture-assessment.md](docs/architecture-assessment.md).

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + static build to dist/
```

## Content

| Path | Purpose |
|---|---|
| `src/content/worklog/<yyyy>/<yyyy-mm-dd>-<slug>.md` | What was done on a given day → `/worklog/<yyyy>/<mm>/<dd>-<slug>/` |
| `src/content/knowledge/<topic>/<slug>.md` | Long-lived, structured knowledge → `/knowledge/<topic>/<slug>/` |
| `src/content/topics.yaml` | Topic tree (`parent` for hierarchy) |
| `src/content/projects/<id>.yaml` | Projects referenced by `project:` |
| `templates/worklog.md` | Template for new worklogs (human or AI generated) |

Frontmatter is validated by `src/content.config.ts`; an unknown topic/project, an invalid `status`,
or a worklog filename date that differs from `date` fails the build.

The previous Jekyll site is preserved at tag `legacy-jekyll`.
