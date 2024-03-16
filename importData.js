// 引入 Express 框架
const express = require('express');
const MempoolApi = require('./libs/MempoolApi');
const { mysqlBuilder, query, saveObjToTable,saveMutiObjToTable, closeMysql } = require("./libs/mysql")
const { sleep,ThreadPool } = require("./libs/utils")

let mempoolApi = new MempoolApi("https://n.lualu.io:8888/api/")
let missHeightId = []
const threadPool = new ThreadPool(100);
mysqlBuilder({ host:"localhost", database:"mg_db", user:"root"})

async function MutiImportIndexForBlocks() {
   GetLastedHeight().then( height => {
    console.log(height)
    findMissingIds(height).then(() =>{
      if(missHeightId.length > 1000 ){
        for (let i = 0; i < missHeightId.length+10; i+=10) {
          threadPool.enqueue(async () => ImportIndexForBlocks(i));
         }
      }else{
        console.log(missHeightId)
        missHeightId.forEach( element => {
          threadPool.enqueue(async () => ImportIndexForBlock(element));
        })
      }

    })
    

  }).then(
    () => {
      closeMysql()

    }
  )

}


async function findMissingIds(height) {
  try {
    // 设置期望 ID 范围
    const startId = 0;
    const endId = height;

    // 删除临时表（如果存在）并创建临时表和插入数据
    await query('DROP TEMPORARY TABLE IF EXISTS all_ids');
    await query('CREATE TEMPORARY TABLE all_ids (id INT)');
    const insertQuery = 'INSERT INTO all_ids (id) VALUES ' + Array.from({ length: endId - startId + 1 }, (_, i) => `(${startId + i})`).join(',');
    await query(insertQuery);

    // 查询缺失的 ID
    const queryMissingIds = `
      SELECT a.id
      FROM all_ids a
      LEFT JOIN block_data b ON a.id = b.height
      WHERE b.id IS NULL;
    `;
    const [missingIds] = await query(queryMissingIds);

    // 打印缺失的 ID
    console.log('Missing IDs:');
    missingIds.forEach(row => {
      // console.log(row.id);
      missHeightId.push(row.id)
    });
  } catch (error) {
    console.error('Error:', error);
  }
};


async function GetLastedHeight() {
  let height = await mempoolApi.getLatestBlockHeight()
  return height
}
async function ImportIndexForBlocks(height) {

  dataHash = await mempoolApi.getBlocksByHeight(height)
  dataHash.forEach(element => {
    const hexadecimalNumber = element.bits.toString(16);
    element.dbits = hexadecimalNumber
  })

  insertBlockToMysql(dataHash)
  
  // await sleep(sleepTime);
  // const blockTransactions = await  mempoolApi.getTransactions(dataHash);
  // console.log('getTxOutspends 4 ', blockTransactions) 
}

async function ImportIndexForBlock(height) {
    Hash = await mempoolApi.getBlockHashByHeight(height)
    dataHash = await mempoolApi.getBlock(Hash)
    console.log(dataHash)
    const hexadecimalNumber = dataHash.bits.toString(16);
    dataHash.dbits = hexadecimalNumber
    try {
      save1 = await saveObjToTable(dataHash, 'block_data') 
    }
    catch(error) {
      console.error("An error occurred:", error.message);
    }
}


async function insertBlockToMysql(data1) {
  try {
  // save1 = await saveObjToTable(data1, 'block_data') 
  saveResult = await saveMutiObjToTable(data1, 'block_data')
  console.info(saveResult )
} catch(error) {
  console.error("An error occurred:", error.message);
}

}



// MutiImportIndexForBlocks()
// findMissingIds(834645)
setInterval(MutiImportIndexForBlocks, 60000);