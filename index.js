const express=require('express');
const path=require('path');
const app=express();
const cheerio = require('cheerio');
const axios = require('axios');
var Promise = require('bluebird');

var parentURL='https://portal.minesandsteel.gov.ng/';
var url1=`https://portal.minesandsteel.gov.ng/MarketPlace/MiningTitle/SearchAll?sEcho=2&iColumns=7&sColumns=%2C%2C%2C%2C%2C%2C&iDisplayStart=`;
var url2=`&iDisplayLength=10&mDataProp_0=Operator&sSearch_0=&bRegex_0=false&bSearchable_0=true&bSortable_0=true&mDataProp_1=Type&sSearch_1=&bRegex_1=false&bSearchable_1=true&bSortable_1=true&mDataProp_2=License&sSearch_2=&bRegex_2=false&bSearchable_2=true&bSortable_2=true&mDataProp_3=State&sSearch_3=&bRegex_3=false&bSearchable_3=true&bSortable_3=true&mDataProp_4=NumberOfCUs&sSearch_4=&bRegex_4=false&bSearchable_4=true&bSortable_4=true&mDataProp_5=ExpiryDate&sSearch_5=&bRegex_5=false&bSearchable_5=true&bSortable_5=true&mDataProp_6=Link&sSearch_6=&bRegex_6=false&bSearchable_6=true&bSortable_6=false&sSearch=&bRegex=false&iSortCol_0=0&sSortDir_0=asc&iSortingCols=1&_=1582216691424`;
var urlList=[];
var linkArray=[];
var dataArray=[];

app.get('/fetch',(req,res)=>{
    for(var i=10001;i<10218;i+=10){
    urlList.push({urls:url1+i+url2});
    }
  
  Promise.map(urlList,async (url)=>{
      //console.log('url:',url.urls);
      return ssData = await axios(url.urls)
      .then(resp=>{
        const html=resp.data;
        
        html.aaData.forEach((data)=>{
          let sLink=data["Link"].slice(9,46);
          var fLink=sLink;
          if(sLink.substr(sLink.length-1)=="'"){    
            var fLink=sLink.slice(0,sLink.length-1);    
          }
          
          linkArray.push(fLink);
        }
        );//close forEach
        
      })
      .catch((err)=>{
        console.log(err);
      });
      
    })//close promise map
    .then(()=>{
      for(var i=0;i<linkArray.length;i++){
        let tt=parentURL+linkArray[i].toString();
        console.log(tt);
        axios(tt)
        .then((resultData)=>{
          const $ = cheerio.load(resultData.data);
          var fg=$(".dl-horizontal>dd").toArray().map((x)=>{
            return $(x).text();
          });
          var mnrl=$("table>tbody>tr>td:nth-child(2)").toArray().map((m)=>{
            return $(m).text();
          })
          if(Array.isArray(fg)){
              var dd=fg.concat(mnrl);
              console.log(dd);
              dataArray.push(dd);
          }    
      })
      .catch((errtt)=>{
        console.log(errtt);
      });
      }
      console.log(dataArray);
    })
    .then(()=>{
      console.log('reached final');
      res.send(dataArray);
    })
    .catch((err1)=>{
      console.log(err1);
    })
  })//close app.get
app.get('/',(req,res)=>{
  res.send('working');
})

app.listen(8080);
console.log('server running on Port 8080');
