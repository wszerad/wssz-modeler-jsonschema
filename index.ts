import { ModelParser } from './src/ModelParser';

export class ModelerJsonSchema {
	static create(model: Object): ModelParser {
		return new ModelParser(model);
	}
}