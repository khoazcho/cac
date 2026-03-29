const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const API_URL = 'https://jakpotgwab.geightdors.net/glms/v1/notify/taixiu?platform_id=g8&gid=vgmn_101';
const HISTORY_FILE = 'history.json';
const MAX_DISPLAY = 500;

fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));

let history = [];

async function fetchGameData() {
  try {
    const response = await axios.get(API_URL);
    const data = response.data;

    if (data.status === 'OK' && Array.isArray(data.data)) {
      data.data.forEach(entry => {
        const { sid, d1, d2, d3, md5 } = entry;

        if (sid && d1 != null && d2 != null && d3 != null && md5) {
          const sum = d1 + d2 + d3;
          const result = sum >= 11 ? 'Tài' : 'Xỉu';

          const record = { sid, md5, d1, d2, d3, sum, result };

          if (!history.some(r => r.sid === sid)) {
            history.unshift(record);
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
          }
        }
      });
    }
  } catch (error) {}
}

setInterval(fetchGameData, 500);

app.get('/history', (req, res) => {
  const display = history.slice(0, MAX_DISPLAY);
  res.json({
    status: "OK",
    code: 200,
    data: display
  });
});

// Endpoint xuất file history.txt
app.get('/export', (req, res) => {
  const txtPath = path.join(__dirname, 'history.txt');
  const content = history.map(r => JSON.stringify(r)).join('\n');
  fs.writeFileSync(txtPath, content);
  res.download(txtPath, 'history.txt');
});

app.listen(PORT);
