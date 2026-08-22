export type AvatarUploadUrlResult = {
	uploadUrl: string;
	fields: Record<string, string>;
	fileUrl: string;
};

export type AudioUploadUrlResult = {
	uploadUrl: string;
	fields: Record<string, string>;
	fileUrl: string;
};

export type FileUploadUrlResult = {
	uploadUrl: string;
	fields: Record<string, string>;
	fileUrl: string;
};

export interface StorageService {
	generateAvatarUploadUrl(
		userId: string,
		contentType?: string,
		contentLength?: number,
	): Promise<AvatarUploadUrlResult>;
	validateImageContentType(contentType: string): boolean;
	generatePoemAudioUploadUrl(
		poemId: string,
		contentType?: string,
		contentLength?: number,
	): Promise<AudioUploadUrlResult>;
	validateAudioContentType(contentType: string): boolean;
	generateFileUploadUrl(
		prefix: string,
		fileName: string,
		contentType?: string,
		contentLength?: number,
	): Promise<FileUploadUrlResult>;
	validateFileContentType(contentType: string): boolean;
}
