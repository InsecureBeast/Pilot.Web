import { Element, XmlParser, Attribute, Text } from "@angular/compiler";
import { Remark } from "./remark";

export class RemarkParser {

    static parseFromXml(xml: string) : Remark {

        let remark = new Remark();

        const pr = new XmlParser().parse(xml, '');
        const annotation = <Element>pr.rootNodes[1];
        remark.type = this.getAttribute('Type', annotation);
        remark.id = this.getAttribute('Id', annotation);
        remark.created = this.getAttribute('CreationTime', annotation);
        
        this.fill(annotation, remark);
        return remark;
    }

    static parseFromArrayBuffer(buffer: ArrayBuffer) : Remark {
        var enc = new TextDecoder("utf-8");
        const s = enc.decode(buffer);
        return this.parseFromXml(s);
    }

    private static getAttribute(name: string, element: Element): any {
        const attr = element.attrs.find(a => a.name === name)
        if (attr) {
            return attr.value; 
        }

        return null;
    }

    private static getFirstOrDefaultChildText(element: Element): string {
        if (!element) {
            return null;
        }

        let node = element.children.filter(a => a instanceof Text) as Text[];
        if (node && node.length > 0) {
            return node[0].value;
        }

        return null;
    }

    private static getElement(element: Element, name: string): Element {
        let children = element.children.filter(a => a instanceof Element) as Element[];
        for (const child of children) {
            if (child.name === name) {
                return child;
            } else {
                const node = this.getElement(child, name);
                if (node !== null) {
                    return node;
                }
            }
        }

        return null;
    }

    private static fill(element: Element, remark: Remark): void {
        let children = element.children.filter(a => a instanceof Element) as Element[];
        for (const child of children) {
            if (child.name === ':anb:StringAuthor' && !remark.person) {
                remark.person = this.getFirstOrDefaultChildText(child);
            } 
            else if (child.name === ':anb:Text') {
                const base64 = this.getFirstOrDefaultChildText(child);
                var parser = new XmlParser();
                const text = parser.parse(atob(base64), '');
                const root = <Element>text.rootNodes[0];
                const paragraph = this.getElement(root, 'Paragraph');
                let paragraphText = this.getFirstOrDefaultChildText(paragraph);
                if (!paragraphText) {
                    var runElements = paragraph.children.filter(p => p instanceof Element) as Element[];
                    const runs = runElements.filter(r => r.name === 'Run') as Element[];
                    for (const run of runs) {
                        remark.text += this.getFirstOrDefaultChildText(run);
                    }
                } else {
                    remark.text = paragraphText;
                }

                console.log(text);
                //remark.text = atob(base64);
            }
            else if (child.name === ':anb:Data') {
                remark.data = this.getFirstOrDefaultChildText(child);
            }
            else if (child.name === ':anb:MetaData') {
                const top = this.getAttribute(':anb:Top', child);
                const left = this.getAttribute(':anb:Left', child);
                remark.position.left = left;
                remark.position.top = top;
                const pageNumber = this.getAttribute(':anb:PageNumber', child);
                remark.pageNumber = pageNumber;
            }
            else if (child.name == ':anc:Item') {
                const pageNumber = this.getAttribute('Value', child);
                remark.pageNumber = pageNumber;
            }
            else {
                this.fill(child, remark);
            }
        }
    }
}