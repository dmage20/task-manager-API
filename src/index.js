const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const multer = require('multer')

// create express aplication server
const app = express();

// set app to parse json
app.use(express.json()) 
// set port with config/dev.env
const port = process.env.PORT
// let the server start listening for requests
app.listen(port,()=>{
    console.log('Server is up on port '+ port);   
})
// connect userRouter to express server app
app.use(userRouter)
// connect taskRouter to express server app
app.use(taskRouter)

// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb){
//         if(!file.originalname.match(/\.(doc|docx)$/)){
//             return cb(new Error('please upload a Word doc'))
//         }
//         cb(undefined, true)
//     }
// })
// app.post('/upload', upload.single('upload'), (req,res)=> {
//     res.send()
// }, (error, req, res, next)=>{
//     res.status(400).send({error: error.message})
// })
