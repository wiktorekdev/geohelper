#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, "..")

// Read version from package.json
const packageJson = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf-8"))
const version = packageJson.version

console.log(`Syncing version ${version} to all config files...`)

// Update tauri.conf.json
const tauriConfig = JSON.parse(readFileSync(join(rootDir, "src-tauri/tauri.conf.json"), "utf-8"))
tauriConfig.version = version
writeFileSync(join(rootDir, "src-tauri/tauri.conf.json"), JSON.stringify(tauriConfig, null, 2))
console.log("✓ Updated src-tauri/tauri.conf.json")

// Update Cargo.toml
let cargoToml = readFileSync(join(rootDir, "src-tauri/Cargo.toml"), "utf-8")
cargoToml = cargoToml.replace(/^version = ".*"/m, `version = "${version}"`)
writeFileSync(join(rootDir, "src-tauri/Cargo.toml"), cargoToml)
console.log("✓ Updated src-tauri/Cargo.toml")

console.log(`\nVersion ${version} synced successfully!`)
