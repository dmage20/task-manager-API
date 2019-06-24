const express = require('express')
const auth = require('../middleware/auth')
const multer = require('multer')
const User = require('../models/user')
const sharp = require('sharp')
const { welcomeEmail, farewellEmail } = require('../emails/account')


const router = express.Router()

// Sign-UP -- Creat User
router.post('/users', async (req, res)=>{
    const user = new User(req.body)

    try {
        await user.save()
        welcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})
// Get Current User Profile
router.get('/users/me', auth ,(req, res)=>{
    res.send(req.user)
})


// Delete-Current-User
router.delete('/users/me', auth ,async(req, res)=>{
    try {
        await req.user.remove()
        farewellEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e){
        res.status(500).send(e)
    }
})
// Update-User
router.patch('/users/me', auth ,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidUpdate = updates.every((update)=> allowedUpdates.includes(update))

    if (!isValidUpdate){
        return res.status(400).send('Invalid update')
    }
    try{
        // const user = await User.findById(_id)
        // if(!user){
        //     return res.status(400).send('No user found')
        // }
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})
// Login
router.post('/users/login', async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
})
// Logout
router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token)=> token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (e){
        res.status(500).send()
    }

})

// Logout of All sessions 
router.post('/users/logoutAll',auth, async (req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch (e){
        res.status(500).send()
    }
})


// Avatars
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|png)$/)){
            return cb(new Error('please upload a jpg,jpeg or png file'))
        }
        cb(undefined, true)
    }
})
// upload a user avatar
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).png().resize({height: 250, width: 250}).toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})
router.delete('/users/me/avatar', auth, async (req,res)=> {
    try{    
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})
// Serve up avatar picture
router.get('/users/:id/avatar', async (req, res)=> {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

module.exports = router