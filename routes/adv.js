const Joi = require('joi');
const Adv = require('../models/Adv');
const Read = require('../models/Read');
const Comment = require('../models/Comment');
const History = require('../models/History');
const User = require('../models/User');
const moment = require('moment');
const Global = require('./global');

async function pda(token,advId,pda,desc){
    const user1 = await User.findOne({_id:token});
    const user2 = await User.findOne({userName:'yanglh'});

    user1.pda = user1.pda + pda;
    user2.pda = user2.pda - pda;
    const r1 = await user1.save();
    const r2 = await user2.save();
    if(!r1 || !r2){
        return false;
    }
    const history = new History({
        userId:token,
        advId,
        pda,
        desc,
        createAt:new Date()
    });
    const data = await history.save();
    if(!data){
        return false;
    }
    console.log(data)
    return true;
}
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
        const result = await Adv.find().sort({createAt: 'desc'});
        if(result){
            const data = [];
            for(const item of result){
                const r1 = await Read.find({advId:item._id});
                data.push({
                    advId:item._id,
                    author:item.author,
                    pda:item.pda,
                    title:item.title,
                    timeStr:Global.getTimeStr(item.createAt,'YYYY-MM-DD'),
                    content:item.content,
                    reads:r1.length,
                });
            }
            return {
                code: 0,
                msg: '查询成功',
                data
            };
        }
        return {
            code: -1,
            msg: '查询失败',
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
                advId: Joi.string().required().description('广告ID').default('5be9298a700e3c743c14f6e7'),
            }).label('广告'),
        }
    },
    handler: async (req, res) => {
        let failMsg = '';
        try {
            const { advId } = req.payload;
            const item = await Adv.findOne({ _id:advId });
            if(item){
                const data ={
                    pda:item["pda"],
                    author:item["author"],
                    content:item["content"],
                    createAt:Global.getTimeStr( item["createAt"],'YYYY-MM-DD HH:mm'),
                    _id:item["_id"],
                    title:item["title"],
                };
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
    path: '/api/v1/adv/alter',
    config: {
        description: '修改广告详情',
        tags: ['api'],
        validate: {
            payload: Joi.object({
                advId: Joi.string().required().description('广告ID').default('41224d776a326fb40f000001'),
                pda: Joi.string().required().description('浏览奖励PDA').default('1'),
                author: Joi.string().required().description('作者').default('author'),
                title: Joi.string().required().description('标题').default('title'),
                content: Joi.string().required().description('正文 type-1文字 2图片 3视频').default('[{type:\'1\',data:\'\'}]')
            }).label('广告'),
        }
    },
    handler: async (req, res) => {
        let failMsg = '';
        try {

            const contentJson = 
            [
              {
                type:1,
                data:'段落1====段落1====段落1====段落1====段落1====段落1====段落1====段落1====段落1====段落1====',
              },
              {
                type:3,
                data:'https://sit-fruit-chain-front.huntor.cn:10071/v/v001.mp4',
              },
              {
                type:1,
                data:'段落2====段落2====段落2====段落2====段落2====段落2====段落2====段落2====段落2====段落2====段落2====段落2====',
              },
              {
                type:2,
                data:'https://pic2.zhimg.com/50/v2-710b7a6fea12a7203945b666790b7181_hd.jpg',
              },
              {
                type:1,
                data:'段落3====段落3====段落3====段落3====段落3====段落3====段落3====段落3====段落3====段落3====',
              },
            ];
            const { advId,pda,title,author,content } = req.payload;
            const adv = await Adv.findOne({ _id:advId });
            if(!adv){
                return {
                    code: 0,
                    msg: '查询失败',
                    data
                }
            }
            if(title) adv.title = title;
            if(author) adv.author = author;
            if(pda) adv.pda = pda;
            if(content) adv.content = content;
            // adv.content = JSON.stringify(contentJson);
            const data = await adv.save();
            if(data){
                return {
                    code: 0,
                    msg: '更新成功',
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
},{
    method: 'POST',
    path: '/api/v1/adv/enter',
    config: {
        description: '开始浏览广告',
        tags: ['api'],
        validate: {
            payload: Joi.object({
                token: Joi.string().required().description('token').default('41224d776a326fb40f000001'),
                advId: Joi.string().required().description('advId').default('5be9298a700e3c743c14f6e7'),
            }).label('广告'),
        }
    },
    handler: async (req, res) => {
        const { token,advId } = req.payload;
        const old = await Read.findOne({userId:token,advId});
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


        if(!old){
            const re = await pda(token,advId,1,'浏览');
            if(!re){
                return {
                    code: -1,
                    msg:'浏览失败'
                }
            } 
        }
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
                pda: Joi.number().required().description('浏览奖励PDA').default(1),
                author: Joi.string().required().description('作者').default('author'),
                content: Joi.string().required().description('正文 type-1文字 2图片 3视频').default('[{type:\'1\',data:\'\'}]')
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
            advId
        }).sort({createAt: 'desc'}).populate('userId');
        if(data){
            const arr = [];
            for(const item of data){
                console.log(item)
                arr.push({
                    name:item.userId.nickname,
                    content:item.content,
                    date:new Date(item.createAt).getTime(),
                    dateStr:Global.getTimeStr(item.createAt,'MM-DD HH:mm')
                })
            }
            return {
                code: 0,
                msg: '查询成功',
                data:arr
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
                advId: Joi.string().required().description('广告ID').default('41224d776a326fb40f000001'),
                content: Joi.string().required().description('评论内容').default('content'),
            }).label('评论')
        }
    },
    handler: async (req, res) => {
        try {
            const { token,advId,content } = req.payload;
            const oldComment = await Comment.findOne({userId:token,advId});
            const user = await User.findOne({_id:token});
            if(!user){
                return {
                    code: -1,
                    msg: '无效的token'
                }
            }
            const adv = await Adv.findOne({_id:advId});
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
            if(!data){
                return {
                    code: -1,
                    msg:'评论失败'
                }
            }
            if(!oldComment){
                const re = await pda(token,advId,2,'评论');
                if(!re){
                    return {
                        code: -1,
                        msg:'评论失败'
                    }
                }
            }
            return {
                code: 0,
                msg: '评论成功',
                id:data._id
            } 
        } catch (error) {
            return {
                code: -1,
                msg: '评论失败'+error,
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
        const adv = await Adv.findOne({_id:advId});
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
        read.favoriteAt = new Date();

        const data = await read.save();
 
        const re = await pda(token,advId,1,'收藏');
        if(!re){
            return {
                code: -1,
                msg:'收藏失败'
            }
        } 


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
        const old = await Read.findOne({ userId:token,advId,shared:true });
        let read = await Read.findOne({ userId:token,advId });
        if(read){
            read.shared = true;
        }else{
            read = new Read({
                userId:token,
                advId,
                shared:true,
            })
        }
        const data = await read.save();

        if(!old){
            const re = await pda(token,advId,1,'浏览');
            if(!re){
                return {
                    code: -1,
                    msg:'分享失败'
                }
            } 
        }

        
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
}, {
    method: 'POST',
    path: '/api/v2/adv/detail',
    config: {
        description: '广告详情V2',
        tags: ['api'],
        validate: {
            payload: Joi.object({
                advId: Joi.string().required().description('广告ID').default('5be9298a700e3c743c14f6e7'),
                token: Joi.string().required().description('token').default('41224d776a326fb40f000001'),
            }).label('广告'),
        }
    },
    handler: async (req, res) => {
        let failMsg = '';
        try {
            const { advId,token } = req.payload;
            const item = await Adv.findOne({ _id:advId });
            if(item){
                const f1 = await Read.find({userId:token,advId,favorited:true});
                const r1 = await Read.find({advId:item._id});
                const data ={
                    pda:item["pda"],
                    author:item["author"],
                    content:item["content"],
                    createAt:Global.getTimeStr( item["createAt"],'YYYY-MM-DD HH:mm'),
                    _id:item["_id"],
                    title:item["title"],
                    favorited:f1.length > 0,
                    reads:r1.length,
                };
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
}]

module.exports = adv;