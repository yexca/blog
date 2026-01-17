---
slug: 221
title: 'Spring AOP (面向切面程式設計)'
# draft: true
author: yexca
date: '2025-01-21T16:05:57+09:00'
categories:
    - 技術學習
tags:
    - 後端技術
    - SpringBoot
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

Aspect-Oriented Programming (面向切面程式設計、面向方面程式設計) 是針對特定方法進行程式設計。

動態代理是面向切面程式設計最主流的實作。而 SpringAOP 是 Spring 框架的高階技術，旨在管理 bean 物件的過程中，主要透過底層的動態代理機制，對特定的方法進行程式設計。

## 統計方法執行時間

匯入依賴

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

撰寫 AOP 程式，針對特定方法根據業務需求進行程式設計

```java
@Slf4j
@Component
@Aspect // AOP類
public class TimeAspect {
    // 切入點表達式
    @Around("execution(* net.yexca.service.*.*(..))")
    public Object recordTime(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        long begin = System.currentTimeMillis();
        // 呼叫原始方法
        Object object = proceedingJoinPoint.proceed();
        long end = System.currentTimeMillis();
        log.info(proceedingJoinPoint.getSignature() + "方法執行時間：{}ms", end-begin);
        return object;
    }
}
```

> AOP 的應用場景有記錄操作日誌、權限控制、交易管理等

## 核心概念

連結點：JoinPoint，可以被 AOP 控制的方法 (隱含方法執行時的相關資訊)

通知：Advice，指哪些重複的邏輯，也就是共性功能 (最終體現為一個方法)

切入點：PointCut，匹配連結點的條件，通知僅會在切入點方法執行時被應用

切面：Aspect，描述通知與切入點的對應關係 (通知 + 切入點)

目標物件：Target，通知所應用的物件

上例中，未寫出的 Service 所有方法都是連結點，被切入點表達式選中的方法都是切入點，而 AOP 類別的 recordTime 方法為通知，註解 @Around 與通知共同為切面，而 TimeAspect 類別稱為切面類別

## 通知

### 通知類型

@Around：環繞通知，此註解標註的通知方法在目標方法前、後都被執行

@Before：前置通知，此註解標註的通知方法在目標方法前被執行

@After：後置通知，此註解標註的通知方法在目標方法後被執行，無論是否有例外都會執行

@AfterReturning：返回後通知，此註解標註的通知方法在目標方法後被執行，有例外不會執行

@AfterThrowing：例外後通知，此註解標註的通知方法發生例外後執行

```java
@Component
@Aspect
public class MyAspect {
    
    @Before("execution(* net.yexca.service.impl.*(..))")
    public void before(){
        System.out.println("Before");
    }
    
    @Around("execution(* net.yexca.service.impl.*(..))")
    public Object around(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        System.out.println("Around before");
        Object result = proceedingJoinPoint.proceed();
        System.out.println("Around after");
        return result;
    }
    
    @After("execution(* net.yexca.service.impl.*(..))")
    public void after(){
        System.out.println("After");
    }
    
    @AfterReturning("execution(* net.yexca.service.impl.*(..))")
    public void afterRetruning(){
        System.out.println("AfterReturning");
    }
    
    @AfterThrowing("execution(* net.yexca.service.impl.*(..))")
    public void afterThrowing(){
        System.out.println("AfterThrowing");
    }
}
```

> @Around 環繞通知需要自己呼叫 `ProceedingJoinPoint.proceed()` 來讓原始方法執行，其他通知不需要考量目標方法執行
>
> @Around 環繞通知方法的回傳值，必須指定為 Object，來接收原始方法的回傳值

---

上述的 5 個註解的切入點表達式都相同，可以提取，如下所示

```java
public class MyAspect {
    
    @Pointcut("execution(* net.yexca.service.impl.*(..))")
    public void pt(){}

    @Before("pt()")
    public void before(){
        System.out.println("Before");
    }
}
```

方法 pt() 若是 public 權限符，則可以在其他的類別中引用

### 通知順序

當有多個切面的切入點都匹配到目標方法，目標方法執行時，多個通知方法都會被執行

```yml
net: 
  yexca: 
    aop: 
      - MyAspect1
      - MyAspect2
      - MyAspect3
```

假設三個 AOP 類別都選中了同一個方法，不同切面類別中，預設是按照切面類別名稱字母排序

* 目標方法前的通知方法：字母排名靠前的先執行
* 目標方法後的通知方法：字母排名靠後的先執行

假設三個 AOP 類別都有 @Before 和 @After，執行順序為

```markdown
MyAspect1 before
MyAspect2 before
MyAspect3 before
MyAspect3 after
MyAspect2 after
MyAspect1 after
```

> 可以使用 @Order(num) 註解加在切面類別上來控制順序，num 越小越先執行，@Before 和 @After 執行同上

## 切入點表達式

描述切入點方法的一種表達式，主要用來決定專案中的哪些方法需要加入通知

常見形式有 `execution(...)` 根據方法的簽章匹配和 `annotation` 根據註解匹配

### execution

主要根據方法的回傳值、套件名稱、類別名稱、方法名稱、方法參數等資訊來匹配，語法為

```markdown
execution(存取修飾符 回傳值 套件名稱.類別名稱.方法名稱(方法參數) throws 例外)
```

其中存取修飾符、套件名稱.類別名稱、throws 例外可以省略，不過不建議省略套件名稱.類別名稱

也可以使用萬用字元描述切入點

* `*`：單個獨立的任意符號，可以萬用任意回傳值、套件名稱、類別名稱、方法名稱、任意類型的一個參數，也可以萬用套件、類別、方法名稱的一部分

```html
execution(* com.*.service.*.update*(*))
```

* `..`：多個連續的任意符號，可以萬用任意層級的套件，或任意類型、任意個數的參數

```html
execution(* com.yexca..service.*(..))
```

> 還可以使用 `&&`、`||`、`!` 來組合比較複雜的切入點表達式

撰寫建議

* 所有業務方法名稱在命名時盡量規範，方便切入點表達式快速匹配
* 描述切入點方法通常基於介面描述，而非實作類別，增強擴充性
* 在滿足業務需求的前提下，盡量縮小切入點的匹配範圍

### @annotation

@annotation 切入點表達式，用於匹配標示有特定註解的方法，使用需先自訂義註解

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyLog {
}
```

然後在方法上加入該註解，在 AOP 類別方法上

```java
@Before("@annotation(net.yexca.aop.MyLog)")
```

## 連結點

在 Spring 中用 JoinPoint 抽象化了連結點，用它可以取得方法執行時的相關資訊

* 對於 @Around 通知，取得連結點資訊只能使用 ProceedingJoinPoint
* 對於其他四種通知，取得連結點資訊只能使用 JoinPoint，它是 ProceedingJoinPoint 的父類別

```java
public Object recordTime(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
    // 取得目標物件的類別名稱
    String className = proceedingJoinPoint.getTarget().getClass().getName();
        
    // 取得目標方法的方法名稱
   String methodNAme = proceedingJoinPoint.getSignature().getName();
        
    // 取得目標方法執行時傳入的參數
    Object[] args = proceedingJoinPoint.getArgs();
    
    // 呼叫原始方法
    Object object = proceedingJoinPoint.proceed();

    return object;
}
```
