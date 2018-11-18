const moment = require('moment');

function getTimeStr(t,f){
    const time  = moment(t).valueOf();
    const now  = new Date().getTime();
    // console.log(t,now,time);
    let str = moment(t).format(f)

    if(now-time <= 3600000*24){
      str = Math.ceil((now-time)/3600000) +'小时前';
    }
    return str;
}

module.exports = {
  getTimeStr
};