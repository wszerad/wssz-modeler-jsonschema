import { ModelerJsonSchemaOptions, ModelParser } from './src/ModelParser';

export class ModelerJsonSchema {
	static create(model: Object, options: ModelerJsonSchemaOptions = {}): ModelParser {
		return new ModelParser(model, options);
	}
}