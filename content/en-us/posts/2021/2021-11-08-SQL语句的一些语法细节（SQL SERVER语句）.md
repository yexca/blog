---
slug: 8
title: 'SQL Syntax Details (SQL Server)'
date: '2021-11-08T11:51:18+08:00'
author: hiyoung
# layout: post
# permalink: /archives/8
views:
    - '183'
categories:
    - Tech Learning
tags:
    - Database
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

> This article was written by [Hiyoung](https://blog.hiyoung.icu/)

## 1. SQL ORDER BY Keyword

The `ORDER BY` keyword is used to sort the result set by one or more columns.

By default, `ORDER BY` sorts records in ascending order. To sort records in descending order, use the `DESC` keyword.

### SQL ORDER BY Syntax

```sql
SELECT column_name, column_name  
FROM table_name  
ORDER BY column_name1, column_name2 ASC|DESC;
```

– `ASC` stands for ascending, `DESC` stands for descending.

– The `ORDER BY` clause should be placed at the end of the script. When sorting multiple columns, the database sorts by `column_name1` first, then `column_name2`, and so on.

## 2. Deleting All Data (DELETE and DROP TABLE)

You can delete all rows in a table without deleting the table itself. This keeps the table structure, attributes, and indexes intact: `DELETE FROM table_name;`

Or:

`DELETE * FROM table_name;`

**Note:** Be extremely careful when deleting records! You can't undo this action.

### DROP TABLE Statement

The `DROP TABLE` statement is used to delete a table entirely: `DROP TABLE table_name`

**Note:** Unlike `DELETE`, `DROP TABLE` removes both the table data and the structure. This is also irreversible.

- - - - - -

### DROP DATABASE Statement

The `DROP DATABASE` statement is used to delete a database: `DROP DATABASE database_name`

- - - - - -

### TRUNCATE TABLE Statement

If you only need to wipe the data inside a table but keep the table itself, use the `TRUNCATE TABLE` statement: `TRUNCATE TABLE table_name`

## 3. SQL JOIN

SQL JOINs are used to combine rows from two or more tables.

The image below illustrates 7 common usages related to `LEFT JOIN`, `RIGHT JOIN`, `INNER JOIN`, and `OUTER JOIN`.

- **INNER JOIN: Returns rows if there is at least one match in both tables (INNER JOIN is the same as JOIN).**
- **LEFT JOIN: Returns all rows from the left table, even if there are no matches in the right table.**
- **RIGHT JOIN: Returns all rows from the right table, even if there are no matches in the left table.**
- **FULL JOIN: Returns rows if there is a match in either of the tables.**

![sql-join](https://www.runoob.com/wp-content/uploads/2019/01/sql-join.png)

**Note:** Join statements in SQL correspond to the connection concepts in database theory. `LEFT JOIN`, `RIGHT JOIN`, and `INNER JOIN` correspond to natural joins, while `FULL JOIN` corresponds to a Cartesian product.

## 4. SQL Constraints

```sql
CREATE TABLE table_name
(
column_name1 data_type(size) constraint_name,
column_name2 data_type(size) constraint_name,
column_name3 data_type(size) constraint_name,
....
);
```

- **NOT NULL** – Ensures a column cannot store `NULL` values.
- **UNIQUE** – Ensures every row in a column has a unique value. (A table can have multiple `UNIQUE` constraints but only one `PRIMARY KEY`; `PRIMARY KEY` automatically includes a `UNIQUE` constraint).
- **PRIMARY KEY** – A combination of `NOT NULL` and `UNIQUE`. Uniquely identifies each record in a table. Helps in finding specific records faster.
- **FOREIGN KEY** – Ensures referential integrity by matching data in one table to values in another.
- **CHECK** – Ensures the values in a column meet specific conditions.
- **DEFAULT** – Sets a default value for a column when no value is specified.

## 5. AUTO INCREMENT Field

Usually, we want the primary key value to be created automatically every time a new record is inserted.

In SQL Server, we use the `IDENTITY` field to achieve this.

The following SQL defines the "ID" column in the "Persons" table as an auto-increment primary key:

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

In this example, the starting value for `IDENTITY` is 1, and it increments by 1 for each new record.

**Tip:** To start the "ID" column at 10 and increment by 5, change it to `IDENTITY(10,5)`.

When inserting into the "Persons" table, you don't need to specify a value for the "ID" column (it's added automatically):

```sql
INSERT INTO Persons (FirstName,LastName)
VALUES ('Lars','Monsen')
```

The SQL above inserts a new record where "ID" gets a unique auto-generated value, "FirstName" is "Lars", and "LastName" is "Monsen".

## 6. Triggers

See: [SqlServer Basics (Triggers) – wangchuang2017 – Blog Garden](https://www.cnblogs.com/wangprince2017/p/7827091.html#:~:text=%E8%A7%A6%E5%8F%91%E5%99%A8%EF%BC%88trigger%EF%BC%89%E6%98%AFSQL%20server%20%E6%8F%90%E4%BE%9B%E7%BB%99%E7%A8%8B%E5%BA%8F%E5%91%98%E5%92%8C%E6%95%B0%E6%8D%AE%E5%88%86%E6%9E%90%E5%91%98%E6%9D%A5%E4%BF%9D%E8%AF%81%E6%95%B0%E6%8D%AE%E5%AE%8C%E6%95%B4%E6%80%A7%E7%9A%84%E4%B8%80%E7%A7%8D%E6%96%B9%E6%B3%95%EF%BC%8C%E5%AE%83%E6%98%AF%E4%B8%8E%E8%A1%A8%E4%BA%8B%E4%BB%B6%E7%9B%B8%E5%85%B3%E7%9A%84%E7%89%B9%E6%AE%8A%E7%9A%84%E5%AD%98%E5%82%A8%E8%BF%87%E7%A8%8B%EF%BC%8C%E5%AE%83%E7%9A%84%E6%89%A7%E8%A1%8C%E4%B8%8D%E6%98%AF%E7%94%B1%E7%A8%8B%E5%BA%8F%E8%B0%83%E7%94%A8%EF%BC%8C%E4%B9%9F%E4%B8%8D%E6%98%AF%E6%89%8B%E5%B7%A5%E5%90%AF%E5%8A%A8%EF%BC%8C%E8%80%8C%E6%98%AF%E7%94%B1%E4%BA%8B%E4%BB%B6%E6%9D%A5%E8%A7%A6%E5%8F%91%EF%BC%8C%E5%BD%93%E5%AF%B9%E4%B8%80%E4%B8%AA%E8%A1%A8%E8%BF%9B%E8%A1%8C%E6%93%8D%E4%BD%9C%EF%BC%88,insert%EF%BC%8Cdelete%EF%BC%8C%20update%EF%BC%89%E6%97%B6%E5%B0%B1%E4%BC%9A%E6%BF%80%E6%B4%BB%E5%AE%83%E6%89%A7%E8%A1%8C%E3%80%82%20%E8%A7%A6%E5%8F%91%E5%99%A8%E7%BB%8F%E5%B8%B8%E7%94%A8%E4%BA%8E%E5%8A%A0%E5%BC%BA%E6%95%B0%E6%8D%AE%E7%9A%84%E5%AE%8C%E6%95%B4%E6%80%A7%E7%BA%A6%E6%9D%9F%E5%92%8C%E4%B8%9A%E5%8A%A1%E8%A7%84%E5%88%99%E7%AD%89%E3%80%82)
