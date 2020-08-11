import { Injectable } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { HttpHeaders } from "@angular/common/http";

export enum RequestType {
    New = 0,
    FromCache = 1
  }

@Injectable({ providedIn: 'root' })
export class HeadersProvider {
  private _requestType: RequestType = RequestType.New;
  
  constructor(private authService: AuthService) {
  }

  set requestType(value: RequestType) {
    this._requestType = value;
  }
  get requestType(): RequestType {
    return this._requestType;
  }

  getHeaders(): HttpHeaders {
      const requestHeader = this.getRequestTypeHeader();
      return this.getHeadersWithType('application/json', requestHeader);
  }

  getStreamHeaders(): HttpHeaders {
    return this.getHeadersWithType('application/octet-stream', '');
  }
  
  private getRequestTypeHeader() : string {
    if (this.requestType === RequestType.New)
      return "new";
    if (this.requestType === RequestType.FromCache)
      return "fromCache";

    return "";
  }

  private getHeadersWithType(accept: string, requestHeader: string): HttpHeaders {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Accept': accept,
      'Authorization': "Bearer " + token,
      'Content-Type': accept,
      'RequestType': requestHeader
    });
    return headers;
  }
}