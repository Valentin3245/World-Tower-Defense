[app]
title = World Tower Defense
package.name = worldtowerdefense
package.domain = com.valentin

source.dir = .
source.include_exts = py,png,jpg

version = 1.0.0

requirements = python3,kivy,pyjnius,android

# Ícone obrigatório
icon.filename = icon.png

# Permissões
android.permissions = INTERNET,ACCESS_NETWORK_STATE

# API
android.api = 33
android.minapi = 21
android.ndk = 25b
android.archs = arm64-v8a

android.accept_sdk_license = True

# Sem presplash
presplash.filename =
android.presplash_color = #0a0a1a

# Orientação
orientation = landscape
fullscreen = 1

# Importante
android.allow_backup = True
android.wakelock = False

[buildozer]
log_level = 2
warn_on_root = 0
