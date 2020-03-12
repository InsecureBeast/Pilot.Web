import { Injectable } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

@Injectable()
export class Tools {

  public static arrayBufferToBase64(buffer: ArrayBuffer): string {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  public static getImage(base64: string, type: string, sanitizer: DomSanitizer): SafeUrl {
    var imageSrc = 'data:image/' + type + ';base64,' + base64;
    var source = sanitizer.bypassSecurityTrustUrl(imageSrc);
    return source;
  }

  static getSvgImage(base64: string, sanitizer: DomSanitizer): SafeUrl {
    return this.getImage(base64, "svg+xml;charset=utf-8", sanitizer);
  }

  static toUtcCsDateTime(scDateTime: string): Date {
    var utcTime = new Date(Date.parse(scDateTime + "Z"));
    return utcTime;
  }

  static toLocalDateTime(scDateTime: string, currentLang: string, format: string = "short"): string {
    if (scDateTime === "9999-12-31T23:59:59.9999999")
      return null;

    const utcDate = Tools.toUtcCsDateTime(scDateTime);
    const datePipe = new DatePipe(currentLang);
    return datePipe.transform(utcDate, format);
  }
}
