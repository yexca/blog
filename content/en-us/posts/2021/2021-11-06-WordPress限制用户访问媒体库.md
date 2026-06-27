---
slug: 2
title: Restricting User Access to the Media Library in WordPress
date: '2021-11-06T14:31:04+08:00'
author: yexca
# permalink: /archives/2
views:
    - '204'
categories:
    - Development Practice
tags:
    - WordPress
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

By default, WordPress allows authors to see all images in your site's media library. They can view files uploaded by administrators, editors, or other authors.

For many sites, this might not be an issue. However, if you are running a multi-author site, you might want to change this behavior.

First, navigate to `site-root/wp-content/themes/your-active-theme/`.

Find the `functions.php` file and edit it. Insert the following code at the end:

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

## References

[How to restrict media library access to user-uploaded content in WordPress](https://blog.csdn.net/cumohuo9136/article/details/108609313)
