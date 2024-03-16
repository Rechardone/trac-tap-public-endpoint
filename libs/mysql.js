// 代码保存到单独的 js 文件

const mysql = require('mysql2/promise')

const debug = true
let conn

/**
 * 执行 SQL 语句
 * @param {String} sql
 * @param {*} params
 * @returns {Array}
 */
const query = (sql, params)=> {
    if(!conn)  throw Error(`数据库连接未创建，请配置 useDB、dbName 属性...`)
    debug && console.debug("[SQL]", sql, "[PARAMS]",Array.isArray(params)?params[0]:(params||"（无）"))
    return conn.query(sql, params)
}

exports.query = query

/**
 * 创建 mysql 连接（使用连接池）
 * @param {import('.').ServerConfig} config
 * @returns
 */
exports.mysqlBuilder = async config=> {
    if(!!conn)  return
	
    conn = mysql.createPool({
        host: config.host || 'localhost',
        port: config.port || 3306,
        user: config.user || 'root',
        password: config.pwd || '',
        database: config.database,

        waitForConnections: true,
        connectionLimit: 10,
        idleTimeout: 180 * 1000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    })

    return conn
}

exports.closeMysql = async ()=> {
  if(!!conn)  return
  conn.end(function(err) {
    if (err) {
      console.log("Error closing connection: " + err.message);
    } else {
      console.log("Connection closed successfully.");
    }
  });
}
/**
 * 返回指定的sql结果数量
 * @param {String} table - 表名
 * @param {String} condition - 条件 SQL
 * @returns {Number}
 */
exports.count = async (table, condition, params) => {
    let [ results ] = await query(`SELECT COUNT(*) FROM ${table} WHERE ${condition}`, params)
    return Number(results[0])
}

/**
 * 按 ID 查询数据（单条）
 * @param {String} id
 * @param {String} table
 * @param {String} idField - ID字段名，默认 id
 * @returns {Object}
 */
exports.findById= async (id, table, idField="id")=>{
    let [ results ] = await query(`SELECT * FROM ${table} WHERE ${idField}=? LIMIT 1`, id)
    return results[0]
}


/**
 * 保存数据到指定表
 * @param {Object} obj - 待保存对象（默认取全部的字段，排除_开头）
 * @param {String} table - 表名
 * @param {Array<String>} ignores - 忽略的字段
 * @returns
 */
exports.saveObjToTable = async (obj, table, ignores=[])=>{
    let fields = Object.keys(obj).filter(k=> !(k.startsWith("_")  || ignores.includes(k)))
    let [ results ] = await query(`INSERT INTO ${table} (${fields.join(",")}) VALUES (${fields.map(v=>'?').join(",")})`, fields.map(v=> obj[v]))

    return results
}

/**
 * 将对象保存到指定数据表
 * @param {Object} obj - 待保存对象（默认取全部的字段，排除_开头）
 * @param {String} table - 表名
 * @param {String} idField - 主键字段名
 * @param {Array<String>} ignores - 忽略的字段
 * @returns
 */
exports.updateObjToTable = async (obj, table, idField="id", ignores=[])=>{
    let fields = Object.keys(obj).filter(k=> !(k!=idField, k.startsWith("_")  || ignores.includes(k) || obj[k]===undefined))
    let [ results ] = await query(
        `UPDATE ${table} set ${fields.map(f=>`${f}=?`).join(",")} WHERE ${idField}=?`,
        fields.concat(idField).map(v=> obj[v])
    )
    return results
}

/**
 * 将对象的某个字段进行 JSON 处理
 * @param {Object} obj - 待处理对象
 * @param {Array<String>} fields - 待转换的属性清单
 * @param {Boolean} toString - 转换为字符串，false=反序列到JSON对象
 */
exports.dealJSONField = (obj, fields, toString = true)=> {
    if(typeof(obj) == 'object'){
        fields
            .filter(k=> k in obj)
            .forEach(k=> obj[k] = toString ? JSON.stringify(obj[k]) : JSON.parse(obj[k]))
    }
    return obj
}


exports.saveMutiObjToTable = async (objList, table, ignores=[])=>{
  let fields = Object.keys(objList[0]).filter(k=> !(k.startsWith("_")  || ignores.includes(k)))
  resultsList = []
  for (let item of objList) {
  result =  await query(`INSERT INTO ${table} (${fields.join(",")}) VALUES (${fields.map(v=>'?').join(",")})`, fields.map(v=> item[v]))
  resultsList.push(result)
}
  return resultsList
}