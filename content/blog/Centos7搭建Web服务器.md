---
title: Centos7搭建Web服务器
date: 2018-01-18 16:56:20
tags: Linux
---

> 最近在虚拟机里装了centos7来配置lamp服务器，其中踩了好多好多……坑o(╥﹏╥)o，必须做个记录
>
> 更新：nginx 与 node 的安装

### centos7安装
- 这里就是网上下好iso镜像，然后一步步装好，建议初学者选GNONE桌面版方便操作

### Apache、Mysql、PHP安装
- Apache
apache软件包名称叫做httpd
`yum install httpd`
出现提示时一路 y+回车 就好

    启动Apache并将其设置为开机启动
    `systemctl start httpd.service`
    `systemctl enable httpd.service`
    检查httpd服务状态：
    `systemctl status httpd.service`
    看到绿色的`active(running)`表示httpd服务正在运行中，`enabled`  表示httpd服务已设为开机启动
  
    这样HTTP协议就启动了，因为它要用到端口80，因此防火墙要放通80，这里直接就关掉它
    `systemctl stop firewalld.service` 停止firewall
    `systemctl disable firewalld.service` 禁止开机启动

    现在可以通过`ip addr`查询当前系统ip地址，在浏览器访问就可以看到apache页面
    Tips: 这里可以将虚拟机内部ip配置为静态的，然后修改主机hosts文件对应别名如myserver之后即可通过http://myserver直接访问

- PHP
`yum install php`
这里有需要的话可以进入`/etc/php.ini`做一些配置的修改
测试Apache能不能正常调用php，在/var/www/html目录下新建一个输出phpinfo的文件
`vim /var/www/html/phpinfo.php`
使用浏览器打开可以看到php信息页则说明正常
然后安装常用的扩展
`yum -y install php-mysql php-gd php-imap php-ldap php-mbstring php-odbc php-pear php-xml php-xmlrpc`

- Mysql
这里推荐安装MariaDB(从RHEL 7开始Red Hat公司推荐使用它替换Mysql)
`yum install mariadb-server mariadb`
`systemctl start mariadb` 启动mariadb
`systemctl enable mariadb` 设置为开机启动

    这里可以启动数据库守护进程
    `mysql_secure_installation`
    用来设置root密码，允许远程root登录等等
  
    `mysql -u root -p`使用root账号登录mariadb
    `show mysql`切换到mysql
    `GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'password' WITH GRANT OPTION;` 修改登录权限设置为允许远程登录
  
### 配置apache虚拟目录
apache默认工程目录是在/var/www下的，而编辑该目录必须是root用户，因此我们有必要自定义一个目录，让apache也能识别
`vim /etc/httpd/conf/httpd.conf`打开apache配置文件
找到`<dir alias_module>`，在内部添加
```
示例：
Alias /myweb "/home/daybreak/www"
<Directory "/home/daybreak/www">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```
这里我的自定义路径为/home/daybreak/www，对应别名是myweb，在浏览器输入`http"//myserver/myweb`就能对真实目录/home/daybreak/www下文件进行访问

注意：这里直接访问后很可能会出现403forbidden的错误，解决方案如下
1. 确保配置虚拟目录时设置了目录访问权限即`Require all granted`
2. 到这里可能是网站目录的权限问题，apache要求目录具有执行权限，也就是x，所以要确保访问的目录树都具有这些权限，例如我的目录时/home/daybreak/www，则需要
```
chmod 755 /home
chmod 755 /home/daybreak
chmod 755 /home/daybreak/www
或者直接 chmod 755 -R /home
```
3. 如果依然是403，那就是selinux的问题，把目录进行一下selinux权限设置
`chcon -R -t httpd_sys_content_t /home`

这样访问成功后就可以通过自定义的目录访问web文档

### 扩展：nginx 与 node 的安装

#### nginx 安装

- 添加 centos7 nginx yum 资源库：

  ```
  sudo rpm -Uvh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm
  ```

- yum 安装：

  ```
  sudo yum install -y nginx
  ```

- 启动并且开机启动nginx：

  ```
  sudo systemctl start nginx && sudo systemctl enable nginx
  ```

- 测试nginx配置文件（查看nginx配置位置）：

  ```
  nginx -t
  ```

#### node 安装

- 使用官方编译的二进制数据包安装：

  - 进入官网[下载链接](https://nodejs.org/download/release/)，选择想要下载的版本链接与版本(*-linux-x64.tar.gz)，进入用户主目录使用 `wget` 命令下载：

    ```
    wget https://nodejs.org/download/release/v8.9.4/node-v8.9.4-linux-x64.tar.gz
    ```

  - 下载完成后解压到 `/usr/local` 目录并安装：

    ```
    sudo tar --strip-components 1 -xzvf node-v* -C /usr/local
    ```

  - 安装完成后验证安装：

    ```
    node -v
    v8.9.4
    ```

- 源码安装：

  - 使用源码安装与二进制数据包安装的区别在于源码安装还需要编译源码才能安装

  - 进入官网[下载链接](https://nodejs.org/download/release/)，选择版本(node-v*.tar.gz)：

    ```
    wget https://nodejs.org/download/release/v8.9.4/node-v8.9.4.tar.gz
    ```

  - 下载完成后，解压并进入解压后的目录

    ```
    tar xzvf node-v8.9.4.tar.gz && cd node-v8.9.4
    ```

  - 编译源码需要安装 `gcc` 和 `gcc-c++` (可先使用`yum info package_name` 检查是否已安装)：

    ```
    sudo yum install gcc gcc-c++
    ```

  - 安装完成后运行 `configure` 文件并编译，编译完成后安装：

    ```
    ./configure && make && make install
    ```

  - ​