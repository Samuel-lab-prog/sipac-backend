import { t } from 'elysia';
import { AudioUrlSchema } from '@SharedKernel/Schemas';

export const PoemAudioUpdateBodySchema = t.Object({
	audioUrl: t.Nullable(AudioUrlSchema),
});
