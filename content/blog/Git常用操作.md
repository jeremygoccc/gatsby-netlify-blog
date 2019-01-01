---
title: Git常用操作
date: 2017-11-30 22:46:08
tags: Git
---

随着做项目的深入，对Git的使用也越来越频繁，这里就做一个常用操作的总结，不断更新~

### Git理念

► 工作区（即本地文件）
► 暂存区
► 本地仓库
► 远程仓库

使用Git项目的文件都是在上面四个地方传递

### 本地项目关联远程仓库

远程库建好以后就可以运行这条命令关联到本地项目：
`git remote add origin your-remote-repository-url`

如果是直接克隆远程仓库到本地的话：
`git clone your-remote-repository-url`

可以运行以下命令查看结果：

`git remote -v`  查看当前项目的远程库
`git branch -a`  查看当前项目的所有分支

### 远程库同步到本地

► 在提交更新以前都要先同步一下本地仓库
```
git pull   等同于 git fetch + git merge
```

如果需要放弃本地修改，强制覆盖本地版本的话（即保持与远程库一致）：
```
git fetch --all
git reset --hard origin/master
git pull
```

### 提交本地更新到远程库

`git status` 检查当前项目状态

然后对于未跟踪的文件执行以下命令：

```
git add untrack-file-path    跟踪单个本地文件，提交到暂存区
git commit -m "your commit"  将跟踪过的文件即在暂存区的文件提交到本地仓库
git push                     将本地仓库提交到远程库
```

提交到远程库常用的命令还有：

`git add . `      跟踪本地所有未跟踪的文件
`git push -f`    强制提交更新，覆盖远程库 --- 慎用！！！

### 版本回退

► 将当前版本回退到已提交的版本历史中
`git reset --hard HEAD^`   一个^号代表回退一个版本

更多时候我们都会找到对应的版本号进行回退：
首先 `git log` 显示最近到最远的提交日志
如果只想显示版本号和评论信息的话可以加上 `--pretty=oneline` 参数
现在就可以  `git reset --hard version number`  回退到对应的版本

这里还有一个常用命令：
`git reflog` 显示你的每一次命令，对于自己命令的整理很有帮助

### 检查修改
► 已修改，未暂存
`git diff`

► 已暂存，未提交
`git diff --cached`

► 已提交，未推送
`git diff master origin/master`

### 撤销修改

► 向commit中添加忘记的文件(即更新最近的commit)
- 编辑文件
- 保存文件
- 暂存文件
- `git commit --amend`

► 还原commit
`git revert <SHA>` 撤销目标commit做出的更改，同时创建一个新的commit记录这一更改

► 重置commit
`git reset <reference>` 清除commit
- 将HEAD和当前分支指针移到引用的commit
- 使用`--hard`选项清除commit
- 使用`--sort`选项将commit的更改移至暂存区
- 使用`--mixed`选项取消暂存已被commit的更改

► 已修改，未暂存
`git checkout -- file-path`

► 已暂存，未提交
`git reset HEAD file-path`  先撤销暂存区的修改
`git checkout -- file-path` 再撤销工作区的修改

PS: 以上两个步骤都可以用 `git reset --hard` 完成，一步到位将修改完全恢复到未修改的状态

► 已提交，未推送
`git reset --hard origin/master`  从远程库将代码取回

► 已推送
`git reset --hard HEAD^`    先回退本地库的版本
`git push -f`               再强制推送到远程库

### 分支与合并

`git branch` ：
- 列出仓库中所有的分支名称  --- 活跃分支旁会显示一个星号
- 创建新的分支
- 删除分支  --- 无法删除当前所在的分支

`git checkout` 切换分支，可以创建新的分支，`-b`选项可以附加切换到该分支

`git log --oneline --decorate` 显示日志中的分支
`git log --oneline --decorate --graph --all`  显示实际的所有分支

`git merge <other-branch>` 合并分支

发生合并时，git将：
- 查看将合并的分支
- 查看分支的历史记录并寻找两个分支的commit历史记录都有的单个commit
- 将单个分支上更改的代码行合并到一起
- 提交一个commit来记录合并操作

合并有以下两种类型：
- 快进合并-要合并的分支位于检出分支前面。检出分支的指针将向前移动，指向另一分支所指向的同一commit
- 普通类型的合并
  - 两个完全不同的分支被合并
  -  创建一个合并commit

合并冲突：
当相同的行在要合并的不同分支上做出了更改时，就会出现合并冲突。解决：
- 找到并删掉存在合并冲突指示符的所有行
- 决定保留哪些行
- 保存文件
- 暂存文件
- 提交commit


