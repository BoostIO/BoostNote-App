//
//  ViewController.swift
//  test2
//
//  Created by Junyoung Choi on 2019/12/27.
//  Copyright © 2019 BoostIO. All rights reserved.
//

import UIKit
import WebKit
import SafariServices

class ViewController: UIViewController, WKNavigationDelegate, WKScriptMessageHandler, SFSafariViewControllerDelegate {

    var webView: WKWebView!
    var safariViewController: SFSafariViewController? = nil
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
      //This function handles the events coming from javascript. We'll configure the javascript side of this later.
      //We can access properties through the message body, like this:
        guard let response = message.body as? String else { return }
        guard let url = URL(string: response) else {
            return
        }
  
        safariViewController = SFSafariViewController(url: url)
        safariViewController!.delegate = self
        present(safariViewController!, animated: true, completion: nil)
    }
    
    func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
        controller.dismiss(animated: true, completion: nil)
        safariViewController = nil
    }

    override func loadView() {
        super.loadView()

        let contentController = WKUserContentController()
        contentController.add(self, name: "callback")
        
        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.setValue(true, forKey: "allowUniversalAccessFromFileURLs")
        
        webView = WKWebView(frame: self.accessibilityFrame, configuration: config)
        webView.navigationDelegate = self
        view = webView
        
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "compiled")!
        webView.loadFileURL(url, allowingReadAccessTo: url)

        let request = URLRequest(url: url)
        webView.load(request)
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        title = webView.title
    }
}

