const { mysqlBuilder, query,  closeMysql } = require("./libs/mysql")

const elementDict = {
  "0": "block_hash"
  , "1": "size"
  , "2": "strippedsize"
  , "3": "weight"
  , "4": "height"
  , "5": "version"
  , "6": "versionHex"
  , "7": "merkleroot"
  , "8": "time"
  , "9": "mediantime"
  , "10": "nonce"
  , "11": "dbits"
  , "12": "difficulty"
  , "13": "chainwork"
  , "14": "nTx"
  , "15": "hex"
  , "16": "txid"
  , "17": "tx_hash"
  , "18": "size"
  , "19": "vsize"
  , "20": "weight"
  , "21": "version"
  , "22": "locktime"
  , "23": "blocktime"
  , "24": "asm"
  , "25": "hex"
  , "26": "sequence"
  , "27": "txinwitness"
  , "28": "value"
  , "29": "n"
  , "30": "asm"
  , "31": "hex"
  , "32": "reqSigs"
  , "33": "type"
  , "34": "witness"
  , "35": "btc_fee"
  , "36": "is_coinbase"
  , "37": "coinbase"
}
// const elementDataList = ["44.44.11.element"]
// http://localhost:3000/api/checkfield?checkStr=44.44.11.element

// 获取 field 与匹配的 pattern
function getStructFromElement( element ) {``
  let elementList = element.split('.');
  let length = elementList.length
  if (length == 4){
    let pattern = elementList[1]
    // pattern = parseInt(pattern).toString(16);
    let field = elementList[2].toString()
    let filedValue = elementDict[field]
    return [filedValue,  pattern ]

  } else if( length == 3){
    let pattern = "*"
    let field = elementList[1]
    console.log(field)
    let filedValue = elementDict[field]
    console.log(filedValue)
    return []
  } else {
    return []
  }

}


async function checkElementDataByStruct(struct) {
  try {
    field = struct[0]
    pattern = struct[1]
    let matchDataQuery = `
    SELECT *
    FROM block_data `;
    if (pattern != '*') {
      matchDataQuery = `
      SELECT *
      FROM block_data 
      WHERE ` + field +` REGEXP '` + pattern +`' ;`;
    }

    const [matchData] = await query(matchDataQuery);
    console.log('match data:');
    // matchData.forEach(row => {
    //   console.log(row); 
    // });
    return matchData

  } catch(error) {
    console.log('match Error:', error)
  }
}


const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  
  
  // 检查请求路径是否为 /api
  if (reqUrl.pathname === '/api/checkfield') {
    const queryData = reqUrl.query;
    
    // 添加一个名为 param 的参数
    const paramValue = queryData.checkStr;
    console.log(paramValue)

    // 设置响应头
    res.writeHead(200, {'Content-Type': 'application/json'});
    mysqlBuilder({ host:"localhost", database:"mg_db", user:"root"})

    struct = getStructFromElement(paramValue)

    checkElementDataByStruct(struct).then(checkfield => {
          // 构造响应数据
      const responseData = {
        data: checkfield,
        code: 200
        
      };
          // 发送响应数据
          closeMysql()
    res.end(JSON.stringify(responseData));
    })

  } else {
    // 如果请求路径不是 /api，则返回 404 Not Found
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 Not Found');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://192.168.2.52:${port}/`);
});