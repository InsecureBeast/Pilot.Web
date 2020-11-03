using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ascon.Pilot.DataModifier;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using Pilot.Web.Controllers;
using Pilot.Web.Model;
using Pilot.Web.Model.DataObjects;

namespace Pilot.Web.Tests
{
    class TasksControllerTests
    {
        [Test]
        public void should_return_tasks_with_filter()
        {
            // given
            var contextService = new Mock<IContextService>();
            var controller = new TasksController(contextService.Object);
            var taskId = Guid.NewGuid();
            var taskFilter = new TaskWithFilter
            {
                TaskId = taskId.ToString(),
                Filter = "filter"
            };

            var guid = Guid.NewGuid();
            var expected = new List<PObject>()
            {
                TestTools.RandomPObject(guid)
            };

            // when
            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var api = new Mock<IServerApiService>();
            api.Setup(a => a.GetTasksWithFilterAsync(taskFilter.Filter, taskId)).Returns(Task.FromResult((IEnumerable<PObject>) expected));
            contextService.Setup(cs => cs.GetServerApi("sedov")).Returns(api.Object);

            var result = controller.GetTaskWithFilter(taskFilter);

            // then
            Assert.AreEqual(expected, result.Result);
        }

        [Test]
        public void should_not_return_tasks_with_filter()
        {
            // given
            var contextService = new Mock<IContextService>();
            var controller = new TasksController(contextService.Object);
            var taskId = Guid.NewGuid();
            var taskFilter = new TaskWithFilter
            {
                TaskId = "wrqrqwqw", //not guid!!!
                Filter = "filter"
            };

            // when
            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var api = new Mock<IServerApiService>();
            contextService.Setup(cs => cs.GetServerApi("sedov")).Returns(api.Object);

            var result = controller.GetTaskWithFilter(taskFilter);

            // then
            Assert.AreEqual(0, result.Result.Count());
        }
    }
}
