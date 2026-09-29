---
title: Magento 项目服务器搭建记录
description: 在 Amazon Linux 上安装 PHP 8.2、Composer、Nginx、MySQL 8、Elasticsearch 并部署 Magento 2.4 的命令记录。
date: 2023-12-29
updated: 2024-05-15
topics:
  - magento
  - linux
  - php
  - nginx
  - mysql
  - elasticsearch
status: reference
---

## PHP 安裝
### 启用 PHP
```shell
sudo amazon-linux-extras enable php8.2
```
### PHP 扩展安装
```shell
sudo yum -y install php-cli php-pdo php-fpm php-mysqlnd php-opcache php-xml php-gd php-devel php-intl php-mbstring php-bcmath php-iconv php-soap php-sodium
```

### php-fpm 配置
```shell
todo
```

## Composer 安裝
### 下载composer
```shell
curl -sS https://getcomposer.org/installer | php
```

### 移动 Composer.phar
```shell
sudo mv composer.phar /usr/bin/composer
```
### 切换 composer 版本
```shell
sudo composer self-update 2.2.22
```

## Nginx 安裝

### 下载、安装 nginx
```shell
sudo yum install nginx
```

### 啟動nginx
```shell
sudo systemctl start nginx
```

## nginx 与 php 配置调整
```shell
sudo sed -i 's/memory_limit = 128M/memory_limit = -1/g' /etc/php.ini
替换 nginx 项目目录
sudo sed -i 's/usr\/share\/nginx\/html/var\/www\/html/g' /etc/nginx/nginx.conf
修改 nginx user
sudo sed -i 's/user nginx/user ec2-user/g' /etc/nginx/nginx.conf
修改 php-fpm user
sudo sed -i 's/user = apache/user = ec2-user/g' /etc/php-fpm.d/www.conf
修改 php-fpm group
sudo sed -i 's/group = apache/group = ec2-user/g' /etc/php-fpm.d/www.conf

sudo sed -i 's/;listen.owner = nobody/listen.owner = ec2-user/g' /etc/php-fpm.d/www.conf

sudo sed -i 's/;listen.group = nobody/listen.group = ec2-user/g' /etc/php-fpm.d/www.conf

sudo sed -i 's/;listen.mode = 0660/listen.mode = 0660/g' /etc/php-fpm.d/www.conf

sudo sed -i 's/listen.acl_users/;listen.acl_users/g' /etc/php-fpm.d/www.conf

sudo sed -i 's/php-fpm/unix:\/run\/php-fpm\/www.sock/g' /etc/nginx/default.d/php.conf
```

## 安装 Mysql

### 引入安装包
```shell
sudo yum localinstall https://dev.mysql.com/get/mysql80-community-release-el7-10.noarch.rpm
```

### 执行安装命令
```shell
sudo yum -y install mysql-community-server
```

### 启动mysql服务器
```shell
sudo systemctl start mysqld

如果您希望每次启动时 MariaDB 服务器都启动，请键入以下命令。
sudo systemctl enable mysqld

通过一下命令验证mysql是否已启用
sudo systemctl is-enabled mysqld
```

### 查看临时密码
```shell
sudo grep 'temporary' /var/log/mysqld.log
```

### 修改 mysql 密码
```shell
sudo mysql_secure_installation
```

### MySQL 数据库创建用户和密码
```sql
mysql >  CREATE USER 'ebkdemo'@'localhost' IDENTIFIED BY '<password>';
```
### 创建数据库
```sql
mysql > CREATE DATABASE `ebrook_demo`;
```
### 刪除数据库
```sql
mysql > DROP DATABASE `ebrook_demo`;
```
### 给用户ebkdemo授予数据库ebrook_demo的完全访问权限
```sql
mysql > GRANT ALL PRIVILEGES ON `ebrook_demo`.* TO "ebkdemo"@"localhost";
```
### 查看用户权限
```sql
mysql > SHOW GRANTS FOR 'ebkdemo'@'localhost';
```

## Elasticsearch 安装

### 导入密钥
```shell
sudo rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
```

### 添加安裝源  在 /etc/yum.repos.d/ 目录新增 elasticsearch.repo 文件并写入下列信息
```ini
[elasticsearch]
name=Elasticsearch repository for 7.x packages
baseurl=https://artifacts.elastic.co/packages/7.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
```
### 下载安装
```shell
sudo yum install --enablerepo=elasticsearch elasticsearch
```

### 指定安装版本 8.5 版本 [optional]
```shell
sudo yum install --enablerepo=elasticsearch elasticsearch-8.5.3-1.x86_64
```
### elasticsearch service to start automatically using systemd
```shell
sudo systemctl daemon-reload
sudo systemctl enable elasticsearch.service
```

### You can start elasticsearch service by executing
```shell
sudo systemctl start elasticsearch.service
```

## 安裝magento

### 添加auth.json
```json
{
    "http-basic": {
        "repo.magento.com": {
            "username": "<public-key>",
            "password": "<private-key>"
        }
    }
}
```

### composer 安装下载 magento
```shell
composer create-project --repository-url=https://repo.magento.com/ magento/project-community-edition .
```
### 安装指定版本 2.4.6-p3
```shell
composer create-project --repository-url=https://repo.magento.com/ magento/project-enterprise-edition=2.4.6-p3 m246p3
```

### 添加 upstream
```nginx
upstream fastcgi_backend {
    server unix:/run/php-fpm/www.sock;
}
```

### Nginx Https SSL 配置
```nginx
server {
    listen       443 ssl http2;
    listen       [::]:443 ssl http2;
    server_name  example.com;
    set $MAGE_ROOT /var/www/ebrook-demo;

    # proxy_next_upstream off;
    include /var/www/ebrook-demo/nginx.conf;

    proxy_ignore_client_abort on;

    ssl_certificate "ssl.pem";
    ssl_certificate_key "ssl.key";
    ssl_protocols TLSv1.3;
}
```
