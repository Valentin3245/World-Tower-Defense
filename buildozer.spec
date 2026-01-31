[app]
title = World Tower Defense
package.name = worldtowerdefense
package.domain = com.valentin
source.dir = .
source.include_exts = py,png,jpg
version = 1.0.0
requirements = python3,kivy==2.2.1,pyjnius,android,certifi

# ICONE
icon.filename = icon.png
presplash.filename = icon.png

# Android
android.permissions = INTERNET,ACCESS_NETWORK_STATE
android.api = 33
android.minapi = 21
android.ndk = 25b
android.archs = arm64-v8a
android.accept_sdk_license = True
android.presplash_color = #1a1a2e

# ORIENTAÇÃO LANDSCAPE (horizontal)
orientation = landscape
fullscreen = 1

[buildozer]
log_level = 2
warn_on_root = 0
