[app]
title = World Tower Defense
package.name = worldtowerdefense
package.domain = com.valentin
source.dir = .
source.include_exts = py,png,jpg
version = 1.0.0
requirements = python3,kivy==2.2.1,pyjnius,android

icon.filename = icon.png

# SEM PRESPLASH
presplash.filename = 

android.permissions = INTERNET,ACCESS_NETWORK_STATE
android.api = 33
android.minapi = 21
android.ndk = 25b
android.archs = arm64-v8a
android.accept_sdk_license = True

# COR DE FUNDO IGUAL AO HTML
android.presplash_color = #0a0a1a

orientation = landscape
fullscreen = 1

# DESABILITAR SPLASH
p4a.presplash_lottie = 
android.presplash_lottie = 

[buildozer]
log_level = 2
warn_on_root = 0
