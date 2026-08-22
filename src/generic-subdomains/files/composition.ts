import { storageService } from '@SharedKernel/infra/storage/storage-service';
import { createFileUploadUrlFactory } from './use-cases/commands/create-file-upload-url/execute';

const createFileUploadUrl = createFileUploadUrlFactory({
	storageService,
});

export { createFileUploadUrl };
