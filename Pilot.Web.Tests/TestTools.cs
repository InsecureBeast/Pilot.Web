using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using Ascon.Pilot.DataClasses;
using Pilot.Web.Model.DataObjects;

namespace Pilot.Web.Tests
{
    class TestTools
    {
        public static PObject RandomPObject(Guid id)
        {
            var metadata = new DMetadata();
            metadata.Types.Add(new MType());
            var people = new ReadOnlyDictionary<int, INPerson>(new Dictionary<int, INPerson>());
            return new PObject(new DObject(), metadata, people);
        }

        public static DObject RandomDObject(Guid id)
        {
            return new DObject { Id = id };
        }

        public static DObject RandomDObject(Guid id, int typeId)
        {
            return new DObject 
            { 
                Id = id, 
                TypeId = typeId
            };
        }

        public static MType RandomMType(int id)
        {
            return new MType 
            { 
                Id = id, 
                Name = Guid.NewGuid().ToString(),
                Kind = TypeKind.User
            };
        }
    }
}
