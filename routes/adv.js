const Joi = require('joi');
const Adv = require('../models/Adv');
const Read = require('../models/Read');
const Comment = require('../models/Comment');
const User = require('../models/User');

const adv = [{
    method: 'POST',
    path: '/api/v1/adv/list',
    config: {
        description: '广告列表',
        tags: ['api'],
        // validate: {
        //     payload: Joi.object({
        //         searchName: Joi.string().description('搜索名').default(''),
        //     }).label('广告')
        // }
    },
    handler: async (req, res) => {
        // const { searchName } = req.payload;
        const data = await Adv.find();
        return {
            code: 0,
            msg: '查询成功',
            data
        };
    }
}, {
    method: 'POST',
    path: '/api/v1/adv/detail',
    config: {
        description: '广告详情',
        tags: ['api'],
        validate: {
            payload: Joi.object({
                advId: Joi.string().required().description('广告ID').default('41224d776a326fb40f000001'),
            }).label('广告'),
        }
    },
    handler: async (req, res) => {
        let failMsg = '';
        try {
            const { advId } = req.payload;
            const data = await Adv.findOne({ _id:advId });
            if(data){
                return {
                    code: 0,
                    msg: '查询成功',
                    data
                }
            }
        } catch (error) {
            console.log(error);

            failMsg += error;
            return {
                code: -1,
                msg: '查询失败'+failMsg,
            };
        }
        
        return {
            code: -1,
            msg: '查询失败'+failMsg,
        };
    }
}, {
    method: 'POST',
    path: '/api/v1/adv/enter',
    config: {
        description: '开始浏览广告',
        tags: ['api'],
        validate: {
            payload: Joi.object({
                token: Joi.string().required().description('token').default('41224d776a326fb40f000001'),
                advId: Joi.string().required().description('advId').default('41224d776a326fb40f000001'),
            }).label('广告'),
        }
    },
    handler: async (req, res) => {
        const { token,advId } = req.payload;
        const user = await User.findOne({ _id:token });
        if(!user){
            return {
                code: -1,
                msg: '用户token失效'
            };
        }
        const adv = await Adv.findOne({ _id:advId });
        if(!adv){
            return {
                code: -1,
                msg: '查询广告失败'
            };
        }
        const read = new Read({
            userId: user._id,
            advId: adv._id,
            beginAt: new Date(),
        });
        const data = await read.save();
        if(data){
            return {
                code: 0,
                msg: '生成浏览记录成功',
                readId: data._id
            }
        }
        return {
            code: -1,
            msg: '生成浏览记录失败'
        };
    }
}, {
    method: 'POST',
    path: '/api/v1/adv/leave',
    config: {
        description: '结束浏览广告',
        tags: ['api'],
        validate: {
            payload: Joi.object({
                token: Joi.string().required().description('token').default('41224d776a326fb40f000001'),
                advId: Joi.string().required().description('广告ID').default('41224d776a326fb40f000001'),
                readId: Joi.string().required().description('浏览记录ID').default('readId'),
            }).label('广告'),
        }
    },
    handler: async (req, res) => {
        const { token,advId,readId } = req.payload;
        const user = await User.findOne({ token });
        if(!user){
            return {
                code: -1,
                msg: '用户token失效'
            };
        }
        const adv = await Adv.findOne({ _id:advId });
        if(!adv){
            return {
                code: -1,
                msg: '查询广告失败'
            };
        }
        const read = await Read.findOne({ _id:readId });
        if(!read){
            return {
                code: -1,
                msg: '查询浏览记录失败'
            };
        }
        read.endAt = new Date();
        const data = read.save();
        if(data){
            return {
                code: 0,
                msg: '生成浏览记录成功',
                readId: data._id
            }
        }
        return {
            code: -1,
            msg: '生成浏览记录失败'
        };
    }
}, {
    method: 'POST',
    path: '/api/v1/adv/new',
    config: {
        description: '新增广告',
        tags: ['api'],
        validate: {
            payload: Joi.object({
                title: Joi.string().required().description('标题').default('title'),
                pda: Joi.string().required().description('浏览奖励PDA').default('1'),
                author: Joi.string().required().description('作者').default('author'),
                content: Joi.array().required().description('正文 type-1文字 2图片 3视频').default('[{type:\'1\',data:\'\]}]')
            }).label('user')
        }
    },
    handler: async (req, res) => {
        const {
            title,
            pda,
            author,
            content,
        } = req.payload;
        const adv = new Adv({
            title,
            pda,
            author,
            content,
            createAt: new Date(),
        })
        const result = await adv.save();
        return {
            code: 0,
            msg: '添加成功',
            result
        };
    }
}, {
    method: 'POST',
    path: '/api/v1/adv/comment/list',
    config: {
        description: '评论列表',
        tags: ['api'],
        validate: {
            payload: Joi.object({
                token: Joi.string().required().description('token').default('41224d776a326fb40f000001'),
                advId: Joi.string().required().description('广告ID').default('41224d776a326fb40f000001'),
            }).label('评论')
        }
    },
    handler: async (req, res) => {
        const { token,advId } = req.payload;
        const data = await Comment.find({
            userId:token,
            advId
        });
        if(data){
            return {
                code: 0,
                msg: '查询成功',
                data
            }
        }
        return {
            code: -1,
            msg: '评论失败',
        };
    }
}, {
    method: 'POST',
    path: '/api/v1/adv/comment/new',
    config: {
        description: '新增评论',
        tags: ['api'],
        validate: {
            payload: Joi.object({
                token: Joi.string().required().description('token').default('41224d776a326fb40f000001'),
                advId: Joi.number().required().description('广告ID').default('41224d776a326fb40f000001'),
                content: Joi.string().required().description('评论内容').default('content'),
            }).label('评论')
        }
    },
    handler: async (req, res) => {
        try {
            const { token,advId,content } = req.payload;

            const user = await User.findOne({_id:token});
            if(!user){
                return {
                    code: -1,
                    msg: '无效的token'
                }
            }
            const adv = await Adv.findById(1234);
            if(!adv){
                return {
                    code: -1,
                    msg:'无效的广告'
                }
            }
            const comment = new Comment({
                userId: token,
                advId,
                content,
                createAt: new Date()
            });
            const data = await comment.save();
            if(data){
                return {
                    code: 0,
                    msg: '评论成功',
                    data
                }
            } 
        } catch (error) {
            return {
                code: -1,
                msg: '评论失3败'+error,
            };
        }
        
        return {
            code: -1,
            msg: '评论失败',
        };
    }
}, {
    method: 'POST',
    path: '/api/v1/adv/recommend/list',
    config: {
        description: '推荐列表',
        tags: ['api'],
        validate: {
            payload: Joi.object({
                token: Joi.string().required().description('token').default('41224d776a326fb40f000001'),
                advId: Joi.string().required().description('广告ID').default('41224d776a326fb40f000001'),
            }).label('评论')
        }
    },
    handler: async (req, res) => {
        const data = await Adv.findOne();
        if(data){
            return {
                code: 0,
                msg: '查询成功',
                data
            }
        }
        return {
            code: -1,
            msg: '查询失败',
        };
    }
}, {
    method: 'POST',
    path: '/api/v1/adv/favorite',
    config: {
        description: '收藏',
        tags: ['api'],
        validate: {
            payload: Joi.object({
                token: Joi.string().required().description('token').default('41224d776a326fb40f000001'),
                advId: Joi.string().required().description('广告ID').default('41224d776a326fb40f000001'),
            }).label('评论')
        }
    },
    handler: async (req, res) => {
        const { token,advId } = req.payload;

        const user = await User.findOne({_id:token});
        if(!user){
            return {
                code: -1,
                msg: '无效的token'
            }
        }
        const adv = await Adv.findById(1234);
        if(!adv){
            return {
                code: -1,
                msg:'无效的广告'
            }
        }


        let read = await Read.findOne({ userId:token,advId });
        if(read && read.favorited){
            return {
                code: -1,
                msg: '请勿重复收藏'
            }
        }
        if(!read){
            read = new Read({
                userId:token,
                advId,

            })
        }
        read.favorited = true;
        const data = await read.save();
        if(data){
            return {
                code: 0,
                msg: '收藏成功'
            }
        }
        return {
            code: -1,
            msg: '收藏失败',
        };
    }
}, {
    method: 'POST',
    path: '/api/v1/adv/share',
    config: {
        description: '分享',
        tags: ['api'],
        validate: {
            payload: Joi.object({
                token: Joi.string().required().description('token').default('41224d776a326fb40f000001'),
                advId: Joi.string().required().description('广告ID').default('41224d776a326fb40f000001'),
            }).label('评论')
        }
    },
    handler: async (req, res) => {
        const { token,advId } = req.payload;
        const read = await Read.findOne({ userId:token,advId });
        read.shared = true;
        const data = await read.save();
        if(data){
            return {
                code: 0,
                msg: '分享成功'
            }
        }
        return {
            code: -1,
            msg: '分享失败',
        };
    }
}]

module.exports = adv;