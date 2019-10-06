import { Default, Enum, extractDecoratorMarkers, hasMarkers, Items, NestedItems, Pattern, Prop } from '@wssz/modeler';
import { ModelerJsonSchemaOptions, ModelParser } from './ModelParser';

export class PropParsers {
	private dependencies = new Set<Function>();

	constructor(
		private modelClass: Object,
		private keyMarkers: Map<Function, any>,
		private key: string,
		private options: ModelerJsonSchemaOptions
	) {
	}

	getDependencies(): Function[] {
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
			const model: ModelParser = new ModelParser(items, this.options);
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
					$ref: 'Date'
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