import { SafeUrl, DomSanitizer } from "@angular/platform-browser";
import { Tools } from "../../core/tools/tools";
import { EventEmitter } from "@angular/core";

export class ToolbarItem {

  title: string;
  icon: SafeUrl;
  source: any;
  event: EventEmitter<any>;
  
  constructor(title: string, icon: string, source: any, sanitizer: DomSanitizer) {
    this.title = title;
    this.icon = Tools.getSvgImage(icon, sanitizer);
    this.source = source;
  }
}
