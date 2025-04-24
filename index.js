// index.js
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/stream/:videoId.m3u8", async (req, res) => {
  const videoId = req.params.videoId;
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // YouTube sayfasını çek
    const page = await axios.get(youtubeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    // m3u8 manifest linkini ayıkla
    const regex = /"hlsManifestUrl":"([^"]+)"/;
    const match = page.data.match(regex);

    if (!match) {
      return res.status(404).send("M3U8 linki bulunamadı.");
    }

    const m3u8Url = match[1].replace(/\\\//g, "/"); // Escape'leri temizle

    // M3U8 içeriğini çek ve kullanıcının tarayıcısına gönder
    const m3u8 = await axios.get(m3u8Url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "application/vnd.apple.mpegurl",
      },
      responseType: "text",
    });

    console.log(m3u8);

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(m3u8.data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Hata oluştu.");
  }
});

app.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
});
