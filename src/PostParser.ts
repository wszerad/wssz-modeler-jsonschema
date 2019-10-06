import { Formats } from "@wssz/modeler";
import { ModelerJsonSchemaOptions } from './ModelParser';
import { JSONProp } from './schema';

export class PostParser {
	static parse(schema: JSONProp, options: ModelerJsonSchemaOptions) {
		if ('$ref' in schema && schema['$ref'] === 'Date') {
			delete schema['$ref'];
			Object.assign(schema, {
				type: 'string',
				format: Formats.Date
			});
		}

		if ('$ref' in schema && 'nullable' in schema) {
			delete schema['nullable'];

			if (!options.openApiV3) {
				return;
			}

			const ref = schema['$ref'];
			delete schema['$ref'];
			Object.assign(schema, {
				oneOf: [
					{$ref: ref},
					{type: 'null'}
				]
			});
		}
	}
}