---
slug: 2
title: WordPressでユーザーのメディアライブラリアクセスを制限する
date: '2021-11-06T14:31:04+08:00'
author: yexca
# permalink: /archives/2
views:
    - '204'
categories:
    - 開発実践
tags:
    - WordPress
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

デフォルトでは、WordPressは投稿者がサイトのメディアライブラリにあるすべての画像を見ることができるようになっているんだ。つまり、投稿者がライブラリ内の全ファイルを確認できてしまうってこと。管理者や編集者、他の投稿者がアップロードした画像までも見ることができちゃうんだよね。

多くのサイトではそれほど重要じゃないかもしれないけど、もし複数の投稿者がいるサイトを運営しているなら、ここを制限したいこともあると思う。

まずは、`サイトのルートディレクトリ/wp-content/themes/現在使っているテーマ名/` に移動してね。

そこで `functions.php` ファイルを見つけて編集し、最後に以下のコードを挿入すればOKだよ。

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

## 参考にさせていただいた記事

[如何限制媒体库对 WordPress 中用户自己上传的内容的访问](https://blog.csdn.net/cumohuo9136/article/details/108609313)
