const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { pathToFileURL } = require("url");
const { chromium } = require("./qa_node/node_modules/playwright-core");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const htmlPath = path.join(outputDir, "academic_test_platform.html");
const manifestPath = path.join(outputDir, "academic_test_manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
];
const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));
if (!executablePath) throw new Error("No Edge/Chrome executable found for visual snapshot QA.");

function readUInt32(buffer, offset) {
  return buffer.readUInt32BE(offset);
}

function parsePng(buffer) {
  const signature = "89504e470d0a1a0a";
  if (buffer.slice(0, 8).toString("hex") !== signature) throw new Error("Not a PNG file.");
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (offset < buffer.length) {
    const length = readUInt32(buffer, offset);
    const type = buffer.slice(offset + 4, offset + 8).toString("ascii");
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const data = buffer.slice(dataStart, dataEnd);
    if (type === "IHDR") {
      width = readUInt32(data, 0);
      height = readUInt32(data, 4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset = dataEnd + 4;
  }
  if (bitDepth !== 8 || ![2, 6].includes(colorType)) throw new Error(`Unsupported PNG format ${bitDepth}/${colorType}.`);
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(height * stride);
  let inOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inOffset];
    inOffset += 1;
    const rowStart = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const raw = inflated[inOffset + x];
      const left = x >= channels ? pixels[rowStart + x - channels] : 0;
      const up = y > 0 ? pixels[rowStart + x - stride] : 0;
      const upLeft = y > 0 && x >= channels ? pixels[rowStart + x - stride - channels] : 0;
      let value = raw;
      if (filter === 1) value = raw + left;
      else if (filter === 2) value = raw + up;
      else if (filter === 3) value = raw + Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        value = raw + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft);
      } else if (filter !== 0) {
        throw new Error(`Unsupported PNG filter ${filter}.`);
      }
      pixels[rowStart + x] = value & 255;
    }
    inOffset += stride;
  }
  return { width, height, channels, pixels };
}

function imageStats(filePath) {
  const buffer = fs.readFileSync(filePath);
  const png = parsePng(buffer);
  const step = Math.max(1, Math.floor((png.width * png.height) / 6000));
  const colors = new Set();
  let count = 0;
  let sum = 0;
  let sumSquares = 0;
  let dark = 0;
  let light = 0;
  for (let pixel = 0; pixel < png.width * png.height; pixel += step) {
    const offset = pixel * png.channels;
    const r = png.pixels[offset];
    const g = png.pixels[offset + 1];
    const b = png.pixels[offset + 2];
    const brightness = (r + g + b) / 3;
    colors.add(`${r >> 4},${g >> 4},${b >> 4}`);
    count += 1;
    sum += brightness;
    sumSquares += brightness * brightness;
    if (brightness < 48) dark += 1;
    if (brightness > 230) light += 1;
  }
  const mean = sum / count;
  const variance = sumSquares / count - mean * mean;
  return {
    width: png.width,
    height: png.height,
    bytes: buffer.length,
    sampledPixels: count,
    sampledColorBins: colors.size,
    brightnessMean: Number(mean.toFixed(2)),
    brightnessVariance: Number(variance.toFixed(2)),
    darkSampleRatio: Number((dark / count).toFixed(3)),
    lightSampleRatio: Number((light / count).toFixed(3))
  };
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

async function captureScene(browser, scene) {
  const context = await browser.newContext({
    viewport: scene.viewport,
    deviceScaleFactor: 1,
    isMobile: scene.mobile === true
  });
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".option", { timeout: 10000 });
  if (scene.setup) await scene.setup(page);
  await page.waitForTimeout(100);
  const dom = await scene.metrics(page);
  const filePath = path.join(outputDir, scene.file);
  await page.screenshot({ path: filePath, fullPage: false });
  await context.close();
  const stats = imageStats(filePath);
  const failures = [];
  if (stats.width !== scene.viewport.width || stats.height !== scene.viewport.height) failures.push("bad screenshot dimensions");
  if (stats.bytes < scene.minimumBytes) failures.push("screenshot byte size too small");
  if (stats.sampledColorBins < scene.minimumColorBins) failures.push("screenshot appears visually blank");
  if (stats.brightnessVariance < scene.minimumVariance) failures.push("screenshot has too little visual variance");
  for (const [name, passed] of Object.entries(dom.assertions || {})) {
    if (!passed) failures.push(`DOM assertion failed: ${name}`);
  }
  return {
    scene: scene.name,
    file: scene.file,
    viewport: scene.viewport,
    status: failures.length ? "fail" : "pass",
    metrics: dom.metrics,
    image: stats,
    failures
  };
}

(async () => {
  const browser = await chromium.launch({ executablePath, headless: true });
  const scenes = [
    {
      name: "desktop-learning",
      file: "snapshot_desktop_learning.png",
      viewport: { width: 1440, height: 1000 },
      minimumBytes: 90000,
      minimumColorBins: 24,
      minimumVariance: 100,
      metrics: async (page) => page.evaluate(() => ({
        metrics: {
          options: document.querySelectorAll(".option").length,
          progressDots: document.querySelectorAll(".map-dot").length,
          exportButtons: [...document.querySelectorAll("button")].filter((node) => ["JSON", "CSV", "Candidate", "Evaluator", "PDF"].includes(node.textContent.trim())).length,
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
        },
        assertions: {
          fiveOptions: document.querySelectorAll(".option").length === 5,
          fullMap: document.querySelectorAll(".map-dot").length === 300,
          exportSurface: [...document.querySelectorAll("button")].filter((node) => ["JSON", "CSV", "Candidate", "Evaluator", "PDF"].includes(node.textContent.trim())).length === 5,
          noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
        }
      }))
    },
    {
      name: "desktop-category-c",
      file: "snapshot_category_c_visual.png",
      viewport: { width: 1440, height: 1000 },
      minimumBytes: 95000,
      minimumColorBins: 24,
      minimumVariance: 100,
      setup: async (page) => {
        await page.locator("aside.left select").nth(1).selectOption("categoryC");
      },
      metrics: async (page) => page.evaluate(() => ({
        metrics: {
          item: document.querySelector(".chip")?.textContent || "",
          dataTables: document.querySelectorAll(".data-card table").length,
          visualizations: document.querySelectorAll(".data-viz").length,
          vizRows: document.querySelectorAll(".viz-row").length,
          ariaVisualizations: document.querySelectorAll(".data-viz[role='img'][aria-label]").length,
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
        },
        assertions: {
          firstCategoryC: document.querySelector(".chip")?.textContent === "ACC_201",
          tableVisible: document.querySelectorAll(".data-card table").length >= 1,
          vizVisible: document.querySelectorAll(".data-viz").length >= 1,
          vizRows: document.querySelectorAll(".viz-row").length >= 3,
          vizAria: document.querySelectorAll(".data-viz[role='img'][aria-label]").length >= 1,
          noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
        }
      }))
    },
    {
      name: "admin-review",
      file: "snapshot_admin_review.png",
      viewport: { width: 1440, height: 1000 },
      minimumBytes: 90000,
      minimumColorBins: 24,
      minimumVariance: 100,
      setup: async (page) => {
        await page.locator("aside.left select").nth(0).selectOption("admin");
      },
      metrics: async (page) => page.evaluate(() => ({
        metrics: {
          adminPanels: document.querySelectorAll(".admin-panel").length,
          fileInputs: document.querySelectorAll("input[type='file']").length,
          hasExpert: document.body.innerText.toLowerCase().includes("expert adjudication"),
          hasPilot: document.body.innerText.toLowerCase().includes("pilot calibration"),
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
        },
        assertions: {
          adminPanels: document.querySelectorAll(".admin-panel").length >= 3,
          expertPanel: document.body.innerText.toLowerCase().includes("expert adjudication"),
          pilotPanel: document.body.innerText.toLowerCase().includes("pilot calibration"),
          noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
        }
      }))
    },
    {
      name: "mobile-initial",
      file: "snapshot_mobile_initial.png",
      viewport: { width: 390, height: 844 },
      mobile: true,
      minimumBytes: 35000,
      minimumColorBins: 18,
      minimumVariance: 80,
      metrics: async (page) => page.evaluate(() => ({
        metrics: {
          options: document.querySelectorAll(".option").length,
          topbarHeight: Math.round(document.querySelector(".topbar")?.getBoundingClientRect().height || 0),
          actionsPosition: getComputedStyle(document.querySelector(".actions")).position,
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
        },
        assertions: {
          fiveOptions: document.querySelectorAll(".option").length === 5,
          stickyActions: getComputedStyle(document.querySelector(".actions")).position === "sticky",
          noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
        }
      }))
    }
  ];

  const snapshots = [];
  for (const scene of scenes) snapshots.push(await captureScene(browser, scene));
  await browser.close();

  const failures = snapshots.flatMap((snapshot) => snapshot.failures.map((failure) => `${snapshot.scene}: ${failure}`));
  const report = {
    generatedAt: new Date().toISOString(),
    bankVersion: manifest.bankVersion,
    schemaVersion: manifest.schemaVersion,
    status: failures.length ? "visual-snapshot-fail" : "visual-snapshot-pass",
    browser: executablePath,
    snapshots,
    failures
  };
  const matrixRows = [
    ["scene", "file", "status", "width", "height", "bytes", "sampled_color_bins", "brightness_variance", "horizontal_overflow", "failure_count"],
    ...snapshots.map((snapshot) => [
      snapshot.scene,
      snapshot.file,
      snapshot.status,
      snapshot.image.width,
      snapshot.image.height,
      snapshot.image.bytes,
      snapshot.image.sampledColorBins,
      snapshot.image.brightnessVariance,
      snapshot.metrics.horizontalOverflow === true,
      snapshot.failures.length
    ])
  ];
  fs.writeFileSync(path.join(outputDir, "visual_snapshot_report.json"), JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(path.join(outputDir, "visual_snapshot_matrix.csv"), matrixRows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");
  console.log(JSON.stringify({
    bankVersion: report.bankVersion,
    status: report.status,
    snapshots: snapshots.length,
    failures: failures.length
  }, null, 2));
  if (failures.length) process.exitCode = 1;
})();
