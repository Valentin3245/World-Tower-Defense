from kivy.app import App
from kivy.uix.widget import Widget
from kivy.utils import platform
from kivy.clock import Clock

if platform == 'android':
    from android.runnable import run_on_ui_thread
    from jnius import autoclass
    
    PythonActivity = autoclass('org.kivy.android.PythonActivity')
    WebView = autoclass('android.webkit.WebView')
    WebViewClient = autoclass('android.webkit.WebViewClient')
    WebSettings = autoclass('android.webkit.WebSettings')
    ViewGroup = autoclass('android.view.ViewGroup')
    LinearLayout = autoclass('android.widget.LinearLayout')


class GameApp(App):
    
    def build(self):
        if platform == 'android':
            Clock.schedule_once(self.create_webview, 0)
        return Widget()
    
    if platform == 'android':
        @run_on_ui_thread
        def create_webview(self, dt):
            activity = PythonActivity.mActivity
            
            # Criar WebView
            webview = WebView(activity)
            webview.setWebViewClient(WebViewClient())
            
            # Configurações
            settings = webview.getSettings()
            settings.setJavaScriptEnabled(True)
            settings.setDomStorageEnabled(True)
            settings.setLoadWithOverviewMode(True)
            settings.setUseWideViewPort(True)
            settings.setBuiltInZoomControls(False)
            settings.setDisplayZoomControls(False)
            settings.setCacheMode(WebSettings.LOAD_DEFAULT)
            settings.setAllowFileAccess(True)
            settings.setAllowContentAccess(True)
            settings.setMediaPlaybackRequiresUserGesture(False)
            
            # Carregar URL
            webview.loadUrl("https://valentin3245.github.io/World-Tower-Defense/")
            
            # Adicionar à tela
            layout = LinearLayout(activity)
            layout.setOrientation(LinearLayout.VERTICAL)
            layout.addView(webview, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            
            activity.setContentView(layout)
    
    def on_pause(self):
        return True
    
    def on_resume(self):
        pass


if __name__ == '__main__':
    GameApp().run()
