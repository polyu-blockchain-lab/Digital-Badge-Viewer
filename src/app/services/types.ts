/**
 * Image File Hash
 */
export interface FileHash {
  path?: string;

  /**
   * The Image File Name
   */
  image: string;

  /**
   * The Image File Hash
   */
  hash: string;

  /**
   * The Image File Signature based on the hash
   */
  signature: string;

  /**
   * The Leave Index in the Merkle Tree
   */
  index: number;
};

/**
 * Proof Data of Image File
 */
export interface Proof extends FileHash {
  /**
   * The Transaction ID on public blockchain
   */
  tx: string;

  /**
   * Merkle Tree's Proof Data
   */
  proofs: { position: string, data: string }[];

  /**
   * The Signed Merkle Tree's Root Hash
   */
  signature: string;
};

/**
 * The Conversion rate of Satoshi and Bitcoin
 */
export const conversion = 100000000;

/**
 * Network type Defining the Bitcoin Network
 */
export type Network = 'BTC' | 'BTCTEST';

/**
 * Fee Speed Defined from Fee Reference
 */
export type Speed = 'fastest' | 'halfHour' | 'hour';

/**
 * The Transaction Fee Reference Interface.
 */
export interface FeeReference {
  /**
   * The Fastest Fee per byte in satoshi
   */
  fastestFee: number;

  /**
   * The est. half hour fee per byte in satoshi
   */
  halfHourFee: number;

  /**
   * The est. hour fee per byte in satoshi
   */
  hourFee: number;
};

/**
 * The Transaction Estimation Interface.
 */
export interface FeeEstimation {
  /**
   * The Transaction Output
   */
  output: number;

  /**
   * The Transaction Fee per Byte
   */
  fee: number;

  /**
   * The Total Transaction Fee
   */
  total: number;
};

/**
 * The UTXO Interface
 */
export interface UTXO {
  /**
   * The TX ID
   */
  txid: string;

  /**
   * UTXO Output Index
   */
  output_no: number;

  /**
   * Total Value of UTXO
   */
  value: string;

  /**
   * Block confirmations on the UTXO
   */
  confirmations: number;
};

/**
 * The UTXO Resposne from API
 */
export interface UTXOResponse {
  /**
   * API Response Indicator
   */
  status: string;

  /**
   * API Response Data
   */
  data: {
    /**
     * The Blockchain Network
     */
    network: string;

    /**
     * The TX Address
     */
    address: string;

    /**
     * The UTXO Transactions
     */
    txs: UTXO[];
  };
};

/**
 * The TX Receipt after submitting TX.
 */
export interface TXReceipt {
  /**
   * API Response Indicator
   */
  status: string;

  /**
   * API Response Data
   */
  data: {
    /**
     * The Blockchain Network
     */
    network: string;

    /**
     * The TX ID
     */
    txid: string;
  };
};

/**
 * The Output of a TX.
 */
export interface TXOutput {
  /**
   * The Output Index
   */
  output_no: number;

  /**
   * The Total Output Value
   */
  value: string;

  /**
   * The recepient Address
   */
  addresses: string[];

  /**
   * TX Type
   */
  type: string;

  /**
   * TX Assembly Script
   */
  script: string;
};

/**
 * Transaction API Response
 */
export interface TXResponse {
  /**
   * API Response Indicator
   */
  status: string;

  /**
   * API Response Data
   */
  data: {
    /**
     * The Blockchain Network
     */
    network: string;

    /**
     * The TX ID
     */
    txid: string;

    /**
     * Transaction Outputs
     */
    outputs: TXOutput[];
  }
};
