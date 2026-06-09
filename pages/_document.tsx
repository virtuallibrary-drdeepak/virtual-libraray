import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const maskedMetaPixelId = maskMetaPixelIdentifier(metaPixelId)

  return (
    <Html lang="en">
      <Head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','GTM-5QWP7ZKZ');`,
          }}
        />
        {/* End Google Tag Manager */}

        {!metaPixelId && (
          <>
            {/* Meta Pixel Diagnostics */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    var logEndpoint = '/api/meta/pixel-log';
                    function getPage() {
                      var searchKeys = [];
                      try {
                        var params = new URLSearchParams(window.location.search);
                        params.forEach(function(_value, key) {
                          if (searchKeys.indexOf(key) === -1) searchKeys.push(key);
                        });
                      } catch (_error) {}

                      return {
                        path: window.location.pathname,
                        searchKeys: searchKeys,
                        referrerHost: getReferrerHost()
                      };
                    }
                    function getReferrerHost() {
                      try {
                        return document.referrer ? new URL(document.referrer).host : '';
                      } catch (_error) {
                        return '';
                      }
                    }
                    function postPixelLog(event, details, level) {
                      try {
                        var body = JSON.stringify({
                          source: 'client',
                          event: event,
                          level: level || 'info',
                          details: {
                            page: getPage(),
                            pixelId: '[missing]',
                            details: details || {}
                          }
                        });

                        if (navigator.sendBeacon && window.Blob) {
                          var queued = navigator.sendBeacon(logEndpoint, new Blob([body], { type: 'application/json' }));
                          if (queued) return;
                        }

                        fetch(logEndpoint, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: body,
                          keepalive: true
                        }).catch(function() {});
                      } catch (_error) {}
                    }

                    window.__vlMetaPixelLog = postPixelLog;
                    postPixelLog('bootstrap_skipped_missing_pixel_id', {
                      hasExistingFbq: Boolean(window.fbq)
                    }, 'warn');
                  })();`,
              }}
            />
            {/* End Meta Pixel Diagnostics */}
          </>
        )}

        {metaPixelId && (
          <>
            {/* Meta Pixel Code */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    var maskedPixelId = ${JSON.stringify(maskedMetaPixelId)};
                    var logEndpoint = '/api/meta/pixel-log';
                    function maskPage() {
                      var searchKeys = [];
                      try {
                        var params = new URLSearchParams(window.location.search);
                        params.forEach(function(_value, key) {
                          if (searchKeys.indexOf(key) === -1) searchKeys.push(key);
                        });
                      } catch (_error) {}

                      return {
                        path: window.location.pathname,
                        searchKeys: searchKeys,
                        referrerHost: getReferrerHost()
                      };
                    }
                    function getReferrerHost() {
                      try {
                        return document.referrer ? new URL(document.referrer).host : '';
                      } catch (_error) {
                        return '';
                      }
                    }
                    function serializeError(error) {
                      if (!error) return null;
                      return {
                        name: error.name,
                        message: error.message || String(error),
                        stack: error.stack
                      };
                    }
                    function postPixelLog(event, details, level) {
                      try {
                        var body = JSON.stringify({
                          source: 'client',
                          event: event,
                          level: level || 'info',
                          details: {
                            page: maskPage(),
                            pixelId: maskedPixelId,
                            details: details || {}
                          }
                        });

                        if (navigator.sendBeacon && window.Blob) {
                          var queued = navigator.sendBeacon(logEndpoint, new Blob([body], { type: 'application/json' }));
                          if (queued) return;
                        }

                        fetch(logEndpoint, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: body,
                          keepalive: true
                        }).catch(function() {});
                      } catch (_error) {}
                    }

                    window.__vlMetaPixelLog = postPixelLog;
                    postPixelLog('bootstrap_start', {
                      hasExistingFbq: Boolean(window.fbq)
                    }, 'info');

                    try {
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq){f.__vlMetaPixelLog && f.__vlMetaPixelLog('bootstrap_existing_fbq', {}, 'warn');return;}n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.onload=function(){f.__vlMetaPixelLog && f.__vlMetaPixelLog('script_loaded', {src:v}, 'info')};
                    t.onerror=function(error){f.__vlMetaPixelLog && f.__vlMetaPixelLog('script_load_error', {src:v,error:serializeError(error)}, 'error')};
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    } catch (error) {
                      postPixelLog('bootstrap_error', {error: serializeError(error)}, 'error');
                    }

                    try {
                      fbq('init', ${JSON.stringify(metaPixelId)});
                      postPixelLog('init_queued', {}, 'info');
                    } catch (error) {
                      postPixelLog('init_error', {error: serializeError(error)}, 'error');
                    }

                    try {
                      fbq('track', 'PageView');
                      postPixelLog('page_view_queued', {}, 'info');
                    } catch (error) {
                      postPixelLog('page_view_error', {error: serializeError(error)}, 'error');
                    }
                  })();`,
              }}
            />
            {/* End Meta Pixel Code */}
          </>
        )}
      </Head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5QWP7ZKZ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {metaPixelId && (
          <>
            {/* Meta Pixel (noscript) */}
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${encodeURIComponent(metaPixelId)}&ev=PageView&noscript=1`}
              />
            </noscript>
            {/* End Meta Pixel (noscript) */}
          </>
        )}

        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

function maskMetaPixelIdentifier(value?: string) {
  if (!value) {
    return '[missing]'
  }

  if (value.length <= 4) {
    return '[present]'
  }

  return `${'*'.repeat(Math.min(value.length - 4, 8))}${value.slice(-4)}`
}
