const express = require('express');
const multer  = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Thư mục lưu file
const storageDir = path.join(__dirname, 'storage/files');
fs.mkdirSync(storageDir, { recursive: true });

// Config multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, storageDir),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });

// Serve front-end HTML
app.get('/', (req, res) => {
  res.send(`
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title> Storage File Upload </title>
<style>
  body {
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    margin: 0;
  }
  h2 {
    font-size: 2.5rem;
    background: linear-gradient(90deg, #ffd700, #ff4500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 30px;
    text-shadow: 0 0 10px #ff4500, 0 0 20px #ffd700;
  }
  form {
    background: rgba(255,255,255,0.05);
    padding: 30px 50px;
    border-radius: 15px;
    box-shadow: 0 0 30px rgba(255,255,255,0.1);
    text-align: center;
  }
  input[type="file"] {
    padding: 10px;
    border-radius: 10px;
    border: none;
    background: rgba(255,255,255,0.1);
    color: #fff;
    cursor: pointer;
    margin-bottom: 20px;
  }
  button {
    background: linear-gradient(90deg, #ffdd00, #ff4d00);
    border: none;
    padding: 12px 25px;
    border-radius: 10px;
    font-size: 1.2rem;
    cursor: pointer;
    color: #fff;
    font-weight: bold;
    box-shadow: 0 0 10px #ff4d00, 0 0 20px #ffdd00;
    transition: transform 0.2s;
  }
  button:hover {
    transform: scale(1.1);
  }
  .progress-container {
    width: 100%;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    margin-top: 20px;
    overflow: hidden;
  }
  .progress-bar {
    width: 0%;
    height: 20px;
    background: linear-gradient(90deg, #00ff99, #00ccff);
    text-align: center;
    line-height: 20px;
    color: #000;
    font-weight: bold;
    border-radius: 10px;
    transition: width 0.3s;
  }
  .price-tag {
    margin-top: 15px;
    font-size: 1.5rem;
    color: #ffd700;
    font-weight: bold;
    text-shadow: 0 0 5px #fff, 0 0 10px #ff0;
  }
  .file-link {
    margin-top: 10px;
    font-size: 1.2rem;
    color: #00ffff;
    text-decoration: underline;
  }
</style>
</head>
<body>

<h2>💎 Upload File VIP 💎</h2>

<form id="uploadForm">
  <input type="file" name="file" required>
  <button type="submit">Upload & Earn \$</button>
  <div class="progress-container">
    <div class="progress-bar" id="progressBar">0%</div>
  </div>
  <div class="price-tag">\$0.00</div>
  <div class="file-link" id="fileLink"></div>
</form>

<script>
  const form = document.getElementById('uploadForm');
  const progressBar = document.getElementById('progressBar');
  const priceTag = document.querySelector('.price-tag');
  const fileLink = document.getElementById('fileLink');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const fileInput = form.querySelector('input[type="file"]');
    if (!fileInput.files.length) return;

    const file = fileInput.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);
    xhr.responseType = 'json';

    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        progressBar.style.width = percent + '%';
        progressBar.textContent = percent + '%';
        priceTag.textContent = '\$' + (percent/100 * 5).toFixed(2);
      }
    };

    xhr.onload = function() {
      if (xhr.status === 200) {
        progressBar.textContent = 'Upload Complete!';
        priceTag.textContent = '\$5.00 💰';
        const resp = xhr.response;
        fileLink.innerHTML = '<a href="' + resp.url + '" target="_blank">📂 ' + resp.filename + '</a>';
      } else {
        progressBar.textContent = 'Error!';
      }
    };

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
</script>

</body>
</html>
  `);
});

// Upload route trả JSON
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fileUrl = `/files/${req.file.filename}`;
  res.json({ filename: req.file.filename, url: fileUrl });
});

// Cho phép tải file
app.use('/files', express.static(storageDir));

// Start server
app.listen(PORT, () => {
  console.log(`Server chạy tại: http://localhost:${PORT}`);
});
