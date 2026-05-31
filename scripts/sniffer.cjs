#!/usr/bin/env node
// GeoGuessr CDP sniffer v3. Zero deps, Node 22+.
// Connects directly to every target whose URL contains geoguessr.com.
// Re-checks for new targets every 2 seconds.

const fs = require("node:fs");
const path = require("node:path");

const LIST_URL = "http://localhost:34788/json";
const MAX_BODY = 40_000;
const POLL_MS = 2000;

const SHOULD_LOG = (url) =>
  /geoguessr\.com\/api\//.test(url) ||
  /game-server\.geoguessr/.test(url) ||
  /geoguessr\.com\/_next\/data/.test(url) ||
  /geoguessr\.com\/(duels|battle|challenge|quiz|live-challenge|game|steam)/.test(url);

async function main() {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const logFile = path.resolve(`sniffer-${ts}.log`);
  const log = fs.createWriteStream(logFile);
  const write = (obj) =>
    log.write(new Date().toISOString() + " " + JSON.stringify(obj) + "\n");

  write({ evt: "start" });
  console.log("Log     :", logFile);
  console.log("Play the game normally. Ctrl+C to stop.\n");

  const attached = new Map(); // targetId -> { close }
  let loggedCount = 0;

  async function refresh() {
    let targets;
    try {
      const res = await fetch(LIST_URL);
      targets = await res.json();
    } catch {
      return;
    }

    const interesting = targets.filter(
      (t) =>
        (t.type === "iframe" || t.type === "page") &&
        t.webSocketDebuggerUrl &&
        (t.url?.includes("geoguessr.com") || /GeoGuessr/i.test(t.title || "")),
    );

    // Attach to new targets
    for (const t of interesting) {
      if (attached.has(t.id)) continue;
      console.log(`attaching -> [${t.type}] ${t.url || t.title}`);
      const ctrl = attachToTarget(t, write, () => loggedCount++);
      attached.set(t.id, ctrl);
    }

    // Drop gone targets
    const alive = new Set(interesting.map((t) => t.id));
    for (const [id, ctrl] of attached) {
      if (!alive.has(id)) {
        ctrl.close();
        attached.delete(id);
        write({ evt: "target-gone", targetId: id });
      }
    }
  }

  const poll = setInterval(refresh, POLL_MS);
  await refresh();

  // Counter print
  setInterval(() => {
    process.stdout.write(`\r  events logged: ${loggedCount}    `);
  }, 500).unref();

  process.on("SIGINT", async () => {
    clearInterval(poll);
    console.log("\nStopping...");
    for (const ctrl of attached.values()) ctrl.close();
    await new Promise((r) => log.end(r));
    console.log("Log saved:", logFile);
    process.exit(0);
  });
}

function attachToTarget(target, write, bumpLogged) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let msgId = 1;
  const pending = new Map();
  const rpc = new Map();
  let closed = false;

  function call(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error("cdp timeout: " + method));
        }
      }, 10000);
    });
  }

  ws.addEventListener("open", async () => {
    try {
      await call("Network.enable");
      await call("Page.enable").catch(() => {});
      write({
        evt: "attached",
        targetId: target.id,
        type: target.type,
        url: target.url,
        title: target.title,
      });
    } catch (e) {
      write({ evt: "attach-err", targetId: target.id, error: e.message });
    }
  });

  ws.addEventListener("message", async (event) => {
    if (closed) return;
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }

    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message));
      else p.resolve(msg.result);
      return;
    }

    const m = msg.method;
    const p = msg.params || {};

    switch (m) {
      case "Network.requestWillBeSent": {
        const url = p.request?.url || "";
        if (SHOULD_LOG(url)) {
          rpc.set(p.requestId, {
            url,
            method: p.request.method,
            postData: p.request.postData,
          });
        }
        break;
      }
      case "Network.responseReceived": {
        const url = p.response?.url || "";
        if (SHOULD_LOG(url) && !rpc.has(p.requestId)) {
          rpc.set(p.requestId, { url, method: "GET" });
        }
        break;
      }
      case "Network.loadingFinished": {
        const req = rpc.get(p.requestId);
        if (!req) return;
        rpc.delete(p.requestId);
        try {
          const body = await call("Network.getResponseBody", {
            requestId: p.requestId,
          });
          const raw = body.base64Encoded
            ? Buffer.from(body.body, "base64").toString("utf8")
            : body.body;
          const truncated = raw.length > MAX_BODY;
          const finalText = truncated ? raw.slice(0, MAX_BODY) + "...TRUNCATED" : raw;
          let parsed;
          try {
            parsed = JSON.parse(finalText);
          } catch {}
          write({
            evt: "http",
            targetId: target.id,
            method: req.method,
            url: req.url,
            postData: req.postData,
            body: parsed ?? finalText,
            truncated,
          });
          bumpLogged();
        } catch (e) {
          write({ evt: "http-err", url: req.url, error: e.message });
        }
        break;
      }
      case "Network.webSocketCreated":
        write({ evt: "ws-open", targetId: target.id, url: p.url });
        break;
      case "Network.webSocketFrameSent":
        write({
          evt: "ws-send",
          targetId: target.id,
          payload: String(p.response?.payloadData || "").slice(0, MAX_BODY),
        });
        bumpLogged();
        break;
      case "Network.webSocketFrameReceived":
        write({
          evt: "ws-recv",
          targetId: target.id,
          payload: String(p.response?.payloadData || "").slice(0, MAX_BODY),
        });
        bumpLogged();
        break;
      case "Page.frameNavigated":
        if (!p.frame?.parentId) {
          write({ evt: "nav", targetId: target.id, url: p.frame?.url });
        }
        break;
    }
  });

  ws.addEventListener("close", () => {
    closed = true;
    write({ evt: "disconnected", targetId: target.id });
  });
  ws.addEventListener("error", (err) => {
    write({ evt: "ws-error", targetId: target.id, error: err?.message || String(err) });
  });

  return {
    close: () => {
      closed = true;
      try {
        ws.close();
      } catch {}
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
