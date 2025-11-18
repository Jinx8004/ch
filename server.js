const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

const hlsFolder = path.join(__dirname, "public/hls");
fs.ensureDirSync(hlsFolder);
fs.emptyDirSync(hlsFolder);

const SOURCE_URL = "http://centra.ink/live/Centra_Live_iVIOT/zTsGiHyZ884M/1477206.ts";

function startFFmpeg() {
  const args = [
    "-i", SOURCE_URL,
    "-c:v", "copy",
    "-ac", "2",
    "-c:a", "aac",
    "-b:a", "128k",
    "-f", "hls",
    "-hls_time", "2",
    "-hls_list_size", "10",
    "-hls_flags", "independent_segments",
    "-hls_segment_type", "mpegts",
    path.join(hlsFolder, "stream.m3u8")
  ];

  console.log("Starting FFmpeg relay...");
  const ffmpeg = spawn("ffmpeg", args);

  ffmpeg.stderr.on("data", data => console.log(data.toString()));
  ffmpeg.on("close", code => {
    console.log("FFmpeg exited. Restarting in 5 seconds...");
    setTimeout(startFFmpeg, 5000);
  });
}

startFFmpeg();

app.use("/hls", express.static(hlsFolder));

app.get("/", (req, res) => {
  res.send("HLS Relay Running: /hls/stream.m3u8");
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));