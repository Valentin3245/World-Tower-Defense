from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.clock import Clock
from kivy.utils import platform
import os

if platform == 'android':
    from jnius import autoclass
    from android.runnable import run_on_ui_thread
    
    PythonActivity = autoclass('org.kivy.android.PythonActivity')
    WebView = autoclass('android.webkit.WebView')
    WebViewClient = autoclass('android.webkit.WebViewClient')
    WebSettings = autoclass('android.webkit.WebSettings')
    LayoutParams = autoclass('android.view.ViewGroup$LayoutParams')
    Color = autoclass('android.graphics.Color')


class WebViewApp(App):
    
    def build(self):
        layout = BoxLayout()
        if platform == 'android':
            Clock.schedule_once(self.load_webview, 0.1)
        return layout
    
    def get_html(self):
        try:
            from urllib.request import urlopen, Request
            
            url = "https://raw.githubusercontent.com/Valentin3245/World-Tower-Defense/main/index.html"
            req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            html = urlopen(req, timeout=10).read().decode('utf-8')
            
            url_css = "https://raw.githubusercontent.com/Valentin3245/World-Tower-Defense/main/style.css"
            req_css = Request(url_css, headers={'User-Agent': 'Mozilla/5.0'})
            css = urlopen(req_css, timeout=10).read().decode('utf-8')
            
            url_js = "https://raw.githubusercontent.com/Valentin3245/World-Tower-Defense/main/script.js"
            req_js = Request(url_js, headers={'User-Agent': 'Mozilla/5.0'})
            js = urlopen(req_js, timeout=10).read().decode('utf-8')
            
            # Salvar cache
            cache_dir = self.user_data_dir
            with open(os.path.join(cache_dir, 'index.html'), 'w') as f:
                f.write(html)
            with open(os.path.join(cache_dir, 'style.css'), 'w') as f:
                f.write(css)
            with open(os.path.join(cache_dir, 'script.js'), 'w') as f:
                f.write(js)
            
            return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<style>{css}</style>
</head>
<body>{html}<script>{js}</script></body>
</html>"""
        except:
            # Tentar cache
            try:
                cache_dir = self.user_data_dir
                with open(os.path.join(cache_dir, 'index.html')) as f:
                    html = f.read()
                css = js = ""
                try:
                    with open(os.path.join(cache_dir, 'style.css')) as f:
                        css = f.read()
                except:
                    pass
                try:
                    with open(os.path.join(cache_dir, 'script.js')) as f:
                        js = f.read()
                except:
                    pass
                return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>{css}</style>
</head>
<body>{html}<script>{js}</script></body>
</html>"""
            except:
                return """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body{font-family:Arial;background:#1a1a2e;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;text-align:center}
h1{color:#e94560}
</style>
</head>
<body>
<div>
<h1>Conecte a Internet</h1>
<p>Abra o app com internet pela primeira vez</p>
</div>
</body>
</html>"""
    
    if platform == 'android':
        @run_on_ui_thread
        def load_webview(self, *args):
            try:
                activity = PythonActivity.mActivity
                webview = WebView(activity)
                
                settings = webview.getSettings()
                settings.setJavaScriptEnabled(True)
                settings.setDomStorageEnabled(True)
                settings.setUseWideViewPort(True)
                settings.setLoadWithOverviewMode(True)
                settings.setCacheMode(WebSettings.LOAD_DEFAULT)
                
                webview.setWebViewClient(WebViewClient())
                webview.setBackgroundColor(Color.parseColor("#1a1a2e"))
                
                html = self.get_html()
                webview.loadDataWithBaseURL(None, html, "text/html", "UTF-8", None)
                
                params = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
                activity.addContentView(webview, params)
            except Exception as e:
                print(f"Erro: {e}")
    
    def on_pause(self):
        return True
    
    def on_resume(self):
        pass


if __name__ == '__main__':
    WebViewApp().run()
