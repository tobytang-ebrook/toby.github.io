---
title: 用 Astro 重建个人站点：内容模型与迁移
description: 把 Jekyll 入门主题站点替换为 Astro，建立带 schema 校验的 Worklog / Knowledge 内容模型，并迁移旧文章。
date: 2026-09-29
topics:
  - astro
  - devops
project: toby-worklog
tags:
  - content-collections
  - github-pages
status: solved
---

## Background

旧站是一个基本没有改动的 Jekyll 入门主题，通过 GitHub Pages classic build 部署在 `tobytang-ebrook.github.io/toby.github.io/`。
新站定位为 Engineering Worklog + Knowledge Base，将部署到 `tobytang-bot.github.io`。

## Problem

旧站没有结构化的内容模型，frontmatter 只有 `title/date/categories`，写错字段也不会报错，无法支撑 AI 自动生成 Worklog。

## Investigation

- 全部代码约 1,000 行模板 / CSS / JS，与目标的三栏文档布局不兼容。
- 只有 4 篇文章：1 篇主题示例、1 篇空文章、2 篇有效内容。
- `server.md` 中包含 repo.magento.com 的 access key 和数据库密码。

## Root Cause

主题 fork 后没有针对知识库场景做内容建模。

## Solution

- 使用 Astro Content Collections，在 `src/content.config.ts` 中定义 `worklog`、`knowledge`、`topics`、`projects`。
- `topics` 和 `project` 使用 `reference()`，引用不存在的 id 时构建失败。
- 旧 `/posts/<slug>/` 通过 `redirects` 跳转到新路径。
- 迁移时将凭据替换为占位符。

## Verification

- `npm run build`（`astro check` + `astro build`）通过。
- 把 `status` 改成非法值，或引用不存在的 topic，构建失败。

## Lessons Learned

- 在内容很少的时候重建成本最低。
- 迁移旧内容时要顺便扫描凭据。
