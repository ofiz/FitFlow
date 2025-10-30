# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: Server error
    - button "×" [ref=e6] [cursor=pointer]
  - generic [ref=e8]:
    - heading "Register to FitFlow" [level=1] [ref=e9]
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: "Full Name:"
        - textbox "Enter your full name" [ref=e13]: Test User 1
      - generic [ref=e14]:
        - generic [ref=e15]: "Email:"
        - textbox "Enter your email" [ref=e16]: test1-1760879829165@example.com
      - generic [ref=e17]:
        - generic [ref=e18]: "Password:"
        - textbox "Enter password" [ref=e19]: Test@123456
      - button "Register" [active] [ref=e20] [cursor=pointer]
    - paragraph [ref=e21]:
      - text: Already have an account?
      - link "Login here" [ref=e22] [cursor=pointer]:
        - /url: /login
```