---
title: Docker 常用命令记录
description: docker logs、docker start 等常用 Docker CLI 命令及参数说明。
date: 2024-01-10
topics:
  - docker
  - linux
status: reference
---

> 本文記錄使用命令皆參考于 [Docker Command Docs](https://docs.docker.com/engine/reference/commandline/docker/ "Docker Command Docs")
>

## 获取容器日誌 [docker logs](https://docs.docker.com/engine/reference/commandline/logs/ "docker logs")
``` shell
docker logs [OPTIONS] CONTAINER
```
### options
<table>
    <thead>
    <tr>
        <td>options</td>
        <td>short</td>
        <td>default</td>
        <td>description</td>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td><code>--detail</code></td>
        <td></td>
        <td></td>
        <td>Show extra details provided to logs</td>
    </tr>
    </tbody>
</table>

## 啟用容器 [docker start](https://docs.docker.com/engine/reference/commandline/start/ "docker start")
``` shell
docker start [OPTIONS] CONTAINER [CONTAINER...]
```
### options
<table>
    <thead>
    <tr>
        <td>options</td>
        <td>short</td>
        <td>default</td>
        <td>description</td>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td><code>--attach</code></td>
        <td><code>-a</code></td>
        <td></td>
        <td>Attach STDOUT/STDERR and forward signals</td>
    </tr>
    </tbody>
</table>
