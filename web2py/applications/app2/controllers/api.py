import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

# Here go your api methods.

@auth.requires_signature()
def add_products():
	#add to DB

    t_id = db.product.insert(
        product_name = "same",  #not useful for this asg
        quantity = 1,
        name = auth.user.first_name,
        price = request.vars.price,
        image = request.vars.images,
        description = "same",
        is_being_edited = False,
        price_model = request.vars.price,
    )
    t = db.product(t_id)
    return response.json(dict(products=t))


@auth.requires_signature()
def save_product():
    m = db((db.product.id == request.vars.product_id) & (db.product.name == auth.user.first_name)).select().first()
    logger.info("id is: %r", request.vars.product_id)
    logger.info(request.vars.new_price)
    m.update_record(price = request.vars.new_price)
    return "ok"
