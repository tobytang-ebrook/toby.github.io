---
layout: post
title: Docker Command
date: 2024-01-10
categories: ["Linux", "Docker"]
---

# <center>Docker 使用命令記錄</center>
***
> 本文記錄使用命令皆參考于 [Docker Command Docs](https://docs.docker.com/engine/reference/commandline/docker/ "Docker Command Docs")
>

##### 获取容器日誌 [docker logs](https://docs.docker.com/engine/reference/commandline/logs/ "docker logs")
``` shell
docker logs [OPTIONS] CONTAINER
```
###### options
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

##### 啟用容器 [docker start](https://docs.docker.com/engine/reference/commandline/start/ "docker start")
``` shell
docker start [OPTIONS] CONTAINER [CONTAINER...]
```
###### options
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