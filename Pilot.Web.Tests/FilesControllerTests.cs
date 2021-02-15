using System;
using System.Collections.Generic;
using System.Linq;
using Ascon.Pilot.DataModifier;
using Castle.Core.Internal;
using DocumentRender;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using Pilot.Web.Controllers;
using Pilot.Web.Model;
using Pilot.Web.Model.FileStorage;

namespace Pilot.Web.Tests
{
    class FilesControllerTests
    {
        [Test]
        public void should_get_pages_count_from_storage()
        {
            // given
            var contextService = new Mock<IContextService>();
            var documentRender = new Mock<IDocumentRender>();
            var fileStorage = new Mock<IFilesStorage>();
            var filesOperationService = new Mock<IFilesOperationService>();
            var controller = new FilesController(
                contextService.Object,
                documentRender.Object,
                fileStorage.Object,
                filesOperationService.Object);
            // when
            var fileId = Guid.NewGuid();
            var page = new byte[] {0, 1, 2, 3, 4, 5, 6, 7};
            fileStorage.Setup(fs => fs.GetPages(fileId)).Returns(new List<byte[]> {page});
            var result = controller.GetDocumentPagesCount(fileId.ToString(), 500, 1);

            // then
            Assert.AreEqual(1, result);
        }

        [Test]
        public void should_get_pages_count_from_render()
        {
            // given
            var contextService = new Mock<IContextService>();
            var documentRender = new Mock<IDocumentRender>();
            var fileStorage = new Mock<IFilesStorage>();
            var fileLoader = new Mock<IFileLoader>();
            var filesOperationService = new Mock<IFilesOperationService>();
            var controller = new FilesController(
                contextService.Object,
                documentRender.Object,
                fileStorage.Object,
                filesOperationService.Object);

            // when
            var fileId = Guid.NewGuid();
            var fileSize = 10;
            var file = new byte[] { 1,2,3,4,5,6,7,8,9,10};
            var page = new byte[] {1, 2, 3, 4, 5, 6, 7};
            var pages = new List<byte[]> { page };

            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            fileLoader.Setup(fl => fl.Download(fileId, fileSize)).Returns(file);
            contextService.Setup(cs => cs.GetFileLoader("sedov")).Returns(fileLoader.Object);
            documentRender.Setup(dr => dr.RenderPages(file, 1)).Returns(pages);

            var result = controller.GetDocumentPagesCount(fileId.ToString(), fileSize, 1);

            // then
            Assert.AreEqual(1, result);
            fileStorage.Verify(fs => fs.PutFilesAsync(fileId, pages), Times.Once);
        }

        [Test]
        public void should_get_page_content()
        {
            // given
            var contextService = new Mock<IContextService>();
            var documentRender = new Mock<IDocumentRender>();
            var fileStorage = new Mock<IFilesStorage>();
            var filesOperationService = new Mock<IFilesOperationService>();
            var controller = new FilesController(
                contextService.Object,
                documentRender.Object,
                fileStorage.Object,
                filesOperationService.Object);

            // when
            var fileId = Guid.NewGuid();
            var page = new byte[] { 1, 2, 3, 4, 5, 6, 7 };
            fileStorage.Setup(fs => fs.GetImageFile(fileId, 1)).Returns(page);
            var result = controller.GetDocumentPageContent(fileId.ToString(), 1) as FileContentResult;

            // then
            Assert.AreEqual(page, result.FileContents);
        }

        [Test]
        public void should_get_empty_page_content_if_not_found_page()
        {
            // given
            var contextService = new Mock<IContextService>();
            var documentRender = new Mock<IDocumentRender>();
            var fileStorage = new Mock<IFilesStorage>();
            var filesOperationService = new Mock<IFilesOperationService>();
            var controller = new FilesController(
                contextService.Object,
                documentRender.Object,
                fileStorage.Object,
                filesOperationService.Object);

            // when
            var fileId = Guid.NewGuid();
            var result = controller.GetDocumentPageContent(fileId.ToString(), 1) as FileContentResult;

            // then
            Assert.IsTrue(result.FileContents.IsNullOrEmpty());
        }

        [Test]
        public void should_get_file_content()
        {
            // given
            var contextService = new Mock<IContextService>();
            var documentRender = new Mock<IDocumentRender>();
            var fileStorage = new Mock<IFilesStorage>();
            var filesOperationService = new Mock<IFilesOperationService>();
            var controller = new FilesController(
                contextService.Object,
                documentRender.Object,
                fileStorage.Object,
                filesOperationService.Object);

            // when
            var fileId = Guid.NewGuid();
            var fileSize = 10;
            var file = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var fileLoader = new Mock<IFileLoader>();
            fileLoader.Setup(fl => fl.Download(fileId, fileSize)).Returns(file);
            contextService.Setup(cs => cs.GetFileLoader("sedov")).Returns(fileLoader.Object);

            var result = controller.GetFile(fileId.ToString(), fileSize) as FileContentResult;

            // then
            Assert.AreEqual(file, result.FileContents);
        }

        [Test]
        public void should_get_thumbnail_from_storage()
        {
            // given
            var contextService = new Mock<IContextService>();
            var documentRender = new Mock<IDocumentRender>();
            var fileStorage = new Mock<IFilesStorage>();
            var filesOperationService = new Mock<IFilesOperationService>();
            var controller = new FilesController(
                contextService.Object,
                documentRender.Object,
                fileStorage.Object,
                filesOperationService.Object);

            // when
            var fileId = Guid.NewGuid();
            var fileSize = 10;
            var thumbnail = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

            fileStorage.Setup(fs => fs.GetThumbnail(fileId)).Returns(thumbnail);
            var result = controller.GetThumbnail(fileId.ToString(), fileSize) as FileContentResult;

            // then
            Assert.AreEqual(thumbnail, result.FileContents);
        }

        [Test]
        public void should_get_thumbnail_from_render()
        {
            // given
            var contextService = new Mock<IContextService>();
            var documentRender = new Mock<IDocumentRender>();
            var fileStorage = new Mock<IFilesStorage>();
            var filesOperationService = new Mock<IFilesOperationService>();
            var controller = new FilesController(
                contextService.Object,
                documentRender.Object,
                fileStorage.Object,
                filesOperationService.Object);

            // when
            var fileId = Guid.NewGuid();
            var fileSize = 10;
            var thumbnailFile = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
            var thumbnail = new byte[] { 1, 2, 3, 4, 5 };

            fileStorage.Setup(fs => fs.GetThumbnail(fileId)).Returns((byte[]) null);
            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var fileLoader = new Mock<IFileLoader>();
            fileLoader.Setup(fl => fl.Download(fileId, fileSize)).Returns(thumbnailFile);
            contextService.Setup(cs => cs.GetFileLoader("sedov")).Returns(fileLoader.Object);
            documentRender.Setup(dr => dr.RenderPage(thumbnailFile, 1, 0.2)).Returns(thumbnail);

            var result = controller.GetThumbnail(fileId.ToString(), fileSize) as FileContentResult;

            // then
            Assert.AreEqual(thumbnail, result.FileContents);
            fileStorage.Verify(fs => fs.PutThumbnailAsync(fileId, thumbnail));
        }

        [Test]
        public void should_get_file_archive()
        {
            // given
            var contextService = new Mock<IContextService>();
            var documentRender = new Mock<IDocumentRender>();
            var fileStorage = new Mock<IFilesStorage>();
            var filesOperationService = new Mock<IFilesOperationService>();
            var controller = new FilesController(
                contextService.Object,
                documentRender.Object,
                fileStorage.Object,
                filesOperationService.Object);

            // when
            var objectIds = new string[]
            {
                "FEA714C2-D61A-4871-8692-E0B37CDCDE35",
                "FEE6491B-9BFF-414A-A0C9-C83F9AA32EFB",
                "ECEFD027-EBED-49BB-A7A8-A428C4BA56EA"
            };

            var objectGuids = objectIds.Select(Guid.Parse).ToArray();
            var objects = objectGuids.Select(TestTools.RandomPObject);
            var zip = new byte[] { 1,2,3,4,5,6,7,8,9 };
            
            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var api = new Mock<IServerApiService>();
            api.Setup(a => a.GetObjects(objectGuids)).Returns(objects);
            contextService.Setup(cs => cs.GetServerApi("sedov")).Returns(api.Object);
            filesOperationService.Setup(fos => fos.CompressObjectsToArchive(objects, "sedov")).Returns(zip);
            
            var result = controller.GetFileArchive(objectIds) as FileContentResult;

            // then
            Assert.AreEqual(zip, result.FileContents);
        }

        [Test]
        public void should_not_get_file_archive()
        {
            // given
            var contextService = new Mock<IContextService>();
            var documentRender = new Mock<IDocumentRender>();
            var fileStorage = new Mock<IFilesStorage>();
            var filesOperationService = new Mock<IFilesOperationService>();
            var controller = new FilesController(
                contextService.Object,
                documentRender.Object,
                fileStorage.Object,
                filesOperationService.Object);

            // then
            Assert.Throws<Exception>(() => controller.GetFileArchive(new string[0]));
        }
    }
}
