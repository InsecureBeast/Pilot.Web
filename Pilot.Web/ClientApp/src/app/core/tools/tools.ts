import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

export class Tools {

  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  static getImage(base64: string, type: string, sanitizer: DomSanitizer): SafeUrl {
    const imageSrc = this.getUnsafeImage(base64, type);
    const source = sanitizer.bypassSecurityTrustUrl(imageSrc);
    return source;
  }

  static getUnsafeImage(base64: string, type: string): string {
    const imageSrc = 'data:image/' + type + ';base64,' + base64;
    return imageSrc;
  }

  static getSvgImage(base64: string, sanitizer: DomSanitizer): SafeUrl {
    return this.getImage(base64, 'svg+xml;charset=utf-8', sanitizer);
  }

  static toUtcCsDateTime(scDateTime: string): Date {
    const utcTime = new Date(Date.parse(scDateTime + 'Z'));
    return utcTime;
  }

  static toLocalDateTime(scDateTime: string, currentLang: string, format: string = 'short'): string {
    if (scDateTime === '9999-12-31T23:59:59.9999999') {
      return undefined;
    }

    if (scDateTime === '9999-12-31T20:59:59.9999999') {
      return undefined;
    }

    if (scDateTime === '0001-01-01T00:00:00') {
      return undefined;
    }

    const utcDate = Tools.toUtcCsDateTime(scDateTime);
    const datePipe = new DatePipe(currentLang);
    return datePipe.transform(utcDate, format);
  }

  static async sleep(ms): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class StringUtils {
  static isNullOrEmpty(value: string) : boolean {
    if (value){
      return value.length === 0;
    }

    return true;
  }
}
