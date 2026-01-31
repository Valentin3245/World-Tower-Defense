from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.clock import Clock
from kivy.utils import platform
import os

if platform == 'android':
    from jnius import autoclass
    from android.runnable import run_on_ui_thread
    WebView = autoclass('android.webkit.WebView')
    WebViewClient = autoclass('android.webkit.WebViewClient')
    activity = autoclass('org.kivy.android.PythonActivity').mActivity
    LayoutParams = autoclass('android.view.ViewGroup$LayoutParams')
    Color = autoclass('android.graphics.Color')

from urllib.request import urlopen, Request

class WorldTowerDefenseApp(App):
    GITHUB_USER = "Valentin3245"
    GITHUB_REPO = "World-Tower-Defense"
    GITHUB_BRANCH = "main"
    
    def build(self):
        self.layout = BoxLayout()
        if platform == 'android':
            Clock.schedule_once(self.create_webview, 0)
        return self.layout
    
    def get_cache_path(self):
        cache_dir = os.path.join(self.user_data_dir, 'cache')
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir)
        return cache_dir
    
    def check_internet(self):
        try:
            urlopen('https://www.google.com', timeout=5)
            return True
        except:
            return False
    
    def download_from_github(self):
        files = ['index.html', 'style.css', 'script.js']
        cache_path = self.get_cache_path()
        for filename in files:
            try:
                url = f"https://raw.githubusercontent.com/{self.GITHUB_USER}/{self.GITHUB_REPO}/{self.GITHUB_BRANCH}/{filename}"
                req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                response = urlopen(req, timeout=15)
                content = response.read().decode('utf-8')
                with open(os.path.join(cache_path, filename), 'w') as f:
                    f.write(content)
            except:
                pass
    
    def get_html_content(self):
        cache_path = self.get_cache_path()
        if self.check_internet():
            self.download_from_github()
        html_path = os.path.join(cache_path, 'index.html')
        if os.path.exists(html_path):
            with open(html_path) as f:
                html = f.read()
            css = js = ""
            css_path = os.path.join(cache_path, 'style.css')
            js_path = os.path.join(cache_path, 'script.js')
            if os.path.exists(css_path):
                with open(css_path) as f:
                    css = f.read()
            if os.path.exists(js_path):
                with open(js_path) as f:
                    js = f.read()
            return f"<!DOCTYPE html><html><head><meta charset=UTF-8><meta name=viewport content='width=device-width,initial-scale=1.0'><style>{css}</style></head><body>{html}<script>{js}</script></body></html>"
        return "<html><body style='background:#1a1a2e;color:white;display:flex;justify-content:center;align-items:center;height:100vh'><h1>Sem Internet</h1></body></html>"
    
    if platform == 'android':
        @run_on_ui_thread
        def create_webview(self, *args):
            self.webview = WebView(activity)
            self.webview.getSettings().setJavaScriptEnabled(True)
            self.webview.getSettings().setDomStorageEnabled(True)
            self.webview.setWebViewClient(WebViewClient())
            self.webview.setBackgroundColor(Color.parseColor("#1a1a2e"))
            self.webview.loadDataWithBaseURL(None, self.get_html_content(), "text/html", "UTF-8", None)
            activity.addContentView(self.webview, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    
    def on_pause(self):
        return True

if __name__ == '__main__':
    WorldTowerDefenseApp().run()
