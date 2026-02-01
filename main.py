from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.utils import platform
from kivy.core.window import Window

# Fundo igual ao HTML (evita flash branco)
Window.clearcolor = (0.04, 0.04, 0.1, 1)

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
    
    if platform == 'android':
        @run_on_ui_thread
        def load_webview(self):
            activity = PythonActivity.mActivity
            webview = WebView(activity)
            
            settings = webview.getSettings()
            settings.setJavaScriptEnabled(True)
            settings.setDomStorageEnabled(True)
            settings.setUseWideViewPort(True)
            settings.setLoadWithOverviewMode(True)
            settings.setCacheMode(WebSettings.LOAD_DEFAULT)
            
            webview.setWebViewClient(WebViewClient())
            webview.setBackgroundColor(Color.parseColor("#0a0a1a"))
            
            webview.loadUrl("https://valentin3245.github.io/World-Tower-Defense/")
            
            params = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
            activity.addContentView(webview, params)
    
    def build(self):
        if platform == 'android':
            self.load_webview()
        return BoxLayout()
    
    def on_pause(self):
        return True


if __name__ == '__main__':
    WebViewApp().run()
