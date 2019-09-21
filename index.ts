import { ModelParser } from './src/ModelParser';
export * from '@wssz/modeler';

export class ModelerJsonSchema {
	static create(model: Object): ModelParser {
		return new ModelParser(model);
	}
}