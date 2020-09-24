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
    }
}
