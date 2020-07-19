# Pilot-Web

Редакция Web-клиента на ASP.NET Core 3.1 для системы управления данными Pilot-ICE

Всё необходимое для устновки Pilot-Server и админки здесь: https://pilot.ascon.ru/
Инструкция развёртывания всех компонентов Pilot-ICE: https://pilot.ascon.ru/release/Help/ru/ReadMe.pdf

## Установка и настройка
### Установка клиента (Linux)
Данное описание и настройка описана для операционной системы Ubuntu.

- Содайте папку /opt/pilot-web и скачайте туда архив с Pilot-Web
```
# mkdir /opt/pilot-web
$ cd /opt/pilot-web
```
- Распакуйте архив в созданную папку
```
# unzip pilot-web.zip
```
- Задайте права на запуск для библиотеки Pilot.Web
```
# chmod +x Pilot.Web
```

### Установка обратного прокси сервера
Для корректной работы Pilot-Web клиента, мы рекомендуем использовать обратный прокси сервер для обработки входящих соединений. Например: Apache или Nginx. Инструкцию по установке и настройке вы можете найти в соответствующем разделе выбранного вами обратного-прокси сервера.

Пример настройки для Nginx:
```
server {
        listen 80;
        listen [::]:80;

        access_log /var/log/nginx/reverse-access.log;
        error_log /var/log/nginx/reverse-error.log;

        location / {
                    proxy_pass http://127.0.0.1:5000;
  }
}
```

### Установка инструментов обработки документов
Для того, чтобы Pilot-Web клиент смог обрабатывать документы формата `xps` и отображать их содержимое в окне браузера необходимо установить дополнительный пакет инструментов обработки документов `mupdf-tools`

```
sudo apt update
sudo apt install mupdf-tools
```
Домашняя страница проекта http://mupdf.com/

## Настройка автозапуска
Для настройки автозапуска необходимо использовать настройку служб инициализации systemd или Supervisor.

Из соображений безопасности рассмотренные сервисы целесообразно запускать и останавливать от имени специально созданного пользователя, например: `pilotwebuser`.

Для этого:
- Создайте учетную запись `pilotwebuser`, от которой будет запускаться и работать Pilot-Web клиент:
```
adduser pilotwebuser --no-create-home
```
- Назначьте пользователя `pilotwebuser` владельцем каталога и файлов /opt/pilot-web:
```
chown pilotwebuser -Rv /opt/pilot-web
```

### Настройка автозапуска с помощь systemd
Один из способов настройки автозапуска реализуется через подсистему инициализации GNU/Linux systemd.

Для того, чтобы автоматически запускать Pilot-Web подключите следующий юнит в systemd:

Юнит автозапуска `pilot-web.service`:
```
[Unit]
Description=Pilot-Web

[Service]
User=pilotwebuser
Group=pilotwebuser
WorkingDirectory=/opt/pilot-web
Restart=always
RestartSec=10
SyslogIdentifier=dotnet-pilot-web-client
Enviroment=ASPNETCORE_ENVIROMENT=Production

[Install]
WantedBy=multi-user.target
```
После содания нового юнита его необходимо включить. Для этого:

- Включите автозапуск сервиса `pilot-web.service`:
```
systemctl enable pilot-web.service
```
- Перезагрузите демон:
```
systemctl daemon-reload
```
- Запустите Pilot-Web:
```
systemctl start pilot-web
```

## Настройка клиента

В клиенте Pilot-Web существует ряд настроек, которые необходимо установить перед запуском системы.

### Основные настройки
Основные настройки клиента расположены в файле `appsettings.json`. Все настройки разбиты по секциям.

#### Секция подключения к Pilot-Server
```json
"PilotServer": {
    "Url": "http://localhost:5545",
    "Database": "basename",
    "LicenseCode": 103
  }
```
где:\
`Url` - адрес подключения к серверу Pilot-Server.\
`Database` - имя базы данных, к которой осуществляется подключение.\
`LicenseCode` - номер лицензии

#### Секция настроек локального хранилища
Т.к. Pilot-Web преобразует полученные от Pilot-Server файлы в формате `xps` в картинки. Чтобы повторно не конвертировать такие файлы используется локальное хранилище преобразованных картинок.

```json
"AppSettings": {
    "FilesStorageDirectory": "C:/PilotWebStorage"
  }
```
где:\
`FilesStorageDirectory` - корневая папка для локального хранилища

#### Секция настроек безопасности
Для обеспечения безопасности авторизации на сервере Pilot-Web необходимо задать следующие настройки:

```json
"AuthSettings": {
    "Issuer": "PilotWebIssuer",
    "SecretKey": "SecretKey@30824995-BD42-4850-87ED-EE8A2AE06ACA",
    "TokenLifeTimeDays": 2,
    "IdleSessionTimeout": 20
  }
```
где:\
`Issuer` - имя издателя токена авторизации.\
`SecretKey` - секретный ключ для формирования токена. Должен содержать различные символы и цифры.\
`TokenLifeTimeDays` - продолжительность жизни токена (в днях).\
`IdleSessionTimeout` - время бездействия пользователя после которого клиент отключается от сервера PIlot.

### Настройки логирования
Для того, чтобы настроить логирование необходимо указать путь куда будет писаться лог. По умолчаний файлы с логами будут лежать рядом с клиентом в папке `Logs`. \
Для того, чтобы задать расположения файла для логов откройте файл `logger.config`. И измените путь для файла в строке:`<conversionPattern value="Logs/web_server.log" />`на нужный:
```xml
<appender name="FileAppender" type="log4net.Appender.RollingFileAppender">
      <file type="log4net.Util.PatternString">
        <conversionPattern value="Logs/web_server.log" />
      </file>
      ...
</appender>
```

При изменении пути файлов лога не забудьте установить права для `pilotwebuser` на запись для папки с логами.

