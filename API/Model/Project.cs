﻿using System.ComponentModel.DataAnnotations;

namespace API.Model
{
    public class Project
    {
        [Key]
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Storage { get; set; }
        public bool HasAccessToInternalUsersHandling { get; set; } = false;
        public bool HasAccessToSuppliersHandling { get; set; } = false;
        public bool HasAccessToProcessingCircuitsHandling { get; set; } = false;
        public bool HasAccessToSignMySelfFeature { get; set; } = false;
        public bool HasAccessToArchiveImmediatelyFeature { get; set; } = false;
        public bool HasAccessToGlobalDynamicFieldsHandling { get; set; } = false;
        public bool HasAccessToPhysicalLocationHandling { get; set; } = false;
        public bool HasAccessToNumericLibrary { get; set; } = false;
        public bool HasAccessToTomProLinking { get; set; } = false;
        public bool HasAccessToUsersConnectionsInformation { get; set; } = false;
        public bool HasAccessToDocumentTypesHandling { get; set; } = false;
        public bool HasAccessToDocumentsAccessesHandling { get; set; } = false;
        public bool HasAccessToRSF { get; set; } = false;
        public DateTime? DeletionDate { get; set; }
        public virtual List<User>? Users { get; set; }
    }
}
