---
# File: src/content/worklog/<yyyy>/<yyyy-mm-dd>-<slug>.md
# The date prefix in the filename must match `date`.
title: <One-line summary of what was done>
description: <1–2 sentences: the problem and the outcome>
date: <yyyy-mm-dd>
# updated: <yyyy-mm-dd>
topics:            # ids from src/content/topics.yaml
  - <topic-id>
# project: <id from src/content/projects/*.yaml>
tags: []           # free-form: error messages, commands, module names
status: investigating  # investigating | solved | reference | deprecated
---

## Background

<Context: system, environment, ticket, why this work started.>

## Problem

<Observed symptom. Paste exact error messages / log lines in code blocks.>

## Investigation

<What was checked, in order. Commands run and what they showed.>

## Root Cause

<The actual cause. Leave empty while status is investigating.>

## Solution

<The fix: code change, config, command. Link commits / PRs.>

## Verification

<How the fix was confirmed.>

## Lessons Learned

<What to remember next time; candidates for a Knowledge article.>
