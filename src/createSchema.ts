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
	Required,
	UniqueItems
} from '@wssz/modeler';
import { PropParser } from './PropParser';

interface ModelerJSONSchemaResults {
	schema: any;
	dependencies: any[]
}

export function createSchema(model): ModelerJSONSchemaResults {
	const dependencies = new Set();
	const schema = {
		type: 'object',
		properties: {}
	};

	getMarkers(model).forEach((markers, key) => {
		const propResults =	new PropParser(model, markers, key as string)
			.typeExtractor()
			.arrayTypeExtractor()
			.enumExtractor()
			.patternExtractor()
			.defaultExtractor()
			.extractor('example', Example)
			.extractor('examples', Examples)
			.extractor('required', Required, true)
			.extractor('minimum', Minimum)
			.extractor('maximum', Maximum)
			.extractor('exclusiveMinimum', ExclusiveMinimum)
			.extractor('exclusiveMaximum', ExclusiveMaximum)
			.extractor('multipleOf', MultipleOf)
			.extractor('maxLength', MaxLength)
			.extractor('minLength', MinLength)
			.extractor('format', Format)
			.extractor('maxItems', MaxItems)
			.extractor('minItems', MinItems)
			.extractor('description', Description)
			.extractor('uniqueItems', UniqueItems, true);


		schema.properties[key] = propResults.getDefinition();
		propResults.getDependencies().forEach(dependence => dependencies.add(dependence));
	});

	return {
		schema,
		dependencies: Array.from(dependencies.values())
	};
}

