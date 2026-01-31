from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.clock import Clock
from kivy.utils import platform
from kivy.core.window import Window
import os
import ssl
import certifi

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
            # Configurar SSL
            context = ssl.create_default_context(cafile=certifi.where())
            
            from urllib.request import urlopen, Request
            
            base = "https://raw.githubusercontent.com/Valentin3245/World-Tower-Defense/main/"
            headers = {'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'}
            
            req_html = Request(base + "index.html", headers=headers)
            html = urlopen(req_html, timeout=15, context=context).read().decode('utf-8')
            
            req_css = Request(base + "style.css", headers=headers)
            css = urlopen(req_css, timeout=15, context=context).read().decode('utf-8')
            
            req_js = Request(base + "script.js", headers=headers)
            js = urlopen(req_js, timeout=15, context=context).read().decode('utf-8')
            
            # Salvar cache
            try:
                d = self.user_data_dir
                open(os.path.join(d, 'cache_html.txt'), 'w').write(html)
                open(os.path.join(d, 'cache_css.txt'), 'w').write(css)
                open(os.path.join(d, 'cache_js.txt'), 'w').write(js)
            except:
                pass
            
            return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<style>{css}</style>
</head>
<body>{html}<script>{js}</script></body>
</html>"""
        
        except Exception as e:
            # Tentar cache
            try:
                d = self.user_data_dir
                html = open(os.path.join(d, 'cache_html.txt')).read()
                css = open(os.path.join(d, 'cache_css.txt')).read()
                js = open(os.path.join(d, 'cache_js.txt')).read()
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
                return self.get_beautiful_offline_page(str(e))
    
    def get_beautiful_offline_page(self, error=""):
        return """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            overflow: hidden;
        }
        
        .container {
            text-align: center;
            max-width: 400px;
            animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .icon-container {
            width: 120px;
            height: 120px;
            margin: 0 auto 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 15px 50px rgba(102, 126, 234, 0.6);
            }
        }
        
        .icon {
            font-size: 50px;
        }
        
        h1 {
            color: #fff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 15px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .subtitle {
            color: rgba(255,255,255,0.8);
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        
        .btn {
            display: inline-block;
            padding: 15px 40px;
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border: none;
            border-radius: 50px;
            cursor: pointer;
            text-decoration: none;
            box-shadow: 0 8px 30px rgba(245, 87, 108, 0.4);
            transition: all 0.3s ease;
        }
        
        .btn:active {
            transform: scale(0.95);
            box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
        }
        
        .tips {
            margin-top: 40px;
            padding: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        
        .tips h3 {
            color: #f093fb;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .tips ul {
            list-style: none;
            color: rgba(255,255,255,0.7);
            font-size: 13px;
            text-align: left;
        }
        
        .tips li {
            padding: 5px 0;
        }
        
        .tips li::before {
            content: "✦ ";
            color: #f093fb;
        }
        
        .wave {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23667eea' fill-opacity='0.2' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") no-repeat bottom;
            background-size: cover;
            pointer-events: none;
        }
        
        .stars {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
        }
        
        .star {
            position: absolute;
            width: 3px;
            height: 3px;
            background: white;
            border-radius: 50%;
            animation: twinkle 2s infinite;
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="stars">
        <div class="star" style="top:10%;left:20%;animation-delay:0s"></div>
        <div class="star" style="top:20%;left:80%;animation-delay:0.5s"></div>
        <div class="star" style="top:60%;left:10%;animation-delay:1s"></div>
        <div class="star" style="top:30%;left:60%;animation-delay:1.5s"></div>
        <div class="star" style="top:80%;left:30%;animation-delay:0.3s"></div>
        <div class="star" style="top:50%;left:90%;animation-delay:0.8s"></div>
        <div class="star" style="top:70%;left:70%;animation-delay:1.2s"></div>
    </div>
    
    <div class="wave"></div>
    
    <div class="container">
        <div class="icon-container">
            <span class="icon">🌐</span>
        </div>
        
        <h1>Conexão Necessária</h1>
        
        <p class="subtitle">
            Para carregar o World Tower Defense,<br>
            conecte-se à internet e tente novamente.
        </p>
        
        <button class="btn" onclick="location.reload()">
            🔄 Tentar Novamente
        </button>
        
        <div class="tips">
            <h3>💡 Dicas</h3>
            <ul>
                <li>Verifique sua conexão Wi-Fi</li>
                <li>Ative os dados móveis</li>
                <li>Reinicie o aplicativo</li>
            </ul>
        </div>
    </div>
    
    <script>
        // Verificar conexão a cada 5 segundos
        setInterval(function() {
            fetch('https://www.google.com', {mode: 'no-cors', timeout: 3000})
                .then(function() {
                    location.reload();
                })
                .catch(function() {});
        }, 5000);
    </script>
</body>
</html>"""
    
    def on_pause(self):
        return True


if __name__ == '__main__':
    WebViewApp().run()
