import {
	Description,
	Enum,
	Example,
	Examples,
	ExclusiveMaximum,
	ExclusiveMinimum,
	Format,
	Formats,
	Maximum,
	MaxItems,
	MaxLength,
	Minimum,
	MinItems,
	MinLength,
	MultipleOf,
	Pattern,
	Required,
	UniqueItems,
	Default,
	Prop,
    Items,
    ArrayItems
} from '@wssz/modeler';
import { expect } from 'chai';
import 'mocha';
import 'reflect-metadata';
import { ModelerJsonSchema } from '../index';

class OtherClass {
	@Prop()
	name: string;
}

class NestedItems extends ArrayItems {
	@UniqueItems()
	@Items(Date)
	items: Date[];
}

enum Enums {
	A = 'test',
	B = 'test2'
}

class TestClass {
	@Description('description')
	@Examples({
		a: {value: {name: 'a'}},
		b: {value: {name: 'b'}},
	})
	@Required()
	@Prop()
	ref: OtherClass;

	@Example('test')
	@MaxLength(6)
	@MinLength(3)
	@Format(Formats.Email)
	@Pattern(/[test|test2]/)
	@Enum(Enums)
	@Prop()
	str: string;

	@Default(0)
	@Minimum(0)
	@Maximum(10)
	@ExclusiveMinimum(-1)
	@ExclusiveMaximum(11)
	@MultipleOf(5)
	num: number;

	@Items(OtherClass)
	@MaxItems(1)
	@MinItems(0)
	@UniqueItems()
	arr: OtherClass[];

	@Items(NestedItems)
	@MaxItems(2)
	@MinItems(1)
	@UniqueItems()
	@Description('Base level')
	arr2D: Date[][];
}

describe('tests', () => {
	describe('createSchema', () => {
		it('should convert to similar object', () => {
			const results = ModelerJsonSchema.create(TestClass);
			expect(results.getDependencies()).to.eql([OtherClass]);
			expect(results.getSchema()).to.eql({
				type: 'object',
				required: ['ref'],
				properties: {
					arr2D: {
						maxItems: 2,
						minItems: 1,
						type: 'array',
						uniqueItems: true,
						description: 'Base level',
						items: {
							uniqueItems: true,
							type: 'array',
							items: {
								type: 'string',
								format: 'date'
							}
						}
					},
					arr: {
						maxItems: 1,
						minItems: 0,
						uniqueItems: true,
						type: 'array',
						items: {
							$ref: '#/definitions/OtherClass'
						}
					},
					num: {
						minimum: 0,
						maximum: 10,
						exclusiveMinimum: -1,
						exclusiveMaximum: 11,
						multipleOf: 5,
						default: 0
					},
					ref: {
						description: 'description',
						$ref: '#/definitions/OtherClass',
						examples: {
							a: {value: {name: 'a'}},
							b: {value: {name: 'b'}}
						}
					},
					str: {
						type: 'string',
						maxLength: 6,
						minLength: 3,
						format: 'email',
						pattern: '[test|test2]',
						enum: ['test', 'test2'],
						example: 'test'
					}
				}
			});
		});
	});
});