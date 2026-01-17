---
slug: 221
title: 'Spring AOP (Aspect-Oriented Programming)'
# draft: true
author: yexca
date: '2025-01-21T16:05:57+09:00'
categories:
    - Tech Learning
tags:
    - Backend Tech
    - SpringBoot
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

Aspect-Oriented Programming (AOP) is about programming for specific methods.

Dynamic proxy is the most common implementation for AOP. Spring AOP is an advanced Spring framework tech, primarily using the underlying dynamic proxy mechanism to program specific methods while managing bean objects.

## Counting Method Execution Time

### Importing Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

### Writing AOP Code

Write AOP code to program specific methods based on business needs.

```java
@Slf4j
@Component
@Aspect // AOP Class
public class TimeAspect {
    // Pointcut expression
    @Around("execution(* net.yexca.service.*.*(..))")
    public Object recordTime(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        long begin = System.currentTimeMillis();
        // Call the original method
        Object object = proceedingJoinPoint.proceed();
        long end = System.currentTimeMillis();
        log.info(proceedingJoinPoint.getSignature() + " method execution time: {}ms", end-begin);
        return object;
    }
}
```

> Common AOP use cases include logging operations, access control, and transaction management.

## Core Concepts

**Join Point**: A method that can be controlled by AOP (implicitly contains execution-related info).

**Advice**: Refers to the repetitive logic, or common functionality (ultimately implemented as a method).

**Pointcut**: Conditions for matching join points. Advice is applied only when a pointcut method executes.

**Aspect**: Describes the relationship between advice and pointcut (Advice + Pointcut).

**Target Object**: The object to which the advice is applied.

In the example above, all methods of the unwritten Service are join points. Methods selected by the pointcut expression are pointcuts. The `recordTime` method in the AOP class is the advice. The `@Around` annotation combined with the advice forms an aspect, and the `TimeAspect` class is called the aspect class.

## Advice

### Advice Types

@Around: Around advice. The advice method annotated with this executes both before and after the target method.

@Before: Before advice. The advice method annotated with this executes before the target method.

@After: After (finally) advice. The advice method annotated with this executes after the target method, regardless of whether an exception occurred.

@AfterReturning: After returning advice. The advice method annotated with this executes after the target method returns normally (no exception).

@AfterThrowing: After throwing advice. The advice method annotated with this executes if the target method throws an exception.

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

> @Around advice needs to manually call `ProceedingJoinPoint.proceed()` for the original method to execute. Other advice types don't need to consider target method execution.
>
> The return type of an @Around advice method must be `Object` to receive the return value of the original method.

---

The pointcut expressions for the 5 annotations above are identical and can be extracted, as shown below:

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

If the `pt()` method has public access, it can be referenced in other classes.

### Advice Order

When multiple aspects' pointcuts match the same target method, multiple advice methods will execute when the target method runs.

```yml
net: 
  yexca: 
    aop: 
      - MyAspect1
      - MyAspect2
      - MyAspect3
```

Suppose three AOP classes all select the same method. Among different aspect classes, the default order is alphabetical by aspect class name.

* Advice methods *before* the target method: those with earlier alphabetical ranking execute first.
* Advice methods *after* the target method: those with later alphabetical ranking execute first.

Assuming three AOP classes have both @Before and @After, the execution order is:

```markdown
MyAspect1 before
MyAspect2 before
MyAspect3 before
MyAspect3 after
MyAspect2 after
MyAspect1 after
```

> You can use the `@Order(num)` annotation on the aspect class to control the order. A smaller `num` means earlier execution. The execution order for @Before and @After remains the same as described above.

## Pointcut Expressions

An expression describing pointcut methods, primarily used to determine which methods in a project need advice.

Common forms include `execution(...)` which matches based on method signatures, and `annotation` which matches based on annotations.

### execution

Mainly matches based on method return type, package name, class name, method name, method parameters, etc. The syntax is:

```markdown
execution(AccessModifier ReturnType PackageName.ClassName.MethodName(MethodParameters) throws Exception)
```

The `AccessModifier`, `PackageName.ClassName`, and `throws Exception` can be omitted, but it's not recommended to omit `PackageName.ClassName`.

Wildcards can also be used to describe pointcuts:

* `*`: A single arbitrary character. Can match any return type, package name, class name, method name, any single parameter type, or part of a package, class, or method name.

```html
execution(* com.*.service.*.update*(*))
```

* `..`: Multiple consecutive arbitrary characters. Can match any level of package, or any type and number of parameters.

```html
execution(* com.yexca..service.*(..))
```

> You can also use `&&`, `||`, `!` to combine more complex pointcut expressions.

### Writing Suggestions

* Standardize all business method names as much as possible for easier pointcut expression matching.
* Describe pointcut methods usually based on interfaces rather than concrete implementations, enhancing extensibility.
* Narrow the pointcut matching scope as much as possible while still meeting business requirements.

### @annotation

The `@annotation` pointcut expression is used to match methods marked with a specific annotation. You need to define a custom annotation first.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyLog {
}
```

Then add this annotation to the method, and in the AOP class method, use:

```java
@Before("@annotation(net.yexca.aop.MyLog)")
```

## Join Point

In Spring, `JoinPoint` abstracts the concept of a join point. It allows you to obtain information related to method execution.

* For `@Around` advice, you must use `ProceedingJoinPoint` to get join point info.
* For the other four advice types, you must use `JoinPoint` to get join point info; it's the parent class of `ProceedingJoinPoint`.

```java
public Object recordTime(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
    // Get the target object's class name
    String className = proceedingJoinPoint.getTarget().getClass().getName();
        
    // Get the target method's name
   String methodNAme = proceedingJoinPoint.getSignature().getName();
        
    // Get the parameters passed during target method execution
    Object[] args = proceedingJoinPoint.getArgs();
    
    // Call the original method
    Object object = proceedingJoinPoint.proceed();

    return object;
}
```
