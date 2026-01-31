[app]
title = World Tower Defense
package.name = worldtowerdefense
package.domain = com.valentin
source.dir = .
source.include_exts = py
version = 1.0.0
requirements = python3,kivy==2.2.1,pyjnius,android,certifi,urllib3
android.permissions = INTERNET,ACCESS_NETWORK_STATE
orientation = portrait
fullscreen = 1
android.api = 33
android.minapi = 21
android.ndk = 25b
android.sdk = 33
android.archs = arm64-v8a
android.accept_sdk_license = True
android.skip_update = False
p4a.branch = master

[buildozer]
log_level = 2
warn_on_root = 0
