import { createSchema } from './src/createSchema';

export class ModelerJsonSchema {
	static create(model: any) {
		return createSchema(model);
	}
}