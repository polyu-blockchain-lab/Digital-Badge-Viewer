import { Component } from '@angular/core';
import { Network, Proof, ProofService, UtilService, ExplorerService } from '../services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Buffer } from 'buffer';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastController } from '@ionic/angular';

interface State {
  name: string;
  value: any;
};

interface Verification {
  index: number;
  states: State[];
};

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent {

  /**
   * The bi-directional binding for Bitcoin Network Selection
   */
  public network: Network = "BTCTEST";

  /**
   * The Verify Form Group
   * The bi-directional binding for Badge Image
   */
  public verifyForm: FormGroup;

  /**
   * The bi-directional binding for Badge Image
   */
  public image: Buffer;

  /**
   * The bi-directional binding for Badge Image Source
   */
  public source: string;

  /**
   * The bi-directional binding for Badge Proof
   */
  public proof: Proof;

  public state: Verification;

  /**
   * Inject required providers.
   * @param proofs The Timestamping Proofing Service Provider
   * @param forms The Form Control Provider
   * @param modals The Bootstrap Modal Provider
   */
  constructor(
    public proofs: ProofService, public forms: FormBuilder,
    public modals: NgbModal, public toast: ToastController,
    public explorer: ExplorerService,
  ) {
    this.reset();
    this.verifyForm = this.forms.group({
      floatLabel: 'auto',
      image: [
        undefined,
        [Validators.required]
      ],
      file: [
        undefined,
        [Validators.required]
      ]
    });
  }

  /**
   * Select a Proof file and validate the proof with root hash on public blockchain.
   */
  public async toProof(content) {
    this.reset();
    this.modals.open(content, {
      centered: true,
      windowClass: 'modal-holder',
      backdrop: 'static',
    });
    try {
      // Check Local Files
      if (!this.image) {
        throw new Error('Please Upload Your Badge Image');
      }
      this.change(0, '👍');
      if (!this.proof) {
        throw new Error('Please Upload Your Badge Proof File');
      }
      this.change(1, '😄');

      // Get Transaction
      const tx = await this.explorer.tx(this.proof.tx, this.network);
      await this.sleep(1000);
      this.change(2, this.network === "BTC" ? "Bitcoin Mainnet" : "Bitcoin Testnet");

      // TODO: Check Signature here
      await this.sleep(1000);
      this.change(3, "PolyU");

      const result = await this.proofs.verify(tx, this.proof, this.image);
      await this.sleep(1500);
      // const result = await this.proofs.proofing(this.image, this.proof, this.network);
      if (result) {
        this.change(4, '✅');
      } else {
        throw new Error('Invalid Root Hash');
      }
    } catch (e) {
      if (this.state.index < this.state.states.length - 1 && this.state.index > 0)
        this.change(this.state.index + 1, false);
      else
        this.change(this.state.index, false);
      UtilService.toasting(this.toast, e.message ? e.message : e);
    }
  }

  /**
   * Update Binding Data when File Input Changed
   * @param key The File Input Key
   * @param e The File Input Event
   */
  public async onFileChange(key: 'image' | 'proof', e) {
    const file: File = e.target.files[0];
    switch (key) {
      case 'image':
        if (!file) return delete this.image;
        const buffer = await UtilService.readFile(file) as ArrayBuffer;
        this.source = URL.createObjectURL(file);
        this.image = UtilService.toBuffer(buffer);
        break;
      case 'proof':
        if (!file) return delete this.proof;
        const text = await UtilService.readFile(file, true) as string;
        this.proof = JSON.parse(text);
        break;
      default: break;
    }
  }

  /**
   * Change Data Of Specified State
   * @param index The State Index
   * @param data The Incoming State Data
   */
  public async change(index: number, data: any) {
    if (index < this.state.index) return UtilService.toasting(this.toast, "Cannot Change Current State to Previous State.");
    this.state.index = index;
    this.state.states[index].value = data;
  }

  /**
   * Reset Verification States
   */
  public async reset() {
    this.state = {
      index: 0,
      states: [
        {
          name: "Valid Image",
          value: undefined,
        },
        {
          name: "Valid Proof File",
          value: undefined,
        },
        {
          name: "Issued on",
          value: undefined,
        },
        {
          name: "Issued by",
          value: undefined,
        },
        {
          name: "VERIFIED",
          value: undefined,
        }
      ],
    }
  }

  /**
   * Delay Function
   * @param m The Deplay Time in ms
   */
  private async sleep(m: number) {
    return new Promise(r => setTimeout(r, m));
  }
}
