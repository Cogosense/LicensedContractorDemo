# Licensed Contractor

## Prerequsites

To build and run the demo:

1. MongoDB running on localhost:27017
2. NodeJS &gt;= version 4.4.4
3. npm (usually installed with node, depending on distribution)
4. bower (install with command _npm -g bower_)
5. grunt (install with command _npm -g grunt_)

and optionally to continue development the following tools are extremely useful:

1. robomongo (http://www.robomongo.org)
2. node-inspector (install with command _npm -g node-inspector_)
3. nodemon (install with command _npm -g nodemon_)
4. Livereload plugin for your browser (search for livereload in browser extensions)

## Development

1. Clone the gitlab repository:

        git clone https://collab.safetyauthority.ca/sis/licensed-contractor.git
        cd licensed-contractor

2. Install components:

        npm install
        bower install

3. Start the server in one terminal:

        nodemon -w server bin/www

4. Start the grunt tasks in another terminal:

        grunt dev

## Production:

1. Invoke grunt to build minifies and uglified javascript:

        grunt production

## Design

The design uses 4 concepts:

1. The publisher
2. The attribute Set
3. The attribute viewer
4. The data source

### Publisher

The publisher is associated with the logged in user, this can be an organization for example.
In the "Licensed Contractor Demo" the publisher is simply created and selected using the
Publishers tab. The demo is demonstrating the ability to combine, apply permissions and present
data from multiple sources. In a live system the publisher would be associated with an existing
authentication system.

Prior to creating attributes, a Publisher must be selected so that the AttributeSet Owner can
be established.

### Attribute set

An attribute set contains the following:

1. A URL endpoint to the data source this attribute set describes.
2. A list of attributes and how they should be presented
3. A list of adornment records, which are themselves __Attribute Sets__

An Attribute Set can also be used to define a Collection (Object) for use as a structured
data type. In this case the URL should be left blank as the data source will be the same
as the containing Atrribute Set or Adornment.

### The Attribute Viewer

The viewer has no understanding of the data it is presenting built into its logic. The only
concepts it understands are primary records, adornment records, built in data types, User
defined datatypes and data sources. An Attribute set is selected and retrieved from the
attribute server. The server fully expands the attribute set as JSON and returns it to the
attribute viewer. The permissions (read/write) are set by the server and honoured by the
viewer,

The viewer has two modes:

1. Summary mode is an AngularJS ui-grid. The attributes in the primary record marked as
summary attributes are added to the table as columns. The primary data source is dynamically
created and data is pulled one page at a time to populate the rows. Each row has a details
button.

2. Details mode is a form dynamically created from the attributes. Including all promary record
fields and all adornment fields. The adornment data sources are dynamically created at this
time and the data for the row is pulled and displayed. Based on the permissions specified by
the server, each record set is either read/write or read only. Any modifiable adorment recordss
are updated when the details view is dismissed. If the primary record is modifiable, and it has
been modified, the summary view controller will be instructed to write back the row to the data
source on dismissing of the details view.

### Data Source

The data source must be a standard CRUD RESTful API (i.e. Create, Retrieve Update Delete), the endpoint
should conform to the form "/resource/:id". For the demo purposes all data sources are served
from the same server. Each data source is a seperate controller, using a dedicated Mongoose
Model and MongoDB table.

In a production environment, the data will be coming from multiple servers in multiple domains.
Use the __XDomain__ package to seamlessly enable CORS with no modification required to the core
code.

__XDomain__ can be found at https://github.com/jpillora/xdomain

The licensed contractor demo supports to preconfigured internal data sources:

    /datasource/contractor/:id
    /datasource/surrey/:id
    /datasource/burnaby/:id
    /datasource/notes/:id

These represent the BCSA licensed contractor data and the City of Surrey, City of Burnaby and Notes
annotations.

__Note__: Because the attribute viewer is limited to text only fields at the moment, the __Notes__
adornment is non functional because it is implemented as an array of the User defined type __Note__.

There is no preset concept of a primary attribute set or an adornment attribute set. Given
an attribute set A and B, B can be an adornment of A and simultaneously A can be an adornment
of B. The only restriction is an attribute set cannot be used as an adornment of itself.

#### Data source services

Data sources must meet a set of minimum requirements to be suitable for use in this demo.
The source must RESTful (i.e. has no state and uses resource based URLs). The data source must
support CRUD operations and the Query operation. The mapping of HTTP method to operation is:

* Use POST for Create
* Use GET for Read (single)
* Use PUT for Update
* Use DELETE for Delete
* Use GET for Query (list)

Optionally the Query operation must also support server side paging, sorting, filtering and
selecting for large data sets.

#### Query parameter support for server side tabulation control

Assuming that the AngularJS ui-grid or Backbone and BackGrid model is used for data presentation,
then both client side and server side controls for sorting, filtering selection and pagination
exist. The client side controls are good for record sets upto about 5,000 maximum. At this
size the retrieval of the initial dataset becomes noticable (~5-10 secs).

Client side controls are trivial to setup,

This demo focuses on the techniques required to support server side tabular control in
AngularJS ui-grid, using an Express/Mongoose/MongoDB back end.

For services to support server side control, the REST API Query operation must support
the following query parameters.

* <b>\_\_sort</b>   is a list of field names seperated by commas. The highest priority sort
first is first. A descending sort is used if the first character in the field name is '-', e.g.

    ?__sort='field1,-field2'

* <b>\_\_skip</b>   is used for pagination. It is an integer used to skip records at the
start of the returned matching set, e.g.

    ?__skip=100

* <b>\_\_limit</b>  is used for pagination. It is an integer that is used to limit the size
of the returned record set, e.g.

    ?__limit=25

Pagination control is achieved by combining skip and limit parameters:

Return the first page of 25 records:

    ?__skip=0&&__limit=25

Return the second page of 25 records

    ?__skip=25&__limit=25

* <b>\_\_select</b> is a list of field names seperated by commas. These are the fields that
will be populated into the returned records. An empty select parameter
will cause an array of empty objects (only the id field will be present) to be
returned, e.g.

    ?__select=field1,field2

__NOTE:__ The default for select is set to return no data, the client side must ask
for the required fields. This is used to protect the data that is not specified
in the Attribute Set from being viewed.

* <b>...</b> a list of field names and regular expressions as parameters.
The named fields are matched against the reqular expression, e.g.

    ?field1=foo&field2=^604

#### Response Header support for server side tabulation control

When using server side tabulation, the total number of records has to be returned with
each Query response. This is done using the custom header __X-total-count__. To support
CORS, the header __Access-Control-Expose-Headers__ set to the value _X-total-count_ must
also be returned.

The actual number returned is a matter of preference, but it can be one of two things:

1. The total number of records in the data source collection.
2. The total number of records that would be returned taking into account the
   filtering parameter and ignoring the skip and limit parameters.

The demo uses the second number as this provides immediate feedback to the operator on
how many records are matching their search criteria.

## Permissions

The following permission model is used for attributes:

1. A publisher can edit their own attribute sets.
2. Other publishes can read the label and description of all attribute sets, except the attributes
the owning publisher has marked as restricted.
3. A publisher may attach their attribute sets to any other attribute set as an adornment.
4. A publisher may view all adornments to an attribute set.

The following permission model is used for data sources:

1. A publisher may edit their own data from either primary or adornment data sources.
2. A publisher may restrict specific data attributes from being viewed by other publishers
3. Other publishers may view all primary and adornment data sets, unless viewing has been
restricted by the publisher.
4. A publisher may opt to make a data set writable by all other publishers.

## Constraints, Limitations and Known Defects

1. No mechanism exists to create new primary Attribute Set records. To achieve this add a "Create New"
button in the viewerSummary view that launches an empty viewerDetailsModal view.

2, Adornment data records for a Primary record with name __Foo__ must have a an attribute __Foo_id__ 
This is the key defined in the Attribute Set and is used to query and update Adornments. This
constraint can be relaxed by adding a field to specify the key name rather than using a convention
in the code to create one.

3. The current mechanism for linking primary and adornment records relies on the MongoDB id field.
Similar to constraint 2 above, an addition to the Attribute Editor could made to allow the unique
key field to be picked from the existing primary record's list of attributes.

4. Summary fields in adornment records are not displayed in the summary viewer table. This is
because to do this would require that the adorment records are retrieved in the summary controller.
Currently they are only retrieved in the details controller. The constraint could be lifted if
all adornments on the page are queried in the summary controller (the number of queries  would be
1 + number of entries per page * number of adorments per primary record). The number of queries
could be limited by checking the adornment attribute lists for summary attributes before making
the adornment queries.

5. There is a bug in that if two publishers publish a primary record with the same name, an
adornment record cannot be an adornment to both these records. This is because the linking
id must have the attribute name __<PrimaryRecordName>_id__. This defect can be fixed by either
using a generated name or __<publisherName>_<PrimaryRecordName>_id__.

6. In practice, an adornment record may also be a primary record, or an adornment record to multiple
primaries. As a primary record it would be queried by the primary record ID, as an adornment record
it would be queried by the ID of primary record the adornment is attached to. The controller needs
to be able to work out which ID is being passed in. This is currently solved by adding
a query parameter of __\_\_key=<PrimaryRecordName>_id__ to the GET resource URL. This allows the REST
api contoller to make a decision on which key to use.

7. Users types are constrained to a single depth currently. In the controller
_server/controllers/publisher/attributes/index.js_ only __attributes.typeRef__ and
__adornments.attributes.typeRef__ are populated (aka expanded). The typeRefs should
be expanded iteratively allowing any arbitrary depth of User types.

## TODO

1. Set the Publisher based on authenticated login.

2. The attribute list in the attribute editor is not persisted to the backend until the
_Active Attribute Set_ is changed. This can result in lost changes. Each change should
be persisted using the onChange() method. (Use the blur option to get a single change per
input field.)

3. Add CORS support for data sources - see __XDomain__ at https://github.com/jpillora/xdomain

4. Allow the key that links the data sources to be configurable. It is currently hard coded
to __"@_id"__, This is mongodb specific and really should be a attribute of the data being
described.

5. Deleting a __Publisher__ does not cleanup any AttributeSers owned by the Publisher. They are 
eft dangling with no owner.

6. A data source may require authentication to access its endpoint. Currently there is no mechanism to
specify the auth tokens. This could be down directly in the attribute set. Special thought may have to
given to this if a publisher wishes to restrict access to a subset of other publishers, in which
case API tokens may need to be provisioned in the publisher record keyed by __Attribute Set__ owner id.

7. In the attribute editor when defining a User defined type, the API endpoint is not needed, so it is
left blank.  It may be better to have an initial select for the record type:
    * Primary Attribute Set
    * Adornment Attribute Set
    * Simple Collection
Then the API endpoint can be hidden (along with the adornments list)

8. An attribute set name cannot be changed - the record has to be deleted and recreated with the new
name.

9. The Attribute Viewer only correctly handles types of "text" and "key". Support for the other types
has not been coded yet. (See __11__ below also).

10. The description field in each attribute is currently not used. The plan is to use it as a tooltip
for each field.

11. The Attribute Viewer was created quickly to test the basic features of the Attribute Editor.
It uses a 'flat' controller model, a single controller handles the primary record and all the adornment
records. It is not capable of handling User defined types. The structure should be changed such that
the top controller of the Attribute Viewer only handles the primary record. An adornment controller
should be attached to every adornment and a User datatype controller to every user defined datatype.
This will create a structure that can easily handle arbritarily complex relationships in the data being
viewed.

12. The query parameter __\_\_select__ is set for primary record queries, but it is not set for adornment
record queries. This should be fixed when __11__ is fixed.
