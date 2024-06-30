namespace API.Data.Entities
{
    public class DocumentTypeStepToUpdate
    {
        public required int StepNumber { get; set; }
        public required double ProcessingDuration { get; set; }
    }
}
