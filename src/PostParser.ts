import { Formats } from "@wssz/modeler";

export class PostParser {
	static parse(schema: object) {
		if ('$ref' in schema && schema['$ref'] === 'Date') {
			delete schema['$ref'];
			Object.assign(schema, {
				type: 'string',
				format: Formats.Date
			});
		}

		if ('$ref' in schema && 'nullable' in schema) {
			const ref = schema['$ref'];
			delete schema['nullable'];
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