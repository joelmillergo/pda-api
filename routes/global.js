const moment = require('moment');

function getTimeStr(t,f){
    const time  = moment(t).valueOf();
    const now  = new Date().getTime();
    // console.log(t,now,time);
    let str = moment(t).format(f)
    let diff = 0;
    if(now-time <= 3600000*24){
      diff = (now-time)/3600000;
      str = Math.ceil(diff) +'小时前';
    }
    return str;
}

module.exports = {
  getTimeStr
};