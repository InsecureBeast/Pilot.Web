import { Injectable } from '@angular/core';
import {IAttribute, IPerson, ITransition, IValue } from "../data/data.classes"

export interface ITransitionsManager {
  getAvailableTransitions(attribute: IAttribute, attributes: Map<string, IValue>, person: IPerson): ITransition[];
}

