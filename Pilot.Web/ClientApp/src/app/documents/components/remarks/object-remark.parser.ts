import { XmlParser, Element } from "@angular/compiler";
import { parseBoolean } from "src/app/core/tools/tools";
import { Remark } from "./remark";
import { PencilData, Rect, TextStickyNoteData, XmlParserBase } from "./remark.parser";

export class ObjectRemarkParser extends XmlParserBase {
    
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
                const xmlData = this.getFirstOrDefaultChildText(child);
                let parser = RemarkDataParserFactory.parseFromXml(xmlData);
                if (!parser){
                    continue;
                }

                let data = parser.parse();
                remark.data =  data;
                if (data instanceof TextStickyNoteData){
                    remark.position.left = data.fixedTextRange.left;
                    remark.position.top = data.fixedTextRange.top;
                }
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

class PencilDataParser extends XmlParserBase {

    constructor(private readonly container: Element) {
        super();
    }

    parse(): PencilData {
        let pencilData = new PencilData();
        if (!this.container){
            return pencilData;
        }
        let children = this.container.children.filter(a => a instanceof Element) as Element[];
        for (const child of children) {
            if (child.name === 'Geometry') {
                let data = this.getFirstOrDefaultChildText(child);
                data = this.replaceInvalidCharactersForGeometryData(data);
                pencilData.geometry = data;
            } 
            if (child.name === 'Color') {
                const color = this.getFirstOrDefaultChildText(child);
                pencilData.color =  color.replace('#FF', '#');
            }
            if (child.name === 'IsStraightLine') {
                const isStraightLine = this.getFirstOrDefaultChildText(child);
                pencilData.isStraightLine =  parseBoolean(isStraightLine);
            } 
            if (child.name === 'IsTextNoteVisible') {
                const isTextNoteVisible = this.getFirstOrDefaultChildText(child);
                pencilData.isTextNoteVisible =  parseBoolean(isTextNoteVisible);
            } 
        }

        return pencilData;
    }
}

class TextStickiNoteParser extends XmlParserBase {
    constructor(private readonly container: Element) {
        super();
    }
    parse(): TextStickyNoteData {
        var data = new TextStickyNoteData();
        if (!this.container){
            return data;
        }
        let children = this.container.children.filter(a => a instanceof Element) as Element[];
        for (const child of children) {
            if (child.name === 'FixedTextRange') {
                const fixedTextRange = this.getFirstOrDefaultChildText(child);
                let points = fixedTextRange.split(',');
                data.fixedTextRange = new Rect();
                data.fixedTextRange.left = parseFloat(points[0]);
                data.fixedTextRange.top = parseFloat(points[1]);
                data.fixedTextRange.right = parseFloat(points[2]);
                data.fixedTextRange.bottom = parseFloat(points[3]);
            } 
        }

        return data;
    }
}

class RemarkDataParserFactory {
    static parseFromXml(xml: string): any {
        const pr = new XmlParser().parse(xml, '');
        const container = <Element>pr.rootNodes[1];
        if (!container)
            return null;
        if (container.name == 'PencilData') {
            return new PencilDataParser(container);
        } 
        if (container.name == 'TextStickyNoteData') {
            return new TextStickiNoteParser(container);
        }    

        return null;
    }
}
