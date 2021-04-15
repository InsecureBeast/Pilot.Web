import { Component, OnInit, Input } from '@angular/core';
import { IIfcNode, IIfcNodeProperty, IIfcNodePropertySet } from '../shared/bim-data.classes';
import { BimModelService } from '../shared/bim-model.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-bim-node-properties',
  templateUrl: './bim-node-properties.component.html',
  styleUrls: ['./bim-node-properties.component.css']
})
export class BimNodePropertiesComponent implements OnInit {

  private ngUnsubscribe = new Subject<void>();

  properties: IIfcNodeProperty[];

  @Input()
  set node(value: IIfcNode) {
    this.updateProperties(value);
  }

  constructor(private readonly bimModelService: BimModelService) {
    this.properties = new Array<IIfcNodeProperty>();
  }

  ngOnInit(): void {
  }

  private async updateProperties(node: IIfcNode): Promise<void> {
    this.properties = new Array<IIfcNodeProperty>();
    const propertySets = await this.bimModelService.getNodePropertiesAsync(node, this.ngUnsubscribe);
    propertySets.forEach(set => {
      set.properties.forEach(property => {
        this.properties.push(property);
      });
    });
  }
}
