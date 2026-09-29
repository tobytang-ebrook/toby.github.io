# Toby Worklog Architecture Assessment

> 评估日期：2026-09-29
> 扫描范围：`astro-site` 分支（与 `main` 一致）全部源码、4 篇文章、线上站点实际 URL / sitemap / HTML 输出。
> 分析阶段只读，未修改任何项目代码。

## 0. 已确认的决策

| 决策 | 结论 |
|---|---|
| 主方向 | **Full Rebuild（Astro）**，保留 Markdown 内容 |
| 站点名称 / 域名 | **`tobytang-bot.github.io`**（根域名 `https://tobytang-bot.github.io/`，`base: '/'`） |
| 报告位置 | `docs/architecture-assessment.md` |

> **前提条件**：GitHub user site 的仓库名必须与账号名一致（`<owner>.github.io`）。
> `tobytang-bot.github.io` 必须建在 GitHub 账号 / 组织 **`tobytang-bot`** 名下才会部署到根域名。
> 若建在 `tobytang-ebrook` 名下，它只是普通 project site，URL 会变成
> `https://tobytang-ebrook.github.io/tobytang-bot.github.io/`，失去改名意义。
> 因此 Phase 5 前需要先创建 `tobytang-bot` 账号或组织。

---

## 1. Executive Summary

**结论：保留 Markdown 内容，其余推倒重建（Option C，Full Rebuild on Astro），新站部署到 `tobytang-bot.github.io`。**

关键原因（均来自实际代码）：

1. **现有代码本质上是一个 Jekyll 入门主题**：2 个 layout、5 个 include、4 个 CSS（864 行）、3 个 JS（75 行），基本保持 fork 时的状态（最早 commit 为 2021-11 "Initial commit with working all pages"）。它是「单列博客卡片 + 分类弹窗」结构，与目标「三栏文档 + Dashboard」在布局范式上完全不同，**UI 层几乎零复用**。
2. **内容量极小**：4 篇文章，其中 1 篇是主题示例（`jekyll-markdown.md`），真正的技术内容仅 3 篇、约 280 行 Markdown。迁移成本接近零，是重建成本最低的时刻。
3. **无论走哪条路，UI 都要全部重写**：即使留在 Jekyll，也需要重写全部模板与 CSS，并从 classic Pages build 切到 GitHub Actions（TOC / 分页等插件不在白名单）。真正的比较对象是「用 Jekyll 重写」vs「用 Astro 重写」，工作量接近，而 Astro 在 **frontmatter Schema 校验**（AI 生成 Worklog 的关键护栏）、标题自动提取（TOC）、组件复用、TypeScript 上明显占优。
4. **域名本来就要变更**（改为 `tobytang-bot.github.io`），旧 URL 无论如何都需要兼容方案，进一步降低了「保留旧架构以保 URL」的价值。

---

## 2. Current Architecture

| 项目 | 实际情况（以代码为准） |
|---|---|
| Framework / SSG | **Jekyll**；`Gemfile` 未锁定 `github-pages`，线上实际为 GitHub Pages 内置 Jekyll 3.10，本地与线上环境不一致 |
| Markdown | kramdown，Rouge 高亮（`assets/css/syntax.css` 硬编码配色） |
| Content | `all_collections/_posts/*.md`（`collections_dir: all_collections`） |
| Routing | `permalink: /posts/:title/`，线上 `/toby.github.io/posts/server/` |
| CSS | 纯手写 CSS 4 个文件，无预处理器，无 Tailwind |
| JS | `categories.js`（Liquid 生成分类弹窗）、`mode.js`（主题切换）、`lbox.js`（图片放大） |
| Search | **无** |
| SEO | 启用了 `jekyll-seo-tag`，但 `_includes/head.html` **未调用 `{% seo %}`**，线上无 description / canonical / OG；sitemap、feed、robots 存在 |
| Deployment | **Classic "Deploy from branch"（main）**，仓库中无 `.github/workflows` |
| Base URL | `_config.yml` 未设 `baseurl`，由 GitHub Pages 注入 `/toby.github.io` |

```text
all_collections/_posts/*.md  (frontmatter: layout/title/date/categories)
        ↓
Jekyll 3.10 (GitHub Pages 内置, kramdown + Rouge)
        ↓
_layouts/blog.html | post.html  +  _includes/*
        ↓  (categories.js 由 Liquid 渲染, 全量文章写入 JS)
GitHub Pages classic build (main 分支)
        ↓
https://tobytang-ebrook.github.io/toby.github.io/
```

目标架构：

```text
src/content/**/*.md (Zod schema 校验)
        ↓
Astro (TypeScript, Content Collections, Shiki)
        ↓
layouts / components (静态 HTML, 少量 island)
        ↓
Pagefind 索引 (postbuild)
        ↓
GitHub Actions → GitHub Pages
        ↓
https://tobytang-bot.github.io/
```

---

## 3. Current Information Architecture

| 当前 | 实现 | 目标 |
|---|---|---|
| Home | `index.md` → `blog.html`，全量列表，无分页 | Dashboard（Search / 统计 / Recently Updated / Knowledge / Projects） |
| Posts | `/posts/:slug/` | `/worklog/…`、`/knowledge/…` |
| Categories | **无独立页面**，JS 弹窗（`href="#!"`，不可索引） | `/topics/`，支持层级（Magento → Cloud → Cron） |
| Tags | 无（`categories` 兼任） | topics + tags |
| Archive | 无 | `/archive/` 年 / 月 / 日 |
| Projects | 无 | `/projects/<id>/` |
| Search | 无 | 全文搜索 + ⌘K |

---

## 4. Gap Analysis

| Capability | Current | Target | Gap | Difficulty（Jekyll / Astro） |
|---|---|---|---|---|
| Content Model | `title/date/categories` | type / status / topics / project / updated / description | 新建 | 中 / **低**（Zod schema） |
| Schema 校验 | 无，错字段静默通过 | 构建失败并报错 | 核心 | **高**（需自写插件） / 低 |
| Worklog / Knowledge | 无 | 两个 collection | 新建 | 中 / 低 |
| Projects | 无 | 数据 + 反向关联 | 新建 | 中 / 低（`reference()`） |
| 层级 Topic | 扁平 categories，大小写混乱（`Php`、`Mysql`） | 树状 | 重新设计 | 中 / 中 |
| Archive | 无 | 年 / 月 / 日 | 新建 | 中（Liquid `group_by_exp`） / 低 |
| Search | 无 | 全文 + 过滤 | 新建 | 低 / 低（Pagefind 两边都可） |
| Article TOC | 无 | Sticky TOC + Mobile TOC | 新建 | 高（插件不在白名单） / **低**（`render()` 返回 `headings`） |
| Heading Anchor / Copy Code | 无 | 有 | 新建 | 中 / 低（rehype + Shiki） |
| Prev / Next / Related | 无 | 有 | 新建 | 中 / 低 |
| Dark Mode | 有，但变量定义 4 遍；未跟随系统偏好初始化（系统为暗色时首次点击仍设为 dark） | Token 化主题 | 重写 | 低 / 低 |
| Responsive | 单列 + 3 个断点 | 三栏 → 单栏 + 抽屉 | 重写 | 中 / 中 |
| SEO | 无 meta / canonical / OG | 完整 | 中 | 低 / 低 |
| AI Integration | 无结构 | 结构化 + 可校验 | 核心 | 高 / 低 |
| 部署 | Classic build | Actions | 切换 | 两者都需 |
| 域名 | `tobytang-ebrook.github.io/toby.github.io/` | `tobytang-bot.github.io/` | 跨域迁移 | 两者相同 |

---

## 5. Reusable Parts

### 可以直接保留

- **3 篇技术文章的 Markdown 正文**（`server`、`docker-command`、`mysql-command`）。
- **GitHub + GitHub Pages 托管方式**。
- **`/feed.xml`、`/sitemap.xml` 路径约定**（新站在同路径输出）。
- `_data/author.yml` 中的作者信息（改写为 TS / JSON 配置）。
- **旧仓库 `tobytang-ebrook/toby.github.io` 本身**：切换后改为「仅重定向」的兼容站（见 §8）。

### 可以重构后保留（保留思路，不保留代码）

- 分类 → Topic 体系，改为真实静态页面，不再用弹窗。
- 图片 Lightbox（`lbox.js`，23 行）→ 可作为很小的 island，或直接删除。
- Dark mode `data-theme` + `localStorage` 机制 → 思路保留，重写实现。

### 建议删除 / 替换

| 对象 | 原因 |
|---|---|
| 全部 CSS（864 行） | `blog.css` 与 `post.css` 的 reset / body / header 大段重复；主题变量在 `common.css` 定义 4 遍；13 处 `!important`；正文使用 JetBrains Mono 等宽字体，不利于长时间阅读；两处 Google Fonts `@import` 阻塞渲染 |
| `categories.js` | 每页 `<head>` 内联全站文章（随文章数线性膨胀）；残留 `console.log`；反引号拼接标题，标题含反引号会破坏 JS；覆盖 `window.onload`；`replace(" ","_")` 只替换第一个空格 |
| `category-modal` | 分类不可被索引、不可分享 |
| `jekyll-markdown.md` | 主题演示内容，含 picsum 外链图片 |
| `bio.html` + 社交 PNG | 与 Dashboard 定位不符 |
| `404.md` | 拼写错误（dosen't），复用 post layout |

**复用比例：内容约 100%，代码约 0–5%。**

---

## 6. Three Implementation Options

### Option A — Incremental Optimization（保留 Jekyll 渐进修改）

- **修改内容**：在现有模板上加 TOC、Topic 页、Archive、Pagefind。
- **优点**：表面改动小。
- **缺点**：目标布局与现有布局完全不同，「渐进」实际是逐个文件重写，同时背着旧 CSS 的重复与 `!important`。
- **技术债务**：持续累积，出现两套 CSS 并存。
- **迁移风险**：低，但收益也低。
- **判断**：**不成立**，没有值得渐进保留的资产。

### Option B — Partial Refactor（保留 Jekyll，重写布局与内容模型）

- **保留**：Jekyll、Markdown。
- **重写**：全部 layout / include / CSS / JS；切到 GitHub Actions + Jekyll 4。
- **风险 / 问题**：
  - frontmatter 无类型校验，AI 生成内容的错误字段无法拦截；
  - Liquid 实现层级 Topic、Related、按 project 反查都很冗长；
  - TOC 依赖第三方插件或前端 JS 解析；
  - Ruby 工具链与日常 Node / PHP 环境割裂。
- **判断**：工作量与 C 相近，却拿不到 Schema 校验这一关键收益。

### Option C — Full Rebuild（Astro）

- **新架构**：Astro + TypeScript + Content Collections（Zod）+ Markdown / MDX + CSS Tokens（或 Tailwind）+ Shiki + Pagefind + GitHub Actions。
- **内容迁移**：3 篇，手工级工作量。
- **URL 兼容**：新站 `site: 'https://tobytang-bot.github.io'`、`base: '/'`；旧仓库保留为重定向站，逐条把旧 URL 指到新域名，并带 canonical（见 §8）。
- **开发成本**：与 B 相当，多出的只是 Astro 学习时间。
- **未来维护**：Node 单工具链；`astro check` 可放进 CI；Decap CMS 可直接读写 `src/content/**`。

---

## 7. Recommended Direction：**Full Rebuild（Astro）**

**为什么是 C：**

- **内容量**：迁移风险接近零。积累到 100+ 篇后再迁移，成本才会真正上升。
- **代码资产**：约为零，不存在「沉没成本」。
- **核心需求**：AI 自动生成 Worklog 需要「构建时拒绝错误的 frontmatter」。Astro Content Collections 原生支持；Jekyll 需自写 Ruby 插件。
- **目标 UI 的 TOC、Anchor、Copy Code、Prev/Next、Related** 在 Astro 中都是一等能力或成熟的 rehype 插件。
- **域名本来就要换**，「保留旧架构以维持 URL」的理由不存在。

**为什么不是 A**：没有可渐进保留的 UI，渐进只会把旧 CSS 的债务带进新设计。

**为什么不是 B**：重写范围与 C 相同，只换来留在 Liquid / Ruby，却放弃了类型化内容模型。若明确不想引入 Node，B（Jekyll 4 + Actions + Pagefind）是唯一备选，但不推荐。

**Search 方案：只用 Pagefind。**

- 构建后生成分片索引，2,000 篇也只按需加载很小的分片；
- 支持 `data-pagefind-filter` 做 type / topic / project / status 过滤；
- 索引正文中的代码块，搜错误信息、命令没有问题；
- 支持中文分词，前提是 `<html lang="zh">`（当前写死为 `lang="en"`）。

V1 **不需要** MiniSearch / Fuse / Algolia，⌘K 面板直接调用 Pagefind JS API。

---

## 8. Migration Plan

### 开发策略

- 新站在新仓库 **`tobytang-bot/tobytang-bot.github.io`** 开发（或先在当前仓库的 `astro-site` 分支开发，Phase 5 再推送到新仓库）。
- 旧站 `tobytang-ebrook/toby.github.io` 在切换前保持原样提供服务；切换前打 tag `legacy-jekyll`。
- 注意：若在当前仓库开发，Astro 文件**不能**提前合入 `main`，否则 classic Jekyll build 会处理 `src/` 下的 `.md`，导致旧站构建出错。

### 阶段

| Phase | 内容 |
|---|---|
| 0 | 创建 GitHub 账号 / 组织 `tobytang-bot` 与仓库 `tobytang-bot.github.io`；Pages Source 设为 "GitHub Actions" |
| 1 | Astro 骨架 + Content Model（schema）+ 迁移 3 篇 + CI 只构建（**PR #1**，见 §12） |
| 2 | 核心布局：Header（玻璃效果）、左侧导航、文章页（Sticky TOC、Anchor、Shiki、Copy Code、Mobile TOC）、主题 Token + Dark Mode |
| 3 | Worklog / Knowledge / Projects / Topics / Archive 列表与详情，Prev/Next/Related |
| 4 | Pagefind + ⌘K + 过滤器 |
| 5 | SEO（meta、canonical、OG、JSON-LD `TechArticle`）、`/feed.xml`、`/sitemap.xml`、404 → 开启部署上线 `tobytang-bot.github.io` → 旧仓库改为重定向站 → 验证旧 URL |
| 6 | Home Dashboard、UI 打磨、Lighthouse |
| 7（后续） | AI Worklog 模板 / Codex 生成脚本、`/admin`（Decap CMS） |

### 旧 URL 兼容（跨域）

GitHub Pages 不提供跨仓库 / 跨域的服务端 301，仓库转移或改名后**旧的 Pages 地址不会自动跳转**。因此：

1. 旧仓库 `tobytang-ebrook/toby.github.io` 保留，内容替换为静态重定向页（每页含 `<meta http-equiv="refresh">` + `<link rel="canonical">` + JS `location.replace` + 可点击的回退链接）。
2. 映射表：

```text
https://tobytang-ebrook.github.io/toby.github.io/                        → https://tobytang-bot.github.io/
https://tobytang-ebrook.github.io/toby.github.io/posts/server/           → https://tobytang-bot.github.io/knowledge/magento/server-setup/
https://tobytang-ebrook.github.io/toby.github.io/posts/docker-command/   → https://tobytang-bot.github.io/knowledge/docker/docker-command/
https://tobytang-ebrook.github.io/toby.github.io/posts/mysql-command/    → https://tobytang-bot.github.io/knowledge/mysql/mysql-command/
https://tobytang-ebrook.github.io/toby.github.io/posts/jekyll-markdown/  → https://tobytang-bot.github.io/
https://tobytang-ebrook.github.io/toby.github.io/feed.xml                → 保留一份指向新 feed 的说明，或长期镜像新 feed
```

3. 新站同时在 Astro `redirects` 中保留 `/posts/<slug>/` → 新路径，这样在新域名下手输旧路径的访问也能到达。
4. 旧重定向站的 `sitemap.xml` 删除、`robots.txt` 保持允许抓取（让搜索引擎能看到 canonical 并迁移索引）。
5. 新 URL 规则一旦确定不再变更：
   - `/knowledge/<topic>/<slug>/`
   - `/worklog/<yyyy>/<mm>/<dd>-<slug>/`

---

## 9. Proposed Directory Structure

```text
src/
  content.config.ts          # 所有 collection 的 Zod schema（单一事实来源）
  content/
    worklog/2026/2026-09-15-magento-cloud-cron-swap.md
    knowledge/magento/cloud/cron.md
    projects/asus-magento.yaml
    topics.yaml              # 层级 topic 树: {id, title, parent}
  components/                # Header, Sidebar, Toc, Card, SearchDialog, StatusBadge...
  layouts/                   # BaseLayout, DocLayout(三栏), ListLayout
  pages/
    index.astro
    worklog/[...slug].astro
    knowledge/[...slug].astro
    projects/[id].astro
    topics/[...path].astro
    archive/index.astro
    404.astro
    feed.xml.ts
  lib/                       # 排序、related、topic 树工具
  styles/                    # tokens.css, prose.css, global.css
public/                      # 图片、favicon
templates/worklog.md         # 给 AI / Codex 用的模板
scripts/migrate-jekyll.mjs
.github/workflows/deploy.yml
docs/                        # 架构文档（本文件）
```

Schema 要点：

- `type` 由 collection 决定，不在 frontmatter 重复；
- `topics` 引用 `topics.yaml` 的 id，拼错即构建失败；
- `project` 使用 `reference('projects')`；
- `status` 为枚举 `investigating | solved | reference | deprecated`；
- `updated` 可选；`description` 必填。

示例（Worklog）：

```yaml
---
title: Magento Cloud Cron Swap Investigation
description: Investigation of Magento Cloud cron memory and swap usage.
date: 2026-09-15
updated: 2026-09-16
topics: [magento-cloud, cron, performance]
project: asus-magento
status: solved
---
```

---

## 10. Content Migration

| 项目 | 数量 |
|---|---|
| 文章总数 | 4 |
| Frontmatter 形态 | 1 种（`layout/title/date/categories`） |
| 需要迁移 | 3（示例文章删除） |
| 可自动迁移字段 | `title`、`date`；`categories` → `topics`（映射表统一大小写：`Php`→`php`、`Mysql`→`mysql`）；`type=knowledge`；`status=reference` |
| 需人工处理 | 3 篇均需 |

人工处理项：

- 补写 `description`（当前全部缺失，可用 AI 生成初稿）；
- 删除正文重复的 `# <center>…</center>` H1；
- **标题层级修正**：现为 `##` 直接跳到 `#####`，会导致 TOC 混乱；
- `docker-command.md` 中的 HTML `<table>`：可保留，或转为 Markdown 表格；
- 确认 `project` 归属（如 `server.md` 是否属于 `asus-magento`）。

迁移脚本：当前规模手工更快。若迁移前仍会用旧格式写文章，可准备 `scripts/migrate-jekyll.mjs`：

1. 用 gray-matter 读取 frontmatter；
2. 按映射表转换 categories；
3. 删除 `<center>` H1；
4. 按 `topics[0]` 写入 `src/content/knowledge/<topic>/<slug>.md`；
5. 同时输出「旧 URL → 新 URL」映射，供新站 `redirects` 与旧仓库重定向页共用。

### PR #1 实际迁移结果（2026-09-29）

| 旧文章 | 结果 |
|---|---|
| `2023-12-29-server.md` | → `knowledge/magento/server-setup.md`；H1/`***` 删除，`#####` → `###`；代码块语言修正（`SQL`→`sql`、`lua`→`nginx`、`yaml`→`ini`）；**repo.magento.com access key、MySQL 密码、内部域名替换为占位符** |
| `2024-01-10-docker-command.md` | → `knowledge/docker/docker-command.md`；`#####`/`######` → `##`/`###`；HTML 表格保留 |
| `2024-01-10-mysql-command.md` | **未迁移**：正文为空（只有标题），`/posts/mysql-command/` 重定向到 server-setup |
| `2021-11-04-jekyll-markdown.md` | 删除（主题示例），`/posts/jekyll-markdown/` 重定向到首页 |

> ⚠️ 旧凭据仍存在于 git 历史（tag `legacy-jekyll`）和线上旧站中，必须在 Magento Marketplace 撤销并重新生成 access key，并修改对应数据库密码。

---

## 11. Technical Debt

### High

- **无结构化内容模型与校验**：直接阻碍 Worklog / Knowledge / Project / AI Workflow。
- **分类只存在于 JS 弹窗**（`href="#!"`）：无可索引页面；`categories.js` 把全站数据内联到每页，文章增加后不可持续。
- **部署依赖 classic Pages 的 Jekyll 3.10 与插件白名单**，本地构建环境未锁定，任何非白名单能力都必须先迁移部署。

### Medium

- SEO 插件启用但未生效：无 description / canonical / OG；页面 `<title>` 为 "你好，世界！ | …"。
- CSS 重复、主题变量定义 4 遍、13 处 `!important`、正文等宽字体、Google Fonts `@import` 阻塞渲染。
- 正文标题层级混乱且重复 H1，影响 TOC 与可访问性。

### Low

- `<html lang="en">` 与中文内容不符（影响 Pagefind 中文分词，迁移时顺手修正）。
- 404 拼写错误；footer 版权起始年份硬编码为 2023。

---

## 12. First Implementation Step

### PR #1 — Bootstrap Astro + Content Model（不做 UI）

**Goal**：建立 Astro 项目、确定 Content Collections schema、把 3 篇文章迁移为 Knowledge、生成 `/posts/<slug>/` 兼容 redirect、CI 能构建。**不部署、不做样式**，页面只输出语义化 HTML，用来验证内容模型。

**Files affected**：

- 新增：`package.json`、`astro.config.mjs`（`site: 'https://tobytang-bot.github.io'`、`base: '/'`、`redirects`、`trailingSlash: 'always'`）、`tsconfig.json`、`src/content.config.ts`、`src/content/topics.yaml`、`src/content/projects/*.yaml`、`src/content/knowledge/**`（3 篇）、`src/pages/{index,knowledge/[...slug],worklog/[...slug]}.astro`、`templates/worklog.md`、`.github/workflows/ci.yml`（只做 build + `astro check`）。
- 删除（仅在新仓库 / `astro-site` 分支）：`_layouts`、`_includes`、`assets/css`、`assets/js`、`all_collections`、`Gemfile*`、`_config.yml`。旧站由 `main` 分支继续提供服务，删除前先打 `legacy-jekyll` tag。

**Acceptance criteria**：

1. `npm run build` 成功，`astro check` 零错误。
2. 故意把某篇的 `status` 写成 `foo`，或引用不存在的 topic，构建**失败**，报错能指出文件与字段。
3. 3 篇文章在 `/knowledge/...` 下生成页面，页面能显示 frontmatter 各字段和由 `headings` 生成的 TOC 数据。
4. `dist/posts/{server,docker-command,mysql-command,jekyll-markdown}/index.html` 存在并 redirect 到新路径（带 canonical）。
5. 按 `templates/worklog.md` 写一篇示例 Worklog，能通过 schema 校验。
6. 在切换前，线上旧站 `tobytang-ebrook.github.io/toby.github.io/` 不受任何影响。
