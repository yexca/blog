---
slug: 8
title: 'SQL 語句的一些語法細節 (SQL SERVER 語句)'
date: '2021-11-08T11:51:18+08:00'
author: hiyoung
# layout: post
# permalink: /archives/8
views:
    - '183'
categories:
    - 技術學習
tags:
    - 資料庫
---

> 該文章使用 Google 翻譯處理。
>
> 該文章由 [Hiyoung](https://blog.hiyoung.icu/) 編寫，翻譯自 yexca

## 1.SQL ORDER BY 關鍵字

ORDER BY 關鍵字用於對結果集按照一個列或者多個列進行排序。

ORDER BY 關鍵字默認按照升序對記錄進行排序。如果需要按照降序對記錄進行排序，您可以使用 DESC 關鍵字

### SQL ORDER BY 語法

```sql
SELECT *column\_name*,*column\_name*  
FROM *table\_name*  
ORDER BY *column\_name*1,*column\_name*2 ASC|DESC;
```

–ASC 表示升序，DESC 表示降序</span>

–使用 order by 語句時應放在所有語句的最後使用，並且排序多個列時先排 `column\_name1` 再 `column\_name2…`

## 2.刪除所有數據（delete 和 drop table）

您可以在不刪除表的情況下，刪除表中所有的行。這表示表格結構、屬性、索引將保持不變：`DELETE FROM table\_name`;

或

`DELETE * FROM table\_name;`

**註釋：**在刪除記錄時要格外小心！因為您不能重來！

### DROP TABLE 語句

DROP TABLE 語句用於刪除表。`DROP TABLE table\_name`

**註釋：**與 elete 不同的是 drop table 會刪除表數據和結果，也是不可逆的！

- - - - - -

### DROP DATABASE 語句

DROP DATABASE 語句用於刪除數據庫。`DROP DATABASE database\_name`

- - - - - -

### TRUNCATE TABLE 語句

如果我們僅僅需要刪除表內的數據，但並不刪除表本身，那麼我們該如何做呢？

請使用 TRUNCATE TABLE 語句：`TRUNCATE TABLE table\_name`

## 3.SQL join

SQL join 用於把來自兩個或多個表的行結合起來。

下圖展示了 LEFT JOIN、RIGHT JOIN、INNER JOIN、OUTER JOIN 相關的 7 種用法。

- **INNER JOIN：如果表中有至少一個匹配，則返回行(INNER JOIN 與 JOIN 是相同的)**
- **LEFT JOIN：即使右表中沒有匹配，也從左表返回所有的行**
- **RIGHT JOIN：即使左表中沒有匹配，也從右表返回所有的行**
- **FULL JOIN：只要其中一個表中存在匹配，則返回行**

![sql-join](https://www.runoob.com/wp-content/uploads/2019/01/sql-join.png)

註釋：SQL 中的 join 語句其實對應數據庫理論中的連接概念，left join、right join 和 inner join 對應自然連接，full join 對應笛卡爾積

## 4.SQL 約束 (Constraints)

```sql
CREATE TABLE table_name
(
column_name1 data_type(size) constraint_name,
column_name2 data_type(size) constraint_name,
column_name3 data_type(size) constraint_name,
....
);
```

- **NOT NULL** – 指示某列不能存儲 NULL 值。
- **UNIQUE** – 保證某列的每行必須有唯一的值。（一個表可以有多個 UNIQUE 約束但只能有一個 primary key，primary key 自動包含 unique 約束）
- **PRIMARY KEY** – NOT NULL 和 UNIQUE 的結合。確保某列（或兩個列多個列的結合）有唯一標識，有助於更容易更快速地找到表中的一個特定的記錄。（主鍵）
- **FOREIGN KEY** – 保證一個表中的數據匹配另一個表中的值的參照完整性。（外鍵）
- **CHECK** – 保證列中的值符合指定的條件。
- **DEFAULT** – 規定沒有給列賦值時的默認值。

## 5.AUTO INCREMENT 字段

我們通常希望在每次插入新記錄時，自動地創建主鍵字段的值。

我們可以在表中創建一個 auto-increment 字段。

下面的 SQL 語句把 “Persons” 表中的 “ID” 列定義為 auto-increment 主鍵字段：CREATE TABLE Persons

```sql
(
ID int IDENTITY(1,1) PRIMARY KEY,
LastName varchar(255) NOT NULL,
FirstName varchar(255),
Address varchar(255),
City varchar(255)
)
```

在上面的實例中，IDENTITY 的開始值是 1，每條新記錄遞增 1。

**提示：**要規定 “ID” 列以 10 起始且遞增 5，請把 identity 改為 IDENTITY(10,5)。

要在 “Persons” 表中插入新記錄，我們不必為 “ID” 列規定值（會自動添加一個唯一的值）：

```sql
INSERT INTO Persons (FirstName,LastName)
VALUES ('Lars','Monsen')
```

上面的 SQL 語句會在 “Persons” 表中插入一條新記錄。”ID” 列會被賦予一個唯一的值。”FirstName” 列會被設置為 “Lars”，”LastName” 列會被設置為 “Monsen”。

## 6.觸發器

參見：[SqlServer 基礎之(觸發器) – wangchuang2017 – 博客園](https://www.cnblogs.com/wangprince2017/p/7827091.html#:~:text=%E8%A7%A6%E5%8F%91%E5%99%A8%EF%BC%88trigger%EF%BC%89%E6%98%AFSQL%20server%20%E6%8F%90%E4%BE%9B%E7%BB%99%E7%A8%8B%E5%BA%8F%E5%91%98%E5%92%8C%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90%E5%91%98%E6%9D%A5%E4%BF%9D%E8%AF%81%E6%95%B0%E6%8D%AE%E5%AE%8C%E6%95%B4%E6%80%A7%E7%9A%84%E4%B8%80%E7%A7%8D%E6%96%B9%E6%B3%95%EF%BC%8C%E5%AE%83%E6%98%AF%E4%B8%8E%E8%A1%A8%E4%BA%8B%E4%BB%B6%E7%9B%B8%E5%85%B3%E7%9A%84%E7%89%B9%E6%AE%8A%E7%9A%84%E5%AD%98%E5%82%A8%E8%BF%87%E7%A8%8B%EF%BC%8C%E5%AE%83%E7%9A%84%E6%89%A7%E8%A1%8C%E4%B8%8D%E6%98%AF%E7%94%B1%E7%A8%8B%E5%BA%8F%E8%B0%83%E7%94%A8%EF%BC%8C%E4%B9%9F%E4%B8%8D%E6%98%AF%E6%89%8B%E5%B7%A5%E5%90%AF%E5%8A%A8%EF%BC%8C%E8%80%8C%E6%98%AF%E7%94%B1%E4%BA%8B%E4%BB%B6%E6%9D%A5%E8%A7%A6%E5%8F%91%EF%BC%8C%E5%BD%93%E5%AF%B9%E4%B8%80%E4%B8%AA%E8%A1%A8%E8%BF%9B%E8%A1%8C%E6%93%8D%E4%BD%9C%EF%BC%88,insert%EF%BC%8Cdelete%EF%BC%8C%20update%EF%BC%89%E6%97%B6%E5%B0%B1%E4%BC%9A%E6%BF%80%E6%B4%BB%E5%AE%83%E6%89%A7%E8%A1%8C%E3%80%82%20%E8%A7%A6%E5%8F%91%E5%99%A8%E7%BB%8F%E5%B8%B8%E7%94%A8%E4%BA%8E%E5%8A%A0%E5%BC%BA%E6%95%B0%E6%8D%AE%E7%9A%84%E5%AE%8C%E6%95%B4%E6%80%A7%E7%BA%A6%E6%9D%9F%E5%92%8C%E4%B8%9A%E5%8A%A1%E8%A7%84%E5%88%99%E7%AD%89%E3%80%82)
