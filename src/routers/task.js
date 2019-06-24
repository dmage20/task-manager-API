const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const User = require('../models/user')

const router = express.Router()

// Tasks
router.post('/tasks', auth ,async (req, res)=>{
    // const task = new Task(req.body)
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        })
        await task.save()
        res.status(201).send(task)
    } catch(e){
        res.status(400).send(e)
    }
})

// /tasks?limit=2&skip=2
// /tasks?complete=true
// /tasks?sortBy=createdAt:desc
router.get('/tasks', auth ,async (req,res)=>{
    const match = {}
    const sort = {}
    if(req.query.completed ){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        // const tasks = await Task.find()
        const user = await User.findById(req.user._id)
        await user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(user.tasks)
    } catch (e){
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth ,async (req, res)=>{
    const _id = req.params.id
    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth ,async (req,res)=>{
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed', 'description']
    const isValidUpdate = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidUpdate){
        return res.status(400).send({ error: 'Invalid updates'})
    }

    try{
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task){
            return res.status(400).send()
        }
        updates.forEach((update)=>task[update] = req.body[update])
        await task.save()
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})
router.delete('/tasks/:id', auth ,async (req, res)=>{
    const _id = req.params.id
    try {
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if (!task){
            return res.status(400).send({error: 'Task not found'})
        }
        res.send(task)
    } catch (e){
        res.status(500).send(e)
    }
})

module.exports = router