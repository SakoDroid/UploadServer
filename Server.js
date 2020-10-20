const ex = require("express");
const fu = require("express-fileupload");
const fs = require("fs");
const b = require("body-parser");
const app = ex();

const date = new Date();

app.use(fu({limits: { fileSize: 50 * 1024 * 1024 }}));
app.use(ex.static(__dirname + "/doc/"));
app.use(b.urlencoded({extended : false}));
let pr = 0;
app.get("/",(req,res)=>{
    console.log("request for main page from " + req.ip.split(":")[3] + "| " + date.toString());
    res.sendFile(__dirname + "/index.html");
});

app.post("/Upload",(req,res)=>{
    console.log("request for Upload from " + req.ip.split(":")[3] + "| " + date.toString());
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
               "<a href='/dl?file_name=" + encodeURIComponent(files[i].name) +"'>    Download link" + "</a>"+ "<br/><hr/>";

           /*app.get("/doc/" + files[i].name,(req,res)=>{
               console.log("request for online view of the " + dir + " , from : " + req.ip.split(":")[3]
                   + "| " + date.toString());
               res.sendFile(dir);
           });*/
       }
       o += "</body></html>";
       res.send(o);
       console.log(files.length + " files uploaded requested by : " + req.ip.split(":")[3] + "| " + date.toString());
   }
});

app.get("/dl",(req,res)=>{
    let dir = __dirname + "/doc/" + decodeURIComponent(req.query.file_name);
    console.log("request for downloading " + dir + " , from : " + req.ip.split(":")[3]  + "| " + date.toString());
    if(fs.existsSync(dir)){
        res.download(dir);
    }else{
        res.status(404).send("<html><head><title>File not found!</title></head><body>" +
            "<h1>File not found!</h1><p>The file you requested is not located on the server!</p></body></html>");
    }
});

app.get("/files",(req,res)=>{
    if(pr === 1){
        console.log("request for files list from : " + req.ip.split(":")[3] + "| " + date.toString());
        let files = fs.readdirSync(__dirname + "/doc");
        let o = "<html><head><title>Files list</title></head><body><h1>Files list</h1><hr/>";
        let j = 0;
        for (let i in files) {
            j++;
            o += "<a href='" + "/dl?file_name=" + encodeURIComponent(files[i]) + "'>" + j + ". " + files[i] + "</a><br/><hr/>";
        }
        o += "</body></html>";
        res.send(o);
    }else{
        res.send("<html><head><title>Access Denied!</title></head><body><h1>Access Denied!</h1></body></html>")
    }
});

app.listen(8081,()=>{
    console.log("listening on port 8081"  + "| " + date.toString());
});