import { Injectable } from '@angular/core';
import { MerkleTree } from './merkle';
import { Proof, Network, TXResponse } from './types';
import { SHA256, lib as crypto, enc } from 'crypto-js';
import { ExplorerService } from './explorer.service';
import * as forge from 'node-forge';


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

  public async verify(tx: TXResponse, proof: Proof, image: Buffer, pubkey: forge.pki.rsa.PublicKey) {
    // Get The Image Hash
    const md = forge.md.sha256.create();
    const str = forge.util.binary.raw.encode(image);
    md.update(str, 'raw');
    const hash = md.digest().toHex();
    console.log(hash);

    const rootHash = this.explorer.getData(tx.data.outputs);
    // Compute Merkle Tree
    const tree = new MerkleTree([], SHA256);
    const valid = tree.verify(proof.proofs, hash, rootHash);
    if (!valid) throw new Error('Computed an invalid Root Hash');

    // Verify Signature from Badge Signer
    const signed = pubkey.verify(md.digest().bytes(), forge.util.hexToBytes(proof.signature));
    if (!signed) throw new Error('Invalid Signature');
    console.log(signed);

    // Verify Tree
    return valid && signed;
  }

  /**
   * Select Proof File and Proof with Data on Public Blockchain
   */
  public async proofing(image: Buffer, proof: Proof, pubKey: forge.pki.rsa.PublicKey, network: Network = 'BTCTEST') {
    // Get Hash Root By TXID
    const tx = await this.explorer.tx(proof.tx, network);
    return this.verify(tx, proof, image, pubKey);
  }
}
