import { Buffer } from 'buffer';
import { ToastController, LoadingController, AlertController } from "@ionic/angular";

/**
 * Helper Utilities
 */
export class UtilService {
  /**
   * Create a Load Spinner on Page
   * @param loader The Page's Loading Controller
   * @param backdrop Show Backdrop (default show)
   * @param message Loading Message (Optional)
   */
  public static async loading(loader: LoadingController, backdrop: boolean = true) {
    const load = await loader.create({ showBackdrop: backdrop });
    load.present();
    return load;
  }

  /**
   * Create a Toast Message on Page
   * @param toast The Page's Toast Controller
   * @param message Toast Message
   * @param position Toast Appear Position
   * @param duration Toast Appear Duration
   */
  public static async toasting(toast: ToastController, message, position: 'bottom' | 'top' | 'middle' = 'bottom', duration: number = 3000) {
    const obj = await toast.create({ message, position, duration });
    obj.present();
    return;
  }

  /**
   * Create a Alert Message on Page
   * @param alert The Page's Alert Controller
   * @param title Alert Title
   * @param message Alert Message
   */
  public static async alerting(alert: AlertController, title: string, message: string) {
    const obj = await alert.create({ message, header: title });
    obj.present();
    return;
  }

  /**
   * File Reader Promisify Function
   * @param file The File Blob
   * @param text Indicate the specified file is text file or binary file
   */
  public static readFile(file: File, text: boolean = false) {
    return new Promise<string | ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      }

      if (text) reader.readAsText(file);
      else reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Transform Array Buffer to NodeJS Buffer
   * @param data The Array Buffer Data
   */
  public static toBuffer(data: ArrayBuffer) {
    var buf = Buffer.alloc(data.byteLength);
    var view = new Uint8Array(data);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
  }
}
