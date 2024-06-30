using System.Data.SqlClient;
using API.Data.Entities;

namespace API.Repositories
{
    public class DocumentTypeRepository
    {
        private readonly string _connectionString;

        public DocumentTypeRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("SoftGED_DBContext")!;
        }

        public async Task<Guid> PostDocumentTypeStep(DocumentTypeStepToAdd documentTypeStepToAdd, Guid documentTypeId, Guid createdBy)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                INSERT INTO DocumentTypesSteps (Id, StepNumber, ProcessingDuration, DocumentTypeId, CreatedBy)
                VALUES (@id, @stepNumber, @processingDuration, @documentTypeId, @createdBy);
            ", conn);

            var id = Guid.NewGuid();

            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@stepNumber", documentTypeStepToAdd.StepNumber);
            cmd.Parameters.AddWithValue("@processingDuration", documentTypeStepToAdd.ProcessingDuration);
            cmd.Parameters.AddWithValue("@documentTypeId", documentTypeId);
            cmd.Parameters.AddWithValue("@createdBy", createdBy);

            await cmd.ExecuteNonQueryAsync();

            return id;
        }

        public async Task PostDocumentTypeUserStep(Guid userId, Guid stepId, Guid createdBy)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                INSERT INTO DocumentTypesUsersSteps (UserId, StepId, CreatedBy)
                VALUES (@userId, @stepId, @createdBy);
            ", conn);

            cmd.Parameters.AddWithValue("@userId", userId);
            cmd.Parameters.AddWithValue("@stepId", stepId);
            cmd.Parameters.AddWithValue("@createdBy", createdBy);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task PostDocumentType(DocumentTypeToAdd documentTypeToAdd, Guid projectId, Guid createdBy)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                INSERT INTO DocumentTypes (Id, Title, ProjectId, CreatedBy)
                VALUES (@id, @title, @projectId, @createdBy);
            ", conn);

            var id = Guid.NewGuid();

            cmd.Parameters.AddWithValue("@id", id);
            cmd.Parameters.AddWithValue("@title", documentTypeToAdd.Title);
            cmd.Parameters.AddWithValue("@projectId", projectId);
            cmd.Parameters.AddWithValue("@createdBy", createdBy);

            await cmd.ExecuteNonQueryAsync();

            for (int i = 0; i < documentTypeToAdd.Steps.Count; i += 1)
            {
                var stepId = await PostDocumentTypeStep(documentTypeToAdd.Steps[i], id, createdBy);

                for (int j = 0; j < documentTypeToAdd.Steps[i].UsersId.Count; j += 1)
                {
                    await PostDocumentTypeUserStep(documentTypeToAdd.Steps[i].UsersId[j], stepId, createdBy);
                }
            }
        }

        public async Task<List<DocumentType>> GetDocumentTypesByProjectId(Guid projectId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                SELECT dt.Id, dt.Title 
                FROM DocumentTypes aS dt
                WHERE dt.DeletionDate IS NULL
                AND dt.ProjectId = @projectId
                ORDER BY dt.CreationDate DESC;
            ", conn);

            cmd.Parameters.AddWithValue("@projectId", projectId);

            using var reader = await cmd.ExecuteReaderAsync();

            var res = new List<DocumentType>();

            while (await reader.ReadAsync())
            {
                res.Add(new DocumentType
                {
                    Id = reader["Id"].ToString()!,
                    Title = reader["Title"].ToString()!
                });
            }

            return res;
        }

        private async Task<List<ValidatorDetails>> GetDocumentTypesUsersSteps(Guid stepId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                SELECT u.Id, u.FirstName, u.LastName, u.Username
                FROM DocumentTypesUsersSteps AS dtus
                INNER JOIN Users AS u ON dtus.UserId = u.Id
                WHERE dtus.StepId = @stepId
                AND dtus.DeletionDate IS NULL
                ORDER BY dtus.CreationDate DESC;
            ", conn);

            cmd.Parameters.AddWithValue("@stepId", stepId);

            using var reader = await cmd.ExecuteReaderAsync();

            var res = new List<ValidatorDetails>();

            while (await reader.ReadAsync())
            {
                var id = reader["Id"].ToString()!;

                res.Add(new ValidatorDetails
                {
                    Id = id,
                    FirstName = reader["FirstName"].ToString()!,
                    LastName = reader["LastName"].ToString()!,
                    Username = reader["Username"].ToString()!
                });
            }

            return res;
        }

        private async Task<List<DocumentTypeStep>> GetDocumentTypesSteps(Guid documentTypeId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                SELECT dts.Id, dts.StepNumber, dts.ProcessingDuration 
                FROM DocumentTypesSteps AS dts
                WHERE dts.DocumentTypeId = @documentTypeId
                AND dts.DeletionDate IS NULL
                ORDER BY dts.StepNumber ASC;
            ", conn);

            cmd.Parameters.AddWithValue("@documentTypeId", documentTypeId);

            using var reader = await cmd.ExecuteReaderAsync();

            var res = new List<DocumentTypeStep>();

            while (await reader.ReadAsync())
            {
                var id = reader["Id"].ToString()!;

                res.Add(new DocumentTypeStep
                {
                    Id = id,
                    StepNumber = Convert.ToInt32(reader["StepNumber"]),
                    ProcessingDuration = Convert.ToDouble(reader["ProcessingDuration"]),
                    Validators = await GetDocumentTypesUsersSteps(Guid.Parse(id))
                });
            }

            return res;
        }

        public async Task<DocumentTypeDetails?> GetDocumentTypeDetails(Guid documentTypeId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                SELECT dt.Title 
                FROM DocumentTypes aS dt
                WHERE dt.Id = @documentTypeId
                AND dt.DeletionDate IS NULL
                ORDER BY dt.CreationDate DESC;
            ", conn);

            cmd.Parameters.AddWithValue("@documentTypeId", documentTypeId);

            using var reader = await cmd.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new DocumentTypeDetails
                {
                    Title = reader["Title"].ToString()!,
                    Steps = await GetDocumentTypesSteps(documentTypeId)
                };
            }

            return null;
        }

        public async Task UpdateDocumentTypeTitle(Guid documentTypeId, string title)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                UPDATE DocumentTypes SET Title = @title
                WHERE Id = @documentTypeId;
            ", conn);

            cmd.Parameters.AddWithValue("@title", title);
            cmd.Parameters.AddWithValue("@documentTypeId", documentTypeId);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task UpdateDocumentTypeStep(Guid documentTypeStepId, DocumentTypeStepToUpdate documentTypeStepToUpdate)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                UPDATE DocumentTypesSteps SET StepNumber = @stepNumber, ProcessingDuration = @processingDuration
                WHERE Id = @documentTypeStepId;
            ", conn);

            cmd.Parameters.AddWithValue("@stepNumber", documentTypeStepToUpdate.StepNumber);
            cmd.Parameters.AddWithValue("@processingDuration", documentTypeStepToUpdate.ProcessingDuration);
            cmd.Parameters.AddWithValue("@documentTypeStepId", documentTypeStepId);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task DeleteDocumentTypeStep(Guid documentTypeStepId, Guid currentUserId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                UPDATE DocumentTypesSteps SET DeletionDate = GETUTCDATE(), DeletedBy = @deletedBy
                WHERE Id = @documentTypeStepId;
            ", conn);

            cmd.Parameters.AddWithValue("@deletedBy", currentUserId);
            cmd.Parameters.AddWithValue("@documentTypeStepId", documentTypeStepId);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task DeleteDocumentTypeUserStep(Guid userId, Guid stepId, Guid currentUserId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                UPDATE DocumentTypesUsersSteps SET DeletionDate = GETUTCDATE(), DeletedBy = @deletedBy
                WHERE StepId = @stepId AND UserId = @userId;
            ", conn);

            cmd.Parameters.AddWithValue("@userId", userId);
            cmd.Parameters.AddWithValue("@stepId", stepId);
            cmd.Parameters.AddWithValue("@deletedBy", currentUserId);

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task DeleteDocumentType(Guid documentTypeId, Guid currentUserId)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                UPDATE DocumentTypes SET DeletionDate = GETUTCDATE(), DeletedBy = @deletedBy
                WHERE Id = @documentTypeId;
            ", conn);

            cmd.Parameters.AddWithValue("@deletedBy", currentUserId);
            cmd.Parameters.AddWithValue("@documentTypeId", documentTypeId);

            await cmd.ExecuteNonQueryAsync();
        }
    }
}
