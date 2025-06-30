import React, { useRef, useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { useTabsStore, useHistoryStore, useSettingsStore, Tab } from '@/stores/browserStore';
import Homepage from './Homepage';
import { View } from 'tamagui';

interface BrowserWebViewProps {
  tab: Tab;
  isActive: boolean;
  onHomepageStateChange?: (showHomepage: boolean) => void;
  emulationZoom?: number;
}

export default function BrowserWebView({ 
  tab, 
  isActive, 
  onHomepageStateChange,
  emulationZoom = 100 
}: BrowserWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const viewShotRef = useRef<ViewShot>(null);
  const mountedRef = useRef<boolean>(false);
  const { updateTab, createTab } = useTabsStore();
  const { addHistoryEntry } = useHistoryStore();
  const { settings, theme } = useSettingsStore();
  const [showHomepage, setShowHomepage] = useState(false);
  const [webViewBackgroundColor, setWebViewBackgroundColor] = useState('transparent');
  const [navigationState, setNavigationState] = useState({
    canGoBack: false,
    canGoForward: false,
    loading: false,
    url: tab.url,
    title: tab.title
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const isBlankTab = tab.url === 'about:blank';
    const shouldShowHomepage = isBlankTab;
    
    setShowHomepage(shouldShowHomepage);
    
    if (isActive && onHomepageStateChange) {
      onHomepageStateChange(shouldShowHomepage);
    }
  }, [tab.url, isActive, onHomepageStateChange]);

  useEffect(() => {
    if (webViewRef.current && !showHomepage && isActive) {
      const timeoutId = setTimeout(() => {
        applyZoom(emulationZoom);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [emulationZoom, showHomepage, isActive]);

  useEffect(() => {
    if (showHomepage) {
      setWebViewBackgroundColor('transparent');
    } else {
      const backgroundColor = theme === 'dark' ? '#000000' : '#FFFFFF';
      setWebViewBackgroundColor(backgroundColor);
    }
  }, [theme, showHomepage, tab.loading]);

  const captureThumbnail = async () => {
    if (!mountedRef.current || !viewShotRef.current || !isActive || showHomepage || tab.url === 'about:blank') {
      return;
    }

    try {
      // Wait a bit for the page to fully render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Double-check that component is still mounted and ref is valid
      if (!mountedRef.current || !viewShotRef.current) {
        return;
      }
      
      const uri = await captureRef(viewShotRef.current, {
        format: 'jpg',
        quality: 0.6,
        width: 300,
        height: 200,
        result: 'data-uri',
      });

      // Final check before updating tab
      if (mountedRef.current) {
        updateTab(tab.id, { thumbnail: uri });
      }
    } catch (error) {
      console.error('Failed to capture thumbnail:', error);
    }
  };

  const extractFavicon = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch {
      return undefined;
    }
  };

  const getDisplayTitle = (title: string, url: string) => {
    // If we have a valid title that's not a loading state, use it
    if (title && title !== 'Loading...' && title.trim() !== '') {
      return title;
    }
    
    // For blank tabs, show "New Tab"
    if (url === 'about:blank') {
      return 'New Tab';
    }
    
    // Extract hostname from URL as fallback
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const getUserAgent = () => {
    if (tab.desktopMode) {
      // Desktop user agent
      return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }
    // Default mobile user agent (let WebView use its default)
    return undefined;
  };

  const applyZoom = (zoomLevel: number) => {
    if (!webViewRef.current || !isActive) return;

    const zoomScript = `
      (function() {
        try {
          const zoomFactor = ${zoomLevel} / 100;
                    
          if (document.documentElement) {
            document.documentElement.style.zoom = zoomFactor;
          }
          
          if (!document.documentElement.style.zoom && document.body) {
            document.body.style.transform = 'scale(' + zoomFactor + ')';
            document.body.style.transformOrigin = 'top left';
            document.body.style.width = (100 / zoomFactor) + '%';
            document.body.style.height = (100 / zoomFactor) + '%';
          }

          let viewportMeta = document.querySelector('meta[name="viewport"]');
          if (viewportMeta) {
            viewportMeta.content = 'width=device-width, initial-scale=' + zoomFactor + ', viewport-fit=cover';
          } else {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            viewportMeta.content = 'width=device-width, initial-scale=' + zoomFactor + ', viewport-fit=cover';
            document.head.appendChild(viewportMeta);
          }

          document.documentElement.setAttribute('data-zoom-level', ${zoomLevel});
          
          document.documentElement.style.setProperty('--zoom-factor', zoomFactor);
          document.documentElement.style.setProperty('--zoom-level', ${zoomLevel});

          if (window.dispatchEvent) {
            const zoomEvent = new CustomEvent('viewportZoomChange', {
              detail: { zoomLevel: ${zoomLevel}, zoomFactor: zoomFactor }
            });
            window.dispatchEvent(zoomEvent);
          }

          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'zoomApplied',
              zoomLevel: ${zoomLevel},
              zoomFactor: zoomFactor,
              method: document.documentElement.style.zoom ? 'css-zoom' : 'css-transform'
            }));
          }

        } catch (error) {
          console.error('Zoom application error:', error);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'zoomError',
              error: error.message
            }));
          }
        }
      })();
      true;
    `;

    webViewRef.current.injectJavaScript(zoomScript);
  };

  const resetZoom = () => {
    if (!webViewRef.current) return;

    const resetScript = `
      (function() {
        try {          
          if (document.documentElement) {
            document.documentElement.style.zoom = '';
          }

          if (document.body) {
            document.body.style.transform = '';
            document.body.style.transformOrigin = '';
            document.body.style.width = '';
            document.body.style.height = '';
          }

          let viewportMeta = document.querySelector('meta[name="viewport"]');
          if (viewportMeta) {
            viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
          }

          document.documentElement.removeAttribute('data-zoom-level');

          document.documentElement.style.removeProperty('--zoom-factor');
          document.documentElement.style.removeProperty('--zoom-level');

          if (window.dispatchEvent) {
            const resetEvent = new CustomEvent('viewportZoomChange', {
              detail: { zoomLevel: 100, zoomFactor: 1 }
            });
            window.dispatchEvent(resetEvent);
          }

          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'zoomReset'
            }));
          }

        } catch (error) {
          console.error('Zoom reset error:', error);
        }
      })();
      true;
    `;

    webViewRef.current.injectJavaScript(resetScript);
  };

  const handleNavigationStateChange = (navState: any) => {
    // Always use the current URL for title generation if no title is provided
    const displayTitle = getDisplayTitle(navState.title, navState.url);
    
    setNavigationState({
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward,
      loading: navState.loading,
      url: navState.url,
      title: displayTitle
    });

    const favicon = extractFavicon(navState.url);

    updateTab(tab.id, {
      url: navState.url,
      title: displayTitle,
      canGoBack: navState.canGoBack,
      canGoForward: navState.canGoForward,
      loading: navState.loading,
      favicon: favicon,
    });

    // Only add to history when page is fully loaded and has content
    if (!navState.loading && navState.url && navState.url !== 'about:blank') {
      // Use the actual page title if available, otherwise use the display title
      const historyTitle = (navState.title && navState.title !== 'Loading...') ? navState.title : displayTitle;
      addHistoryEntry(navState.url, historyTitle, favicon);
    }

    const shouldHideHomepage = navState.url !== 'about:blank';
    if (shouldHideHomepage && showHomepage) {
      setShowHomepage(false);
      if (isActive && onHomepageStateChange) {
        onHomepageStateChange(false);
      }
    }
  };

  const handleLoadProgress = (event: any) => {
    updateTab(tab.id, {
      progress: event.nativeEvent.progress,
    });
  };

  const handleLoadStart = (event: any) => {
    const { url } = event.nativeEvent;
    
    if (emulationZoom !== 100) {
      resetZoom();
    }
    
    // Reset title to URL-based title when starting to load a new page
    const loadingTitle = getDisplayTitle('', url);
    
    setNavigationState(prev => ({
      ...prev,
      loading: true,
      url: url,
      title: loadingTitle
    }));

    updateTab(tab.id, {
      loading: true,
      progress: 0,
      url: url,
      title: loadingTitle
    });
    
    const loadingColor = theme === 'dark' ? '#000000' : '#FFFFFF';
    setWebViewBackgroundColor(loadingColor);
  };

  const handleLoadEnd = (event: any) => {
    const { url } = event.nativeEvent;
    
    setNavigationState(prev => ({
      ...prev,
      loading: false,
      url: url
    }));

    updateTab(tab.id, {
      loading: false,
      progress: 1,
      url: url
    });

    if (emulationZoom !== 100 && isActive) {
      setTimeout(() => {
        applyZoom(emulationZoom);
      }, 500);
    }

    // Capture thumbnail after page loads
    if (isActive && !showHomepage && url !== 'about:blank') {
      setTimeout(() => {
        captureThumbnail();
      }, 1500);
    }

    setTimeout(() => {
      if (webViewRef.current && isActive) {
        webViewRef.current.requestFocus();
      }
    }, 100);
  };

  const handleError = (event: any) => {
    setNavigationState(prev => ({
      ...prev,
      loading: false
    }));

    updateTab(tab.id, {
      loading: false,
      progress: 0,
    });
  };

  const injectedJavaScript = `
    (function() {
      function applyBrowserTheme() {
        const isDark = ${theme === 'dark'};
        
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeColorMeta) {
          themeColorMeta = document.createElement('meta');
          themeColorMeta.name = 'theme-color';
          document.head.appendChild(themeColorMeta);
        }
        
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
        
        let backgroundColor = bodyBg !== 'rgba(0, 0, 0, 0)' ? bodyBg : htmlBg;
        
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          backgroundColor = isDark ? '#000000' : '#FFFFFF';
        }
        
        if (document.body.style.backgroundColor === '' || 
            document.body.style.backgroundColor === 'transparent') {
          document.body.style.backgroundColor = backgroundColor;
        }
        
        themeColorMeta.content = backgroundColor;
        
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
          viewportMeta = document.createElement('meta');
          viewportMeta.name = 'viewport';
          viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
          document.head.appendChild(viewportMeta);
        }
        
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'backgroundColor',
            color: backgroundColor
          }));
        }
      }
      
      function sendNavigationState() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'navigationState',
            canGoBack: window.history.length > 1,
            canGoForward: false,
            url: window.location.href,
            title: document.title
          }));
        }
      }
      
      // Send updated title when it changes
      function sendTitleUpdate() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'titleUpdate',
            title: document.title,
            url: window.location.href
          }));
        }
      }
      
      // Popup blocking functionality
      const blockPopups = ${settings.blockPopups};
      if (blockPopups) {
        const originalOpen = window.open;
        window.open = function(url, name, specs) {
          console.log('Popup blocked:', url);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'popupBlocked',
              url: url || '',
              name: name || '',
              specs: specs || ''
            }));
          }
          return null;
        };
        
        // Block other popup methods
        window.showModalDialog = function() {
          console.log('Modal dialog blocked');
          return null;
        };
        
        // Prevent new window creation via target="_blank"
        document.addEventListener('click', function(e) {
          const target = e.target;
          if (target && target.tagName === 'A' && target.target === '_blank') {
            e.preventDefault();
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'popupBlocked',
                url: target.href || '',
                method: 'target_blank'
              }));
            }
          }
        });
      }
      
      // Watch for title changes
      const titleObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.target === document.head) {
            const titleElement = document.querySelector('title');
            if (titleElement) {
              sendTitleUpdate();
            }
          }
        });
      });
      
      // Observe changes to the document head for title updates
      if (document.head) {
        titleObserver.observe(document.head, {
          childList: true,
          subtree: true
        });
      }
      
      // Also watch for direct title property changes
      let lastTitle = document.title;
      setInterval(function() {
        if (document.title !== lastTitle) {
          lastTitle = document.title;
          sendTitleUpdate();
        }
      }, 500);
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          applyBrowserTheme();
          sendNavigationState();
          sendTitleUpdate();
        });
      } else {
        applyBrowserTheme();
        sendNavigationState();
        sendTitleUpdate();
      }
      
      window.addEventListener('load', function() {
        applyBrowserTheme();
        sendNavigationState();
        sendTitleUpdate();
      });
      
      window.addEventListener('popstate', function() {
        sendNavigationState();
        setTimeout(sendTitleUpdate, 100);
      });
      
      const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' && 
              (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
            shouldUpdate = true;
          }
        });
        if (shouldUpdate) {
          setTimeout(applyBrowserTheme, 100);
        }
      });
      
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        subtree: true
      });

      const zoomCSS = document.createElement('style');
      zoomCSS.textContent = \`
        html {
          zoom: var(--zoom-factor, 1);
        }
        
        html:not([style*="zoom"]) body {
          transform-origin: top left;
        }
        
        @media screen {
          :root {
            --zoom-factor: 1;
            --zoom-level: 100;
          }
        }
        
        html, body {
          overflow-x: auto !important;
          min-height: 100vh;
        }
      \`;
      document.head.appendChild(zoomCSS);
    })();
    
    true;
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'backgroundColor' && data.color) {
        setWebViewBackgroundColor(data.color);
      } else if (data.type === 'navigationState') {
        const displayTitle = getDisplayTitle(data.title, data.url);
        
        setNavigationState(prev => ({
          ...prev,
          canGoBack: data.canGoBack,
          url: data.url,
          title: displayTitle
        }));
        
        updateTab(tab.id, {
          canGoBack: data.canGoBack,
          url: data.url,
          title: displayTitle
        });
      } else if (data.type === 'titleUpdate') {
        // Handle real-time title updates from the page
        const displayTitle = getDisplayTitle(data.title, data.url);
        
        setNavigationState(prev => ({
          ...prev,
          title: displayTitle,
          url: data.url
        }));
        
        updateTab(tab.id, {
          title: displayTitle,
          url: data.url
        });
      } else if (data.type === 'popupBlocked') {
        console.log('Popup blocked:', data);
        // Could show a toast notification here if desired
      } else if (data.type === 'zoomApplied') {
        console.log('Zoom applied:', data.zoomLevel + '% using', data.method);
      } else if (data.type === 'zoomError') {
        console.error('Zoom error:', data.error);
      } else if (data.type === 'zoomReset') {
        console.log('Zoom reset to 100%');
      }
    } catch (error) {
      // Ignore parsing errors
    }
  };

  const goBack = () => {
    if (webViewRef.current && navigationState.canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const goForward = () => {
    if (webViewRef.current && navigationState.canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const reload = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const injectJavaScript = (script: string) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(script);
    }
  };

  const navigateToUrl = (url: string) => {
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        formattedUrl = `https://${url}`;
      } else {
        const searchEngine = settings.defaultSearchEngine;
        const searchUrls = {
          google: `https://www.google.com/search?q=${encodeURIComponent(url)}`,
          bing: `https://www.bing.com/search?q=${encodeURIComponent(url)}`,
          duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(url)}`,
        };
        formattedUrl = searchUrls[searchEngine];
      }
    }
    
    const displayTitle = getDisplayTitle('', formattedUrl);
    
    setNavigationState(prev => ({
      ...prev,
      loading: true,
      url: formattedUrl,
      title: displayTitle
    }));
    
    updateTab(tab.id, { 
      url: formattedUrl,
      title: displayTitle,
      loading: true,
      canGoBack: false,
      canGoForward: false
    });
    
    setShowHomepage(false);
    if (isActive && onHomepageStateChange) {
      onHomepageStateChange(false);
    }
  };

  const handleHomepageSearch = (query: string) => {
    navigateToUrl(query);
  };

  useEffect(() => {
    if (isActive) {
      (tab as any).webViewRef = {
        goBack,
        goForward,
        reload,
        navigateToUrl,
        injectJavaScript,
        applyZoom,
        resetZoom,
      };
      
      updateTab(tab.id, {
        canGoBack: navigationState.canGoBack,
        canGoForward: navigationState.canGoForward,
        loading: navigationState.loading
      });
    }
  }, [isActive, navigationState]);

  return (
    <View
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={isActive ? 1 : 0}
      backgroundColor="$background"
    >
      <View
        flex={1}
        backgroundColor={webViewBackgroundColor}
        opacity={isActive ? 1 : 0}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        {showHomepage ? (
          <Homepage onSearch={handleHomepageSearch} />
        ) : (
          <ViewShot
            ref={viewShotRef}
            style={{ flex: 1 }}
            options={{
              format: 'jpg',
              quality: 0.6,
            }}
          >
            <WebView
              ref={webViewRef}
              incognito={tab.isPrivate}
              source={{ uri: tab.url }}
              userAgent={getUserAgent()}
              onNavigationStateChange={handleNavigationStateChange}
              onLoadProgress={handleLoadProgress}
              onLoadStart={handleLoadStart}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
              onMessage={handleMessage}
              injectedJavaScript={injectedJavaScript}
              injectedJavaScriptBeforeContentLoaded={`
                window.addEventListener('beforeunload', function() {
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'beforeUnload'
                    }));
                  }
                });
              `}
              style={{ flex: 1, backgroundColor: webViewBackgroundColor }}
              allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
              decelerationRate="normal"
              startInLoadingState={true}
              scalesPageToFit={false}
              mixedContentMode="always"
              thirdPartyCookiesEnabled={!tab.isPrivate}
              domStorageEnabled={!tab.isPrivate}
              javaScriptEnabled={true}
              pullToRefreshEnabled={true}
              renderToHardwareTextureAndroid={true}
              removeClippedSubviews={false}
              {...(Platform.OS === 'android' && {
                overScrollMode: 'never',
                nestedScrollEnabled: true,
              })}
              {...(Platform.OS === 'ios' && {
                bounces: true,
                scrollEnabled: true,
                automaticallyAdjustContentInsets: false,
                contentInsetAdjustmentBehavior: 'never',
              })}
              onShouldStartLoadWithRequest={(request) => {
                return true;
              }}
            />
          </ViewShot>
        )}
      </View>
    </View>
  );
}