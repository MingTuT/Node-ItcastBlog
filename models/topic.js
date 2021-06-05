const mongoose = require('mongoose')
const db = require('./db')
const Schema = mongoose.Schema
const topicSchema = new Schema({
    email: {
        type: String,
        require: true
    },
    nickname: {
        type: String,
        require: true
    },
    model: {
        type: Number,
        //0--分享 1--问答 2--招聘 3--客户端测试
        enum: [0, 1, 2, 3],
        require: true
    },
    title: {
        type: String,
        required: true
    },
    article: {
        type: String,
        required: true
    },
    created_time: {
        type: Date,
        default: Date.now
    }
})

const Topic = mongoose.model('Topic', topicSchema)
module.exports = Topic