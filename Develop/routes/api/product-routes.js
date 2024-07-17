const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve products', error: err });
  }
});

// GET a single product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });

    if (!product) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve product', error: err });
  }
});

// POST a new product
router.post('/', async (req, res) => {
  try {
    const { tagIds, ...productData } = req.body;
    const newProduct = await Product.create(productData);

    if (tagIds && tagIds.length) {
      const productTagIdArr = tagIds.map((tag_id) => {
        return {
          product_id: newProduct.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create product', error: err });
  }
});

// PUT update a product by id
router.put('/:id', async (req, res) => {
  try {
    const { tagIds, ...productData } = req.body;
    await Product.update(productData, {
      where: {
        id: req.params.id,
      },
    });

    const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });
    const productTagIds = productTags.map(({ tag_id }) => tag_id);

    const newProductTags = (tagIds || [])
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });

    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !(tagIds || []).includes(tag_id))
      .map(({ id }) => id);

    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update product', error: err });
  }
});

// DELETE a product by id
router.delete('/:id', async (req, res) => {
  try {
    await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err });
  }
});

module.exports = router;
