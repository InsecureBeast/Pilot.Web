import { TestBed } from '@angular/core/testing';
import { skipWhile } from 'rxjs/operators';
import { NodeStyle, NodeStyleService } from './node-style.service';

describe('NodeStyleService', () => {
  let service: NodeStyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeStyleService);

    let store = {};
    const mockLocalStorage = {
        getItem: (key: string): string => {
            return key in store ? store[key] : null;
        },
        setItem: (key: string, value: string) => {
            store[key] = `${value}`;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set node style', () => {
    // when
    service.setNodeStyle(NodeStyle.GridView);
    // then
    expect(localStorage.getItem('nodeStyle')).toEqual('1');

    // when
    service.setNodeStyle(NodeStyle.ListView);
    // then
    expect(localStorage.getItem('nodeStyle')).toEqual('0');
  });

  it('should get node style', () => {
    // then
    service.getNodeStyle().pipe(skipWhile(v => v === 0)).subscribe(style => {
        expect(style).toBe(NodeStyle.GridView);
    });

    // when
    service.setNodeStyle(NodeStyle.GridView);
  });
});
