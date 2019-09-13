import { Injectable } from '@angular/core';
import { BitcoinScript } from './bitcoin-script.service';
import { HttpClient } from '@angular/common/http';
import {
  UTXOResponse,
  Network,
  FeeReference,
  TXReceipt,
  TXResponse,
  TXOutput,
  conversion,
  Speed,
  UTXO,
} from './types';
import { Buffer } from 'buffer';
import { map } from 'rxjs/operators';

/**
 * The BigNumber Dependency
 */
const Big = require('big.js');

namespace Blockcypher {
  export interface Input {
    prev_hash: string, output_index: number, script: string,
    output_value: number, sequence: number, addresses: string[],
    script_type: string, age: number
  };

  export interface Output {
    value: number, script: string, addresses: string[] | null,
    script_type: string, data_hex?: string
  };

  export interface UTXO {
    tx_hash: string, block_height: number, tx_input_n: number,
    tx_output_n: number, value: number, ref_balance: number,
    spent: boolean, confirmations: number, confirmed: string, double_spend: boolean
  };
}

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
  ) { }

  /**
   * Get Unspent Output of a bitcoin address
   * @param address The Bitcoin Address
   * @param network Bitcoin Network
   */
  public async unspents(address: string, network: Network = 'BTCTEST') {
    const net = network === 'BTC' ? 'main' : 'test3';
    return this.http.get<{
      address: string, total_received: number, total_sent: number,
      balance: number, unconfirmed_balance: number, final_balance, n_tx: number,
      unconfirmed_n_tx: number, final_n_tx: number,
      tx_url: string, unconfirmed_txrefs?: Blockcypher.UTXO[],
      txrefs?: Blockcypher.UTXO[]
    }>(`https://api.blockcypher.com/v1/btc/${net}/addrs/${address}?unspentOnly=true`)
    .pipe(map(x => {
      console.log(x);
      // If the account does not have confirmed UTXO, the application will use the unconfirmed one.
      // Just to be sure use all confirmed UTXO first
      // reference: https://github.com/LedgerHQ/ledger-wallet-chrome/issues/61
      if (!x.txrefs) {
        if (x.unconfirmed_txrefs) x.txrefs = x.unconfirmed_txrefs;
        else x.txrefs = [];
      }
      let txs: UTXO[] = x.txrefs.map(a => {
        return {
          txid: a.tx_hash,
          output_no: a.tx_output_n,
          value: a.value.toString(),
          confirmations: a.confirmations,
        }
      });

      if (txs.length == 0) throw new Error('Account contain zero UTXO!');

      return {
        status: 'success',
        data: { network, address, txs, }
      }
    }))
    .toPromise<UTXOResponse>();

  }

  /**
   * Get Reference Fee
   * @param data The Sending Data
   * @param network Bitcoin Network
   */
  public async fee(data: Buffer | number, speed: Speed) {
    const reference = await this.feeReference();
    const len = data instanceof Buffer ? data.length : data;
    return len * reference[`${speed}Fee`];
  }

  public async feeReference() {
    return this.http.get<FeeReference>(`https://bitcoinfees.earn.com/api/v1/fees/recommended`).toPromise();
  }

  /**
   * Broadcast Transaction
   * @param hex The Raw Transaction
   * @param network Bitcoin Network
   */
  public async broadcast(hex: string, network: Network = 'BTCTEST') {
    const net = network === 'BTC' ? 'main' : 'test3';
    const data = { tx: hex };
    return this.http.post<{ tx: {
      block_height: number, hash: string, addresses: string[],
      total: number, fees: number, size: number, preference: string,
      relayed_by: string, received: string, ver: number, lock_time: number,
      double_spend: boolean, vin_sz: number, vout_sz: number,
      confirmations: number, inputs: Blockcypher.Input[],
      output: Blockcypher.Output[],
    } }>(`https://api.blockcypher.com/v1/btc/${net}/txs/push`, data)
      .pipe(map(x => {
        return {
          status: 'success',
          data: {
            network, txid: x.tx.hash
          }
        }
      }))
      .toPromise<TXReceipt>();
  }

  /**
   * Get Transaction Output
   * @param txid The Transaction ID
   * @param network Bitcoin Network
   */
  public async tx(txid: string, network: Network = 'BTCTEST') {
    const net = network === 'BTC' ? 'main' : 'test3';

    return this.http.get<{
      block_hash: string, block_height: number, hash: string,
      addresses: string[], total: number, fees: number, size: number,
      preference: string, confirmed: string, received: string,
      ver: number, double_spend: boolean, vin_sz: number, vout_sz: number,
      data_protocol: string, confirmations: number, confidence: number,
      inputs: Blockcypher.Input[],
      outputs: Blockcypher.Output[]
    }>(`https://api.blockcypher.com/v1/btc/${net}/txs/${txid}`)
      .pipe(map(x => {
        let outputs: TXOutput[] = x.outputs.map((a, i) => {
          return {
            output_no: i, value: a.value.toString(), addresses: a.addresses,
            type: a.script_type, script: a.script
          }
        });

        return {
          status: 'success',
          data: {
            network, txid, outputs
          }
        }
      }))
      .toPromise<TXResponse>();
  }

  /**
   * Get The Hex Data Of The Null Data Transaction
   * @param outputs Transaction Outputs
   */
  public getData(outputs: TXOutput[]) {
    // Caution : null-data is just for Blockcypher API
    const output = outputs.find(x => x.type === 'null-data');
    if (!output) throw new Error('No OP_RETURN Output found');
    // Blockcypher Modification : Hex script to Assembly Script
    const script = BitcoinScript.Script.toAsm(Buffer.from(output.script, 'hex'));
    console.log(script);
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
    if (typeof satoshi !== 'number') {
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
    if (typeof bitcoin !== 'number') {
      throw new TypeError('toSatoshi must be called on a number or string, got ' + typeof bitcoin);
    }

    const bigBitcoin = new Big(bitcoin);
    return Number(bigBitcoin.times(conversion));
  }
}
