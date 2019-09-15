import { Default, Prop, Enum, Pattern, MaxItems, MinItems, UniqueItems, Items, hasMarkers, extractDecoratorMarkers, getMarkers, Example, Required, Description, Examples, ExclusiveMaximum, MultipleOf, ExclusiveMinimum, Minimum, Maximum, MaxLength, MinLength, Format, ArrayItems, NestedItems } from '@wssz/modeler';

export class ModelParser {
	private dependencies = new Set();
	private schema = {
		type: 'object',
		properties: {}
	};

	constructor(model: Object) {
		getMarkers(model).forEach((markers, key) => {
			const definition = {};
			const prop = new PropParsers(model, markers, key as string);

			Object.assign(
				definition,
				prop.defaultExtractor(),
				prop.typeExtractor(),
				prop.arrayTypeExtractor(),
				prop.extractor('description', Description),
				prop.extractor('example', Example),
				prop.extractor('examples', Examples),
				prop.extractor('required', Required),
				prop.extractor('maxItems', MaxItems),
				prop.extractor('minItems', MinItems),
				prop.extractor('uniqueItems', UniqueItems),
			);

			const selfProp = Reflect.has(definition, 'items') ? (definition as ArrayItems).items : definition;

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

			this.schema.properties[key] = definition;
			prop.getDependencies().forEach(dependence => this.dependencies.add(dependence));
		});
	}

	getSchema() {
		return this.schema;
	}

	getDependencies() {
		return Array.from(this.dependencies);
	}
}

export class PropParsers {
	private dependencies = new Set();

	constructor(
		private modelClass: Object,
		private keyMarkers: Map<Function, any>,
		private key: string
	) {}

	getDependencies() {
		return Array.from(this.dependencies.values());
	}

	extractor(jsonKey: string, decorator: Function) {
		const marker = this.extractKeyMarkers(decorator);
		if (marker === undefined) {
			return {};
		}

		return {[jsonKey]: marker};
	}

	patternExtractor() {
		const marker = this.extractKeyMarkers(Pattern);
		if (!marker) {
			return {};
		}

		return {pattern: marker.toString()};
	}

	defaultExtractor() {
		const marker = this.extractKeyMarkers(Default);
		if (marker === undefined) {
			return {};
		}

		return {default: (marker instanceof Function) ? marker() : marker};
	}

	enumExtractor() {
		const marker = this.extractKeyMarkers(Enum);
		if (!marker) {
			return {};
		}

		return {enum: Array.isArray(marker) ? marker : Object.values(marker)};
	}

	typeExtractor() {
		const marker = this.extractKeyMarkers(Prop);
		const items = this.extractKeyMarkers(Items);
		if (marker === undefined || marker === Array || items !== undefined) {
			return {};
		}

		return this.typeMatch(marker);
	}

	arrayTypeExtractor() {
		const type = this.extractKeyMarkers(Prop);
		const items = this.extractKeyMarkers(Items);
		const nestedItems = this.extractKeyMarkers(NestedItems);

		if (type === Array && !items) {
			return {
				type: 'array'
			};
		} else if (type !== Array && !items) {
			return {};
		}

		let nested;

		if (nestedItems && nestedItems.length) {
			const model: ModelParser = new ModelParser(items);
			// @ts-ignore
			nested = model.getSchema().properties.items;
			model.getDependencies().forEach(dep => this.dependencies.add(dep));
		} else {
			nested = this.typeMatch(items);
		}

		return {
			type: 'array',
			items: nested
		};
	}

	private extractKeyMarkers(decorator: Function) {
		return extractDecoratorMarkers(this.keyMarkers, decorator);
	}

	private typeMatch(type: any) {
		switch (type) {
			case String:
				return {type: 'string'};
			case Number:
				return {type: 'number'};
			case Boolean:
				return {type: 'boolean'};
			case Date:
				return {
					type: 'string',
					format: 'date'
				};
			case Object:
				return {type: 'object'};
			default:
				const dependencies = hasMarkers(type);
				if (dependencies) {
					this.dependencies.add(type);
					return {
						$ref: `#/definitions/${type.name}`
					};
				}
				return {type: 'null'};
		}
	}
}