import { IFileSnapshot, IObject, IType } from "src/app/core/data/data.classes";
import { SystemAttributes, SystemTypes } from "src/app/core/data/system.types";
import { FilesRepositoryService } from "src/app/core/files-repository.service";
import { RepositoryService } from "src/app/core/repository.service";
import { DateTools } from "src/app/core/tools/date.tools";
import { FilesSelector } from "src/app/core/tools/files.selector";
import { ObjectRemarkParser } from "./object-remark.parser";
import { Remark } from "./remark";
import { RemarkParser } from "./remark.parser";

export interface IRemarksLoader {
    loadRemarks(document: IObject, snapshot: IFileSnapshot, remarks: Remark[]): Promise<void>;
}

export class FilesRemarkLoader implements IRemarksLoader {
    
    constructor(private readonly fileRepository: FilesRepositoryService) {
        
    }

    async loadRemarks(document: IObject, snapshot: IFileSnapshot, remarks: Remark[]): Promise<void> {
        remarks.splice(0, remarks.length);
        
        var remarkFiles = FilesSelector.getRemarkFiles(snapshot.files);
        const parser = new RemarkParser();
        for (const file of remarkFiles) {
            var b = await this.fileRepository.getFileAsync(file.body.id, file.body.size);
            const remark = parser.parseFromArrayBuffer(b);
            remarks.push(remark);
        }
        
        remarks.sort((a, b) => {
            return (DateTools.toDate(a.created).getTime() < DateTools.toDate(b.created).getTime()) ? -1 : 1;
        });
    }
}

export class ObjectRemarksLoader implements IRemarksLoader {
    
    private _remarksFolderType: IType;
    private _remarkType: IType;

    constructor(private repository: RepositoryService) {
        this._remarksFolderType = this.repository.getTypeByName(SystemTypes.DOCUMENT_REMARKS_FOLDER);
        this._remarkType = this.repository.getTypeByName(SystemTypes.DOCUMENT_REMARK);
    }

    async loadRemarks(document: IObject, snapshot: IFileSnapshot, remarks: Remark[]): Promise<void> {
        remarks.splice(0, remarks.length);

        var folders = document.children.filter(x => x.typeId == this._remarksFolderType.id);
        for (const folder of folders) {
            var folderObj = await this.repository.getObjectAsync(folder.objectId);
            let folderRemarks = await this.processFolderAsync(folderObj, snapshot);
            for (const remark of folderRemarks) {
                remarks.push(remark);
            }
        }

        remarks.sort((a, b) => {
            return (DateTools.toDate(a.created).getTime() < DateTools.toDate(b.created).getTime()) ? -1 : 1;
        });
    }

    async processFolderAsync(folderObj: IObject, snapshot: IFileSnapshot): Promise<Remark[]> {
        let remarks = new Array<Remark>();
        let version = folderObj.attributes[SystemAttributes.DOCUMENT_REMARK_VERSION];
        if (! version) {
            return remarks;
        }

        if (!snapshot || !version || version !== snapshot.created) {
            return remarks;
        }

        let currentRemarks = folderObj.children.filter(c => c.typeId == this._remarkType.id).map(c => c.objectId);

        for (const r of currentRemarks) {
            const remarkObj = await this.repository.getObjectAsync(r);
            let remark = this.processRemark(remarkObj);
            if (remark == null) {
                continue;
            }

            remarks.push(remark);
        }

        return remarks;
    }

    processRemark(remarkObj: IObject): Remark {
        const annotationValue = remarkObj.attributes[SystemAttributes.DOCUMENT_REMARK_ANNOTATION];
        if (!annotationValue) {
            return null;
        }

        const parser = new ObjectRemarkParser();
        let remark = parser.parseFromXml(annotationValue);
        if (!remark) {
            return null;
        }

        // TODO is In recyclebin
        //if (annotation.)
        
        return remark;
    }
}