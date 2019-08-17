import { Default, Type, Enum, Pattern, ArrayType } from '@wssz/modeler/src/decorators';
import { hasMarkers } from '@wssz/modeler/src/utils';

export class PropParser {
	private dependencies = new Set();
	private definition = {};

	constructor(
		private modelClass: any,
		private keyMarkers: Map<Function, any>,
		private key: string
	) {}

	getDependencies() {
		return Array.from(this.dependencies.values());
	}

	getDefinition() {
		return this.definition;
	}

	extractor(jsonKey: string, decorator: Function, value?: any) {
		const marker = this.extractKeyMarkers(decorator, value);
		if (marker === undefined) {
			return this;
		}

		this.definition[jsonKey] = marker;
		return this;
	}

	patternExtractor() {
		const marker = this.extractKeyMarkers(Pattern);
		if (!marker) {
			return this;
		}

		this.definition['pattern'] = marker.toString();
		return this;
	}

	defaultExtractor() {
		const marker = this.extractKeyMarkers(Default);
		if (marker === undefined) {
			return this;
		}

		this.definition['default'] = (marker instanceof Function) ? marker() : marker;
		return this;
	}

	enumExtractor() {
		const marker = this.extractKeyMarkers(Enum);
		if (!marker) {
			return this;
		}

		this.definition['enum'] = Array.isArray(marker) ? marker : Object.values(marker);
		return this;
	}

	typeExtractor() {
		const marker = this.extractKeyMarkers(Type);
		if (marker === undefined) {
			return this;
		}

		if (marker === Array) {
			throw new TypeError(`For Array in ${this.modelClass.constructor.name}.${this.key} use @ArrayType instead of @Type`);
		}

		Object.assign(this.definition, this.typeMatch(marker));
		return this;
	}

	arrayTypeExtractor() {
		const marker = this.extractKeyMarkers(ArrayType);
		if (marker === undefined) {
			return this;
		}

		Object.assign(this.definition, {
			type: 'array',
			items: this.typeMatch(marker)
		});
		return this;
	}

	private extractKeyMarkers(decorator: Function, value?: any) {
		if (!this.keyMarkers.has(decorator)) {
			return;
		}
		return value !== undefined ? value : this.keyMarkers.get(decorator);
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