import {
	Description,
	Example,
	Examples,
	ExclusiveMaximum,
	ExclusiveMinimum,
	Format,
	getMarkers,
	Maximum,
	MaxItems,
	MaxLength,
	Minimum,
	MinItems,
	MinLength,
	MultipleOf,
	Nullable,
	Required,
	UniqueItems
} from '@wssz/modeler';
import { PostParser } from './PostParser';
import { PropParsers } from './PropParser';
import { JSONProp, JSONSchema } from './schema';

export interface ModelerJsonSchemaOptions {
	useNullable?: boolean
}

export class ModelParser {
	private dependencies = new Set<Function>();
	private schema: JSONSchema = {
		type: 'object',
		properties: {},
		required: []
	};

	constructor(model: Object, options: ModelerJsonSchemaOptions) {
		let required: string[] = [];

		getMarkers(model).forEach((markers, key) => {
			const definition: JSONProp = {};
			const prop = new PropParsers(model, markers, key as string, options);

			required = prop.requiredExtractor(required);

			Object.assign(
				definition,
				prop.defaultExtractor(),
				prop.typeExtractor(),
				prop.arrayTypeExtractor(),
				prop.extractor('description', Description),
				prop.extractor('example', Example),
				prop.extractor('examples', Examples),
				prop.extractor('maxItems', MaxItems),
				prop.extractor('minItems', MinItems),
				prop.extractor('uniqueItems', UniqueItems),
				prop.extractor('nullable', Nullable),
			);

			const selfProp = Reflect.has(definition, 'items') ? definition.items : definition;

			Object.assign(
				selfProp,
				prop.enumExtractor(),
				prop.patternExtractor(),
				prop.extractor('minimum', Minimum),
				prop.extractor('maximum', Maximum),
				prop.extractor('exclusiveMinimum', ExclusiveMinimum),
				prop.extractor('exclusiveMaximum', ExclusiveMaximum),
				prop.extractor('multipleOf', MultipleOf),
				prop.extractor('maxLength', MaxLength),
				prop.extractor('minLength', MinLength),
				prop.extractor('format', Format),
			);

			PostParser.parse(selfProp, options);
			PostParser.parse(definition, options);
			this.schema.properties[key as string] = definition;
			prop.getDependencies().forEach(dependence => this.dependencies.add(dependence));
		});

		this.schema.required = required;
	}

	getSchema() {
		return this.schema;
	}

	getDependencies(): Function[] {
		return Array.from(this.dependencies);
	}
}