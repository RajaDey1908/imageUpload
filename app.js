const express= require('express');
const jwt=require('jsonwebtoken');
const bodyParser = require('body-parser');
const sharp = require('sharp');

const app=express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var multer  = require('multer');
//var upload = multer({ dest: 'uploads/' });




// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads/')
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + '.jpg') //Appending .jpg
//     }
//   })


var path = require('path')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})

  
var upload = multer({ storage: storage });

var cpUpload = upload.fields([{ name: 'file'}])


resize_image= function(req, res, cb){
    for (var i = 0; i < req.files.length; i++) {
       
        let inputFile  = 'uploads/'+req.files[i].filename;
        let outputFile = 'uploads/resizeImage/'+req.files[i].filename;
        
        sharp(inputFile).resize({ height: 780 }).toFile(outputFile)
            .then(function(newFileInfo) {
                // newFileInfo holds the output file properties
                //console.log("Success");;
                cb(null, newFileInfo)
            })
            .catch(function(err) {
                //console.log("Error occured");
                throw err;
            });    
    }

    
}



app.get('/api', (req, res)=>{
    let getvalue=req.body.name;
    console.log(getvalue);
    res.json({
        message:"tesi api"
    })
})


app.post('/api/login', (req, res)=>{
    let getvalue=req.body;
    jwt.sign({getvalue},'secretkey',{ expiresIn: '30s' },(err, tolken)=>{
        if(err){
            res.sendStatus(403);
        }else{
            res.json({
                tolken
            })
        }
    })
})

app.post('/api/profile',verifytoke, (req, res)=>{
    res.json({
        "message":"You are in profile page"
    })
})

function verifytoke(req, res, next){
    let bearerHeader= req.headers['authorization'];
    if( typeof bearerHeader !== 'undefined'){
        let bearerToken=bearerHeader.split(' ');
        let token= bearerToken[1];
    
        jwt.verify(token, 'secretkey', (err, cb)=>{
            if(err){
                res.sendStatus(403);
            }else{
                next();
            }
        })
    }else{
        res.sendStatus(403);
    }    
}

app.post('/api/fileupload',upload.single('file'), (req, res)=>{
    
    let fileValue=req.file;
    let bodyValue=req.body;
    console.log(fileValue);
    console.log(bodyValue);
    res.json({
        "message":"image upload Successfully"
    })
})


app.post('/api/multipleFile', cpUpload, resize_image, (req, res)=>{
    
    //let fileValue=req.file;
    let bodyValue=req.body;
    //console.log(fileValue);
    console.log(bodyValue);
    res.json({
        "message":"image upload Successfully"
    })
})

app.post('/api/resizeImage', upload.array('file', 10), resize_image, (req, res)=>{
    
    //let fileValue=req.file;
    let bodyValue=req.body;
    //console.log(fileValue);
    console.log(bodyValue);
    res.json({
        "message":"image upload Successfully"
    })
})

app.listen('4000', ()=> {
    console.log("server is running in port 4000")
});
