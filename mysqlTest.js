const mysql = require('mysql2');

// 创建 MySQL 数据库连接
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mg_db'
});

// 创建blockDetail

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');

  // 创建表格，
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS block_data (
      id VARCHAR(64) UNIQUE,
      height INT,
      version BIGINT,
      timestamp BIGINT,
      tx_count INT,
      size INT,
      weight INT,
      merkle_root VARCHAR(64),
      previousblockhash VARCHAR(64),
      mediantime BIGINT,
      nonce BIGINT,
      bits BIGINT,
      difficulty BIGINT,
      dbits VARCHAR(10),
      INDEX difficulty_index (difficulty)

    )
  `;
  
// 创建blockDetail，并写入
  connection.query(createTableQuery, (error, results, fields) => {
    if (error) {
      console.error('Error creating table in MySQL:', error);
      return;
    }
    console.log('Table created in MySQL');

    // 插入数据
    const data = {
      id: '0000000000000000000071923ef5a18dc17d47717fae386296dfe8902414ea71',
      height: 834514,
      version: 805298176,
      timestamp: 1710337707,
      tx_count: 3270,
      size: 1620530,
      weight: 3993659,
      merkle_root: 'd2741bd191e392c61f7266d5085b771002f9553df9a109f9b9f16f3f4b49976b',
      previousblockhash: '00000000000000000002e48bd3ad74468e76eee117abf560410df1bf65b415d6',
      mediantime: 1710335383,
      nonce: 3433590084,
      bits: 386108434,
      difficulty: 79351228131136,
      dbits: '17038c12'
    };

    connection.query('INSERT INTO block_data SET ?', data, (error, results, fields) => {
      if (error) {
        console.error('Error inserting data into MySQL:', error);
        return;
      }
      console.log('Data inserted into MySQL');
      
      // 关闭数据库连接
      connection.end();
    });
  });
// 创建 blockTransaction , 并写入
// createTableQuery2
const createTableQuery2 = `
CREATE TABLE IF NOT EXISTS block_transaction (
  id VARCHAR(64),
  height INT,
  transaction VARCHAR(64) UNIQUE
)
`;
connection.query(createTableQuery2, (error, results, fields) => {
  if (error) {
    console.error('Error creating table2 in MySQL:', error);
    return;
  }
  console.log('Table2 created in MySQL');

  // 插入数据
  const data = {
    id: '0000000000000000000071923ef5a18dc17d47717fae386296dfe8902414ea71',
    height: 834514,
    transaction: '33fc56d37b27e3d09f0035bb9dccc411f5fb9bcef7b8f5a99885898324f7086e'
  };

  connection.query('INSERT INTO block_transaction SET ?', data, (error, results, fields) => {
    if (error) {
      console.error('Error inserting data into MySQL:', error);
      return;
    }
    console.log('Data2 inserted into MySQL');

  })
      
    // 关闭数据库连接
  connection.end();
})})
