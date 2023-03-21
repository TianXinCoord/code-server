import proxyServer from "http-proxy"
import { HttpCode } from "../common/http"

export const proxy = proxyServer.createProxyServer({})

// The error handler catches when the proxy fails to connect (for example when
// there is nothing running on the target port).
proxy.on("error", (error, _, res) => {
  // This could be for either a web socket or a regular request.  Despite what
  // the types say, writeHead() will not exist on web socket requests (nor will
  // status() from Express) so write out the code manually.
  res.end(`HTTP/1.1 ${HttpCode.ServerError} ${error.message}\r\n\r\n`)
})

// Intercept the response to rewrite absolute redirects against the base path.
// Is disabled when the request has no base path which means /absproxy is in use.
proxy.on("proxyRes", (res, req) => {
  if (res.headers.location && res.headers.location.startsWith("/") && (req as any).base) {
    res.headers.location = (req as any).base + res.headers.location
  }
})
