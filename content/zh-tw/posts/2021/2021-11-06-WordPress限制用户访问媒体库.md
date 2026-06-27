---
slug: 2
title: WordPress 限制使用者存取媒體庫
date: '2021-11-06T14:31:04+08:00'
author: yexca
# permalink: /archives/2
views:
    - '204'
categories:
    - 開發實踐
tags:
    - WordPress
---

> 該文章使用 Google 翻譯處理。

預設情況下，WordPress 允許作者查看您網站媒體庫中的所有圖像。允許作者查看媒體庫中的所有檔案。 他們還可以查看由管理員 ， 編輯或其他作者上傳的圖像。

對於許多網站而言，這可能並不重要。 但是，如果您運行一個多作者網站 ，則可能需要更改它。

首先，進入 `網站根目錄/wp-content/themes/您目前使用的主題名稱/`

找到 functions.php 檔案並編輯，在末尾插入如下程式碼即可

```php
// Limit media library access
 
add_filter( 'ajax_query_attachments_args', 'wpb_show_current_user_attachments' );
 
function wpb_show_current_user_attachments( $query ) {
    $user_id = get_current_user_id();
    if ( $user_id && !current_user_can('activate_plugins') && !current_user_can('edit_others_posts
') ) {
        $query['author'] = $user_id;
    }
    return $query;
}
```

## 參考文章

[如何限制媒體庫對 WordPress 中使用者自己上傳的內容的訪問](https://blog.csdn.net/cumohuo9136/article/details/108609313)
