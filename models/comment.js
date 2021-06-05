const mongoose = require('mongoose')
const db = require('./db')
const Schema = mongoose.Schema
const commentSchema = new Schema({
    articleId: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    nickname: {
        type: String,
        require: true
    },
    comments: {
        type: String,
        require: true
    },
    created_time: {
        type: Date,
        //这里不能写Date.now()，因为会即刻调用,
        // 这里给了一个方法Date.now
        // 当new model的时候，如果没有传递created_time属性，mongoose就会调用该方法
        default: Date.now
    }
})

const Comments = mongoose.model('Comment', commentSchema)
module.exports = Comments