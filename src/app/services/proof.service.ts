import { Injectable } from '@angular/core';
import { MerkleTree } from './merkle';
import { SHA256, lib as crypto, enc } from 'crypto-js';
import { Proof, Network, TXResponse } from './types';
import { ExplorerService } from './explorer.service';
import { Buffer } from 'buffer';

/**
 * File Proof Service Provider.
 */
@Injectable()
export class ProofService {
  /**
   * Inject required providers
   * @param electron The Electron Provider Injection
   * @param explorer The Explorer Provider Injection
   */
  constructor(
    private explorer: ExplorerService,
  ) {}

  public async verify(tx: TXResponse, proof: Proof, image: Buffer) {
    const hash = SHA256(crypto.WordArray.create(image)).toString(enc.Hex);
    const rootHash = this.explorer.getData(tx.data.outputs);
    // Compute Merkle Tree
    const tree = new MerkleTree([], SHA256);
    const valid = tree.verify(proof.proofs, hash, rootHash);

    // Verify Tree
    return valid;
  }

  /**
   * Select Proof File and Proof with Data on Public Blockchain
   */
  public async proofing(image: Buffer, proof: Proof,network: Network = 'BTCTEST') {
    // Get Hash Root By TXID
    const tx = await this.explorer.tx(proof.tx, network);
    return this.verify(tx, proof, image);
  }
}
