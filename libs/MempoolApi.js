const axios = require("axios");
const https = require("https");
const { SocksProxyAgent } = require("socks-proxy-agent");

class MempoolApi {
  constructor(baseURL, proxy = null) {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      timeout: 10000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // 忽略证书验证
      }),
    });

    // Set up SOCKS5 proxy if provided
    if (proxy) {
      const agent = new SocksProxyAgent(proxy);
      this.axiosInstance.defaults.agent = agent;
    }
  }

  async axiosWithRetry(url, retries = 3) {
    try {
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      if (retries <= 0) {
        console.error(`Max retries reached for ${url}:`, error);
        return null;
      }
      console.warn(`Retrying ${url}, remaining attempts: ${retries - 1}`);
      return this.axiosWithRetry(url, retries - 1);
    }
  }
  /**
   * 获取地址信息
   * @param {*} address
   * @returns
   * {
      address: '地址',
      chain_stats: {
        funded_txo_count: 31,
        funded_txo_sum: 14383732,
        spent_txo_count: 2,
        spent_txo_sum: 1000000,
        tx_count: 31
      },
      mempool_stats: {
        funded_txo_count: 0,
        funded_txo_sum: 0,
        spent_txo_count: 0,
        spent_txo_sum: 0,
        tx_count: 0
      }
    }
   */
  async getAddress(address) {
    return this.axiosWithRetry(`${this.baseURL}/address/${address}`);
  }

  /**
   * 获取地址交易
   * @param {*} address
   * @returns
   */
  async getAddressTxs(address) {
    return this.axiosWithRetry(`${this.baseURL}/address/${address}/txs`);
  }
  /**
   * 获取地址UTXO
   * @param {*} address
   * @returns
   */
  async getAddressTxsUtxo(address) {
    return this.axiosWithRetry(`${this.baseURL}/address/${address}/utxo`);
  }
  // Fetch latest block height
  async getLatestBlockHeight() {
    return this.axiosWithRetry(`${this.baseURL}/blocks/tip/height`);
  }

  /**
   * 按高度获取区块HASH
   * @param {*} height
   * @returns
   */
  async getBlockHashByHeight(height) {
    return this.axiosWithRetry(`${this.baseURL}/block-height/${height}`);
  }

  /**
   * 获取区块信息
   * @param {*} blockHash
   * @returns
   */
  async getBlock(blockHash) {
    return this.axiosWithRetry(`${this.baseURL}/block/${blockHash}`);
  }

  // 获取区块的所有交易
  async getTransactions(blockHash) {
    return this.axiosWithRetry(`${this.baseURL}/block/${blockHash}/txids`);
  }

  // 获取单条HASH交易信息
  async getTx(txid) {
    return this.axiosWithRetry(`${this.baseURL}/tx/${txid}`);
  }

  // 获取HASH对应的UTXO是否使用
  async getTxOutspends(txid) {
    return this.axiosWithRetry(`${this.baseURL}/tx/${txid}/outspends`);
  }
    /**
   * 获取多个区块信息
   * @param {*} height
    * @returns
   */
  // https://mempool.space/api/v1/blocks/100
  async getBlocksByHeight(height) {
    return this.axiosWithRetry(`${this.baseURL}/blocks/${height}`);
  }
}

module.exports = MempoolApi;
