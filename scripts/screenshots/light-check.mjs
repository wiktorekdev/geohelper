// Quick light-mode visual check. Requires Vite dev running on :1420.
import { chromium } from "playwright"

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } })
page.on("console", (msg) => console.log("[page]", msg.type(), msg.text().slice(0, 200)))
page.on("pageerror", (err) => console.log("[pageerror]", String(err).slice(0, 300)))
await page.goto("http://localhost:1420", { waitUntil: "networkidle" })
await page.waitForFunction(() => window.__geohelper__)

await page.evaluate(() => {
  const gh = window.__geohelper__
  const store = gh.store.getState()
  store.setConn({ kind: "connected" })
  store.pushCoords({ lat: 48.8566, lng: 2.3522, source: "mock", timestamp: Date.now() })
  store.setPlace({
    country: "France",
    countryCode: "fr",
    region: "Île-de-France",
    city: "Paris",
    neighbourhood: "4th Arrondissement",
    road: "Rue de Rivoli",
    postcode: "75004",
    continent: "Europe",
  })
  store.setCountryDetails({
    capital: "Paris",
    subregion: "Western Europe",
    languages: ["French"],
    currency: "EUR (€)",
    callingCode: "+33",
    timezones: ["UTC+01:00"],
  })
  document.documentElement.classList.remove("dark")
})
await page.waitForTimeout(2000)
await page.screenshot({ path: "docs/screenshots/_light-check.png" })

// settings panel in light mode
await page.evaluate(() => window.__geohelper__.store.getState().openSettings())
await page.waitForTimeout(800)
await page.screenshot({ path: "docs/screenshots/_light-settings.png" })

await browser.close()
console.log("done")
