export interface JSONProp {
	$ref?: string;
	nullable?: boolean;
	items?: object;
}

export interface JSONSchema {
	type: string,
	properties: {[key: string]: JSONProp}
}