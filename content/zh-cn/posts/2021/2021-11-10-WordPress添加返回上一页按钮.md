---
slug: 10
title: WordPress 添加返回上一页按钮
date: '2021-11-10T11:06:27+08:00'
author: yexca
# layout: post
# permalink: /archives/10
views:
    - '288'
categories:
    - 开发实践
tags:
    - WordPress
---

多数情况下，我们浏览网页一般使用浏览器或系统自带的返回，但有些系统的交互逻辑及其不好用，这时在网页添加一个返回上一页按钮可以极大改善浏览体验

首先，在 WordPress 的后台点击“外观-自定义”来到可视化编辑页面

在左方找到“额外CSS”选项（一般在最后）

然后在里面输入下方代码

```css
.float-button {
position: fixed;
height: 90px;
width: 40px;
bottom: 90px;
right: 50px;
/* 可以自己修改相关描述 */
}
```

输入完成后保存，然后编辑主题相关界面

如果您不能访问服务器文件，可以在 WordPress 后台的“外观-主题编辑器”中找到要添加的界面修改

如果您可以访问服务器文件，可以打开路径 `网站根目录/wp-content/themes/<您的主题名>/` 然后打开相应页面修改

只需在相关页面文件插入下面代码并保存即可

```html
<div class="float-button">
<input type="button" name="Submit" value="返回" onclick="javascript:history.back(-1);">
</div>
<!-- 可以自己修改相关描述 -->
```

## 参考文章

[网页上的“返回上一页”的几种实现代码](https://www.cnblogs.com/Julia-Yuan/p/7978888.html)

[div 套路之悬浮的 button](https://blog.csdn.net/qq_34266804/article/details/88316086)
