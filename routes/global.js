const moment = require('moment');

function getTimeStr(t){
    const time  = moment(t).valueOf();
    const now  = new Date().getTime();
    // console.log(t,now,time);
    let str = moment(t).format('MM月DD日 HH:mm')

    if(now-time <= 3600000*24){
      str = Math.ceil((now-time)/3600000) +'小时前';
    }
    return str;
}

module.exports = {
  getTimeStr
};