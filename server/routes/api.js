
//3rd party imports
const router = require('express').Router()
const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');
const multer = require("multer");

router.get('/hallo', function (req, res, next) {
    console.log("Router Working");
    res.end();
})

// router.post('/mindset', async (req, res) => {
//         // const prompt = "Experts have told the BBC that the current Covid surge in China is unlikely to impact India, but they urged people to stay cautious and wear masks. India has stepped up surveillance after a spike in cases in neighbouring China. People travelling from China and four other Asian countries now have to produce a Covid-19 negative test report before entering India. On Tuesday, drills were held to check if hospitals could handle a surge. According to government data, India currently has only around 3,400 active coronavirus cases. But reports of the surge in China and the memories of two deadly Covid waves in 2020 and 2021 in India have made many people fearful."
//         const prompt = req.body.prompt
        
//         let dataToSend;
    
//         const pythonPath = '/usr/bin/python3';
//         const scriptPath = folder+'/scripts/mindset.py';
    
//         const python = spawn(pythonPath, [scriptPath, prompt]);
    
//         python.stdout.on('data', function (data) {
//             dataToSend = data.toString();
//             return res.send(dataToSend);
//         });
// })

// async function mindset(prompt) {

//         try {
//             const response = await axios.post('http://localhost:4000/api/v1/mindset', {prompt})
    
//             const jsonData = response.data;
    
//             const data = await jsonData;
    
//             return data;
    
//         } catch (error) {
//             return `An error occurred: ${error.message}`
//         }
// }

// async function transformOutput(data) {
//     const transformed = [];

//     if (data.mindset) {
//         data.mindset.forEach((item) => {
//             transformed.push({
//                 attribute: item.attribute,
//                 value: item.value,
//                 explanation: item.explanation,
//                 span: item.span,
//                 confidence: item.confidence,
//             });
//         });
//     }

//     return transformed;
// }

//   router.post('/result', async (req, res) => {
//     // const prompt = "Experts have told the BBC that the current Covid surge in China is unlikely to impact India, but they urged people to stay cautious and wear masks. India has stepped up surveillance after a spike in cases in neighbouring China. People travelling from China and four other Asian countries now have to produce a Covid-19 negative test report before entering India. On Tuesday, drills were held to check if hospitals could handle a surge. According to government data, India currently has only around 3,400 active coronavirus cases. But reports of the surge in China and the memories of two deadly Covid waves in 2020 and 2021 in India have made many people fearful."
//     const prompt = req.body.prompt

//     try {
//         const mindsetData = await mindset(prompt);

//         const combinedData = {
//             mindset: mindsetData,
//         };

//         const transformedData = await transformOutput(combinedData)

//         const outputPrompt = {"prompt": prompt}

//         const resultData = {
//             prompt: outputPrompt,
//             comments: transformedData,
//         };

//         console.log(resultData)

//         res.send(resultData);
        
//     } catch (error) {
//         // Handle any errors that occurred during the execution
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred while processing the request.' });
//     }
// });


const fs = require("fs");

// Ensure folders exist
const evidenceDir = "./uploads/evidence";
const policyDir = "./uploads/policy";

if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

if (!fs.existsSync(policyDir)) {
  fs.mkdirSync(policyDir, { recursive: true });
}

// Function to clear a specific folder
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

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "evidence") {
      clearFolder(evidenceDir); // Clear the evidence folder
      cb(null, evidenceDir);
    } else if (file.fieldname === "policy") {
      clearFolder(policyDir); // Clear the policy folder
      cb(null, policyDir);
    } else {
      cb(new Error("Invalid field name"));
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filenames
  },
});

// Initialize multer with storage configuration
const upload = multer({ storage: storage });

router.post("/upload", upload.fields([{ name: "evidence" }, { name: "policy" }]), async (req, res) => {
    const { subject, question } = req.body;

    // Validate that both files and subject are provided
    if (!req.files || !req.files.evidence || !req.files.policy || !subject) {
      return res.status(400).json({
        error: "Please upload both evidence and policy files, and provide a subject.",
      });
    }

    // Log files and subject
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

    // Respond with success
    // res.status(200).json({
    //   message: "Files and subject received successfully.",
    //   evidence: req.files.evidence,
    //   policy: req.files.policy,
    //   subject: subject,
    // });
  }
);

module.exports = router;