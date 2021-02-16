using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Ascon.Pilot.DataClasses;
using Ascon.Pilot.DataModifier;
using Ascon.Pilot.Server.Api.Contracts;
using Moq;
using NUnit.Framework;
using Pilot.Web.Model;
using Pilot.Web.Model.DataObjects;

namespace Pilot.Web.Tests.ModelTests
{
    class ServerApiServiceTests
    {
        [Test]
        public void should_get_metadata()
        {
            // given
            var api = new Mock<IServerApi>();
            Setup(api);
            var meta = new DMetadata();
            api.Setup(a => a.GetMetadata(0)).Returns(meta);
            var dbInfo = new DDatabaseInfo();
            var searchFactory = new Mock<ISearchServiceFactory>();
            var backend = new Mock<IBackend>();
            var service = new ServerApiService(api.Object, dbInfo, searchFactory.Object, backend.Object);
            
            // when
            var actual = service.GetMetadata();

            // then
            Assert.AreEqual(meta, actual);
        }

        [Test]
        public void should_get_object_children()
        {
            // given
            var api = new Mock<IServerApi>();
            Setup(api);
            var meta = new DMetadata();
            meta.Types.Add(TestTools.RandomMType(23));
            meta.Types.Add(TestTools.RandomMType(15));
            api.Setup(a => a.GetMetadata(0)).Returns(meta);

            var parentId = Guid.NewGuid();
            var parent = TestTools.RandomDObject(parentId);
            var childId1 = Guid.NewGuid();
            var childId2 = Guid.NewGuid();
            parent.TypeId = 15;
            parent.Children.Add(new DChild { ObjectId = childId1, TypeId = 23 });
            parent.Children.Add(new DChild { ObjectId = childId2, TypeId = 23 });

            var dbInfo = new DDatabaseInfo();
            var searchFactory = new Mock<ISearchServiceFactory>();
            var backend = new Mock<IBackend>();
            var service = new ServerApiService(api.Object, dbInfo, searchFactory.Object, backend.Object);
            api.Setup(a => a.GetObjects(new[] {parentId})).Returns(new List<DObject> { parent });

            var children = new List<DObject>()
            {
                TestTools.RandomDObject(childId1, 23),
                TestTools.RandomDObject(childId2, 23)
            };
            api.Setup(a => a.GetObjects(new[] {childId1, childId2})).Returns(children);

            // when
            var actual = service.GetObjectChildren(parentId, ChildrenType.ListView).ToArray();

            // then
            Assert.AreEqual(childId1, actual[0].Id);
            Assert.AreEqual(childId2, actual[1].Id);
        }

        [Test]
        public void should_get_object_children_with_source_files_folder()
        {
            // given
            var api = new Mock<IServerApi>();
            Setup(api);
            var meta = new DMetadata();
            var parentType = TestTools.RandomMType(15);
            meta.Types.Add(TestTools.RandomMType(23));
            meta.Types.Add(parentType);
            api.Setup(a => a.GetMetadata(0)).Returns(meta);

            var parentId = Guid.NewGuid();
            var parent = TestTools.RandomDObject(parentId);
            var childId1 = Guid.NewGuid();
            var childId2 = Guid.NewGuid();
            parent.TypeId = 15;
            parent.Children.Add(new DChild { ObjectId = childId1, TypeId = 23 });
            parent.Children.Add(new DChild { ObjectId = childId2, TypeId = 23 });

            var dbInfo = new DDatabaseInfo();
            var searchFactory = new Mock<ISearchServiceFactory>();
            var backend = new Mock<IBackend>();
            var service = new ServerApiService(api.Object, dbInfo, searchFactory.Object, backend.Object);
            api.Setup(a => a.GetObjects(new[] { parentId })).Returns(new List<DObject> { parent });

            var children = new List<DObject>()
            {
                TestTools.RandomDObject(childId1, 23),
                TestTools.RandomDObject(childId2, 23)
            };
            api.Setup(a => a.GetObjects(new[] { childId1, childId2 })).Returns(children);

            // when
            parentType.IsMountable = true;
            var actual = service.GetObjectChildren(parentId, ChildrenType.ListView).ToArray();

            // then
            Assert.AreEqual(3, actual.Length);
            Assert.AreEqual(parentId, actual[0].Id);
            Assert.AreEqual(childId1, actual[1].Id);
            Assert.AreEqual(childId2, actual[2].Id);
        }

        [Test]
        public void should_throw_exception_if_parent_not_found()
        {
            // given
            var api = new Mock<IServerApi>();
            Setup(api);
            var meta = new DMetadata();
            var parentType = TestTools.RandomMType(15);
            meta.Types.Add(TestTools.RandomMType(23));
            meta.Types.Add(parentType);
            api.Setup(a => a.GetMetadata(0)).Returns(meta);

            var parentId = Guid.NewGuid();
            var dbInfo = new DDatabaseInfo();
            var searchFactory = new Mock<ISearchServiceFactory>();
            var backend = new Mock<IBackend>();
            var service = new ServerApiService(api.Object, dbInfo, searchFactory.Object, backend.Object);
            api.Setup(a => a.GetObjects(new[] { parentId })).Returns(new List<DObject>());

            // when
            Assert.Throws<Exception>(() => service.GetObjectChildren(parentId, ChildrenType.ListView));
        }

        [Test]
        public void should_get_objects()
        {
            // given
            var api = new Mock<IServerApi>();
            Setup(api);
            var meta = new DMetadata();
            meta.Types.Add(TestTools.RandomMType(23));
            api.Setup(a => a.GetMetadata(0)).Returns(meta);
            var dbInfo = new DDatabaseInfo();
            var searchFactory = new Mock<ISearchServiceFactory>();
            var backend = new Mock<IBackend>();
            var service = new ServerApiService(api.Object, dbInfo, searchFactory.Object, backend.Object);

            var guids = new[]
            {
                Guid.Parse("81C28B67-B8EA-4BA6-9595-40707B47DA8B"),
                Guid.Parse("D029F4C6-4C84-42D5-8C31-A23ECEFCB116")
            };
            var children = new List<DObject>()
            {
                TestTools.RandomDObject(guids[0], 23),
                TestTools.RandomDObject(guids[1], 23)
            };
            api.Setup(a => a.GetObjects(new[] { guids[0], guids[1] })).Returns(children);

            // when
            var actual = service.GetObjects(guids).ToArray();

            // then
            Assert.AreEqual(2, actual.Length);
            Assert.AreEqual(guids[0], actual[0].Id);
            Assert.AreEqual(guids[1], actual[1].Id);
        }

        [Test]
        public void should_get_empty_list_objects()
        {
            // given
            var api = new Mock<IServerApi>();
            Setup(api);
            var meta = new DMetadata();
            meta.Types.Add(TestTools.RandomMType(23));
            api.Setup(a => a.GetMetadata(0)).Returns(meta);
            var dbInfo = new DDatabaseInfo();
            var searchFactory = new Mock<ISearchServiceFactory>();
            var backend = new Mock<IBackend>();
            var service = new ServerApiService(api.Object, dbInfo, searchFactory.Object, backend.Object);

            // when
            var actual = service.GetObjects(new Guid[0]);

            // then
            Assert.AreEqual(0, actual.Count());

            // when
            var actual2 = service.GetObjects(null);

            // then
            Assert.AreEqual(0, actual2.Count());
        }

        [Test]
        public void should_get_object_parents()
        {
            // given
            var api = new Mock<IServerApi>();
            Setup(api);
            var meta = new DMetadata();
            meta.Types.Add(TestTools.RandomMType(23));
            api.Setup(a => a.GetMetadata(0)).Returns(meta);
            var dbInfo = new DDatabaseInfo();
            var searchFactory = new Mock<ISearchServiceFactory>();
            var backend = new Mock<IBackend>();
            var service = new ServerApiService(api.Object, dbInfo, searchFactory.Object, backend.Object);

            var objectId = Guid.NewGuid();
            var obj = TestTools.RandomDObject(objectId, 23);
            api.Setup(a => a.GetObjects(new[] { objectId })).Returns(new List<DObject> { obj });

            var parent1 = TestTools.RandomDObject(Guid.NewGuid(), 23);
            var parent2 = TestTools.RandomDObject(Guid.NewGuid(), 23);
            parent2.ParentId = parent1.Id;
            obj.ParentId = parent2.Id;

            api.Setup(a => a.GetObjects(new[] { parent1.Id })).Returns(new List<DObject> { parent1 });
            api.Setup(a => a.GetObjects(new[] { parent2.Id })).Returns(new List<DObject> { parent2 });

            // when
            var actual = service.GetObjectParents(objectId).ToArray();

            // then
            Assert.AreEqual(2, actual.Length);
            Assert.AreEqual(parent2.Id, actual[0].Id);
            Assert.AreEqual(obj.Id, actual[1].Id);
        }

        [Test]
        public void should_get_object_parents_with_source_folder()
        {
            // given
            var api = new Mock<IServerApi>();
            Setup(api);
            var meta = new DMetadata();
            var projectType = TestTools.RandomMType(24);
            projectType.IsMountable = true;
            meta.Types.Add(projectType);
            meta.Types.Add(TestTools.RandomMType(23));
            api.Setup(a => a.GetMetadata(0)).Returns(meta);
            var dbInfo = new DDatabaseInfo();
            var searchFactory = new Mock<ISearchServiceFactory>();
            var backend = new Mock<IBackend>();
            var service = new ServerApiService(api.Object, dbInfo, searchFactory.Object, backend.Object);

            var objectId = Guid.NewGuid();
            var obj = TestTools.RandomDObject(objectId, 23);
            api.Setup(a => a.GetObjects(new[] { objectId })).Returns(new List<DObject> { obj });

            var parent1 = TestTools.RandomDObject(Guid.NewGuid(), 23);
            var parent2 = TestTools.RandomDObject(Guid.NewGuid(), 24);
            parent2.ParentId = parent1.Id;
            obj.ParentId = parent2.Id;

            api.Setup(a => a.GetObjects(new[] { parent1.Id })).Returns(new List<DObject> { parent1 });
            api.Setup(a => a.GetObjects(new[] { parent2.Id })).Returns(new List<DObject> { parent2 });

            // when
            var actual = service.GetObjectParents(objectId).ToArray();

            // then
            Assert.AreEqual(3, actual.Length);
            Assert.AreEqual(parent2.Id, actual[0].Id);
            Assert.AreEqual(parent2.Id, actual[1].Id);
            Assert.AreEqual(obj.Id, actual[2].Id);
        }

        private void Setup(Mock<IServerApi> api)
        {
            var people = new List<DPerson>();
            api.Setup(a => a.LoadPeople()).Returns(people);
            var orgUnits = new List<DOrganisationUnit>();
            api.Setup(a => a.LoadOrganisationUnits()).Returns(orgUnits);
        }
    }
}
