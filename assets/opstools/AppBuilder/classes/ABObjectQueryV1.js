import ABObjectQuery from "./ABObjectQuery"

export default class ABObjectQueryV1 extends ABObjectQuery {

    constructor(attributes, application) {

        super(attributes, application);
        /*
        {
            id: uuid(),
            name: 'name',
            labelFormat: 'xxxxx',
            isImported: 1/0,
            urlPath:'string',
            importFromObject: 'string', // JSON Schema style reference:  '#[ABApplication.id]/objects/[ABObject.id]'
                                        // to get other object:  ABApplication.objectFromRef(obj.importFromObject);
            translations:[
                {}
            ],
        
        
        
            // ABOBjectQuery Specific Changes
            // we store a list of fields by their urls:
            fields:[
                {
                    fieldURL:'#/url/to/field',
                }
            ],
        
        
            // we store a list of joins:
            joins: [
                {
                    objectURL:"#/...",					// the base object of the join
                    fieldID:'adf3we666r77ewsfe',		// the connection field of the object we are joining with.
                    type:[left, right, inner, outer]    // join type: these should match the names of the knex methods
                            => innerJoin, leftJoin, leftOuterJoin, rightJoin, rightOuterJoin, fullOuterJoin
                }
            ],
            where: { QBWhere }
        }
        */

    }

    /**
	 * @method objectBase
	 * return the origin object
	 * 
	 * @return {ABObject}
	 */
    objectBase() {

        return this.objects()[0];

    }


	/**
	 * @method importJoins
	 * instantiate a set of joins from the given attributes.
	 * Our joins contain a set of ABObject URLs that should already be created in our Application.
	 * @param {array} settings The different field urls for each field
	 *					{ }
	 */
    importJoins(settings) {
        var newJoins = [];
        var newObjects = [];
        function storeSingle(object) {
            var inThere = newObjects.filter((o) => { return o.id == object.id }).length > 0;
            if (!inThere) {
                newObjects.push(object);
            }
        }
        settings.forEach((join) => {

            // Convert our saved settings:
            // 		{
            // 			objectURL:"#/...",
            // 			fieldID:'adf3we666r77ewsfe',
            // 			type:[left, right, inner, outer]  // these should match the names of the knex methods
            // 					=> innerJoin, leftJoin, leftOuterJoin, rightJoin, rightOuterJoin, fullOuterJoin
            // 		}

            // track our base object
            var object = this.application.urlResolve(join.objectURL);
            if (!object) {

                // flag this query is disabled
                this.disabled = true;
                return;
            }

            storeSingle(object);

            // track our linked object
            var linkField = object.fields((f) => { return f.id == join.fieldID; })[0];
            if (linkField) {
                var linkObject = linkField.datasourceLink;
                storeSingle(linkObject);
            }


            newJoins.push(join);
        })
        this._joins = newJoins;
        this._objects = newObjects;
    }


}