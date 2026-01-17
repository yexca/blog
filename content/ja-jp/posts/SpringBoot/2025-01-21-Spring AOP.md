---
slug: 221
title: 'Spring AOP（アスペクト指向プログラミング）'
# draft: true
author: yexca
date: '2025-01-21T16:05:57+09:00'
categories:
    - 技術学習
tags:
    - バックエンド技術
    - SpringBoot
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

Aspect Oriented Programming（アスペクト指向プログラミング）は、特定メソッド向けのプログラミングだよ。

動的プロキシは、アスペクト指向プログラミングの最も主流な実装だね。そしてSpring AOPは、Springフレームワークの高度な技術なんだ。主に、Beanオブジェクトを管理する過程で、基盤となる動的プロキシ機構を通じて、特定のメソッドに対してプログラミングを行うことを目的としているよ。

## メソッド実行時間の統計

依存関係をインポートするよ。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

AOPプログラムを書いて、特定のメソッドに対してビジネス要件に応じてプログラミングしよう。

```java
@Slf4j
@Component
@Aspect // AOPクラス
public class TimeAspect {
    // ポイントカット式
    @Around("execution(* net.yexca.service.*.*(..))")
    public Object recordTime(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        long begin = System.currentTimeMillis();
        // 元のメソッドを呼び出す
        Object object = proceedingJoinPoint.proceed();
        long end = System.currentTimeMillis();
        log.info(proceedingJoinPoint.getSignature() + "メソッド実行時間：{}ms", end-begin);
        return object;
    }
}
```

> AOPの応用シナリオとしては、操作ログの記録、権限制御、トランザクション管理なんかがあるよ。

## コアコンセプト

ジョインポイント：JoinPoint、AOPで制御できるメソッドのこと（メソッド実行時の関連情報が暗に含まれる）。

アドバイス：Advice、繰り返されるロジック、つまり共通機能を指すよ（最終的には一つのメソッドとして現れる）。

ポイントカット：PointCut、ジョインポイントをマッチングさせる条件のこと。アドバイスは、このポイントカットのメソッドが実行されるときにだけ適用されるよ。

アスペクト：Aspect、アドバイスとポイントカットの対応関係を記述したもの（アドバイス＋ポイントカット）。

ターゲットオブジェクト：Target、アドバイスが適用されるオブジェクトのこと。

上の例で言うと、書かれてないServiceの全メソッドがジョインポイントで、ポイントカット式で選択されたメソッドがポイントカットだね。AOPクラスのrecordTimeメソッドがアドバイスで、`@Around`アノテーションとアドバイスが一緒になってアスペクトになるんだ。そしてTimeAspectクラスはアスペクトクラスと呼ばれるよ。

## アドバイス

### アドバイスの種類

`@Around`：アラウンドアドバイス、このアノテーションが付いたアドバイスメソッドは、ターゲットメソッドの前と後の両方で実行されるよ。

`@Before`：ビフォーアドバイス、このアノテーションが付いたアドバイスメソッドは、ターゲットメソッドの前に実行されるんだ。

`@After`：アフターアドバイス、このアノテーションが付いたアドバイスメソッドは、ターゲットメソッドの後に実行されるよ。例外があってもなくても実行されるんだ。

`@AfterReturning`：アフターリターニングアドバイス、このアノテーションが付いたアドバイスメソッドは、ターゲットメソッドの後に実行されるよ。例外がある場合は実行されないんだ。

`@AfterThrowing`：アフタースローイングアドバイス、このアノテーションが付いたアドバイスメソッドは、ターゲットメソッドで例外が発生した後に実行されるよ。

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

> `@Around`アラウンドアドバイスは、元のメソッドを実行させるために自分で`ProceedingJoinPoint.proceed()`を呼ばなきゃいけないんだ。他のアドバイスはターゲットメソッドの実行を考慮する必要はないよ。
>
> `@Around`アラウンドアドバイスメソッドの戻り値は、元のメソッドの戻り値を受け取るために`Object`として指定する必要があるんだ。

---

上記の5つのアノテーションのポイントカット式は全部同じだから、以下のように抽出できるよ。

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

`pt()`メソッドがpublicアクセス修飾子を持っていれば、他のクラスから参照できるよ。

### アドバイスの実行順序

複数のアスペクトのポイントカットがターゲットメソッドにマッチした場合、ターゲットメソッドが実行されるとき、複数のアドバイスメソッドが全部実行されるよ。

```yml
net: 
  yexca: 
    aop: 
      - MyAspect1
      - MyAspect2
      - MyAspect3
```

3つのAOPクラスが全部同じメソッドを選んだとしよう。異なるアスペクトクラスの中では、デフォルトでアスペクトクラスの名前のアルファベット順に並ぶんだ。

* ターゲットメソッドの前のBeforeアドバイス：アルファベット順で早い方が先に実行される。
* ターゲットメソッドの後のAfterアドバイス：アルファベット順で遅い方が先に実行される。

3つのAOPクラスが全部`@Before`と`@After`を持っていると仮定すると、実行順序はこうなるよ。

```markdown
MyAspect1 before
MyAspect2 before
MyAspect3 before
MyAspect3 after
MyAspect2 after
MyAspect1 after
```

> `@Order(num)`アノテーションをアスペクトクラスに付けて順序を制御できるよ。`num`が小さいほど先に実行されて、`@Before`と`@After`の実行は上と同じだね。

## ポイントカット式

ポイントカットメソッドを記述する式で、主にプロジェクトのどのメソッドにアドバイスを追加するかを決めるために使うんだ。

よくある形式は、メソッドのシグネチャに基づいてマッチングする`execution(...)`と、アノテーションに基づいてマッチングする`annotation`だよ。

### execution

主にメソッドの戻り値、パッケージ名、クラス名、メソッド名、メソッド引数などの情報に基づいてマッチングさせるんだ。構文はこれだよ。

```markdown
execution(アクセス修飾子 戻り値 パッケージ名.クラス名.メソッド名(メソッド引数) throws 例外)
```

その中で、アクセス修飾子、`パッケージ名.クラス名`、`throws`例外は省略できるけど、`パッケージ名.クラス名`は省略しない方がいいよ。

ワイルドカードを使ってポイントカットを記述することもできるんだ。

* `*`：単一の独立した任意の記号で、任意の戻り値、パッケージ名、クラス名、メソッド名、任意の型の1つの引数をマッチングさせることができるし、パッケージ、クラス、メソッド名の一部をマッチングさせることもできるよ。

```html
execution(* com.*.service.*.update*(*))
```

* `..`：複数の連続した任意の記号で、任意の階層のパッケージ、または任意の型、任意の数の引数をマッチングさせることができるよ。

```html
execution(* com.yexca..service.*(..))
```

> `&&`、`||`、`!`を使って、もっと複雑なポイントカット式を組み合わせることもできるよ。

書き方のヒント

* 全てのビジネスメソッド名は、名前を付けるときにできるだけ規範的にすると、ポイントカット式が素早くマッチングできて便利だよ。
* ポイントカットメソッドは通常、実装クラスではなくインターフェースに基づいて記述すると、拡張性が高まるんだ。
* ビジネス要件を満たす前提で、ポイントカットのマッチング範囲はできるだけ狭くする方がいいよ。

### @annotation

`@annotation`ポイントカット式は、特定の注解でマークされたメソッドをマッチングさせるために使うんだ。使うには、まずカスタムアノテーションを定義する必要があるよ。

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyLog {
}
```

それから、メソッドにそのアノテーションを追加して、AOPクラスのメソッド上で使うんだ。

```java
@Before("@annotation(net.yexca.aop.MyLog)")
```

## ジョインポイント

Springでは、JoinPointを使ってジョインポイントが抽象化されてるんだ。これを使うと、メソッド実行時の関連情報を取得できるよ。

* `@Around`アドバイスの場合、ジョインポイント情報の取得は`ProceedingJoinPoint`しか使えないんだ。
* 他の4つのアドバイスの場合、ジョインポイント情報の取得は`JoinPoint`しか使えないよ。これは`ProceedingJoinPoint`の親クラスだね。

```java
public Object recordTime(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
    // ターゲットオブジェクトのクラス名を取得する
    String className = proceedingJoinPoint.getTarget().getClass().getName();
        
    // ターゲットメソッドのメソッド名を取得する
   String methodNAme = proceedingJoinPoint.getSignature().getName();
        
    // ターゲットメソッド実行時に渡された引数を取得する
    Object[] args = proceedingJoinPoint.getArgs();
    
    // 元のメソッドを呼び出す
    Object object = proceedingJoinPoint.proceed();

    return object;
}
```
