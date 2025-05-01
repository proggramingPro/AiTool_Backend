const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/downloads', express.static(UPLOADS_DIR)); // Serve static files from uploads

//previous imports remain the same

app.post('/api/generate', async (req, res) => {
  const { prompt, filename = 'generated_code.js' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required!" });
  }

  try {
    const response = await axios.post('http://localhost:8000/generate', { prompt }, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000,
    });

    // Extract code and description from the response
    const fullResponse = response.data.result;
    const codeMatch = fullResponse.match(/```(?:[a-zA-Z]*\n)?([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : fullResponse;
    const description = fullResponse.replace(/```[\s\S]*?```/g, '').trim();
    
    // Save only the code to file
    const safeFilename = filename.replace(/[^a-z0-9_.-]/gi, '_');
    const filePath = path.join(UPLOADS_DIR, safeFilename);
    fs.writeFileSync(filePath, code);
    
    const downloadLink = `/downloads/${safeFilename}`;
    
    res.json({ 
      success: true, 
      code: code,
      description: description,
      downloadLink: downloadLink,
      filename: safeFilename
    });
  } catch (error) {
    console.error("❌ Error connecting to local DeepSeek API:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to connect to local DeepSeek model. Is it running?",
      details: error.message,
    });
  }
});

// List Generated Files
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR)
      .filter(file => fs.statSync(path.join(UPLOADS_DIR, file)).isFile())
      .map(file => ({
        name: file,
        downloadLink: `/downloads/${file}`,
        size: fs.statSync(path.join(UPLOADS_DIR, file)).size
      }));
    
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: "Failed to list files" });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Node API healthy', 
    deepseek: 'connected locally via localhost:8000',
    filesDirectory: UPLOADS_DIR
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Node.js server running at http://localhost:${PORT}`);
  console.log(`📁 Generated files will be saved to: ${UPLOADS_DIR}`);
});