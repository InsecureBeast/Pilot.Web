import { Injectable } from "@angular/core";
import { IType } from "src/app/core/data/data.classes";
import { SystemTypes } from "src/app/core/data/system.types";
import { FilesRepositoryService } from "src/app/core/files-repository.service";
import { RepositoryService } from "src/app/core/repository.service";
import { FilesRemarkLoader, IRemarksLoader, ObjectRemarksLoader } from "./remarks.loader";

@Injectable({ providedIn: 'root' })
export class RemarksLoaderFactory {

    private remarksType: IType;

    constructor(
        private readonly fileRepository: FilesRepositoryService, 
        private readonly repository: RepositoryService) {
            this.remarksType = this.repository.getTypeByName(SystemTypes.DOCUMENT_REMARK);
    }

    createLoader(): IRemarksLoader {
        if (this.remarksType) {
            return new ObjectRemarksLoader(this.repository);
        }
        else {
            return new FilesRemarkLoader(this.fileRepository);
        }
    }
}