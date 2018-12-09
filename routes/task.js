const Joi = require('joi');
const Task = require('../models/Task');
const TaskHistory = require('../models/TaskHistory');
const moment = require('moment');

const History = require('../models/History');
const User = require('../models/User');

async function pda(token,taskId,pda,desc){
    const user1 = await User.findOne({_id:token});
    const user2 = await User.findOne({userName:'yanglh'});

    user1.pda = user1.pda + pda;
    user2.pda = user2.pda - pda;
    const r1 = await user1.save();
    const r2 = await user2.save();
    console.log(r1,r2)

    if(!r1 || !r2){
        return false;
    }
    const history = new History({
        userId:token,
        taskId,
        pda,
        desc,
        createAt:new Date()
    });
    console.log(r1,r2)

    const data = await history.save();
    if(!data){
        return false;
    }
    console.log(data)
    return true;
}

const task = [
    {
        method: 'POST',
        path: '/api/v1/task/list',
        config:{
            description:'任务列表',
            tags:['api'],
            validate: {
                payload: Joi.object({
                    token: Joi.string().required().description('token').default('5be8d85bc362044bb27e0f58'),
                }).label('广告'),
            }
        },
        handler: async (res,req) => {
            const { token } = res.payload;
            const result = await Task.find().sort({createAt: 'asc'});
            const todayStr = moment().format('YYYY-MM-DD');
            const tomorrowStr = moment().add(1, 'days').format('YYYY-MM-DD');
            if(result){
                const data = [];
                for(const item of result){
                    const history = await TaskHistory.find({
                        taskId:item._id,
                        userId:token,
                        doneAt:{"$gte": new Date(todayStr), "$lt": new Date(tomorrowStr)}
                    });
                    data.push({
                        taskId: item._id,
                        pda: item.pda,
                        title: item.title,
                        desc: item.desc,
                        done:history.length>0
                    })
                }
                return {
                    code: 0,
                    msg: '查询成功',
                    data
                };
            }else{
                return {
                    code: -1,
                    msg: '查询失败',
                };
            }
        }
    },{
        method: 'POST',
        path: '/api/v1/task/do',
        config:{
            description:'完成任务',
            tags:['api'],   
            validate: {
                payload: Joi.object({
                    token: Joi.string().required().description('token').default('5be8d85bc362044bb27e0f58'),
                    taskId: Joi.string().required().description('任务ID').default('5c075e2548cda181071b3e66'),
                }).label('任务'),
            }
        },
        handler: async (res,req) => {
            const { token, taskId } = res.payload;
            const tUser = await User.findOne({_id:token});
            if(!tUser){
                return {
                    code: -1,
                    msg: '无效的用户',
                }
            }

            const tTask = await Task.findOne({_id:taskId});
            if(!tTask){
                return {
                    code: -1,
                    msg: '无效的任务',
                }
            }

            const todayStr = moment().format('YYYY-MM-DD');
            const tomorrowStr = moment().add(1, 'days').format('YYYY-MM-DD');
            const data = await TaskHistory.find({
                taskId,
                userId:token,
                doneAt:{"$gte": new Date(todayStr), "$lt": new Date(tomorrowStr)}
            });
            if(data.length>0){
                return {
                    code: -1,
                    msg: '任务已完成，请勿重复点击',
                }
            }

            

            const re = await pda(token,taskId,1,'任务');
            if(!re){
                return {
                    code: -1,
                    msg:'完成任务失败'
                }
            } 

            const history = new TaskHistory({
                userId: token,
                taskId,
                doneAt: new Date()
            });
            const result = history.save();
      
            if(result){

                
                return {
                    code: 0,
                    msg: '完成任务',
                    data: result
                }
            }
            return {
                code: -1,
                msg: '完成任务失败'
            };
    }
}
]

module.exports = task;