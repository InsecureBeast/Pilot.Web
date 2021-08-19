import { Element, XmlParser, Text } from "@angular/compiler";
import { Tools } from "src/app/core/tools/tools";
import { TextDecoder } from 'text-encoding';
import { Remark } from "./remark";

export class RemarkParserBase {
    protected getAttribute(name: string, element: Element): any {
        const attr = element.attrs.find(a => a.name === name)
        if (attr) {
            return attr.value; 
        }

        return null;
    }

    protected getFirstOrDefaultChildText(element: Element): string {
        if (!element) {
            return null;
        }

        let node = element.children.filter(a => a instanceof Text) as Text[];
        if (node && node.length > 0) {
            return node[0].value;
        }

        return null;
    }

    protected getElement(element: Element, name: string): Element {
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
}

export class RemarkParser extends RemarkParserBase {

    parseFromXml(xml: string) : Remark {

        let remark = new Remark();

        const pr = new XmlParser().parse(xml, '');
        const annotation = <Element>pr.rootNodes[1];
        remark.type = this.getAttribute('Type', annotation);
        remark.id = this.getAttribute('Id', annotation);
        remark.created = this.getAttribute('CreationTime', annotation);
        
        this.fill(annotation, remark);
        return remark;
    }

    parseFromArrayBuffer(buffer: ArrayBuffer) : Remark {
        var enc = new TextDecoder("utf-8");
        const s = enc.decode(buffer);
        return this.parseFromXml(s);
    }

    private fill(element: Element, remark: Remark): void {
        let children = element.children.filter(a => a instanceof Element) as Element[];
        for (const child of children) {
            if (child.name === ':anb:StringAuthor' && !remark.person) {
                remark.person = this.getFirstOrDefaultChildText(child);
            } 
            else if (child.name == ':anb:Text') {
                let text = this.getText(child);
                if (text === null || text === 'null') {
                    text = '';
                } 
                remark.text = text;
            }
            else if (child.name.startsWith(':anb:Data')) {
                let data = this.getFirstOrDefaultChildText(child);
                if (data.includes(';')) {
                    data = Tools.replaceAll(data, ";", " ");
                    data = Tools.replaceAll(data, ",", ".");
                }
                else {
                    data = Tools.replaceAll(data, ",", " ");
                }
                remark.data = data;
            }
            else if (child.name === ':anb:MetaData') {
                const top = this.getAttribute(':anb:Top', child);
                const left = this.getAttribute(':anb:Left', child);
                remark.position.left = parseFloat(left);
                remark.position.top = parseFloat(top);
                
                if (remark.pageNumber === -1) {
                    const pageNumber = this.getAttribute(':anb:PageNumber', child);
                    remark.pageNumber = parseInt(pageNumber);
                }
                
            }
            else if (child.name == ':anb:PageNumber') {
                if (remark.pageNumber === -1) {
                    const element = this.getElement(child, ":anc:Item");
                    const pageNumber = this.getAttribute('Value', element);
                    remark.pageNumber = parseInt(pageNumber);
                }
                
            }
            else {
                this.fill(child, remark);
            }
        }
    }

    private getText(element: Element) : string {
        const base64 = this.getFirstOrDefaultChildText(element);
        var parser = new XmlParser();
        const text = parser.parse(atob(base64), '');
        const root = <Element>text.rootNodes[0];
        const paragraph = this.getElement(root, 'Paragraph');
        if (paragraph != null) {
            let paragraphText = this.getFirstOrDefaultChildText(paragraph);
            if (paragraphText == null) {
                var runElements = paragraph.children.filter(p => p instanceof Element) as Element[];
                const runs = runElements.filter(r => r.name === 'Run') as Element[];
                let remarkText = '';
                for (const run of runs) {
                    const toDecText = this.getFirstOrDefaultChildText(run);
                    const text = decodeURIComponent(escape(toDecText));
                    remarkText += text;
                }
                return remarkText;
            } else {
                const text = decodeURIComponent(escape(paragraphText));
                if (text == null) {
                    return '';
                }
                return text;
            }
        } else {
            const textElement = this.getFirstOrDefaultChildText(root);
            const text = decodeURIComponent(escape(textElement));
            return text;
        }
    }
}

export class ObjectRemarkParser extends RemarkParserBase {
    
    parseFromXml(xml: string) : Remark {

        let remark = new Remark();

        const pr = new XmlParser().parse(xml, '');
        const container = <Element>pr.rootNodes[1];
        if (!container){
            return remark;
        }

        this.fill(container, remark);
        return remark;
    }

    fill(container: Element, remark: Remark) {
        let children = container.children.filter(a => a instanceof Element) as Element[];
        for (const child of children) {
            if (child.name === 'AnnotationId') {
                remark.id = this.getFirstOrDefaultChildText(child);
            } 
            if (child.name === 'PositionX') {
                const left = this.getFirstOrDefaultChildText(child);
                remark.position.left = parseFloat(left);
            }
            if (child.name === 'PositionY') {
                const top = this.getFirstOrDefaultChildText(child);
                remark.position.top = parseFloat(top);
            } 
            if (child.name === 'PageNumber') {
                const pageNumber = this.getFirstOrDefaultChildText(child);
                remark.pageNumber =  parseInt(pageNumber);
            } 
            if (child.name === 'Author') {
                remark.person = this.getFirstOrDefaultChildText(child);
            } 
            if (child.name === 'AuthorId') {
                //const personId = this.getFirstOrDefaultChildText(child);
                //remark.personId =  parseInt(personId);
            }
            if (child.name === 'Kind') {
                const kind = this.getFirstOrDefaultChildText(child);
                remark.type =  kind;
            }  
            // TODO deserialize remark data
            if (child.name === 'Data') {
                const data = this.getFirstOrDefaultChildText(child);
                remark.data =  data;
            }  
            if (child.name === 'Mark') {
                const mark = this.getFirstOrDefaultChildText(child);
                remark.pointer =  mark;
            } 
            if (child.name === 'StatusName') {
                //const statusName = this.getFirstOrDefaultChildText(child);
                //remark.statusName =  statusName;
            }  
        }
    }
}
