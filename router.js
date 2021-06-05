const express = require('express')
const router = express.Router()
const fs = require('fs');
const md5 = require('blueimp-md5')
const User = require('./models/user')
const Topic = require('./models/topic')
const Comments = require('./models/comment')


router.get('/', async (req, res) => {
    var data = await Topic.find({})
    res.render('index.html', {
        user: req.session.user,
        topics: data
    })
})

router.get('/login', (req, res) => {
    res.render('login.html')
})

router.post('/login', async (req, res) => {
    // 1. 获取表单数据
    // 2. 查询数据库用户名密码是否正确
    // 3. 发送响应数据
    var body = req.body
    try {
        const email = await User.findOne({ email: body.email })
        if (!email) {
            return res.status(200).json({
                err_code: 1,
                message: 'Email is invalid!'
            })
        }
        const user = await User.findOne({ email: body.email, password: md5(md5(body.password)) })
        if (!user) {
            return res.status(200).json({
                err_code: 2,
                message: 'password is invalid!'
            })
        }
        req.session.user = user
        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    } catch (e) {
        return res.status(500).json({
            err_code: 500,
            message: 'Server error'
        })
    }

})

router.get('/register', (req, res) => {
    res.render('register.html')
})

router.post('/register', async (req, res) => {
    var body = req.body
    try {
        const data = await User.findOne({ email: body.email })
        if (data) {
            return res.status(200).json({
                err_code: 1,
                message: 'Email already exit'
            })
        }
        //使用MD5对密码进行双重加密
        body.password = md5(md5(body.password))
        const user = await new User(body).save()
        req.session.user = user
        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    } catch (e) {
        return res.status(500).json({
            err_code: 500,
            message: 'Server error'
        })
    }
})

router.get('/logout', (req, res) => {
    req.session.user = null
    res.redirect('/login')
})

router.get('/topics/new', (req, res) => {
    res.render('topic/new.html', {
        user: req.session.user
    })
})

router.post('/topics/new', async (req, res) => {
    // console.log(req.body);
    var body = req.body
    body["email"] = req.session.user.email
    body["nickname"] = req.session.user.nickname
    try {
        await new Topic(body).save()
        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    } catch (e) {
        return res.status(500).json({
            err_code: 500,
            message: e.message
        })
    }
})

router.get('/topics/show', async (req, res) => {
    var id = req.query.id
    try {
        const topic = await Topic.findOne({ _id: id })
        const comments = await Comments.find({ articleId: id })
        res.render('topic/show.html', {
            user: req.session.user,
            topic,
            comments
        })
    } catch (e) {
        throw e
    }
})

router.post('/topics/show', async (req, res) => {
    if (!req.session.user) {
        res.status(200).json({
            err_code: 1,
            message: 'Not logged in'
        })
    }
    var body = req.body
    var articleId = body.articleId
    try {
        const data = await Topic.findOne({ _id: articleId })
        var comment = {}
        comment.articleId = articleId
        comment.email = data.email
        comment.nickname = req.session.user.nickname
        comment.comments = body.comments
        await new Comments(comment).save()
        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    } catch (e) {
        res.status(500).json({
            err_code: 500,
            message: e.message
        })
    }

})

router.get('/settings/admin', (req, res) => {
    res.render('settings/admin.html', {
        user: req.session.user
    })
})

router.post('/settings/admin', async (req, res) => {
    const body = req.body
    const newPassword = md5(md5(body.checkPassword))
    try {
        await User.updateOne(
            { email: req.session.user.email },
            {
                $set: { 'password': newPassword },
                $currentDate : { "lastModified": true }
            }
        )
        req.session.user = null
        res.status(200).json({
            err_code:0,
            message:'OK'
        })    
    } catch (e) {
        return res.status(500).json({
            err_code: 500,
            message: e.message
        })
    }

})

router.get('/settings/profile', async (req, res) => {
    res.render('./settings/profile.html', {
        user: req.session.user
    })
})

router.post('/settings/profile', async (req, res) => {
    const body = req.body
    console.log(body.file);
    try {
        await User.updateOne({ email: req.session.user.email },
            {
                $set: { "nickname": body.nickname, "bio": body.bio, "gender": body.gender },
                $currentDate: { "lastModified": true }
            })
        req.session.user["nickname"] = body.nickname
        req.session.user["bio"] = body.bio
        req.session.user["gender"] = body.gender

        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    } catch (e) {
        return res.status(500).json({
            err_code: 500,
            message: e.message
        })
    }
})

router.get('/settings/delete', async (req, res) => {
    try {
        await User.deleteOne({ email: req.session.user.email })
        req.session.user = null
        res.status(200).json({
            err_code:0,
            message:'OK'
        })
    } catch (e) {
        return res.status(500).json({
            err_code:500,
            message:e.message
        })
    }
})


module.exports = router