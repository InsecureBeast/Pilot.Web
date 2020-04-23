import { Injectable } from '@angular/core';
import { ICommonSettings } from '../../../core/data/data.classes';


export class TaskFiltersProvider {

  commonFilters = new Map<string, string>();
  personalFilters = new Map<string, string>();

  constructor(settings: ICommonSettings) {
    const dic = new CsvToDictionaryConverter();
    this.commonFilters = dic.parse(settings.common);
    this.personalFilters = dic.parse(settings.personal);
  }
}

export class CsvToDictionaryConverter {

  private columnDelimiter: string = '|';
  private isEscapingValues: boolean = false;

  parse(csv: string): Map<string, string> {

    const result = new Map<string, string>();
    if (!csv)
      return result;

    const scvString = csv + "".trim();

    const lines = scvString.split("\n");
    for (let line of lines) {
      const pair = line.split(this.columnDelimiter);
      let count = 0;
      const key = pair[0];
      const value = pair[1];

      if (!key)
        continue;

      while (result.get(key)) {
        const resultValue = result[key];
        if (!value) {
          // TODO
          continue;
        }

        if (resultValue.indexOf(value.trim()) !== -1) {
          pair[0] = null;
          break;
        }

        count++;
        pair[0] = key + "(" + count + ")";
      }

      if (!pair[0])
        continue;


      result.set(pair[0].trim(), value);
    }

    return result;
  }
}
