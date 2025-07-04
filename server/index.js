// fast_scraper.js
const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const cliProgress = require("cli-progress");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());

app.get("/scrape", async (req, res) => {
  let browser;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const hasil = [];
  let jumlahValid = 0;
  let jumlahCacat = 0;
  let jumlahDiupdate = 0;
  const logCacat = [];
  const logHapus = [];
  const logUpdate = [];

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["stylesheet", "font"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    let currentPageUrl = "https://books.toscrape.com/";
    let pageCount = 0;
    const maxPage = 50;

    while (currentPageUrl && pageCount < maxPage) {
      pageCount++;
      console.log(`\u{1F4C4} Halaman ke-${pageCount}: ${currentPageUrl}`);
      await page.goto(currentPageUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      const productLinks = await page.$$eval(".product_pod h3 a", (links) =>
        links.map((link) => link.href)
      );

      const progressBar = new cliProgress.SingleBar({
        format: `\u{1F6D2} Produk {bar} {percentage}% | {value}/{total} diproses`,
        barCompleteChar: "|",
        barIncompleteChar: "-",
        hideCursor: false,
      });
      progressBar.start(productLinks.length, 0);

      const concurrency = 20;
      for (let i = 0; i < productLinks.length; i += concurrency) {
        const chunk = productLinks.slice(i, i + concurrency);

        const results = await Promise.allSettled(
          chunk.map(async (url) => {
            const detailPage = await browser.newPage();
            await detailPage.setRequestInterception(true);
            detailPage.on("request", (req) => {
              if (["stylesheet", "font"].includes(req.resourceType())) {
                req.abort();
              } else {
                req.continue();
              }
            });

            await detailPage.goto(url, {
              waitUntil: "domcontentloaded",
              timeout: 60000,
            });
            const data = await detailPage.evaluate(() => {
              const namaProduk = document.querySelector("h1")?.innerText || "-";
              const hargaProduk =
                document.querySelector(".price_color")?.innerText || "-";
              const deskripsiProduk =
                document.querySelector("#product_description + p")?.innerText ||
                "-";
              const imgProduk =
                document.querySelector(".item.active img")?.src || "-";
              const genre =
                document.querySelectorAll(".breadcrumb li a")[2]?.innerText ||
                "-";
              const ratingClass =
                document.querySelector(".star-rating")?.classList[1] || null;
              const ratingMap = { One: 1, Two: 2, Three: 3, Four: 4, Five: 5 };
              const rating = ratingMap[ratingClass] || 0;
              const stock =
                document
                  .querySelector(".instock.availability")
                  ?.innerText.trim() || "-";

              return {
                namaProduk,
                hargaProduk,
                deskripsiProduk,
                imgProduk,
                genre,
                rating,
                stock,
              };
            });
            await detailPage.close();
            return { url, data };
          })
        );

        for (let j = 0; j < results.length; j++) {
          const r = results[j];
          const url = chunk[j];
          if (r.status === "fulfilled") {
            const { data } = r.value;
            const isValid =
              data.namaProduk !== "-" &&
              data.hargaProduk !== "-" &&
              data.deskripsiProduk !== "-" &&
              data.imgProduk !== "-" &&
              data.genre !== "-" &&
              data.rating > 0 &&
              data.stock !== "-";

            if (isValid) {
              hasil.push(data);
              jumlahValid++;
            } else {
              jumlahCacat++;
              logCacat.push({ url, ...data });
            }
          } else {
            jumlahCacat++;
            logCacat.push({ url, error: r.reason?.message });
          }
          progressBar.increment();
        }
      }

      progressBar.stop();

      const nextButton = await page.$(".next a");
      if (nextButton) {
        const nextHref = await page.evaluate(
          (el) => el.getAttribute("href"),
          nextButton
        );
        currentPageUrl = new URL(nextHref, page.url()).href;
      } else {
        currentPageUrl = null;
      }

      // await delay(100);
    }

    const hasilValid = hasil;
    const dbProduk = await db.query("SELECT nama FROM produk");
    const namaValidBaru = hasilValid.map((d) => d.namaProduk);
    const dataUntukDihapus = dbProduk.rows.filter(
      (item) => !namaValidBaru.includes(item.nama)
    );

    for (const item of dataUntukDihapus) {
      await db.query("DELETE FROM produk WHERE nama = $1", [item.nama]);
      logHapus.push(item.nama);
    }

    const existingProdukMap = {};
    const existingProduk = await db.query("SELECT * FROM produk");
    for (const row of existingProduk.rows) {
      existingProdukMap[row.nama] = row;
    }

    for (const data of hasilValid) {
      try {
        const lama = existingProdukMap[data.namaProduk] || null;

        const normalize = (text) =>
          text
            ?.replace(/\s+/g, " ") // hapus spasi berlebih
            .replace(/[‘’]/g, "'") // tanda kutip miring jadi biasa
            .replace(/[“”]/g, '"') // kutip ganda miring jadi biasa
            .replace(/…/g, "...") // elipsis unicode jadi tiga titik
            .trim();

        const isBerubahSignifikan = (lama, baru) => {
          const parseHarga = (str) =>
            parseFloat(str.replace(/[^\d.]/g, "")) || 0;
          const normalize = (text) =>
            text
              ?.replace(/\s+/g, " ")
              .replace(/[‘’]/g, "'")
              .replace(/[“”]/g, '"')
              .trim();
          const getImgName = (url) => url?.split("/").pop();

          return (
            parseHarga(lama.harga) !== parseHarga(baru.hargaProduk) ||
            normalize(lama.deskripsi) !== normalize(baru.deskripsiProduk) ||
            getImgName(lama.img) !== getImgName(baru.imgProduk) ||
            lama.genre !== baru.genre ||
            lama.rating !== baru.rating ||
            lama.stock !== baru.stock
          );
        };

        const stripEllipsis = (text) => text?.replace(/\.{3,}$/, "").trim(); // hapus ... di akhir

        const parseHarga = (str) => parseFloat(str.replace(/[^\d.]/g, "")) || 0;

        const getImgPath = (url) => new URL(url).pathname;

        const adaPerubahan = !lama || isBerubahSignifikan(lama, data);

        if (!adaPerubahan) continue;

        await db.query(
          `INSERT INTO produk (nama, harga, deskripsi, img, genre, rating, stock)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (nama)
           DO UPDATE SET
             harga = EXCLUDED.harga,
             deskripsi = EXCLUDED.deskripsi,
             img = EXCLUDED.img,
             genre = EXCLUDED.genre,
             rating = EXCLUDED.rating,
             stock = EXCLUDED.stock`,
          [
            data.namaProduk,
            data.hargaProduk,
            data.deskripsiProduk,
            data.imgProduk,
            data.genre,
            data.rating,
            data.stock,
          ]
        );

        if (lama) {
          jumlahDiupdate++;
          logUpdate.push({
            nama: data.namaProduk,
            perubahan: {
              dari: {
                harga: lama.harga,
                deskripsi: lama.deskripsi,
                img: lama.img,
                genre: lama.genre,
                rating: lama.rating,
                stock: lama.stock,
              },
              ke: {
                harga: data.hargaProduk,
                deskripsi: data.deskripsiProduk,
                img: data.imgProduk,
                genre: data.genre,
                rating: data.rating,
                stock: data.stock,
              },
            },
          });
        }
      } catch (err) {
        console.error(
          `❌ Gagal update/insert produk "${data.namaProduk}": ${err.message}`
        );
      }
    }

    const waktuIndonesia = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour12: false,
    });

    const summaryLog = {
      waktu: waktuIndonesia,
      totalValid: jumlahValid,
      totalCacat: jumlahCacat,
      totalDiupdate: jumlahDiupdate,
      logCacat,
      logHapus,
      logUpdate,
    };

    const logFilePath = path.join(__dirname, "logScraping.json");
    fs.writeFileSync(
      logFilePath,
      JSON.stringify({ success: true, data: summaryLog }, null, 2)
    );

    console.log("\u2705 Scraping selesai.");
    res.json({ success: true, message: "Scraping berhasil", data: summaryLog });
  } catch (err) {
    res.status(500).json({ error: "Gagal scraping", detail: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.get("/products", async (req, res) => {
  const { genre } = req.query;
  try {
    let query = "SELECT * FROM produk";
    const params = [];
    if (genre) {
      query += " WHERE LOWER(genre) = LOWER($1)";
      params.push(genre);
    }
    query += " ORDER BY id ASC";
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Gagal mengambil data", detail: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\u{1F680} Server berjalan di http://localhost:${PORT}`);
});
