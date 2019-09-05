import {
	Description,
	Example,
	Examples,
	ExclusiveMaximum,
	ExclusiveMinimum,
	Format,
	getMarkers,
	Maximum,
	MaxLength,
	Minimum,
	MinLength,
	MultipleOf, Prop,
	Required
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
		const definition = {};
		const prop = new PropParser(model, markers, key as string);
		const marker = markers.get(Prop);
		const isArray = (marker === Array || Array.isArray(marker));
		let instance;

		if (isArray) {
			const arrayDef = prop.arrayTypeExtractor();
			instance = arrayDef[1];
			Object.assign(
				definition,
				arrayDef[0],
				prop.extractor('description', Description),
				prop.extractor('example', Example),
				prop.extractor('examples', Examples),
				prop.extractor('required', Required, true),
			);
		} else {
			instance = definition;
			Object.assign(
				definition,
				prop.typeExtractor(),
				prop.extractor('description', Description),
				prop.extractor('example', Example),
				prop.extractor('examples', Examples),
				prop.extractor('required', Required, true)
			);
		}

		Object.assign(
			instance,
			prop.enumExtractor(),
			prop.patternExtractor(),
			prop.defaultExtractor(),
			prop.extractor('minimum', Minimum),
			prop.extractor('maximum', Maximum),
			prop.extractor('exclusiveMinimum', ExclusiveMinimum),
			prop.extractor('exclusiveMaximum', ExclusiveMaximum),
			prop.extractor('multipleOf', MultipleOf),
			prop.extractor('maxLength', MaxLength),
			prop.extractor('minLength', MinLength),
			prop.extractor('format', Format)
		);

		schema.properties[key] = definition;
		prop.getDependencies().forEach(dependence => dependencies.add(dependence));
	});

	return {
		schema,
		dependencies: Array.from(dependencies.values())
	};
}