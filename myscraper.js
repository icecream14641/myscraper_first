var request = require("request");
var cheerio = require("cheerio");

// 台南市的氣溫
var url = "http://house.nfu.edu.tw/NCUE/table.html";
var DATA_LENGTH = 8;
// 取得網頁資料
request(url, function (error, response, body) {
  if (!error) { // 抓取網頁資料 無錯誤的話

    // 用 cheerio 解析 html 資料
    var $ = cheerio.load(body);

    // 篩選有興趣的資料
    // #housetable > table > tbody > tr:nth-child(1) > th:nth-child(1) > label
    // #housetable > table > tbody > tr:nth-child(2) > td:nth-child(4)

    // for(var i=0;i<10;i++){
    //   var map = $("#housetable > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
    //   var type = map.slice(0, 2);
    //   console.log("map = " + map + " type = " + type + " ");
    // }
    //
    // var aa = $("#housetable > table > tbody > tr:nth-child(3) > td:nth-child(2) > a").attr("href");
    // console.log(aa);
    //
    // // 輸出
    // console.log(map);

    // #housetable > table > tbody > tr:nth-child(2) > td:nth-child(2) > a
    // #housetable > table > tbody > tr:nth-child(3) > td:nth-child(2) > a
    // #housetable > table > tbody > tr:nth-child(4) > td:nth-child(2) > a


    var house_url = [];

    for(var i=2;i<DATA_LENGTH + 2;i++){ // 抓取網頁的房屋資料所在網址 共DATA_LENGTH個
      var aa = $("#housetable > table > tbody > tr:nth-child("+ i +") > td:nth-child(2) > a").attr("href");
      house_url.push(aa);
    }

    for(var i=0;i<DATA_LENGTH;i++){ // 一筆一筆抓取
      request(house_url[i], function(err, response, body){
        if(!err){
          $ = cheerio.load(body);

          // register
          var name = $("#info > table:nth-child(1) > tbody > tr:nth-child(18) > td").text();
          console.log("name = " + name);
          var gender = name.slice(1, 3)=="先生" ? "male" : "female";
          console.log("gender = " + gender);
          var phone = $("#info > table:nth-child(1) > tbody > tr:nth-child(20) > td").text();
          console.log("phone = " + phone);
          var addr = $("#info > table:nth-child(1) > tbody > tr:nth-child(2) > td > div").attr("title");
          console.log("addr = " + addr);
          var address = "彰化縣" + addr;
          console.log("address = " + address);

          if(name.length == 0 || gender.length == 0 || phone.length == 0 || addr.length == 0){
            console.log("有一個欄位為0");
          }else{ // 全部欄位都有抓到

            request.post({ // register start
              headers: {'Accept': 'application/json',
                        'Content-Type': 'application/json'},
              url:     'http://test-zzpengg.c9users.io:8080/user/register',
              body:    JSON.stringify({
                         name: name,
                         phone: phone,
                         gender: gender,
                         address: address,
                         account: phone,
                         password: "123456",
                         email: "cfps91177@gmail.com"
                       })
            }, function(error, response, body){
              console.log("response = ");
              console.log(JSON.parse(body));

              if(body.indexOf("success") !== -1){ // if success and to login to have the token
                // solve validation

                request.post({ // set validation all true
                  headers: {'content-type' : 'application/json'},
                  url:     'http://test-zzpengg.c9users.io:8080/user/allTrue',
                }, function(error, response, body){
                  console.log( JSON.parse(body) );

                  // login
                  request.post({ // login
                    headers: {'Accept': 'application/json',
                              'Content-Type': 'application/json'},
                    url:     'http://test-zzpengg.c9users.io:8080/user/login',
                    body:    JSON.stringify({
                               account: phone,
                               password: "123456"
                             })
                  }, function(error, response, body){ // login functioin
                    console.log("login = ");
                    console.log(JSON.parse(body) );
                    body = JSON.parse(body);

                    // to check token
                    console.log("token = " + body.token);
                    var token = body.token;

                    // create house_data
                    var title = addr.slice(3);
                    console.log("title = " + title);
                    var type = $("#info > table:nth-child(1) > tbody > tr:nth-child(6) > td:nth-child(1)").text().slice(0, 2);
                    console.log("type = " + type);
                    var rent = $("#info > table:nth-child(1) > tbody > tr:nth-child(6) > td:nth-child(3)").text().slice(2, 6);
                    console.log("rent = " + rent);
                    var addition = $("#info > table:nth-child(1) > tbody > tr:nth-child(9) > td").text().trim();
                    console.log("addition = " + addition);

                    var checknet = addition.indexOf("網路") == -1 ? true : false ;
                    var checkele = addition.indexOf("電") == -1 ? true : false ;
                    var checkwater = addition.indexOf("水") == -1 ? true : false;
                    console.log("丸子三兄弟 = " + checknet + " " + checkele + " " + checkwater);
                    var remark = $("#info > table:nth-child(1) > tbody > tr:nth-child(16) > td").text().trim();
                    console.log("remark = " + remark);
                    var area = "進德";

                    var vacancy_temp = $("#info > table:nth-child(1) > tbody > tr:nth-child(6) > td:nth-child(2)").text().split("/");
                    console.log("va_temp = " + vacancy_temp);
                    vacancy = vacancy_temp[1].slice(2, 3);
                    console.log("vacancy = " + vacancy);

                    request.post({ // create start
                      headers: {'content-type' : 'application/json', 'x-access-token' : token},
                      url:     'http://test-zzpengg.c9users.io:8080/house/createMyHouse',
                      body:    JSON.stringify({
                                title: title,
                                area: area,
                                address: address,
                                vacancy: vacancy,
                                rent: rent,
                                checknet: checknet,
                                checkele: checkele,
                                checkwater: checkwater,
                                type: type,
                                remark: remark
                              })
                    }, function(error, response, body){
                      // console.log(response);
                    }); // create end
                  }); // login end
                }); // set validation all true end
              } // success register end
            });// register end
          }// else 全部欄位都有抓到end
        }else{
          console.log("擷取錯誤2：" + error);
        }
      });
    } // for 迴圈 針對 每個房屋資料的處理
  } else { // 抓取網頁資料 發生錯誤
    console.log("擷取錯誤：" + error);
  }
});
