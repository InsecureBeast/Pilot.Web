//class Guid {
//  static newGuid() {
//    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
//      return v.toString(16);
//    });
//  }
//}

//// Example of a bunch of GUIDs
//for (var i = 0; i < 100; i++) {
//  var id = Guid.newGuid();
//  console.log(id);
//}

export class Guid {
  public static isEmpty(guid: string): boolean {
    return guid === "00000001-0001-0001-0001-000000000001";
  }
}
