import { DatePipe } from '@angular/common';

export class DateTools {
    static toUtcCsDateTime(scDateTime: string): Date {
        const utcTime = new Date(Date.parse(scDateTime + 'Z'));
        return utcTime;
    }

    static toLocalDateTime(scDateTime: string, currentLang: string, format: string = 'short'): string {
        if (!DateTools.checkUndefined(scDateTime)) {
            return undefined;
        }

        const utcDate = DateTools.toUtcCsDateTime(scDateTime);
        const datePipe = new DatePipe(currentLang);
        return datePipe.transform(utcDate, format);
    }

    static dateToString(scDateTime: string, currentLang: string, format: string = 'short'): string {
        if (!DateTools.checkUndefined(scDateTime)) {
            return undefined;
        }

        const date = new Date(Date.parse(scDateTime));
        const datePipe = new DatePipe(currentLang);
        return datePipe.transform(date, format);
    }

    static checkUndefined(scDateTime: string): boolean {
        if (scDateTime === '9999-12-31T23:59:59.9999999') {
            return false;
        }

        if (scDateTime === '9999-12-31T20:59:59.9999999') {
            return false;
        }

        if (scDateTime === '0001-01-01T00:00:00') {
            return false;
        }

        return true;
    }
}
