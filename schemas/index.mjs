import { DEFAULT_SCHEMA, Type } from 'js-yaml';

function cfnTag(name, kind, construct = (data) => data) {
    return new Type(name, { kind, construct });
}

const joinType = new Type('!Join', {
    kind: 'sequence',
    construct(data) {
        if (Array.isArray(data) && data.length === 2 && Array.isArray(data[1])) {
            return data[1].join(data[0]);
        }
        return data;
    },
});

const customSchema = DEFAULT_SCHEMA.extend([
    cfnTag('!Ref', 'scalar'),
    cfnTag('!Sub', 'scalar'),
    cfnTag('!Sub', 'sequence'),
    cfnTag('!GetAtt', 'scalar'),
    cfnTag('!GetAtt', 'sequence'),
    joinType,
    cfnTag('!FindInMap', 'sequence'),
    cfnTag('!Transform', 'mapping'),
    cfnTag('!If', 'sequence'),
    cfnTag('!Equals', 'sequence'),
    cfnTag('!Not', 'sequence'),
    cfnTag('!And', 'sequence'),
    cfnTag('!Or', 'sequence'),
    cfnTag('!Select', 'sequence'),
    cfnTag('!Split', 'sequence'),
    cfnTag('!ImportValue', 'scalar'),
    cfnTag('!Condition', 'scalar'),
    cfnTag('!GetAZs', 'scalar'),
    cfnTag('!Cidr', 'sequence'),
    cfnTag('!Base64', 'scalar'),
    cfnTag('!Base64', 'mapping'),
]);

export { customSchema };
