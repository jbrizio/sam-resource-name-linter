import { Schema, Type } from 'js-yaml';

const subType = new Type('!Sub', {
    kind: 'scalar',
    construct: function (data) {
        return data;
    }
});

const refType = new Type('!Ref', {
    kind: 'scalar',
    construct: function (data) {
        return data;
    }
});

const getAttrType = new Type('!GetAtt', {
    kind: 'scalar',
    construct: function (data) {
        return data;
    }
});

const findInMapType = new Type('!FindInMap', {
    kind: 'sequence',
    construct: function (data) {
        return data;
    }
});

const transformType = new Type('!Transform', {
    kind: 'mapping',
    construct: function (data) {
        return data;
    }
});

const joinType = new Type('!Join', {
    kind: 'sequence',
    construct: function (data) {
        if (Array.isArray(data) && data.length === 2 && Array.isArray(data[1])) {
            // Join elements with the specified delimiter
            return data[1].join(data[0]);
        }
        return data;
    }
});

const customSchema = new Schema({
    include: [],
    explicit: [
        subType,
        refType,
        joinType,
        getAttrType,
        transformType,
        findInMapType,
    ],
});

export { customSchema };