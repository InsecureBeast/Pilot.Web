import { Element, XmlParser, Text } from "@angular/compiler";
import { parseBoolean, Tools } from "src/app/core/tools/tools";
import { TextDecoder } from 'text-encoding';
import { Remark } from "./remark";

export class XmlParserBase {
    protected getAttribute(name: string, element: Element): any | null {
        const attr = element.attrs.find(a => a.name === name)
        if (attr) {
            return attr.value; 
        }

        return null;
    }

    protected getFirstOrDefaultChildText(element: Element): string | null {
        if (!element) {
            return null;
        }

        let node = element.children.filter(a => a instanceof Text) as Text[];
        if (node && node.length > 0) {
            return node[0].value;
        }

        return null;
    }

    protected getElement(element: Element, name: string): Element | null {
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

    protected replaceInvalidCharactersForGeometryData(data: string): string {
        if (data.includes(';')) {
            data = Tools.replaceAll(data, ';', ' ');
            data = Tools.replaceAll(data, ',', '.');
            data = Tools.replaceAll(data, 'F1', '');
            data = Tools.replaceAll(data, 'F0', '');
        }
        else {
            data = Tools.replaceAll(data, ',', ' ');
            data = Tools.replaceAll(data, 'F1', '');
            data = Tools.replaceAll(data, 'F0', '');
        }
        return data;
    }
}

export class RemarkParser extends XmlParserBase {

    parseFromXml(xml: string) : Remark {

        let remark = new Remark();
        const pr = new XmlParser().parse(xml, '');
        const annotation = <Element>pr.rootNodes.find(n => (<Element>n).name === "Annotation");
        if (!annotation) {
            console.warn("annotation is undefined")
            console.log(pr);
        }

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

                let visibility = this.getAttribute(':anb:Visibility', child);
            }
            else if (child.name.startsWith(':anb:Data')) {
                let pencilData = new PencilData();
                let data = this.getFirstOrDefaultChildText(child);
                data = this.replaceInvalidCharactersForGeometryData(data);
                pencilData.geometry = data;
                let color = this.getAttribute(':anb:Color', child);
                if (color !== null) {
                    pencilData.color = color.replace('#FF', '#');
                }
                let isStraightLine = this.getAttribute(':anb:IsStraightLine', child);
                pencilData.isStraightLine = parseBoolean(isStraightLine);
                remark.data = pencilData;
            }
            else if (child.name === ':anb:MetaData') {
                const t = this.getAttribute(':anb:Top', child);
                const left = this.getAttribute(':anb:Left', child);
                remark.position.left = parseFloat(left);
                remark.position.top = parseFloat(t);
                
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

export class PencilData {
    geometry: string;
    color: string = '#FF0000';
    isStraightLine: boolean;
    isTextNoteVisible: boolean;
}

export class TextStickyNoteData {
    fixedTextRange: Rect;
}

export class Rect {
    top: number;
    left: number;
    bottom: number;
    right: number;
}
