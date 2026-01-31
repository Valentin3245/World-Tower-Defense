from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.clock import Clock
from kivy.utils import platform
from kivy.core.window import Window
import os

# Cor de fundo
Window.clearcolor = (0.1, 0.1, 0.18, 1)

class WebViewApp(App):
    
    def build(self):
        self.layout = BoxLayout()
        
        if platform == 'android':
            Clock.schedule_once(self.init_webview, 0.5)
        
        return self.layout
    
    def init_webview(self, dt):
        try:
            from jnius import autoclass
            from android.runnable import run_on_ui_thread
            
            PythonActivity = autoclass('org.kivy.android.PythonActivity')
            WebView = autoclass('android.webkit.WebView')
            WebViewClient = autoclass('android.webkit.WebViewClient')
            LayoutParams = autoclass('android.view.ViewGroup$LayoutParams')
            
            @run_on_ui_thread
            def create():
                try:
                    activity = PythonActivity.mActivity
                    
                    wv = WebView(activity)
                    wv.getSettings().setJavaScriptEnabled(True)
                    wv.getSettings().setDomStorageEnabled(True)
                    wv.setWebViewClient(WebViewClient())
                    
                    html = self.load_html()
                    wv.loadDataWithBaseURL(None, html, "text/html", "UTF-8", None)
                    
                    params = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
                    activity.addContentView(wv, params)
                except:
                    pass
            
            create()
        except:
            pass
    
    def load_html(self):
        try:
            from urllib.request import urlopen, Request
            
            base = "https://raw.githubusercontent.com/Valentin3245/World-Tower-Defense/main/"
            
            html = urlopen(Request(base + "index.html", headers={'User-Agent': 'Mozilla'}), timeout=10).read().decode()
            css = urlopen(Request(base + "style.css", headers={'User-Agent': 'Mozilla'}), timeout=10).read().decode()
            js = urlopen(Request(base + "script.js", headers={'User-Agent': 'Mozilla'}), timeout=10).read().decode()
            
            # Salvar cache
            try:
                d = self.user_data_dir
                open(os.path.join(d, 'h.txt'), 'w').write(html)
                open(os.path.join(d, 'c.txt'), 'w').write(css)
                open(os.path.join(d, 'j.txt'), 'w').write(js)
            except:
                pass
            
            return f"<!DOCTYPE html><html><head><meta charset=UTF-8><meta name=viewport content='width=device-width,initial-scale=1'><style>{css}</style></head><body>{html}<script>{js}</script></body></html>"
        
        except:
            # Tentar cache
            try:
                d = self.user_data_dir
                html = open(os.path.join(d, 'h.txt')).read()
                css = open(os.path.join(d, 'c.txt')).read()
                js = open(os.path.join(d, 'j.txt')).read()
                return f"<!DOCTYPE html><html><head><meta charset=UTF-8><meta name=viewport content='width=device-width,initial-scale=1'><style>{css}</style></head><body>{html}<script>{js}</script></body></html>"
            except:
                return "<html><body style='background:#1a1a2e;color:white;display:flex;justify-content:center;align-items:center;height:100vh;margin:0'><h1>Conecte a Internet</h1></body></html>"
    
    def on_pause(self):
        return True


if __name__ == '__main__':
    WebViewApp().run()
