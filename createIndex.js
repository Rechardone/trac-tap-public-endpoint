// 引入 Express 框架
const express = require('express');
const MempoolApi = require('./libs/MempoolApi');
const { mysqlBuilder, query, saveObjToTable } = require("./libs/mysql")
const { sleep,ThreadPool } = require("./libs/utils")

// 创建 Express 应用程序
const app = express();

// 定义一个路由处理 GET 请求
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/test', (req, res) => {
  // Test(834514)
  // example()
  res.send('Hello, World!');
});


async function example() {
  const threadPool = new ThreadPool(30);
  const promises = [];
  let arrayData = Array.from({ length: 100 }, (_, index) => index);

  for (let i = 0; i < 834633; i++) {
    await threadPool.enqueue(async () => Test(i, 5));
  }
}

async function Test(numdata, sleepTime) {
  let mempoolApi = new MempoolApi("https://n.lualu.io:8888/api/")
  // let mempoolApi = new MempoolApi("https://mempool.space/api", "socks://192.168.2.161:1081")
  dataHash = await mempoolApi.getBlockHashByHeight(numdata)

  // dataHash = await mempoolApi.getBlockHashByHeight(834514)
  console.log("getTxOutspends 1 ", dataHash);
  blockContent = await mempoolApi.getBlock(dataHash)
  console.log("getTxOutspends 2 ", blockContent)
  const hexadecimalNumber = blockContent.bits.toString(16);
  blockContent.dbits = hexadecimalNumber
  console.log("getTxOutspends 3 ", blockContent)
  TestMysql(blockContent)

  // await sleep(sleepTime);
  // const blockTransactions = await  mempoolApi.getTransactions(dataHash);
  // console.log('getTxOutspends 4 ', blockTransactions) 
}

async function TestMysql(data1) {
  await mysqlBuilder({ host:"localhost", database:"mg_db", user:"root"})

  try {
  save1 = await saveObjToTable(data1, 'block_data') 
  console.info(save1 )
} catch(error) {
  console.error("An error occurred:", error.message);
}

}

async function TestMysql2(data2) {
  await mysqlBuilder({ host:"localhost", database:"mg_db", user:"root"})
  await saveObjToTable()
  console.info(results )

}
// 启动服务器，监听端口
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


async function CheckHeight() {
  await mysqlBuilder({ host:"localhost", database:"mg_db", user:"root"})
  try {
    const queryMissingIds = `
  SELECT a.id
  FROM all_ids a
  LEFT JOIN block_data b ON a.id = b.id
  WHERE b.id IS NULL;
`;
    save1 = await query(queryMissingIds)
    console.info(save1 )
  } catch(error) {
    console.error("An error occurred:", error.message);
  }
  
}


// example()