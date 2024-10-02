## About
*Как собрать front web*
1) В папке front установить npm пакеты с помощью команды "npm i --legacy-peer-deps"
2) В package.json запустить скрипт "start"
3) Клиент будет на 4200 порте

*Как собрать mobile (android)*
(Нужно установить Android Studio)
1) В папке front-mobile установить пакеты с помощью команды "npm i --legacy-peer-deps"
3) В package.json запустить скрипт "dev_build"
4) В package.json запустить скрипт "update_android"
5) В package.json запустить скрипт "sync_android"
6) Открыть Android Studio - в ней открыть папку android в папке "front-mobile"
7) Выполнить следующую команду:
![image](https://github.com/user-attachments/assets/101503a7-9dd1-4052-b607-25ca75b8f6d7)

Apk готовый поставить себе на телефон android или эмулятор в Android Studio.

*Как собрать server*
(Нужно установить docker)
1) В папке server установить npm пакеты с помощью команды "npm i"
2) Сделать копию файла .example.env в той же директории и назвать её .env
3) В package.json запустить скрипт "docker:build:artd"
4) После запустить "docker:compose:up"
5) После запустить скрипт "db:dump:restore"

Готово, у вас запущен контейнер с сервером. Клиент уже автоматически будет от него ждать ответы
