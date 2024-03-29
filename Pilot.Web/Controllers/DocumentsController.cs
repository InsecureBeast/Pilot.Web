﻿using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Pilot.Web.Model;
using Pilot.Web.Model.DataObjects;
using Pilot.Web.Tools;
using Pilot.Xps.Entities;

namespace Pilot.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly IContextService _contextService;

        public DocumentsController(IContextService contextService)
        {
            _contextService = contextService;
        }

        [Authorize]
        [HttpGet("[action]")]
        public IList<PObject> GetDocuments(Guid[] ids)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            return api.GetObjects(ids).ToList();
        }

        [Authorize]
        [HttpPost("[action]")]
        public IList<PObject> GetObjects([FromBody] string[] ids)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var guids = ids.Select(Guid.Parse);
            return api.GetObjects(guids.ToArray()).ToList();
        }

        [Authorize]
        [HttpGet("[action]")]
        public IList<PObject> GetDocumentChildren(string id, int childrenType)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var guid = Guid.Parse(id);
            return api.GetObjectChildren(guid, (ChildrenType)childrenType).ToList();
        }

        [Authorize]
        [HttpGet("[action]")]
        public PObject GetObject(string id)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var guid = Guid.Parse(id);

            var objs = api.GetObjects(new[] { guid });
            var current = objs.FirstOrDefault();
            return current;
        }

        [Authorize]
        [HttpGet("[action]")]
        public IList<PObject> GetDocumentParents(string id)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var guid = Guid.Parse(id);

            var parents = api.GetObjectParents(guid);
            return parents.ToList();
        }

        [Authorize]
        [HttpGet("[action]")]
        public IList<XpsDigitalSignature> GetDocumentSignatures(string documentId)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var guid = Guid.Parse(documentId);
            var xpsServiceApi = _contextService.GetExternalXpsServiceApi(api);
            var signatureBuffer = xpsServiceApi.GetSignatures(guid);
            return DtoCreator.CreateDigitalSignatures(signatureBuffer);
        }

        [Authorize]
        [HttpGet("[action]")]
        public IList<XpsDigitalSignature> GetDocumentSignaturesWithSnapshot(string documentId, string snapshotDate)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var guid = Guid.Parse(documentId);
            var snapshotDateTime = DateTime.Parse(snapshotDate);
            var xpsServiceApi = _contextService.GetExternalXpsServiceApi(api);
            var signatureBuffer = xpsServiceApi.GetSignatures(guid, snapshotDateTime);
            return DtoCreator.CreateDigitalSignatures(signatureBuffer);
        }

        [Authorize]
        [HttpPost("[action]")]
        public bool SignDocument([FromBody] DocumentSignData data)
        {
            var positions = data.Positions.ToObject<int[]>();
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var guid = Guid.Parse(data.DocumentId);
            var xpsServiceApi = _contextService.GetExternalXpsServiceApi(api);
            var currentPerson = api.GetCurrentPerson();
            var result = xpsServiceApi.SignDocument(guid, positions, currentPerson.Id);
            return result == SignResult.SignedSuccessfully;
        }

        [Authorize]
        [HttpGet("[action]")]
        public bool IsXpsServiceConnected()
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var xpsServiceApi = _contextService.GetExternalXpsServiceApi(api);
            return xpsServiceApi.CheckConnected();
        }
    }

    public class DocumentSignData
    {
        public string DocumentId { get; set; }
        public JArray Positions { get; set; }
    }
}
