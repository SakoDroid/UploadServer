const ex = require("express");
const fu = require("express-fileupload");
const fs = require("fs");
const app = ex();

app.use(fu({limits: { fileSize: 50 * 1024 * 1024 }}));

app.get("/",(req,res)=>{
    console.log("request for main page from " + req.ip.split(":")[3]);
    res.sendFile(__dirname + "/index.html");
});

app.post("/Upload",(req,res)=>{
    console.log("request for Upload from " + req.ip.split(":")[3]);
    let files = req.files;
   if (files.length === 0){
       res.status(400).send("No file is uploaded!");
   } else{
       let j = 0;
       let o = "<html><head><title>Upload successful!</title></head><body><h1>Files uploaded!</h1>" +
           "<h3>Click the links below for the files!</h3><br/>"

       for (let i in files){
           let dir = __dirname + "/doc/" + files[i].name;
           j++;
           fs.closeSync(fs.openSync(dir,"w"));
           files[i].mv(dir);
           o += "<p>"+ "File number " + j + " (" + files[i].name + ") :" +
               "</p><a href='/doc/" + files[i].name + "'>Online view" + "</a>" + "<p>   </p>" +
               "<a href='/dl?file_name=" + files[i].name +"'>    Download link" + "</a>"+ "<br/><hr/>";

           app.get("/doc/" + files[i].name,(req,res)=>{
               res.sendFile(dir);
           });
       }
       o += "</body></html>";
       res.send(o);
       console.log(files.length + " files uploaded requested by : " + req.ip.split(":")[3]);
   }
});

app.get("/dl",(req,res)=>{
    let dir = __dirname + "/doc/" + decodeURIComponent(req.query.file_name);
    console.log("request for downloading " + dir + " , from : " + req.ip.split(":")[3]);
    if(fs.existsSync(dir)){
        res.download(dir);
    }else{
        res.status(404).send("<html><head><title>File not found!</title></head><body>" +
            "<h1>File not found!</h1><p>The file you requested is not located on the server!</p></body></html>");
    }
});

app.get("/files",(req,res)=>{
    console.log("request for files list from : " + req.ip.split(":")[3]);
    let files = fs.readdirSync(__dirname + "/doc");
    let o = "<html><head><title>Files list</title></head><body><h1>Files list</h1><hr/>";
    for (let i in files){
        o += "<a href='" + "/dl?file_name=" + encodeURIComponent(files[i]) + "'>" + files[i] + "</a><br/><hr/>";
    }
    o += "</body></html>";
    res.send(o);
});

app.listen(8081,()=>{
    console.log("listening on port 8081");
});