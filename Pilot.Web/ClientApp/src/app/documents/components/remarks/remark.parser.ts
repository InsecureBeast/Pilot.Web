import { Element, XmlParser, Text } from "@angular/compiler";
import { Tools } from "src/app/core/tools/tools";
import { TextDecoder } from 'text-encoding';
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
            else if (child.name == ':anb:Text') {
                remark.text = this.getText(child);
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
                console.log(remark.type);
                console.log(data);
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

    private static getText(element: Element) : string {
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

// class GeometryToSvgPathConverter {
//     private readonly _ratio;
//     private Parts: string[];
//     public Path: string;

//     public CanvasGeometryToSvgPathReader() : this(Vector2.One)
//     { }

//     public CanvasGeometryToSvgPathReader(Vector2 ratio)
//     {
//         _ratio = ratio;
//         Parts = new List<string>();
//     }

//     public void BeginFigure(Vector2 startPoint, CanvasFigureFill figureFill)
//     {
//         Parts.Add($"M{startPoint.X / _ratio.X} {startPoint.Y / _ratio.Y}");
//     }

//     public void AddArc(Vector2 endPoint, float radiusX, float radiusY, float rotationAngle, CanvasSweepDirection sweepDirection, CanvasArcSize arcSize)
//     {
      
//     }

//     public void AddCubicBezier(Vector2 controlPoint1, Vector2 controlPoint2, Vector2 endPoint)
//     {
//         Parts.Add($"C{controlPoint1.X / _ratio.X},{controlPoint1.Y / _ratio.Y} {controlPoint2.X / _ratio.X},{controlPoint2.Y / _ratio.Y} {endPoint.X / _ratio.X},{endPoint.Y / _ratio.Y}");
//     }

//     public void AddLine(Vector2 endPoint)
//     {
//         Parts.Add($"L {endPoint.X / _ratio.X} {endPoint.Y / _ratio.Y}");
//     }

//     public void AddQuadraticBezier(Vector2 controlPoint, Vector2 endPoint)
//     {
//         //
//     }

//     public void SetFilledRegionDetermination(CanvasFilledRegionDetermination filledRegionDetermination)
//     {
//        //
//     }

//     public void SetSegmentOptions(CanvasFigureSegmentOptions figureSegmentOptions)
//     {
//         //
//     }

//     public void EndFigure(CanvasFigureLoop figureLoop)
//     {
//         Parts.Add("Z");
//     }
// }
