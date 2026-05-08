import { describe, expect, it } from "vitest"

import { isPubliclyReachableHttpUrl } from "./public-origin"

/**
 * Behavioural tests for the SSRF predicate that gates which URLs the
 * dashboard will (a) accept as `templateMediaUrl` and (b) auto-generate
 * for signed PDF delivery. The threat model: an attacker controls the
 * URL string and tries to coerce the dashboard or WhatsApp into
 * fetching from an internal address. The predicate must return false
 * for any private/loopback/link-local destination, including the
 * IPv4-mapped IPv6 form (`::ffff:127.0.0.1`) which WHATWG URL parses
 * but our earlier regex didn't catch.
 */

describe("isPubliclyReachableHttpUrl", () => {
  describe("accepts public hosts", () => {
    it.each([
      "https://example.com",
      "https://example.com/path?q=1",
      "https://api.example.com:8443/x",
      "http://8.8.8.8/",
      "https://1.1.1.1:443/",
    ])("%s", (url) => {
      expect(isPubliclyReachableHttpUrl(url)).toBe(true)
    })
  })

  describe("rejects non-http(s) schemes", () => {
    it.each([
      "file:///etc/passwd",
      "data:text/plain,hello",
      "javascript:alert(1)",
      "ftp://example.com/",
      "ws://example.com/",
    ])("%s", (url) => {
      expect(isPubliclyReachableHttpUrl(url)).toBe(false)
    })
  })

  describe("rejects loopback / unspecified", () => {
    it.each([
      "http://localhost/",
      "http://localhost:3000/",
      "http://127.0.0.1/",
      "http://127.0.0.1:8080/",
      "http://127.5.5.5/",
      "http://[::1]/",
      "http://[::1]:8080/",
      "http://[::]/",
      "http://0.0.0.0/",
    ])("%s", (url) => {
      expect(isPubliclyReachableHttpUrl(url)).toBe(false)
    })
  })

  describe("rejects RFC 1918 private ranges", () => {
    it.each([
      "http://10.0.0.1/",
      "http://10.255.255.255/",
      "http://172.16.0.1/",
      "http://172.31.255.255/",
      "http://192.168.0.1/",
      "http://192.168.1.1/",
    ])("%s", (url) => {
      expect(isPubliclyReachableHttpUrl(url)).toBe(false)
    })
  })

  describe("accepts addresses just outside RFC 1918", () => {
    // 172.15 and 172.32 sit on either side of the 172.16/12 block.
    it.each([
      "http://172.15.0.1/",
      "http://172.32.0.1/",
      "http://11.0.0.1/",  // 11/8 is public
      "http://9.0.0.1/",   // 9/8 is public
    ])("%s", (url) => {
      expect(isPubliclyReachableHttpUrl(url)).toBe(true)
    })
  })

  describe("rejects link-local 169.254/16", () => {
    it.each([
      "http://169.254.0.1/",
      "http://169.254.169.254/",  // AWS metadata service
      "http://169.254.255.255/",
    ])("%s", (url) => {
      expect(isPubliclyReachableHttpUrl(url)).toBe(false)
    })
  })

  describe("rejects IPv6 unique-local fc00::/7", () => {
    it.each([
      "http://[fc00::1]/",
      "http://[fd12:3456:789a::1]/",
      "http://[fdff::]/",
    ])("%s", (url) => {
      expect(isPubliclyReachableHttpUrl(url)).toBe(false)
    })
  })

  describe("rejects IPv4-mapped IPv6 (the SSRF bypass)", () => {
    // These are the cases that the original regex-only predicate
    // failed on. WHATWG URL parses them and the hostname comes back
    // either dotted (`::ffff:127.0.0.1`) or hex-encoded
    // (`::ffff:7f00:1`) depending on the input form.
    it.each([
      "http://[::ffff:127.0.0.1]/",
      "http://[::ffff:10.0.0.1]/",
      "http://[::ffff:192.168.1.1]/",
      "http://[::ffff:169.254.169.254]/",
      "http://[::ffff:172.16.0.1]/",
      "http://[::ffff:7f00:1]/",       // hex-encoded 127.0.0.1
      "http://[::FFFF:7F00:1]/",       // case insensitivity
      "http://[::ffff:0a00:1]/",       // hex-encoded 10.0.0.1
      "http://[::ffff:c0a8:101]/",     // hex-encoded 192.168.1.1
    ])("%s", (url) => {
      expect(isPubliclyReachableHttpUrl(url)).toBe(false)
    })
  })

  describe("rejects malformed input", () => {
    it.each([
      "",
      "not-a-url",
      "http://",
      "://example.com",
    ])("%s", (url) => {
      expect(isPubliclyReachableHttpUrl(url)).toBe(false)
    })
  })
})
