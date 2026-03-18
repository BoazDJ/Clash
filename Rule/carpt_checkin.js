/*
Surge 签到脚本: CarPT
说明: 
1. 先把脚本添加至 Surge，并配置重写规则。
2. 打开浏览器访问一次 https://carpt.net/attendance.php，提示获取 Cookie 成功。
3. 之后脚本会根据 cron 定时自动签到。
*/

const isGetCookie = typeof $request !== 'undefined';

if (isGetCookie) {
  // 获取 Cookie 逻辑
  if ($request.url.indexOf("attendance.php") > -1) {
    const cookie = $request.headers['Cookie'];
    if (cookie) {
      $persistentStore.write(cookie, "carpt_cookie");
      $notification.post("CarPT", "Cookie 获取成功", "现在可以关闭重写并开启定时签到");
    }
  }
  $done({});
} else {
  // 自动签到逻辑
  const cookie = $persistentStore.read("carpt_cookie");
  if (!cookie) {
    $notification.post("CarPT", "签到失败", "未找到 Cookie，请先手动访问网站获取");
    $done();
  }

  const request = {
    url: "https://carpt.net/attendance.php",
    headers: {
      "Cookie": cookie,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    }
  };

  $httpClient.get(request, function(error, response, data) {
    if (error) {
      $notification.post("CarPT", "签到接口请求失败", error);
    } else {
      if (data.indexOf("已经签到") > -1 || data.indexOf("签到成功") > -1) {
        $notification.post("CarPT", "签到成功", "今天也要加油搬砖哦");
      } else if (data.indexOf("请先登录") > -1) {
        $notification.post("CarPT", "签到失败", "Cookie 已过期，请重新获取");
      } else {
        $notification.post("CarPT", "签到结果未知", "请检查脚本逻辑或网页变动");
      }
    }
    $done();
  });
}
