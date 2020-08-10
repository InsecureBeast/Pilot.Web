import { SafeUrl, DomSanitizer } from "@angular/platform-browser";
import { Tools } from "../../core/tools/tools";

export class ToolbarItem {

  title: string;
  icon: SafeUrl;
  
  constructor(title: string, icon: string,  sanitizer: DomSanitizer) {
    this.title = title;
    this.icon = Tools.getSvgImage(icon, sanitizer);    
  }
}