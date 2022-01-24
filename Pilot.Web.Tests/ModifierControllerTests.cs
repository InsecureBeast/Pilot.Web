using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Ascon.Pilot.DataClasses;
using Ascon.Pilot.DataModifier;
using DocumentRender;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using Pilot.Web.Controllers;
using Pilot.Web.Model;
using Pilot.Web.Model.ModifyData;
using Change = Pilot.Web.Model.ModifyData.Change;

namespace Pilot.Web.Tests
{
    class ModifierControllerTests
    {
        [Test]
        public void should_change_attribute()
        {
            // given
            var contextService = new Mock<IContextService>();
            var controller = new ModifierController(contextService.Object);

            // when
            var objectId = Guid.NewGuid();
            var change = new Change
            {
                ObjectId = objectId.ToString(),
                Attributes = new ChangesResult<AttributeChangeValue>
                {
                    Changed = new List<AttributeChangeValue>
                    {
                        new AttributeChangeValue
                        {
                            Value = "New value",
                            Name = "AttributeName"
                        }
                    }
                }
            };

            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var api = new Mock<IServerApiService>();
            var modifier = new Mock<IModifier>();
            var builder = new Mock<IObjectChangeBuilder>();
            modifier.Setup(m => m.EditObject(objectId)).Returns(builder.Object);
            api.Setup(a => a.NewModifier()).Returns(modifier.Object);
            contextService.Setup(cs => cs.GetServerApi("sedov")).Returns(api.Object);

            controller.Change(new[] {change});

            // then
            builder.Verify(b => b.SetAttribute("AttributeName", "New value"), Times.Once);
        }

        [Test]
        public void should_remove_attribute()
        {
            // given
            var contextService = new Mock<IContextService>();
            var controller = new ModifierController(contextService.Object);

            // when
            var objectId = Guid.NewGuid();
            var change = new Change
            {
                ObjectId = objectId.ToString(),
                Attributes = new ChangesResult<AttributeChangeValue>
                {
                    Removed = new List<AttributeChangeValue>
                    {
                        new AttributeChangeValue
                        {
                            Value = "New value",
                            Name = "AttributeName"
                        }
                    }
                }
            };

            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var api = new Mock<IServerApiService>();
            var modifier = new Mock<IModifier>();
            var builder = new Mock<IObjectChangeBuilder>();
            modifier.Setup(m => m.EditObject(objectId)).Returns(builder.Object);
            api.Setup(a => a.NewModifier()).Returns(modifier.Object);
            contextService.Setup(cs => cs.GetServerApi("sedov")).Returns(api.Object);

            controller.Change(new[] { change });

            // then
            builder.Verify(b => b.RemoveAttribute("AttributeName"), Times.Once);
        }

        [Test]
        public void should_not_apply_changes_if_object_id_not_set()
        {
            // given
            var contextService = new Mock<IContextService>();
            var controller = new ModifierController(contextService.Object);

            // when
            var objectId = Guid.NewGuid();
            var change = new Change();

            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var api = new Mock<IServerApiService>();
            var modifier = new Mock<IModifier>();
            var builder = new Mock<IObjectChangeBuilder>();
            modifier.Setup(m => m.EditObject(objectId)).Returns(builder.Object);
            api.Setup(a => a.NewModifier()).Returns(modifier.Object);
            contextService.Setup(cs => cs.GetServerApi("sedov")).Returns(api.Object);

            controller.Change(new[] { change });

            // then
            builder.Verify(b => b.RemoveAttribute(It.IsAny<string>()), Times.Never);
            builder.Verify(b => b.SetAttribute(It.IsAny<string>(), It.IsAny<DValue>()), Times.Never);
        }

        [Test]
        public void should_apply_if_has_changed()
        {
            // given
            var contextService = new Mock<IContextService>();
            var controller = new ModifierController(contextService.Object);

            // when
            var objectId = Guid.NewGuid();
            var change = new Change();

            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var api = new Mock<IServerApiService>();
            var modifier = new Mock<IModifier>();
            var builder = new Mock<IObjectChangeBuilder>();
            modifier.Setup(m => m.EditObject(objectId)).Returns(builder.Object);
            modifier.Setup(b => b.AnyChanges()).Returns(true);
            api.Setup(a => a.NewModifier()).Returns(modifier.Object);
            contextService.Setup(cs => cs.GetServerApi("sedov")).Returns(api.Object);

            controller.Change(new[] { change });

            // then
            modifier.Verify(m => m.Apply(null), Times.Once);
        }

        [Test]
        public void should_return_ok()
        {
            // given
            var contextService = new Mock<IContextService>();
            var controller = new ModifierController(contextService.Object);

            // when
            var objectId = Guid.NewGuid();
            var change = new Change();

            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var api = new Mock<IServerApiService>();
            var modifier = new Mock<IModifier>();
            var builder = new Mock<IObjectChangeBuilder>();
            modifier.Setup(m => m.EditObject(objectId)).Returns(builder.Object);
            api.Setup(a => a.NewModifier()).Returns(modifier.Object);
            contextService.Setup(cs => cs.GetServerApi("sedov")).Returns(api.Object);

            var result = controller.Change(new[] { change }) as OkResult;

            // then
            Assert.AreEqual(200, result.StatusCode);
        }

    }
}
