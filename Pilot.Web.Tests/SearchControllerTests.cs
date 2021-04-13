using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using Pilot.Web.Controllers;
using Pilot.Web.Model;
using Pilot.Web.Model.Auth;

namespace Pilot.Web.Tests
{
    class SearchControllerTests
    {
        [SetUp]
        public void Setup()
        {
        }

        //[Test]
        //public async Task should_search_objects()
        //{
        //    // given
        //    var contextService = new Mock<IContextService>();
        //    var controller = new SearchController(contextService.Object);

        //    // when
        //    var request = " →attribute code: 10";
        //    var result = await controller.SearchObjects(request);

        //    // then
        //    Assert.NotNull(result);
        //    //Assert.AreEqual(200, result.StatusCode);
        //    //contextService.Verify(cs => cs.CreateContext(It.IsAny<Credentials>()), Times.Once);
        //}
    }
}
