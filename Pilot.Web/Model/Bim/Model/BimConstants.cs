using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pilot.Web.Model.Bim.Model
{
    static class BimConstants
    {
        public const string VENDOR_NAME = "ASCON";
        public const string SERVER_APP_NAME = "Pilot-BIM-Server";
        public const string VIEWER_APP_NAME = "Pilot-BIM-Viewer";
        public const string IFC_PROJECT_TYPE = "IfcProject";
        public const string MODEL_PART_FILE_EXTENSION = ".bm";
        public const string MODEL_PART_REBUILD_REASON = "Reprocessing";
        public static string BimServerName = "Pilot-BIM-Server";
        public const string COLLISION_RESULT_FILE_EXTENSION = ".crbm";
        public const string SOLIDS_FILE_EXTENSION = ".sldbm";
    }

    static class Versions
    {
        public const int MODEL_METADATA_VERSION = 6;
    }

    static class BimProxyTypes
    {
        public const string BIM_OTHER_3D_MODEL_TYPE = "Other3DModel";
    }

    class BimSystemAttributes
    {
        public const string BIM_FOLDER_ATTRIBUTE_NAME = "name";
        public const string DEFAULT_BIM_FOLDER_NAME = "bim folder";

        public const string BIM_EVENT_ATTRIBUTE_TITLE = "title";
        public const string BIM_EVENT_ATTRIBUTE_DATE = "date";

        public const string BIM_MODEL_ATTRIBUTE_METADATA_VERSION = "metadata_version";

        public const string BIM_OBJECT_ATTRIBUTE_GUID = "guid";
        public const string BIM_OBJECT_ATTRIBUTE_PARENT_GUID = "parent_guid";
        public const string BIM_OBJECT_ATTRIBUTE_TYPE = "type";
        public const string BIM_OBJECT_ATTRIBUTE_NAME = "name";
        public const string BIM_OBJECT_ATTRIBUTE_POLYGON_MODEL = "polygon_model";
        public const string BIM_OBJECT_ATTRIBUTE_INFO = "info";
        public const string BIM_OBJECT_ATTRIBUTE_PLACEMENT = "placement";
        public const string BIM_OBJECT_ATTRIBUTE_BIM_OBJECT_ID = "bimObjectId";
        public const string BIM_OBJECT_ATTRIBUTE_STATE = "state";
        public const string BIM_OBJECT_ATTRIBUTE_DESCRIPTION = "description";
        public const string BIM_OBJECT_ATTRIBUTE_IFC_MD5 = "last_processed_ifc_md5";
        public const string BIM_OBJECT_ATTRIBUTE_MD5 = "last_processed_md5";
        public const string REMARK_RESPONSIBLE = "remark_responsible";
        public const string BIM_OBJECT_ATTRIBUTE_BIM_OBJECT_VERSION = "bimObjectVersion";
        public const string BIM_OBJECT_ATTRIBUTE_INITIATOR = "initiator";
        public const string IFC_SOURCE_FILE_NAME = "ifc_file_name";
        public const string IFC_SOURCE_OBJECT_ID = "ifc_source_object_id";
        public const string BIM_VIEW_POINT_ATTRIBUTE_CAMERA_POSITION = "cameraPosition";
        public const string BIM_VIEW_POINT_ATTRIBUTE_CLIP_PLANES = "clipPlanes";
        public const string BIM_VIEW_POINT_ATTRIBUTE_NODES_VISIBILITY = "nodesVisibility";
        public const string BIM_VIEW_POINT_ATTRIBUTE_IMAGE = "image";
        public const string BIM_VIEW_POINT_ATTRIBUTE_NAME = "name";
        public const string BIM_RELATION_PROXY_ATTRIBUTE_TITLE = "title";
        public const string BIM_RELATION_PROXY_ATTRIBUTE_BIM_OBJECT_ID = "bimObjectId";
        public const string BIM_RELATION_PROXY_ATTRIBUTE_BIM_MODEL_PART_ID = "bimModelPartId";
        public const string BIM_RELATION_PROXY_ATTRIBUTE_ITEM_ID = "itemId";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_NAME = "name";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_LEFT_MODEL_PART = "leftModelPartId";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_RIGHT_MODEL_PART = "rightModelPartId";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_ISSUES_COUNT = "issuesCount";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_UPDATED = "updated";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_ISSUES_DETECTION_OPERATION_ID = "issuesDetectionOperationId";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_ISSUES_DETECTION_PROCESS_STATE = "issuesDetectionProcessState";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_ISSUES_DETECTION_PROCESS_PROGRESS = "issuesDetectionProcessProgress";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_ISSUES_DETECTION_PROCESS_LAST_ERROR = "issuesDetectionProcessLastError";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_LEFT_IFC_CLASSES = "leftIfcClasses";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_RIGHT_IFC_CLASSES = "rightIfcClasses";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_DETECTION_WEAK_DISTANCE = "detectionWeakDistance";
        public const string BIM_COLLISIONS_JOURNAL_ATTRIBUTE_START_DETECTION_AUTOMATICALLY = "startAutomatically";
        public const string BIM_COLLISIONS_ISSUE_STATES = "issueStates";


        public const string OPTIMIZATION_ATTRIBUTE_NAME = "bim_optimization_settings";
        public const string MESH_PROCESSOR_ATTRIBUTE_NAME = "bim_mesh_processor_settings";

        public const string BIM_TRANSFORMATION_ATTRIBUTE = "bim_transformation";
    }

    class BimSystemTypeNames
    {
        public const string BIM_COORDINATION_MODEL = "bim_coordinationModel";
        public const string BIM_MODEL_PART = "bim_modelPart";
        public const string BIM_MODEL_PART_OTHER_3D_MODEL = "bim_modelPart_other3Dmodel";
        public const string BIM_MODEL_REMARKS_FOLDER = "bim_modelRemarksFolder";
        public const string BIM_MODEL_REMARK = "bim_modelRemark";
        public const string BIM_VIEW_POINTS_FOLDER = "bim_viewPointsFolder";
        public const string BIM_VIEW_POINT = "bim_viewPoint";
        public const string BIM_RELATION_PROXY_FOLDER = "bim_relationProxyFolder";
        public const string BIM_RELATION_PROXY = "bim_relationProxy";
        public const string BIM_MODEL_CHECKER_JOURNALS_FOLDER = "bim_modelCheckerJournalsFolder";
        public const string BIM_MODEL_PART_SOLIDS = "bim_modelPartSolids";
        public const string BIM_GLOBAL_SETTINGS = "bim_settings";

        // При создании нового имени типа обязательно добавить сюда
        public static IEnumerable<string> All()
        {
            yield return BIM_COORDINATION_MODEL;
            yield return BIM_MODEL_PART;
            yield return BIM_MODEL_PART_OTHER_3D_MODEL;
            yield return BIM_MODEL_REMARKS_FOLDER;
            yield return BIM_MODEL_REMARK;
            yield return BIM_VIEW_POINTS_FOLDER;
            yield return BIM_VIEW_POINT;
            yield return BIM_RELATION_PROXY_FOLDER;
            yield return BIM_RELATION_PROXY;
            yield return BIM_MODEL_CHECKER_JOURNALS_FOLDER;
            yield return BIM_GLOBAL_SETTINGS;
            yield return BIM_MODEL_PART_SOLIDS;
        }

        // При создании нового ModelPart типа обязательно добавить сюда
        public static IEnumerable<string> AllModelParts()
        {
            yield return BIM_MODEL_PART;
            yield return BIM_MODEL_PART_OTHER_3D_MODEL;
        }
    }

    static class BimSystemUserStates
    {
        public const string BIM_COLLISION_ISSUE_FIXED_STATE = "bim_issueFixed";
    }

    class BimAttributesToIgnore
    {
        public const string BIM_GEOMETRY_GROUP = "Pset_GeometryInformation";

        public static IEnumerable<string> AllGroups()
        {
            yield return BIM_GEOMETRY_GROUP;
        }
    }

    class BimOther3DModelNames
    {
        public static Dictionary<string, string> Names = new Dictionary<string, string>()
        {
            { ".sat", "ACIS" },
            { ".igs", "IGES" },
            { ".iges", "IGES" },
            { ".jt", "JT" },
            { ".x_t", "Parasolid" },
            { ".x_b", "Parasolid" },
            { ".xmt_txt", "Parasolid" },
            { ".xmp_txt", "Parasolid" },
            { ".xmt_bin", "Parasolid" },
            { ".xmp_bin", "Parasolid" },
            { ".stp", "STEP" },
            { ".step", "STEP" },
            { ".wrl", "VRML" },
            { ".grdecl", "GRDECL" },
            { ".c3d", "C3D" }
        };

        public static string GetNameByExt(string ext)
        {
            return Names.TryGetValue(ext, out var name) ? name : string.Empty;
        }
    }
}
