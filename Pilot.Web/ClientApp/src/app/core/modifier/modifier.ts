import { ObjectBuilder } from "./object.builder";
import { RepositoryService } from "../repository.service";
import { Change } from "./change";
import { Observable } from "rxjs";

export class Modifier {
    private builders: Map<string, ObjectBuilder>;

    constructor(private readonly repository: RepositoryService) {
        this.builders = new Map<string, ObjectBuilder>();
    }

    edit(objectId: string) : ObjectBuilder {
        if (this.builders.has(objectId)){
            return this.builders.get(objectId);
        }
        const builder = new ObjectBuilder(objectId);
        this.builders.set(objectId, builder);
        return builder;
    }

    apply() : Observable<any> {
        const changes = new Array<Change>();
        this.builders.forEach(b => {
            changes.push(b.getChange());
        });
        const s = this.repository.applyChange(changes);
        this.builders.clear();
        return s;
    }
}