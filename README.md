# @wssz/modeler-jsonschema
Plugin for [@wssz/modeler](https://github.com/wszerad/wssz-modeler), create JSONSchema from decorated object.

## ModelerJsonSchema

* ModelerJsonSchema.create(model, options)
    * model decorated class
    * options
    ``
     {
        useNullable: boolean
        // use nullable instead of oneOf: [{type: 'null'}, ...]
        // for OpenAPI < 3 compatibility
     }
    ``

## Usage

```ts
import { Description, Enum, Required, Type, Items } from '@wssz/modeler';
import { ModelerJsonSchema } from '@wssz/modeler-jsonschema';

enum Enums {
	A = 'test',
	B = 'test2'
}

class NestedArray extend ArrayItems {
    @Items()
    items: string[];
}

class TestClass {
	@Description('description')
	@Required()
	@Prop()
	ref: OtherClass;

	@Enum(Enums)
	@Prop()
	str: string;

    @Items(OtherClass)
	@Prop()
	arr: OtherClass[];
	
    @Items(NestedArray)
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
@Prop
@Items
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
@UniqueItems
@Description
```