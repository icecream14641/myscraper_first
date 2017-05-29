const request = require("request");
const cheerio = require("cheerio");

const DATA_LENGTH = 8;

let createHouse = async( $, addr, token) => {
  let title = addr.slice(3);
  console.log("title = " + title);
  let type = $("#info > table:nth-child(1) > tbody > tr:nth-child(6) > td:nth-child(1)").text().slice(0, 2);
  console.log("type = " + type);
  let rent = $("#info > table:nth-child(1) > tbody > tr:nth-child(6) > td:nth-child(3)").text().slice(2, 6);
  console.log("rent = " + rent);
  let addition = $("#info > table:nth-child(1) > tbody > tr:nth-child(9) > td").text().trim();
  console.log("addition = " + addition);

  let checknet = addition.indexOf("網路") == -1 ? true : false ;
  let checkele = addition.indexOf("電") == -1 ? true : false ;
  let checkwater = addition.indexOf("水") == -1 ? true : false;
  console.log("丸子三兄弟 = " + checknet + " " + checkele + " " + checkwater);
  let remark = $("#info > table:nth-child(1) > tbody > tr:nth-child(16) > td").text().trim();
  console.log("remark = " + remark);
  let area = "進德";

  let vacancy_temp = $("#info > table:nth-child(1) > tbody > tr:nth-child(6) > td:nth-child(2)").text().split("/");
  console.log("va_temp = " + vacancy_temp);
  vacancy = vacancy_temp[1].slice(2, 3);
  console.log("vacancy = " + vacancy);

  request.post({ // create start
    headers: {'content-type' : 'application/json', 'x-access-token' : token},
    url:     'http://test-zzpengg.c9users.io:8080/house/createMyHouse',
    body:    JSON.stringify({
              title: title,
              area: area,
              address: '彰化縣'+addr,
              vacancy: vacancy,
              rent: rent,
              checknet: checknet,
              checkele: checkele,
              checkwater: checkwater,
              type: type,
              remark: remark
            })
  }, function(error, response, body){
    if(!error){
      console.log("success");
    }else{
      console.log("failure");
    }

  }); // create end
}

let login = async($, addr, phone) => {
  request.post({
    headers: {'Accept': 'application/json',
              'Content-Type': 'application/json'},
    url:     'http://test-zzpengg.c9users.io:8080/user/login',
    body:    JSON.stringify({
               account: phone,
               password: "123456"
             })
  }, async(error, response, body) => {
    let token = JSON.parse(body).token;
    await createHouse( $, addr, token);
  })
}

let allTrue = async() => {
  request.post({
    headers: {'content-type' : 'application/json'},
    url:     'http://test-zzpengg.c9users.io:8080/user/allTrue',
  }, async(error, response, body) => {

  })
}

let register = async(name, gender, phone, address) => {
  request.post({
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
  }, async(error, response, body) => {
    if(body.indexOf("success") !== -1){
      console.log("register success");
    }else{
      console.log("register not success");
    }
  })
}

let getDetail = async(url) => {
  request(url, async(error, response, body) => {
    if(!error){
      let $ = cheerio.load(body);
      $ = cheerio.load(body);
      // get the data detail
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
        await register(name, gender, phone, address);
        await allTrue();
        await login($, addr, phone)
      }
    }
  })
}


let getData = async() => {
  let url = "http://house.nfu.edu.tw/NCUE/table.html";
  request(url, async(error, response, body) => {
    if(!error){
      let $ = cheerio.load(body);
      let house_url = [];
      for(let i=2;i<DATA_LENGTH + 2;i++){ // 抓取網頁的房屋資料所在網址 共DATA_LENGTH個
        var aa = $("#housetable > table > tbody > tr:nth-child("+ i +") > td:nth-child(2) > a").attr("href");
        house_url.push(aa);
      }
      for(let i=0;i<DATA_LENGTH;i++){
        await getDetail(house_url[i]);
      }
    }else{
      console.log("抓取網頁資料錯誤");
    }
  })
}

getData();
