---
slug: 8
title: 'SQL文のいくつかの構文詳細 (SQL Server編)'
date: '2021-11-08T11:51:18+08:00'
author: hiyoung
# layout: post
# permalink: /archives/8
views:
    - '183'
categories:
    - 技術学習
tags:
    - データベース
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

> この記事は [Hiyoung](https://blog.hiyoung.icu/) が書いたよ。

## 1. SQL ORDER BY キーワード

ORDER BY キーワードは、結果セットを1つまたは複数の列でソートするために使うんだ。

ORDER BY キーワードはデフォルトで昇順（小さい順）にレコードを並べ替えるよ。もし降順（大きい順）にしたいなら、DESC キーワードを使えばOK。

### SQL ORDER BY の構文

```sql
SELECT *column\_name*,*column\_name*  
FROM *table\_name*  
ORDER BY *column\_name*1,*column\_name*2 ASC|DESC;
```

– ASC は昇順、DESC は降順を意味するよ。

– ORDER BY 文を使うときは、すべての文の最後に置くのがルール。複数の列でソートするときは、まず `column\_name1` で並べ替えて、その次に `column\_name2…` という順序で処理されるよ。

## 2. すべてのデータを削除する（DELETE と DROP TABLE）

テーブル自体を削除せずに、テーブル内のすべての行だけを削除することができるよ。これなら、テーブルの構造、属性、インデックスはそのまま残るんだ。

`DELETE FROM table\_name;`

または

`DELETE * FROM table\_name;`

**注意：** レコードを削除するときはマジで気をつけて！やり直しはきかないからね！

### DROP TABLE 文

DROP TABLE 文はテーブルそのものを削除するために使うよ。

`DROP TABLE table\_name`

**注意：** DELETE と違うのは、DROP TABLE はテーブルのデータも構造も丸ごと削除しちゃうこと。これも後戻りできない操作だよ！

- - - - - -

### DROP DATABASE 文

DROP DATABASE 文はデータベースを削除するために使うんだ。

`DROP DATABASE database\_name`

- - - - - -

### TRUNCATE TABLE 文

もしテーブル内のデータだけを削除したくて、テーブル自体は残しておきたい場合はどうすればいいかな？

そんなときは TRUNCATE TABLE 文を使おう。

`TRUNCATE TABLE table\_name`

## 3. SQL JOIN

SQL の JOIN は、2つ以上のテーブルの行を組み合わせるために使われるよ。

下の図は、LEFT JOIN、RIGHT JOIN、INNER JOIN、OUTER JOIN に関連する 7 種類の使い方を示しているんだ。

- **INNER JOIN：テーブル間に少なくとも1つのマッチがあれば行を返す（INNER JOIN と JOIN は同じ意味だよ）**
- **LEFT JOIN：右のテーブルにマッチするものがなくても、左のテーブルのすべての行を返す**
- **RIGHT JOIN：左のテーブルにマッチするものがなくても、右のテーブルのすべての行を返す**
- **FULL JOIN：どちらかのテーブルにマッチがあれば行を返す**

![sql-join](https://www.runoob.com/wp-content/uploads/2019/01/sql-join.png)

注意：SQL の JOIN 文は、実はデータベース理論における「結合」の概念に対応しているんだ。LEFT JOIN、RIGHT JOIN、INNER JOIN は自然結合に、FULL JOIN はデカルト積に対応しているよ。

## 4. SQL 制約 (Constraints)

```sql
CREATE TABLE table_name
(
column_name1 data_type(size) constraint_name,
column_name2 data_type(size) constraint_name,
column_name3 data_type(size) constraint_name,
....
);
```

- **NOT NULL** – その列に NULL 値を保存できないようにする。
- **UNIQUE** – その列の各行が必ず一意（ユニーク）な値であることを保証する。（1つのテーブルに複数の UNIQUE 制約を設定できるけど、PRIMARY KEY は1つだけ。PRIMARY KEY には自動的に UNIQUE 制約が含まれるよ）
- **PRIMARY KEY** – NOT NULL と UNIQUE を組み合わせたもの。その列（または複数列の組み合わせ）に一意の識別子を持たせ、特定のレコードを素早く簡単に見つけられるようにするんだ。（主キー）
- **FOREIGN KEY** – あるテーブルのデータが別のテーブルの値と一致することを保証し、参照整合性を守るためのもの。（外部キー）
- **CHECK** – 列の値が指定された条件を満たしているか確認する。
- **DEFAULT** – 列に値が指定されなかったときのデフォルト値を決めておく。

## 5. AUTO INCREMENT フィールド

新しいレコードを挿入するたびに、主キーの値を自動的に生成したいことってよくあるよね。

そんなときは、テーブルに auto-increment フィールドを作成すればいいんだ。

次の SQL 文は、"Persons" テーブルの "ID" 列を auto-increment の主キーとして定義しているよ。

```sql
CREATE TABLE Persons
(
ID int IDENTITY(1,1) PRIMARY KEY,
LastName varchar(255) NOT NULL,
FirstName varchar(255),
Address varchar(255),
City varchar(255)
)
```

上の例では、IDENTITY の開始値は 1 で、新しいレコードが追加されるたびに 1 ずつ増えていく設定になっているよ。

**ヒント：** もし "ID" 列を 10 から始めて 5 ずつ増やしたいなら、IDENTITY を `IDENTITY(10,5)` に変えれば OK。

"Persons" テーブルに新しいレコードを挿入するとき、"ID" 列に値を指定する必要はないよ（自動的にユニークな値が割り振られるからね）。

```sql
INSERT INTO Persons (FirstName,LastName)
VALUES ('Lars','Monsen')
```

この SQL 文を実行すると、"Persons" テーブルに新しいレコードが挿入され、"ID" 列には自動で値が入り、"FirstName" は 'Lars'、"LastName" は 'Monsen' に設定されるんだ。

## 6. トリガー

参考：[SqlServer 基礎之(触发器) – wangchuang2017 – 博客园](https://www.cnblogs.com/wangprince2017/p/7827091.html#:~:text=%E8%A7%A6%E5%8F%91%E5%99%A8%EF%BC%88trigger%EF%BC%89%E6%98%AFSQL%20server%20%E6%8F%90%E4%BE%9B%E7%BB%99%E7%A8%8B%E5%BA%8F%E5%91%98%E5%92%8C%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90%E5%91%98%E6%9D%A5%E4%BF%9D%E8%AF%81%E6%95%B0%E6%8D%AE%E5%AE%8C%E6%95%B4%E6%80%A7%E7%9A%84%E4%B8%80%E7%A7%8D%E6%96%B9%E6%B3%95%EF%BC%8C%E5%AE%83%E6%98%AF%E4%B8%8E%E8%A1%A8%E4%BA%8B%E4%BB%B6%E7%9B%B8%E5%85%B3%E7%9A%84%E7%89%B9%E6%AE%8A%E7%9A%84%E5%AD%98%E5%82%A8%E8%BF%87%E7%A8%8B%EF%BC%8C%E5%AE%83%E7%9A%84%E6%89%A7%E8%A1%8C%E4%B8%8D%E6%98%AF%E7%94%B1%E7%A8%8B%E5%BA%8F%E8%B0%83%E7%94%A8%EF%BC%8C%E4%B9%9F%E4%B8%8D%E6%98%AF%E6%89%8B%E5%B7%A5%E5%90%AF%E5%8A%A8%EF%BC%8C%E8%80%8C%E6%98%AF%E7%94%B1%E4%BA%8B%E4%BB%B6%E6%9D%A5%E8%A7%A6%E5%8F%91%EF%BC%8C%E5%BD%93%E5%AF%B9%E4%B8%80%E4%B8%AA%E8%A1%A8%E8%BF%9B%E8%A1%8C%E6%93%8D%E4%BD%9C%EF%BC%88,insert%EF%BC%8Cdelete%EF%BC%8C%20update%EF%BC%89%E6%97%B6%E5%B0%B1%E4%BC%9A%E6%BF%80%E6%B4%BB%E5%AE%83%E6%89%A7%E8%A1%8C%E3%80%82%20%E8%A7%A6%E5%8F%91%E5%99%A8%E7%BB%8F%E5%B8%B8%E7%94%A8%E4%BA%8E%E5%8A%A0%E5%BC%BA%E6%95%B0%E6%8D%AE%E7%9A%84%E5%AE%8C%E6%95%B4%E6%80%A7%E7%BA%A6%E6%9D%9F%E5%92%8C%E4%B8%9A%E5%8A%A1%E8%A7%84%E5%88%99%E7%AD%89%E3%80%82)
