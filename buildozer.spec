[app]
title = World Tower Defense
package.name = worldtowerdefense
package.domain = com.valentin
source.dir = .
source.include_exts = py
version = 1.0.0
requirements = python3,kivy==2.2.1,pyjnius,android,certifi
android.permissions = INTERNET,ACCESS_NETWORK_STATE
orientation = portrait
fullscreen = 1
android.api = 33
android.minapi = 21
android.ndk = 25b
android.archs = arm64-v8a
android.accept_sdk_license = True
android.presplash_color = #1a1a2e
android.whitelist = lib-dynload/_csv.so

[buildozer]
log_level = 2
warn_on_root = 0
