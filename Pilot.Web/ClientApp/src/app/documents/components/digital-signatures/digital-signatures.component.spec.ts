/// <reference path="../../../../../../node_modules/@types/jasmine/index.d.ts" />
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { DigitalSignaturesComponent } from './digital-signatures.component';

let component: DigitalSignaturesComponent;
let fixture: ComponentFixture<DigitalSignaturesComponent>;

describe('digital-signatures component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ DigitalSignaturesComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        });
        fixture = TestBed.createComponent(DigitalSignaturesComponent);
        component = fixture.componentInstance;
    }));

    it('should do something', async(() => {
        expect(true).toEqual(true);
    }));
});