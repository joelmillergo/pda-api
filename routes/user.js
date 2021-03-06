const User = require('../models/User');
const Read = require('../models/Read');
const Joi = require('joi');
const History = require('../models/History');
const Global  = require( './global');
const moment = require('moment');


const user = [
    {
        method: 'POST',
        path: '/api/v1/user/register',
        config:{
            description:'注册',
            tags:['api'],
            validate: {
                payload: Joi.object({
                    userName: Joi.string().required().description('帐号').default('name'),
                    password: Joi.string().required().description('密码').default('123456'),
                }).label('user')
            }
        },
        handler: async  (req,res) => {
            const { userName ,password } = req.payload;
            const a = await User.find({userName}) ;
            if(a.length > 0){
                return {code:-1,msg:'用户名已存在'};
            } 
             const user = new User({
                userName,
                password,
                nickname:userName,
            }) 
            const result = await user.save();
            return {
                code: 0,
                msg: '注册成功',
                token: result._id,
            };
        }
    },{
        method: 'POST',
        path: '/api/v1/user/login',
        config:{
            description:'登录',
            tags:['api'],
            validate: {
                payload: Joi.object({
                    userName: Joi.string().required().description('帐号').default('name'),
                    password: Joi.string().required().description('密码').default('123456'),
                }).label('user')
            }
        },
        handler: async  (req,res) => {
            const { userName ,password } = req.payload;
            const result = await User.findOne( {userName,password});
            if(result){
                return {
                    code: 0,
                    msg: '登录成功',
                    token: result._id
                }
            }
            return {
                code: -1,
                msg:'用户名或密码有误，请重新输入'
            };
        }
    },{
        method: 'POST',
        path: '/api/v1/user/info/query',
        config:{
            description:'查询个人信息',
            tags:['api'],
            validate: {
                payload: Joi.object({
                    token: Joi.string().required().description('token').default('token'),
                }).label('token')
            }
        },
        handler: async  (req,res) => {
            const { token } = req.payload;
            const result = await User.findOne({_id:token});
            if(result){
                return {
                    code: 0,
                    msg: '查询成功',
                    userName: result.userName,
                    nickName: result.nickname || result.userName,
                    follow: result.follow,
                    fans: result.fans,
                    favorited: result.favorited,
                    point: result.point,
                    tag: result.tag,
                    pda:result.pda,
                };
            }
            return {
                code: -1,
                msg:'查询失败'
            };
        }
    },{
        method: 'POST',
        path: '/api/v1/user/info/alter',
        config:{
            description:'修改个人信息',
            tags:['api'],
            validate: {
                payload: Joi.object({
                    token: Joi.string().required().description('token').default('token'),
                    nickname: Joi.string().description('昵称').default('昵称'),
                    follow: Joi.number().description('关注').default('9'),
                    favorited: Joi.number().description('被收藏').default('999'),
                    fans: Joi.number().description('粉丝').default('99'),
                    point: Joi.number().description('积分').default('3000'),
                    tag: Joi.array().description('标签').default(['90后','宅']),
                }).label('user')
            }
        },
        handler: async  (req,res) => {
            const {
                token,
                nickname,
                pda,
                follow,
                favorited,
                fans,
                point,
                tag
            }  = req.payload;
            const result = await User.findOne({_id:token});
            if(result){
                if(nickname)  result.nickname = nickname;
                if(pda)  result.pda = pda;
                if(follow)  result.follow = follow;
                if(favorited)  result.favorited = favorited;
                if(fans)  result.fans = fans;
                if(point)  result.point = point;
                if(tag)  result.tag = tag;
                // result.pda = 100000;
                const re = await result.save();
                if(re){
                    return {
                        code: 0,
                        msg: '修改成功',
                        userName: re.userName,
                        nickname: re.nickname,
                        pda: re.pda,
                        follow: re.follow,
                        fans: re.fans,
                        favorited: re.favorited,
                        point: re.point,
                        tag: re.tag,
                    };
                }else{
                    return {
                        code: -1,
                        msg:'修改失败'
                    };
                }
            }
            return {
                code: -1,
                msg:'修改失败'
            };
        }
    },{
        method: 'POST',
        path: '/api/v1/user/read/list',
        config:{
            description:'浏览列表',
            tags:['api'],
            validate: {
                payload: Joi.object({
                    token: Joi.string().required().description('token').default('token'),
                }).label('token')
            }
        },
        handler: async  (req,res) => {
            const { token } = req.payload;
            const result = await Read.find({userId:token}).sort({beginAt: 'desc'}).populate('advId');

            if(result){
                const data = [];
                for(const item of result){
                    let pic = "";
                    let video = "";
                    console.log(item)
                    for(const cnt of JSON.parse(item.advId.content)){
                        if(cnt.type == 2){
                            pic = cnt.data;
                        }
                        if(cnt.type == 3){
                            video = cnt.data;
                        }
                    }
                   data.push({
                       advId:item.advId._id,
                        title:item.advId.title,
                        advTimeStr:Global.getTimeStr(item.advId.createAt,'MM月DD日'),
                        pic,
                        video,
                        author:item.advId.author,
                        readTimeStr:Global.getTimeStr(item.beginAt,'MM月DD日 HH:mm'),
                        commented:item.commented,
                        shared:item.shared,
                        favorited:item.favorited,
                   })
                }
                return {
                    code: 0,
                    msg: '查询成功',
                    data
                }
            }



            if(data){
                return {
                    code: 0,
                    msg: '查询成功',
                    data
                }
            }
            return {
                code: -1,
                msg:'查询失败',
            };
        }
    },{
        method: 'POST',
        path: '/api/v1/user/favorite/list',
        config:{
            description:'收藏列表',
            tags:['api'],
            validate: {
                payload: Joi.object({
                    token: Joi.string().required().description('token').default('token'),
                }).label('token')
            }
        },
        handler: async  (req,res) => {
            const { token } = req.payload;
            const result = await Read.find({userId:token,favorited:true}).sort({favoriteAt: 'desc'}).populate('advId');
            if(result){
                const data = [];
                for(const item of result){
                    let pic = "";
                    console.log(item)
                    for(const cnt of JSON.parse(item.advId.content)){
                        if(cnt.type == 2){
                            pic = cnt.data;
                        }
                    }
                   data.push({
                       advId:item.advId._id,
                        title:item.advId.title,
                        advTimeStr:Global.getTimeStr(item.advId.createAt,'MM月DD日'),
                        pic,
                        author:item.advId.author,
                        readTimeStr:Global.getTimeStr(item.favoriteAt,'MM月DD日 HH:mm'),
                   })
                }
                return {
                    code: 0,
                    msg: '查询成功',
                    data
                }
            }
            return {
                code: -1,
                msg:'查询失败'
            };
        }
    },{
        method: 'POST',
        path: '/api/v1/user/pda/history',
        config:{
            description:'PDA流水',
            tags:['api'],
            validate: {
                payload: Joi.object({
                    token: Joi.string().required().description('token').default('token'),
                }).label('token')
            }
        },
        handler: async  (req,res) => {
            const { token } = req.payload;
            const result = await History.find({userId:token}).populate('advId').sort({createAt: 'desc'});
            if(result){
                const data = [];
                for(const item of result){
                    console.log(item)
                    let  advName = '';
                    if(item.advId){
                        advName = item.advId.title;
                    }
                    data.push({
                        advName,
                        time:moment(item.createAt).valueOf(),
                        timeStr:Global.getTimeStr(item.createAt,'MM月DD日 HH:mm'),
                        pda:item.pda,
                        desc:item.desc
                    })
                }
                return {
                    code: 0,
                    msg: '查询成功',
                    data
                }
            }
            return  {
                code: -1,
                msg:'查询失败'
            };
        }
    }
]

module.exports = user;