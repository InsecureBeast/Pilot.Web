import { UrlSerializer, UrlTree, DefaultUrlSerializer } from '@angular/router';

export class CustomUrlSerializer implements UrlSerializer {
    parse(url: any): UrlTree {
        const dus = new DefaultUrlSerializer();
        return dus.parse(url);
    }

    serialize(tree: UrlTree): string {
        const dus = new DefaultUrlSerializer();
        const path = dus.serialize(tree);
        // use your regex to replace as per your requirement.
        let newPath = path;
        newPath = newPath.replace(/%3F/g, '?');
        newPath = newPath.replace(/%3D/g, '=');
        newPath = newPath.replace(/%2F/g, '/');
        return newPath;
    }
}
