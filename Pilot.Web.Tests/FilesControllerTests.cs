using System;
using System.Collections.Generic;
using System.Linq;
using Ascon.Pilot.DataModifier;
using Castle.Core.Internal;
using DocumentRender;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using Pilot.Web.Controllers;
using Pilot.Web.Model;
using Pilot.Web.Model.FileStorage;

namespace Pilot.Web.Tests
{
    [TestFixture]
    class FilesControllerTests
    {
        private Mock<IContextService> _contextService;
        private Mock<IDocumentRender> _documentRender;
        private Mock<IFilesStorage> _fileStorage;
        private Mock<IFileSaver> _fileSaver;
        private Mock<IFilesOperationService> _filesOperationService;
        private Mock<IFileStorageProvider> _filesStorageProvider;
        private Mock<IOptions<AppSettings>> _options;
        private FilesController _controller;

        [SetUp]
        public void Setup()
        {
            _contextService = new Mock<IContextService>();
            _documentRender = new Mock<IDocumentRender>();
            _fileStorage = new Mock<IFilesStorage>();
            _fileSaver = new Mock<IFileSaver>();
            _filesOperationService = new Mock<IFilesOperationService>();
            _filesStorageProvider = new Mock<IFileStorageProvider>();
            _options = new Mock<IOptions<AppSettings>>();
            _controller = new FilesController(
                _contextService.Object,
                _documentRender.Object,
                _fileStorage.Object,
                _fileSaver.Object,
                _filesOperationService.Object,
                _filesStorageProvider.Object,
                _options.Object);
        }

        [Test]
        public void should_get_pages_count_from_storage()
        {
            // given
            var fileId = Guid.NewGuid();
            var page = new byte[] { 0, 1, 2, 3, 4, 5, 6, 7 };
            _fileStorage.Setup(fs => fs.GetPages(fileId)).Returns(new List<byte[]> { page });
            
            // when
            var result = _controller.GetDocumentPagesCount(fileId.ToString(), 500, 1);

            // then
            Assert.AreEqual(1, result);
        }

        [Test]
        public void should_get_pages_count_from_render()
        {
            // given
            var fileLoader = new Mock<IFileLoader>();
            var fileId = Guid.NewGuid();
            var fileSize = 10;
            var file = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
            var page = new byte[] { 1, 2, 3, 4, 5, 6, 7 };
            var pages = new List<byte[]> { page };

            _contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            fileLoader.Setup(fl => fl.Download(fileId, fileSize)).Returns(file);
            _contextService.Setup(cs => cs.GetFileLoader("sedov")).Returns(fileLoader.Object);
            _documentRender.Setup(dr => dr.RenderPages(file, 1)).Returns(pages);

            // when
            var result = _controller.GetDocumentPagesCount(fileId.ToString(), fileSize, 1);

            // then
            Assert.AreEqual(1, result);
            _fileSaver.Verify(fs => fs.PutFilesAsync(fileId, pages), Times.Once);
        }

        [Test]
        public void should_get_page_content()
        {
            // given
            var fileId = Guid.NewGuid();
            var page = new byte[] { 1, 2, 3, 4, 5, 6, 7 };
            _fileStorage.Setup(fs => fs.GetImageFile(fileId, 1)).Returns(page);

            // when
            var result = _controller.GetDocumentPageContent(fileId.ToString(), 1) as FileContentResult;

            // then
            Assert.AreEqual(page, result.FileContents);
        }

        [Test]
        public void should_get_empty_page_content_if_not_found_page()
        {
            // given
            var fileId = Guid.NewGuid();

            // when
            var result = _controller.GetDocumentPageContent(fileId.ToString(), 1) as FileContentResult;

            // then
            Assert.IsTrue(result.FileContents.IsNullOrEmpty());
        }

        [Test]
        public void should_get_file_content()
        {
            // given
            var fileId = Guid.NewGuid();
            var fileSize = 10;
            var file = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

            _contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var fileLoader = new Mock<IFileLoader>();
            fileLoader.Setup(fl => fl.Download(fileId, fileSize)).Returns(file);
            _contextService.Setup(cs => cs.GetFileLoader("sedov")).Returns(fileLoader.Object);

            // when
            var result = _controller.GetFile(fileId.ToString(), fileSize) as FileContentResult;

            // then
            Assert.AreEqual(file, result.FileContents);
        }

        [Test]
        public void should_get_thumbnail_from_storage()
        {
            // given
            var fileId = Guid.NewGuid();
            var fileSize = 10;
            var thumbnail = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

            _fileStorage.Setup(fs => fs.GetThumbnail(fileId)).Returns(thumbnail);

            // when
            var result = _controller.GetThumbnail(fileId.ToString(), fileSize) as FileContentResult;

            // then
            Assert.AreEqual(thumbnail, result.FileContents);
        }

        [Test]
        public void should_get_thumbnail_from_render()
        {
            // given
            var fileId = Guid.NewGuid();
            var fileSize = 10;
            var thumbnailFile = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
            var thumbnail = new byte[] { 1, 2, 3, 4, 5 };

            _fileStorage.Setup(fs => fs.GetThumbnail(fileId)).Returns((byte[])null);
            _contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var fileLoader = new Mock<IFileLoader>();
            fileLoader.Setup(fl => fl.Download(fileId, fileSize)).Returns(thumbnailFile);
            _contextService.Setup(cs => cs.GetFileLoader("sedov")).Returns(fileLoader.Object);
            _documentRender.Setup(dr => dr.RenderPage(thumbnailFile, 1, 0.2)).Returns(thumbnail);

            // when
            var result = _controller.GetThumbnail(fileId.ToString(), fileSize) as FileContentResult;

            // then
            Assert.AreEqual(thumbnail, result.FileContents);
            _fileSaver.Verify(fs => fs.PutThumbnailAsync(fileId, thumbnail));
        }

        [Test]
        public void should_get_file_archive()
        {
            // given
            var objectIds = new string[]
            {
                "FEA714C2-D61A-4871-8692-E0B37CDCDE35",
                "FEE6491B-9BFF-414A-A0C9-C83F9AA32EFB",
                "ECEFD027-EBED-49BB-A7A8-A428C4BA56EA"
            };

            var objectGuids = objectIds.Select(Guid.Parse).ToArray();
            var objects = objectGuids.Select(TestTools.RandomPObject);
            var zip = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9 };

            _contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var api = new Mock<IServerApiService>();
            api.Setup(a => a.GetObjects(objectGuids)).Returns(objects);
            _contextService.Setup(cs => cs.GetServerApi("sedov")).Returns(api.Object);
            _filesOperationService.Setup(fos => fos.CompressObjectsToArchive(objects, "sedov")).Returns(zip);

            // when
            var result = _controller.GetFileArchive(objectIds) as FileContentResult;

            // then
            Assert.AreEqual(zip, result.FileContents);
        }

        [Test]
        public void should_not_get_file_archive()
        {
            // then
            Assert.Throws<Exception>(() => _controller.GetFileArchive(new string[0]));
        }
    }
}
