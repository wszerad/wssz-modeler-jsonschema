# @wssz/modeler-jsonschema
Plugin for [@wssz/modeler](https://github.com/wszerad/wssz-modeler), create JSONSchema from decorated object.

## Usage

```ts
import { Description, Enum, Required, Type, ArrayType } from '@wssz/modeler';
import { ModelerJsonSchema } from '@wssz/modeler-jsonschema';

enum Enums {
	A = 'test',
	B = 'test2'
}

class TestClass {
	@Description('description')
	@Required()
	@Type()
	ref: OtherClass;

	@Enum(Enums)
	@Type()
	str: string;

	@Prop([OtherClass])
	arr: OtherClass[];
	
	@Prop([[String]])
	arr2D: string[][];
}

const schema = ModelerJsonSchema.create(TestClass);
results.dependencies => 
    [OtherClass]
    
results.schema => 
    {
        type: 'object',
        properties: {
            arr2D: {
                type: 'array',
                items: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            },
            arr: {
                type: 'array',
                items: {
                    $ref: '#/definitions/OtherClass'
                }
            },
            ref: {
                description: 'description',
                $ref: '#/definitions/OtherClass',
                required: true
            },
            str: {
                type: 'string',
                enum: ['test', 'test2'],
            }
        }
    }
```
### Supported decorators
* see more at [build-in decorators](https://github.com/wszerad/wssz-modeler#Decorators)
```ts
@Required
@Minimum
@Maximum
@ExclusiveMinimum
@ExclusiveMaximum
@MultipleOf
@MaxLength
@MinLength
@Format
@Pattern
@Enum
@MaxItems
@MinItems
@Default
@Example
@Examples
@Type
@UniqueItems
@Description
```