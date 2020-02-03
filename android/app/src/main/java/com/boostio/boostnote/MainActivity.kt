package com.boostio.boostnote

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat.startActivity

class MainActivity : AppCompatActivity() {
    val ctx: AppCompatActivity = this
    class WebAppInterface(private val mContext: Context) {

        /** Show a toast from the web page  */
        @JavascriptInterface
        fun showToast(toast: String) {
            Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show()
        }

        @JavascriptInterface
        fun openUrl(url: String) {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(mContext, intent, null);
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
        WebView.setWebContentsDebuggingEnabled(true);
    }
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main);
        val view = findViewById<WebView>(R.id.webview);
        val settings = view.settings;
        settings.javaScriptEnabled = true;
        settings.allowContentAccess = true;
        settings.domStorageEnabled = true;
        view.webViewClient = WebViewClient()
        view.webChromeClient = object : WebChromeClient() {

            override fun onConsoleMessage(message: String, lineNumber: Int, sourceID: String) {
                Log.d("MyApplication", "$message -- From line $lineNumber of $sourceID")
            }
        }
        view.addJavascriptInterface(WebAppInterface(this), "Android")
        view.loadUrl("file:///android_asset/compiled/index.html");

    }
}
