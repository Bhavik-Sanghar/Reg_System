# User Stories  

Date : 16/4/2026

## Story : 1 : Captcha

1. As a System , I want to add captcha service so that prevnt unauthorized access and to add delay
2. In Captcha service captcha is simple math string in svg and answer of maths string so system can valdidate answer with user's input and prevent bot / crawler
3. Each time this service/function used it provide new captcha with expire time also such as 1 min.
4. After Valdidate captcha it get deleted in session so it can't be used again

## Strory : 2 : Registration-page

1. As a user i can register my self into system.

2. As a user i need to fill follwing inforamtion:
    - Name (Fisrt Name , Last Name)
    - Email (Unique Email id)
    - Password & confirm Password
    - Captcha is also there

3. As a user when i register in system should check that if user with that email alreday in system or not if yes then give warning like user alredy exist.

4. As a user after succussful regisration i redirected on login page

## Strory : 3 : Login-page

1. As user i can login into system with email and password

2. As a user i have control of so user can tell **Remember Me** to system so it will keep me logged in.

3. As a user when i dont check remember me , i will logged out in 1 Day (Default JWT expire)

4. As a user when i click on forget password button i should get password reset link on mail (Here we disply that in new page) and i can reset password also new password should not be same as last password

5. Forget passowrd link is made with userdata encrpted with some salt and also expire time. so we can protect that link from public access.

6. As a user i can only attempt limited login attempt such as 3 or 5.

## Strory 4 : Admin-panel/dashboard

1. As a admin i have access to all logs.
2. As a admin i can see users registration , login attempt.
