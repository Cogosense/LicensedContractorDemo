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

The design users 3 concepts:

1. The publisher
2. The attribute Set
3. The data source

### Publisher

The publisher is associated with the logged in user, this can be an organization for example.
In the "Licensed Contractor Demo" the publisher is simply created and selected using the
Publishers tab. The demo is demonstrating the ability to combine, apply permissions and present
data from multiple sources. In a live system the publisher would be associated with an existing
authentication system.

Prior to creating attributes, a Publisher must be selected so that the AttributeSet Owner can
be established.

## Attribute set

AN attribute set contains the following:

1. A URL endpoint to the data source this attribute set describes.
2. A list of attributes and how they should be presented
3. A list of adornment records, which are themselves __Attribute Sets__

## Data Source

The data source must be a standard CRUD RESTful API (i.e. CReate Update Delete), the endpoint
should conform to the form "/resource/:id". For the demo purposes all data sources are served
from the same server. Each data source is a seperate controller, using a dedicated Mongoose
Model and MongoDB table.

In a production environment, the data will be coming from multiple servers in multiple domains.
Use the __XDomain__ package to seamlessly enable CORS with no modification required to the core
code.

__XDomain__ can be found at https://github.com/jpillora/xdomain

The licensed contractor demo supports to preconfigured internal data sources:

    /contractor/:id

and

    /surrey/:id

These represent the BCSA licensed contractor data and the City of Surrey annotations.

There is no preset concept of a primary attribute set or an adornment attribute set. Given an attribute
set A and B, B can be an adornment of and simultaneously A can be an adornment of B. The only restriction
is an attribute set cannot be used as an adornment of itself.

## Permissions

The following permission model is used:

1. A publisher can edit all their owned attribute sets.
2. Other publishes can read the label and description of all attribute sets, except the attributes
the owning publisher has marked as restricted.
3. A publisher may attach their attribute sets to any other attribute set as an adornment.
4. A publisher may view all adornments to an attribute set.

## TODO

1. Set the Publisher based on authenticated login.

2. The attribute list in the attribute editor is not persisted to the backend until the
_Active Attribute Set_ is changed. This can result in lost changes. Each change should
be persisted using the onChange() method. (Use the blur option to get a single change per
input field.)

3. Add CORS support for data sources - see __XDomain__ at https://github.com/jpillora/xdomain

4. Allow the key that links the data sources to be configurable. It is currently hard coded
to __"@i_id"__, This is mongodb specific and really should be a data attribute instead, not a meta
attribute.

5. Deleting a __Publisher__ does not cleanup any AttributeSers owned by the Publisher. They are 
eft dangling with no owner.

6. A data source may require authentication to access its endpoint. Currently there is no mechanism to
specify the auth tokens. This could be down directly in the attribute set. Special thought may have to
given to this if a publisher wishes to restrict access to a subset of other publishers, in which
case API tokens may need to be provisioned in the publisher record keyed by __Attribute Set__ owner id.

7. In the attribute editor when defining a simple collection, the API endpoint is not needed, so it is
left blank.  It may be better to have an initial select for the record type:
    * Primary Attribute Set
    * Adornment Attribute Set
    * Simple Collection
Then the API endpoint can be hidden (onlong with the adornments)

8. An attribute set name cannot be changed - the record has to be deleted and recreated with the new
name.
