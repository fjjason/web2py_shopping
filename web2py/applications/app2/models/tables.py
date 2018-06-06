# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.


# Product table.
db.define_table('product',
	Field('name'),
    Field('product_name'),
    Field('quantity', 'integer'),
    Field('price', 'float'),
    Field('price_model', 'float'),
    Field('image'),
    Field('is_editting'),
    Field('description', 'text'),
)
db.product.id.readable = db.product.id.writable = False

db.define_table('product_order',
	Field('name'),
    Field('cart', 'blob'), # We store the entire cart in json.
    Field('order_key'), # For security.
    Field('paid', default=False),
    Field('order_details', 'blob'), # I just put all here to be quick.
)

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
