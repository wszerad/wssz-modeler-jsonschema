import { ModelParser } from './src/parsers';

export class ModelerJsonSchema {
	static create(model: Object): ModelParser {
		return new ModelParser(model);
	}
}