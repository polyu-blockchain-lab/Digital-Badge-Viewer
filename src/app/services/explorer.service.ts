import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  UTXOResponse,
  Network,
  FeeReference,
  TXReceipt,
  TXResponse,
  TXOutput,
  conversion,
} from './types';
import { Buffer } from 'buffer';

/**
 * The BigNumber Dependency
 */
import * as Big from 'big.js';

/**
 * Explorer service provider.
 * Used for communicate with blockchain public RPC and broadcast transactions.
 */
@Injectable()
export class ExplorerService {

  /**
   * Inject required providers
   * @param http The HTTP Request Client
   */
  constructor(
    private http: HttpClient
  ) {}

  /**
   * Get Unspent Output of a bitcoin address
   * @param address The Bitcoin Address
   * @param network Bitcoin Network
   */
  public async unspents(address: string, network: Network = 'BTCTEST') {
    return this.http.get<UTXOResponse>(`https://chain.so/api/v2/get_tx_unspent/${network}/${address}`)
      .toPromise<UTXOResponse>();
  }

  /**
   * Get Reference Fee
   * @param data The Sending Data
   * @param network Bitcoin Network
   */
  public async fee(data: Buffer, speed: 'fastest' | 'halfHour' | 'hour') {
    const reference = await this.http.get<FeeReference>(`https://bitcoinfees.earn.com/api/v1/fees/recommended`).toPromise();
    return data.length * reference[`${speed}Fee`];
  }

  /**
   * Broadcast Transaction
   * @param hex The Raw Transaction
   * @param network Bitcoin Network
   */
  public async broadcast(hex: string, network: Network = 'BTCTEST') {
    const data = new FormData();
    data.append('tx_hex', hex);
    return this.http.post<TXReceipt>(`https://chain.so/api/v2/send_tx/${network}`, data)
      .toPromise();
  }

  /**
   * Get Transaction Output
   * @param txid The Transaction ID
   * @param network Bitcoin Network
   */
  public async tx(txid: string, network: Network = 'BTCTEST') {
    return this.http.get<TXResponse>(`https://chain.so/api/v2/get_tx_outputs/${network}/${txid}`)
      .toPromise();
  }

  /**
   * Get The Hex Data Of The Null Data Transaction
   * @param outputs Transaction Outputs
   */
  public getData(outputs: TXOutput[]) {
    const output = outputs.find(x => x.type === 'nulldata');
    if (!output) throw new Error('No OP_RETURN Output found');
    const script = output.script;
    const data = script.split('OP_RETURN ');
    if (data.length <= 1) throw new Error('Invalid TX Script from Null Data Output');
    return data[1];
  }

  /**
   * Convert Satoshi to Bitcoin
   * @param {number|string} satoshi Amount of Satoshi to convert. Must be a whole number
   * @throws {TypeError} Thrown if input is not a number or string
   * @throws {TypeError} Thrown if input is not a whole number or string format whole number
   * @returns {number}
   */
  public static toBitcoin(satoshi: string | number) {
    //validate arg
    if (typeof satoshi === 'string') {
      satoshi = Number(satoshi);
    }
    if (typeof satoshi !== 'number'){
      throw new TypeError('toBitcoin must be called on a number or string, got ' + typeof satoshi);
    }

    if (!Number.isInteger(satoshi)) {
      throw new TypeError('toBitcoin must be called on a whole number or string format whole number');
    }

    const bigSatoshi = new Big(satoshi);
    return Number(bigSatoshi.div(conversion));
  }

  /**
   * Convert Bitcoin to Satoshi
   * @param {number|string} bitcoin Amount of Bitcoin to convert
   * @throws {TypeError} Thrown if input is not a number or string
   * @returns {number}
   */
  public static toSatoshi(bitcoin: string | number) {
    //validate arg
    if (typeof bitcoin === 'string') {
      bitcoin = Number(bitcoin);
    }
    if (typeof bitcoin !== 'number'){
      throw new TypeError('toSatoshi must be called on a number or string, got ' + typeof bitcoin);
    }

    const bigBitcoin = new Big(bitcoin);
    return Number(bigBitcoin.times(conversion));
  }
}
