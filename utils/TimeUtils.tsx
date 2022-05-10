export function getTimer(lastEditTime: number, placeholder = "0") {
  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var week = day * 7;
  var month = day * 30;
  var curTime = new Date().getTime();//当前的时间戳
  var time = curTime - lastEditTime;
  var result = null;
  if (time < 0) {
    alert("设置的时间不能早于当前时间！");
  } else if (time / month >= 1) {
    result = Math.floor(time / month) + "月前";
  } else if (time / week >= 1) {
    result = Math.floor(time / week) + "周前";
  } else if (time / day >= 1) {
    result = Math.floor(time / day) + "天前";
  } else {
    result = placeholder;
  }
  return result;
}

export function formatDate(date: string) {
  if (date === null || date === "" || date === undefined) {
    return "";
  }
  let year, mouth, day;
  const p1 = date.match("([0-9]{4})[/-]([0-9][0-9]?)[/-]([0-9][0-9]?)");
  if (p1) {
    [year, mouth, day] = p1.slice(1, 4);
    return parseInt(year) + "年" + parseInt(mouth) + "月" + parseInt(day) + "日"
  }
  const p2 = date.match("([0-9][0-9]?)[/-]([0-9][0-9]?)[/-]([0-9]{2})");
  if (p2) {
    [mouth, day, year] = p2.slice(1, 4);
    return "20" + parseInt(year) + "年" + parseInt(mouth) + "月" + parseInt(day) + "日"
  }
  return date;
}