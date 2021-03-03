var lunr = require("lunr");
const express = require('express');
const app = express()
const router = express.Router();
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');

// App Middlewares
app.use(express.json());
app.use(cors());

// Checking Connection
app.listen(process.env.PORT || 3000, () => {
    console.log('App is Live');
});


router.post("/search", async (req, res) => {
    let rawdata = fs.readFileSync('captions.json');
    let captions = JSON.parse(rawdata);
    var idx = lunr(function () {
        this.field('caption');
        captions.forEach(cap => {
            this.add(cap);
        });
    });
    var search = idx.search(req.body.search);
    var files = [];
    var names=[];
    if (search.length > 5) {
        for (let i = 0; i <= 5; i++) {
            var img = fs.readFileSync(`images/${search[i]['ref']}`, "base64");
            const dataUrl = `data:image/jpeg;base64, ${img}`
            files.push(dataUrl);
            names.push(search[i]['ref']);
        }
        res.send([files,names]);
    } else if (search.length > 0) {
        for (let i = 0; i < search.length; i++) {
            var image = fs.readFileSync(`images/${search[i]['ref']}`, "base64");
            const dataUrl = `data:image/jpeg;base64, ${image}`
            files.push(dataUrl);
            names.push(search[i]['ref']);
        }
        res.send([files,names]);
    } else {
        res.sendStatus(404).end();
    }
});

router.post("/append", async (req, res) => {
    let rawdata = fs.readFileSync('captions.json');
    let captions = JSON.parse(rawdata);
    captions.push({"id":req.body['name'],"caption":req.body['caption']});
    fs.writeFile("captions.json", JSON.stringify(captions), function(error){
        if (error) throw error;
      });
    res.send("Ok");
});


const uploadRoute = require("./uploadRoute");
app.use('/', router);
app.use('/', uploadRoute);



