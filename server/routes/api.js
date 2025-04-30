const router = require('express').Router()
const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');
const multer = require("multer");
const fs = require("fs");

router.get('/hallo', function (req, res, next) {
    console.log("Router Working");
    res.end();
})

const evidenceDir = "./uploads/evidence";
const policyDir = "./uploads/policy";

if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

if (!fs.existsSync(policyDir)) {
  fs.mkdirSync(policyDir, { recursive: true });
}

const clearFolder = (folderPath) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Error reading folder: ${folderPath}`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${filePath}`, err);
        }
      });
    });
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "evidence") {
      clearFolder(evidenceDir); 
      cb(null, evidenceDir);
    } else if (file.fieldname === "policy") {
      clearFolder(policyDir); 
      cb(null, policyDir);
    } else {
      cb(new Error("Invalid field name"));
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.fields([{ name: "evidence" }, { name: "policy" }]), async (req, res) => {
    const { subject, question } = req.body;

    if (!req.files || !req.files.evidence || !req.files.policy || !subject) {
      return res.status(400).json({
        error: "Please upload both evidence and policy files, and provide a subject.",
      });
    }

    console.log("Evidence file:", req.files.evidence);
    console.log("Policy file:", req.files.policy);
    console.log("Subject:", subject);
    console.log("Question:", question);
    
    const folder = path.join(__dirname, '../scripts');

    let dataToSend;
    const pythonPath = '/Users/warner/Documents/openai_script/.venv/bin/python';
    const scriptPath = folder + '/OpenAI.py';

    console.log(scriptPath)

    const python = spawn(pythonPath, [scriptPath, subject, question]);

    python.stdout.on('data', function (data) {
        dataToSend = data.toString();
        console.log(dataToSend)
        return res.send(dataToSend);
    });

    python.stderr.on('data', function (data) {
        console.error('Python error: ', data.toString());
        res.status(500).send('Python process error');
    });

    python.on('close', function (code) {
        if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
        }
    });
  }
);

module.exports = router;