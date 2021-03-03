const router = require('express').Router();
var multer = require('multer');
const path = require("path");
const { spawn } = require('child_process');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: "./images",
    filename: function(req, file, cb){
       cb(null,Date.now() + path.extname(file.originalname));
    }
 });

 const upload = multer({
    storage: storage,
 }).single("myImage");

 router.post("/upload", (req, res)=>{
    upload(req, res, (err) => {
       if(!err){
        const python = spawn('python3', ['client.py',req.file['path']]);
        python.stdout.on('data', function (data) {
            fs.readFile('captions.json', function (errr, info) {
                var json = JSON.parse(info);
                let caption=data.toString()+`${req.body['tag']}`
                caption=caption.replace(/(\r\n|\n|\r)/gm, " ");
                json.push({"id":req.file["filename"],"caption":caption});    
                fs.writeFile("captions.json", JSON.stringify(json), function(error){
                  if (error) throw error;
                  console.log(caption);
                });
            })
            return res.sendStatus(200).end();
        });
       }  
    });
});

module.exports=router;


