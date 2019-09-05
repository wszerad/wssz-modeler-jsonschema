import { Default, Prop, Enum, Pattern, MaxItems, MinItems, UniqueItems } from '@wssz/modeler/src/decorators';
import { hasMarkers, extractDecoratorMarkers } from '@wssz/modeler/src/utils';

export class PropParser {
	private dependencies = new Set();

	constructor(
		private modelClass: any,
		private keyMarkers: Map<Function, any>,
		private key: string
	) {}

	getDependencies() {
		return Array.from(this.dependencies.values());
	}

	extractor(jsonKey: string, decorator: Function, value?: any) {
		const marker = this.extractKeyMarkers(decorator, value);
		if (marker === undefined) {
			return {};
		}

		return {[jsonKey]: marker};
	}

	extractorWithLevels(jsonKey: string, decorator: Function, level: number, value?: any) {
		const marker = this.getNestedDecorator(decorator, level, value);
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
		if (marker === undefined || marker === Array || Array.isArray(marker)) {
			return {};
		}

		if (marker === Array) {
			throw new TypeError(`For Array in ${this.modelClass.constructor.name}.${this.key} use @ArrayType instead of @Type`);
		}

		return this.typeMatch(marker);
	}

	arrayTypeExtractor() {
		const marker = this.extractKeyMarkers(Prop);

		if (marker !== Array && !Array.isArray(marker)) {
			return {};
		}

		const nestedArrayInfo = this.getArrayDepthAndType(marker);
		const arraySchema: any = {};
		let prev = arraySchema;

		for (let i = 0; i < nestedArrayInfo.depth; i++) {
			Object.assign(
				prev,
				{
					type: 'array',
					items: {}
				},
				this.extractorWithLevels('maxItems', MaxItems, i),
				this.extractorWithLevels('minItems', MinItems, i),
				this.extractorWithLevels('uniqueItems', UniqueItems, i, true)
			);
			prev = prev.items;
		}

		Object.assign(prev, this.typeMatch(nestedArrayInfo.type));
		return [arraySchema, prev];
	}

	private getNestedDecorator(decorator: Function, level: number, value?: any) {
		const marker = this.extractKeyMarkers(decorator, value);

		if (Array.isArray(marker)) {
			return marker[level];
		} else if(level === 0) {
			return marker;
		} else {
			return undefined;
		}
	}

	private getArrayDepthAndType(type: any, depth: number = 0) {
		if (type === Array) {
			return {
				depth: 1,
				type: undefined
			};
		} else if (Array.isArray(type)) {
			return this.getArrayDepthAndType(type[0], ++depth);
		}
		return {
			depth,
			type
		};
	}

	private extractKeyMarkers(decorator: Function, value?: any) {
		return extractDecoratorMarkers(this.keyMarkers, decorator, value);
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